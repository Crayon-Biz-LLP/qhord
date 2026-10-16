import { Worker, Job } from 'bullmq';
import { prisma } from '../lib/prisma';
import { ExecutionEngine } from '../services/execution.engine';
import { redisConnection } from '../queue/bullmq-setup';
import { resolveManifestSteps, applyPipelineToPayload, isLeadSourceAction } from '../ai/pipeline/action-resolver';
import { emptyPipelineContext, type ManifestStepLike } from '../ai/pipeline/pipeline-types';
import type { ToolName } from '../types';
import { mergePipelineContext } from '../ai/pipeline/pipeline-leads';
import { findToolAccount } from '../ai/pipeline/ensure-tool-accounts';

const CREDIT_COST: Record<string, number> = {
  hunter: 2,
  bettercontacts: 1,
  brevo: 3,
  calendly: 1,
  smartlead: 2,
  heyreach: 2,
  instantly: 2,
  hubspot: 1,
  salesforce: 1,
};

interface CampaignJobData {
  campaignId: string;
  operatorId: string;
  clientId: string;
}

export class CampaignWorker {
  private executionEngine: ExecutionEngine;
  private worker: Worker<CampaignJobData, any, string>;

  constructor() {
    this.executionEngine = new ExecutionEngine();

    this.worker = new Worker(
      'campaign-execution',
      this.processCampaign.bind(this),
      {
        connection: redisConnection as any,
        concurrency: 5,
        limiter: {
          max: 10,
          duration: 60000,
        },
      }
    );

    this.worker.on('completed', (job) => {
      console.log(`✅ Campaign worker completed job ${job.id}`);
    });

    this.worker.on('failed', (job, err) => {
      console.error(`❌ Campaign worker failed job ${job?.id}:`, err);
    });

    this.worker.on('error', (err) => {
      console.error('Campaign worker error:', err);
    });
  }

  private async processCampaign(job: Job<CampaignJobData, any, string>) {
    const { campaignId, operatorId, clientId } = job.data;

    try {
      console.log(`🚀 Starting campaign execution: ${campaignId}`);

      const campaign = await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: 'executing' },
      });

      const campaignSteps = await prisma.campaignStep.findMany({
        where: { campaign_id: campaignId },
        orderBy: { step_order: 'asc' },
      });

      let manifestSteps: ManifestStepLike[] = campaignSteps.map((s) => ({
        id: s.id,
        order: s.step_order,
        tool: s.tool_name,
        action: s.action,
        params: (s.params as Record<string, unknown>) || {},
        dependencies: (s.dependencies as string[]) || [],
      }));

      // A campaign built from a CSV/manual lead list already has its exact
      // leads persisted (see POST /campaigns/plan). Use those as-is instead
      // of re-running a live search step, which would source a fresh,
      // unrelated batch of leads regardless of what was actually picked.
      let existingLeads = await prisma.lead.findMany({ where: { campaign_id: campaignId } });
      const usingPreloadedLeads = existingLeads.length > 0;

      // Cap how many leads this run actually enrolls/sends to. This throttles
      // a single execution pass — it doesn't yet spread sends across
      // multiple days, since nothing schedules/resumes campaigns that way.
      const dailyLimit = (campaign as any).daily_send_limit as number | null;
      if (usingPreloadedLeads && dailyLimit && existingLeads.length > dailyLimit) {
        console.log(`✂️ Capping ${existingLeads.length} lead(s) to daily send limit of ${dailyLimit}`);
        existingLeads = existingLeads.slice(0, dailyLimit);
      }

      if (usingPreloadedLeads) {
        manifestSteps = manifestSteps.filter((s) => !isLeadSourceAction(s.action));
        console.log(`📇 Using ${existingLeads.length} pre-loaded lead(s) for this campaign — skipping live sourcing steps`);
      }

      const resolvedSteps = resolveManifestSteps(manifestSteps);
      console.log(`📋 Resolved ${resolvedSteps.length} execution actions from ${campaignSteps.length} manifest steps`);

      let pipelineContext = emptyPipelineContext();
      if (usingPreloadedLeads) {
        pipelineContext = {
          ...pipelineContext,
          leads: existingLeads.map((l) => ({
            first_name: l.first_name || '',
            last_name: l.last_name || '',
            email: l.email,
            company_name: l.company_name || undefined,
            title: l.title || undefined,
            linkedin_url: l.linkedin_url || undefined,
            industry: l.industry || undefined,
          })),
        };
      }
      const results = [];
      let stepIndex = 0;

      for (const resolved of resolvedSteps) {
        stepIndex += 1;

        const manifestStep = manifestSteps.find((m) => m.id === resolved.manifestStepId);
        const manifestParams = manifestStep?.params || {};

        try {
          await job.updateProgress({
            currentStep: stepIndex,
            totalSteps: resolvedSteps.length,
            stepName: resolved.label,
          });

          if (resolved.skipExecution) {
            if (resolved.waitMs && resolved.waitMs > 0) {
              await new Promise((r) => setTimeout(r, resolved.waitMs));
            }
            console.log(`⏭️ Skipped (system): ${resolved.label}`);
            continue;
          }

          // A campaign running against a specific, pre-loaded lead list
          // (CSV/manual) enrolls each lead individually — resolving or
          // creating its Apollo contact along the way — instead of one bulk
          // add_to_sequence call, which needs Apollo contact ids our leads
          // don't have unless they came from a live Apollo search step.
          if (usingPreloadedLeads && resolved.tool === 'apollo' && resolved.action === 'add_to_sequence') {
            const emailerCampaignId =
              (manifestParams as any).emailer_campaign_id || (resolved.payload as any)?.emailer_campaign_id;

            for (const lead of pipelineContext.leads) {
              if (!lead.email) continue;
              try {
                const enrollResult = await this.executeResolvedStep(
                  { tool: 'apollo', action: 'enroll_lead', label: `Apollo — enroll ${lead.email}` },
                  {
                    email: lead.email,
                    campaign_id: emailerCampaignId,
                    first_name: lead.first_name,
                    last_name: lead.last_name,
                  },
                  operatorId,
                  clientId,
                  campaignId
                );
                results.push(enrollResult);
              } catch (leadErr) {
                console.error(`❌ Failed to enroll ${lead.email}`, leadErr);
                results.push({
                  success: false,
                  tool: 'apollo',
                  action: 'enroll_lead',
                  status: 'error',
                  error: leadErr instanceof Error ? leadErr.message : String(leadErr),
                  response: null,
                });
              }
            }
            continue;
          }

          const payload = applyPipelineToPayload(resolved, pipelineContext, manifestParams);

          const result = await this.executeResolvedStep(
            resolved,
            payload,
            operatorId,
            clientId,
            campaignId
          );
          results.push(result);

          pipelineContext = mergePipelineContext(
            pipelineContext,
            resolved.tool,
            resolved.action,
            result.response
          );

          console.log(
            `✅ ${resolved.label} — ${pipelineContext.leads.length} leads in pipeline`
          );
        } catch (stepError) {
          console.error(`❌ Failed: ${resolved.label}`, stepError);
          results.push({
            success: false,
            tool: resolved.tool,
            action: resolved.action,
            status: 'error',
            error: stepError instanceof Error ? stepError.message : String(stepError),
            response: null,
          });
        }
      }

      // Persist leads from pipeline to database (skip when they were
      // already preloaded from an existing CSV/manual list — otherwise
      // this would insert duplicate rows for the same leads).
      if (!usingPreloadedLeads && pipelineContext.leads.length > 0) {
        const leadData = pipelineContext.leads.map((l: any) => ({
          client_id: clientId,
          campaign_id: campaignId,
          email: l.email || '',
          first_name: l.first_name || l.firstName || '',
          last_name: l.last_name || l.lastName || '',
          title: l.title || l.position || '',
          company_name: l.company_name || l.company || '',
          domain: l.domain || '',
          linkedin_url: l.linkedin_url || '',
          industry: l.industry || '',
          source: l.source || 'hunter',
          status: 'new',
          enriched: false,
        }));
        await prisma.lead.createMany({ data: leadData, skipDuplicates: true });
        console.log(`📝 ${leadData.length} leads saved to DB`);
      }

      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          status: 'completed',
          updated_at: new Date(),
        },
      });

      const hasErrors = results.some((r) => r.status === 'error');
      console.log(`${hasErrors ? '⚠️' : '✅'} Campaign finished: ${campaignId}`);

      return {
        success: !hasErrors,
        campaignId,
        stepsExecuted: results.length,
        leadsProcessed: pipelineContext.leads.length,
        results,
        message: hasErrors ? 'Campaign completed with errors' : 'Campaign executed successfully',
      };
    } catch (error) {
      console.error(`❌ Campaign execution failed: ${campaignId}`, error);

      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          status: 'failed',
          updated_at: new Date(),
        },
      });

      throw error;
    }
  }

  private async executeResolvedStep(
    resolved: { tool: string; action: string; label: string },
    payload: Record<string, unknown>,
    operatorId: string,
    clientId: string,
    campaignId: string
  ) {
    const toolAccount = await findToolAccount(clientId, resolved.tool);

    if (!toolAccount) {
      throw new Error(
        `No tool account for ${resolved.tool}. Connect ${resolved.tool} in settings or run with mock accounts.`
      );
    }

    // Without this, Apollo enrolls contacts using whatever mailbox it has
    // set as its own internal default — not necessarily the account the
    // client actually connected here.
    const senderAccountId = (toolAccount.config_json as any)?.senderAccountId;
    const isApolloEnrollment = resolved.tool === 'apollo' && (resolved.action === 'add_to_sequence' || resolved.action === 'enroll_lead');
    if (isApolloEnrollment && senderAccountId) {
      payload = { ...payload, email_account_id: senderAccountId };
    }

    const execution = await this.executionEngine.execute(
      {
        clientId,
        tool: resolved.tool as ToolName,
        toolAccountId: toolAccount.id,
        contextId: undefined,
        action: resolved.action,
        payload,
      },
      operatorId
    );

    if (execution.status !== 'success') {
      throw new Error(execution.error_message || `Step failed: ${resolved.label}`);
    }

    // Consume credits after successful step
    try {
      const cost = CREDIT_COST[resolved.tool] || 1;
      const credit = await prisma.clientCredit.findUnique({ where: { client_id: clientId } });
      if (credit && credit.balance >= cost) {
        await prisma.clientCredit.update({
          where: { id: credit.id },
          data: { balance: { decrement: cost }, total_used: { increment: cost } },
        });
        await prisma.creditTransaction.create({
          data: {
            credit_id: credit.id,
            amount: cost,
            type: 'debit',
            description: `${resolved.tool}:${resolved.action}`,
            tool_name: resolved.tool,
            action: resolved.action,
            campaign_id: campaignId,
            execution_id: execution.id,
          },
        });
        console.log(`💰 Consumed ${cost} credits for ${resolved.tool}:${resolved.action}`);
      }
    } catch (creditErr) {
      console.error(`⚠️ Credit consumption failed (non-blocking):`, creditErr);
    }

    return {
      success: true,
      status: 'success',
      tool: resolved.tool,
      action: resolved.action,
      executionId: execution.id,
      response: execution.response_payload,
    };
  }

  /** Run campaign steps in-process (no Redis queue). Used when QHORD_SYNC_PIPELINE=true. */
  async runCampaignNow(campaignId: string, operatorId: string, clientId: string) {
    const job = {
      id: `sync-${campaignId}`,
      data: { campaignId, operatorId, clientId },
      updateProgress: async () => {},
    } as unknown as Job<CampaignJobData, unknown, string>;
    return this.processCampaign(job);
  }

  async close() {
    await this.worker.close();
    console.log('Campaign worker closed');
  }
}

export const campaignWorker = new CampaignWorker();

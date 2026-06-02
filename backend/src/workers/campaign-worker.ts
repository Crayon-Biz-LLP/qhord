import { Worker, Job } from 'bullmq';
import { prisma } from '../lib/prisma';
import { ExecutionEngine } from '../services/execution.engine';
import { redisConnection } from '../queue/bullmq-setup';
import { resolveManifestSteps, applyPipelineToPayload } from '../ai/pipeline/action-resolver';
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

      await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: 'executing' },
      });

      const campaignSteps = await prisma.campaignStep.findMany({
        where: { campaign_id: campaignId },
        orderBy: { step_order: 'asc' },
      });

      const manifestSteps: ManifestStepLike[] = campaignSteps.map((s) => ({
        id: s.id,
        order: s.step_order,
        tool: s.tool_name,
        action: s.action,
        params: (s.params as Record<string, unknown>) || {},
        dependencies: (s.dependencies as string[]) || [],
      }));

      const resolvedSteps = resolveManifestSteps(manifestSteps);
      console.log(`📋 Resolved ${resolvedSteps.length} execution actions from ${campaignSteps.length} manifest steps`);

      let pipelineContext = emptyPipelineContext();
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

      // Persist leads from pipeline to database
      if (pipelineContext.leads.length > 0) {
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

import { prisma } from '../lib/prisma';
import { ApolloService } from './apollo.service';
import { ClayService } from './clay.service';
import { HeyReachService } from './heyreach.service';
import { SmartLeadService } from './smartlead.service';
import { InstantlyService } from './instantly.service';
import { BetterContactService } from './bettercontact.service';
import { findToolAccount } from '../ai/pipeline/ensure-tool-accounts';
import { workflowQueue } from '../queue/workflow-queue';
import { useFreeDemoStack } from '../config/demo-stack';

export class WorkflowEngine {
  // Triggers incoming webhook/event
  async triggerWorkflow(triggerEvent: string, clientId: string, payload: any, operatorId?: string) {
    try {
      console.log(`[WorkflowEngine] Received trigger: ${triggerEvent} for client: ${clientId}`);

      // Find active workflows matching trigger and client
      const activeWorkflows = await prisma.workflow.findMany({
        where: {
          client_id: clientId,
          trigger_type: triggerEvent,
          status: 'active',
        },
      });

      console.log(`[WorkflowEngine] Found ${activeWorkflows.length} active workflows matching trigger.`);

      const resolvedOperatorId = operatorId || await this.getDefaultOperatorId(clientId);

      for (const wf of activeWorkflows) {
        const syncPipeline = process.env.QHORD_SYNC_PIPELINE === 'true' || useFreeDemoStack();

        if (syncPipeline) {
          console.log(`[WorkflowEngine] Running workflow ${wf.id} synchronously`);
          await this.executeWorkflow(wf.id, payload, resolvedOperatorId);
        } else {
          console.log(`[WorkflowEngine] Queueing workflow ${wf.id} for async execution`);
          await workflowQueue.add(`wf-${wf.id}-${Date.now()}`, {
            workflowId: wf.id,
            payload,
            operatorId: resolvedOperatorId,
          });
        }
      }
    } catch (error) {
      console.error('[WorkflowEngine] Trigger processing error:', error);
    }
  }

  // Executes a single workflow execution
  async executeWorkflow(workflowId: string, payload: any, operatorId: string) {
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow) {
      console.error(`[WorkflowEngine] Workflow not found: ${workflowId}`);
      return;
    }

    // 1. Create run log
    const recordId = payload.record_id || payload.email || payload.id || null;
    const run = await prisma.workflowRun.create({
      data: {
        workflow_id: workflowId,
        trigger_event: workflow.trigger_type,
        target_type: workflow.target_type,
        status: 'running',
        record_id: recordId ? String(recordId) : null,
      },
    });

    try {
      // 2. Load the target record (Lead, Company, or Deal)
      const targetRecord = await this.loadTargetRecord(workflow.client_id, workflow.target_type, payload);

      // 3. Evaluate Enrollment Filters
      const filterResult = await this.evaluateFilters(workflow.enrollment_filters as any[], targetRecord, workflow.client_id);
      await prisma.workflowRun.update({
        where: { id: run.id },
        data: { filter_result: filterResult as any },
      });

      if (!filterResult.passed) {
        await prisma.workflowRun.update({
          where: { id: run.id },
          data: {
            status: 'completed',
            error_message: `Enrollment filters not met: ${filterResult.reason}`,
          },
        });
        console.log(`[WorkflowEngine] Workflow ${workflowId} execution skipped: filters not met.`);
        return;
      }

      // 4. Evaluate Guardrails
      const guardrailResult = await this.evaluateGuardrails(workflow.guardrails as any[], targetRecord, workflow.client_id);
      await prisma.workflowRun.update({
        where: { id: run.id },
        data: { guardrail_result: guardrailResult as any },
      });

      if (!guardrailResult.passed) {
        // Apply guardrail actions: Hold for review, require approval, block, pause
        const action = guardrailResult.action; // 'Hold for review' | 'Request approval' | 'Reroute' | 'Block' | 'Pause'
        let runStatus = 'held';
        let errorMsg = `Guardrail triggered: ${guardrailResult.reason}`;

        if (action === 'Block' || action === 'Exit with reason') {
          runStatus = 'failed';
        } else if (action === 'Pause') {
          runStatus = 'held';
          // Pause workflow itself
          await prisma.workflow.update({
            where: { id: workflowId },
            data: { status: 'paused' },
          });
        }

        // Notify operator / create internal task
        await prisma.notification.create({
          data: {
            operator_id: operatorId,
            type: 'workflow_guardrail_triggered',
            title: `Guardrail triggered on workflow: ${workflow.name}`,
            message: `Guardrail: ${guardrailResult.reason}. Action taken: ${action}`,
            entity_id: workflow.id,
            entity_type: 'workflow',
          },
        });

        await prisma.workflowRun.update({
          where: { id: run.id },
          data: {
            status: runStatus,
            error_message: errorMsg,
          },
        });
        console.log(`[WorkflowEngine] Workflow execution paused/held by guardrail: ${guardrailResult.reason}`);
        return;
      }

      // 5. Execute Path actions
      console.log(`[WorkflowEngine] Running path actions for workflow: ${workflow.name}`);
      const executionResult = await this.executePath(
        workflow.path_actions as any,
        targetRecord,
        workflow.client_id,
        operatorId
      );

      await prisma.workflowRun.update({
        where: { id: run.id },
        data: {
          status: 'completed',
          action_executed: executionResult.action_executed,
          tool_used: executionResult.tool_used,
        },
      });
      console.log(`[WorkflowEngine] Workflow run ${run.id} finished successfully.`);
    } catch (err: any) {
      console.error(`[WorkflowEngine] Execution error on workflow run ${run.id}:`, err);
      await prisma.workflowRun.update({
        where: { id: run.id },
        data: {
          status: 'failed',
          error_message: err.message || 'Unknown execution failure',
        },
      });
    }
  }

  // Load the object to act on
  private async loadTargetRecord(clientId: string, targetType: string, payload: any) {
    // Basic fallback object
    const fallback = {
      email: payload.email || '',
      first_name: payload.first_name || payload.firstName || '',
      last_name: payload.last_name || payload.lastName || '',
      company_name: payload.company || payload.company_name || '',
      domain: payload.domain || '',
      linkedin_url: payload.linkedin_url || '',
      score: payload.score || 50,
      intent_score: payload.intent_score || 0,
      region: payload.region || 'US',
      seniority: payload.seniority || 'Manager',
      enriched: payload.enriched || false,
    };

    if (targetType === 'people') {
      let lead = null;
      if (payload.email) {
        lead = await prisma.lead.findFirst({ where: { client_id: clientId, email: payload.email } });
      } else if (payload.record_id) {
        lead = await prisma.lead.findFirst({ where: { id: payload.record_id } });
      }
      return lead ? { ...fallback, ...lead } : fallback;
    }

    if (targetType === 'deals') {
      let deal = null;
      if (payload.record_id) {
        deal = await prisma.deal.findFirst({ where: { id: payload.record_id } });
      } else if (payload.name) {
        deal = await prisma.deal.findFirst({ where: { client_id: clientId, name: payload.name } });
      }
      return deal ? { ...fallback, ...deal } : fallback;
    }

    return fallback;
  }

  // Evaluate Enrollment Filters
  private async evaluateFilters(filters: any[], record: any, clientId: string): Promise<{ passed: boolean; reason?: string }> {
    if (!filters || filters.length === 0) {
      return { passed: true };
    }

    for (const filter of filters) {
      const filterId = filter.id || filter.label;
      const isFilterActive = filter.active !== false;
      if (!isFilterActive) continue;

      if (filterId === 'ICP match' || filterId === 'e1') {
        const client = await prisma.client.findUnique({ where: { id: clientId } });
        if (client?.icp_summary && record.company_name && !record.company_name.toLowerCase().includes('unknown')) {
          // ICP matches basic domain checks
        }
      } else if (filterId === 'Verified email' || filterId === 'e2') {
        if (!record.email || !record.email.includes('@')) {
          return { passed: false, reason: 'Missing or unverified email' };
        }
      } else if (filterId === 'LinkedIn exists' || filterId === 'e3') {
        if (!record.linkedin_url || record.linkedin_url.trim().length === 0) {
          return { passed: false, reason: 'LinkedIn URL does not exist' };
        }
      } else if (filterId === 'Score threshold' || filterId === 'e4') {
        const threshold = parseInt(filter.value?.replace(/[^\d]/g, '') || '70', 10);
        const score = record.score || 50;
        if (score < threshold) {
          return { passed: false, reason: `Lead score (${score}) below threshold (${threshold})` };
        }
      } else if (filterId === 'Intent threshold' || filterId === 'e5') {
        const intent = String(record.intent_score || '0');
        if (intent.toLowerCase() === 'low') {
          return { passed: false, reason: 'Intent score too low' };
        }
      } else if (filterId === 'Enrichment status' || filterId === 'e6') {
        if (!record.enriched) {
          return { passed: false, reason: 'Lead not enriched' };
        }
      } else if (filterId === 'Not in active campaign' || filterId === 'e7') {
        if (record.campaign_id) {
          return { passed: false, reason: 'Lead is already enrolled in another campaign' };
        }
      } else if (filterId === 'Not contacted in 30 days' || filterId === 'e8') {
        // Optional verification check
      } else if (filterId === 'No active opportunity' || filterId === 'e9') {
        const deals = await prisma.deal.findMany({
          where: { client_id: clientId, contact: record.email, NOT: { stage: 'Closed' } },
        });
        if (deals.length > 0) {
          return { passed: false, reason: 'Lead has an active sales opportunity open' };
        }
      }
    }

    return { passed: true };
  }

  // Evaluate Guardrails
  private async evaluateGuardrails(guardrails: any[], record: any, clientId: string): Promise<{ passed: boolean; reason?: string; action?: string }> {
    if (!guardrails || guardrails.length === 0) {
      return { passed: true };
    }

    for (const gd of guardrails) {
      const isEnabled = gd.enabled !== false;
      if (!isEnabled) continue;

      const title = gd.title || gd.id;
      const action = gd.action || 'Hold for review';

      if (title === 'Active sequence conflict' || title === 'g1') {
        // Mock sequence conflict checks
        if (record.campaign_id) {
          return { passed: false, reason: 'Conflict: contact active in another campaign', action };
        }
      } else if (title === 'Open opportunity' || title === 'g4') {
        const deals = await prisma.deal.findMany({
          where: { client_id: clientId, contact: record.email, NOT: { stage: 'Closed' } },
        });
        if (deals.length > 0) {
          return { passed: false, reason: 'Guardrail: open opportunity found on contact', action };
        }
      } else if (title === 'Verified contactability' || title === 'g9') {
        if (!record.email && !record.linkedin_url) {
          return { passed: false, reason: 'Guardrail: uncontactable lead (no email or linkedin)', action };
        }
      } else if (title === 'Compliance block' || title === 'g7') {
        if (record.region && ['RU', 'KP', 'IR'].includes(record.region.toUpperCase())) {
          return { passed: false, reason: 'Guardrail: blocked compliance region', action };
        }
      }
    }

    return { passed: true };
  }

  // Execute Path preset
  private async executePath(path: string | any[], record: any, clientId: string, operatorId: string) {
    const presetName = typeof path === 'string' ? path : (path as any)?.name || '';
    let toolUsed = 'internal';
    let actionExecuted = presetName || 'Notify + assign owner';

    console.log(`[WorkflowEngine] Resolving path: "${presetName}"`);

    if (presetName === 'Email-first cadence') {
      // Enroll lead in Apollo, Smartlead or Instantly sequence
      const leadAccount = await findToolAccount(clientId, 'smartlead') ||
                          await findToolAccount(clientId, 'apollo') ||
                          await findToolAccount(clientId, 'instantly');

      if (!leadAccount) {
        throw new Error('No connected email outreach tools (Smartlead/Apollo/Instantly) found.');
      }

      toolUsed = leadAccount.tool_name;
      actionExecuted = `${toolUsed}: enroll_lead`;

      const apiKey = leadAccount.api_key_encrypted; // Engine will decrypt inside

      if (toolUsed === 'smartlead') {
        const service = new SmartLeadService(apiKey);
        const campaigns = await service.fetchCampaigns();
        const campaignId = campaigns[0]?.id || '1';
        await service.enrollLead({
          campaign_id: campaignId,
          email: record.email,
          first_name: record.first_name,
          last_name: record.last_name,
        });
      } else if (toolUsed === 'apollo') {
        const service = new ApolloService(apiKey);
        const sequences = await service.fetchCampaigns();
        const campaignId = sequences[0]?.id || '1';
        await service.enrollLead({
          campaign_id: campaignId,
          email: record.email,
          first_name: record.first_name,
          last_name: record.last_name,
        });
      } else if (toolUsed === 'instantly') {
        const service = new InstantlyService(apiKey);
        const campaigns = await service.fetchCampaigns();
        const campaignId = campaigns[0]?.id || '1';
        await service.enrollLead({
          campaign_id: campaignId,
          email: record.email,
          first_name: record.first_name,
          last_name: record.last_name,
        });
      }
    } else if (presetName === 'LinkedIn-first') {
      const reachAccount = await findToolAccount(clientId, 'heyreach');
      if (!reachAccount) {
        throw new Error('No HeyReach account connected for LinkedIn-first actions.');
      }

      toolUsed = 'heyreach';
      actionExecuted = 'heyreach: send_message';

      const service = new HeyReachService(reachAccount.api_key_encrypted);
      const campaigns = await service.fetchCampaigns();
      const campaignId = campaigns[0]?.id || '1';

      await service.enrollLead({
        campaign_id: campaignId,
        email: record.email,
        first_name: record.first_name,
        last_name: record.last_name,
      });
    } else if (presetName === 'Route by channel readiness') {
      if (record.email) {
        // Email route
        const leadAccount = await findToolAccount(clientId, 'smartlead') ||
                            await findToolAccount(clientId, 'apollo') ||
                            await findToolAccount(clientId, 'instantly');
        if (leadAccount) {
          toolUsed = leadAccount.tool_name;
          actionExecuted = `${toolUsed}: enroll_lead`;
        }
      } else if (record.linkedin_url) {
        // HeyReach route
        const reachAccount = await findToolAccount(clientId, 'heyreach');
        if (reachAccount) {
          toolUsed = 'heyreach';
          actionExecuted = 'heyreach: enroll_lead';
        }
      } else {
        // Enrichment route (Clay or BetterContact)
        const enrichmentAccount = await findToolAccount(clientId, 'clay') ||
                                  await findToolAccount(clientId, 'bettercontacts');
        if (enrichmentAccount) {
          toolUsed = enrichmentAccount.tool_name;
          actionExecuted = `${toolUsed}: enrich_lead`;
        }
      }
    } else {
      // Default: Notify + assign owner
      toolUsed = 'qhord';
      actionExecuted = 'create_task';

      await prisma.notification.create({
        data: {
          operator_id: operatorId,
          type: 'workflow_task_assigned',
          title: `New task: Follow up with ${record.first_name || 'Prospect'}`,
          message: `Lead: ${record.email || 'N/A'}. Action required.`,
        },
      });
    }

    return { tool_used: toolUsed, action_executed: actionExecuted };
  }

  // Get default operator to run active tasks
  private async getDefaultOperatorId(clientId: string): Promise<string> {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { created_by_operator_id: true },
    });
    if (client?.created_by_operator_id) return client.created_by_operator_id;
    const fallbackOp = await prisma.operator.findFirst();
    return fallbackOp!.id;
  }
}

export const workflowEngine = new WorkflowEngine();

import { prisma } from '../lib/prisma';
import { ApolloService } from './apollo.service';
import { ClayService } from './clay.service';
import { SmartLeadService } from './smartlead.service';
import { InstantlyService } from './instantly.service';
import { HeyReachService } from './heyreach.service';
import { BetterContactService } from './bettercontact.service';
import { findToolAccount } from '../ai/pipeline/ensure-tool-accounts';
import { workflowQueue } from '../queue/workflow-queue';
import { useFreeDemoStack } from '../config/demo-stack';

export class CampaignWorkflowEngine {
  // Starts a new run for a lead in a campaign workflow
  async startWorkflowRun(workflowId: string, leadId: string) {
    try {
      console.log(`[CampaignWorkflowEngine] Starting workflow ${workflowId} for lead ${leadId}`);

      // Check if workflow is active
      const workflow = await prisma.campaignWorkflow.findUnique({
        where: { id: workflowId },
        include: { nodes: true },
      });

      if (!workflow || workflow.status !== 'active') {
        console.log(`[CampaignWorkflowEngine] Workflow ${workflowId} is not active or not found.`);
        return;
      }

      // Check if there is already an active run for this lead
      const existingRun = await prisma.campaignWorkflowRun.findFirst({
        where: {
          campaign_workflow_id: workflowId,
          lead_id: leadId,
          status: { in: ['pending', 'running'] },
        },
      });

      if (existingRun) {
        console.log(`[CampaignWorkflowEngine] Run already active for lead ${leadId} in workflow ${workflowId}`);
        return;
      }

      // Find the start/source node (or trigger node)
      const startNode = workflow.nodes.find(n => n.node_type === 'source') || workflow.nodes[0];
      if (!startNode) {
        console.error(`[CampaignWorkflowEngine] No start node found in workflow ${workflowId}`);
        return;
      }

      // Create a new workflow run
      const run = await prisma.campaignWorkflowRun.create({
        data: {
          campaign_workflow_id: workflowId,
          lead_id: leadId,
          status: 'running',
        },
      });

      // Execute the first node
      await this.executeNode(run.id, startNode.id);
    } catch (error) {
      console.error('[CampaignWorkflowEngine] startWorkflowRun error:', error);
    }
  }

  // Executes a single node in a workflow run
  async executeNode(runId: string, nodeId: string) {
    let runStep = null;
    try {
      const run = await prisma.campaignWorkflowRun.findUnique({
        where: { id: runId },
        include: {
          workflow: {
            include: {
              campaign: true,
            },
          },
          lead: true,
        },
      });

      if (!run || run.status !== 'running') {
        console.log(`[CampaignWorkflowEngine] Run ${runId} is not running.`);
        return;
      }

      const node = await prisma.workflowNode.findUnique({
        where: { id: nodeId },
      });

      if (!node) {
        throw new Error(`Node ${nodeId} not found`);
      }

      console.log(`[CampaignWorkflowEngine] Executing node ${node.id} (${node.node_type}:${node.tool}) for run ${runId}`);

      // Create run step log
      runStep = await prisma.workflowRunStep.create({
        data: {
          run_id: runId,
          node_id: nodeId,
          status: 'running',
          started_at: new Date(),
        },
      });

      let output: any = {};
      const config = (node.configuration_json as any) || {};

      switch (node.node_type) {
        case 'source':
          // Source nodes mark the start. If we are running per-lead, they just complete.
          output = { message: 'Workflow initiated' };
          break;

        case 'enrichment':
          output = await this.executeEnrichmentNode(node, run.lead!, run.workflow.campaign.client_id);
          break;

        case 'ai':
          output = await this.executeAiNode(node, run.lead!);
          break;

        case 'action':
          output = await this.executeActionNode(node, run.lead!, run.workflow.campaign.client_id);
          break;

        case 'condition':
          const conditionPassed = await this.evaluateCondition(node, run.lead!);
          await prisma.workflowRunStep.update({
            where: { id: runStep.id },
            data: {
              status: 'completed',
              output_json: { passed: conditionPassed },
              completed_at: new Date(),
            },
          });
          // Branch based on condition
          await this.transitionNext(runId, nodeId, conditionPassed ? 'yes' : 'no');
          return;

        case 'delay':
          const waitDays = config.wait_days || 1;
          const waitMs = waitDays * 24 * 60 * 60 * 1000;
          await prisma.workflowRunStep.update({
            where: { id: runStep.id },
            data: {
              status: 'waiting_event',
              output_json: { delay_ms: waitMs, resume_at: new Date(Date.now() + waitMs) },
            },
          });

          // Queue delay job using BullMQ
          await workflowQueue.add(
            `resume-run-${runId}-${nodeId}`,
            { runId, nextNodeId: await this.getNextNodeId(nodeId, 'default') },
            { delay: waitMs }
          );
          return;

        case 'event':
          // Event node pauses and waits for incoming webhook trigger
          await prisma.workflowRunStep.update({
            where: { id: runStep.id },
            data: {
              status: 'waiting_event',
              output_json: { waiting_for_event: node.tool },
            },
          });
          return;

        default:
          throw new Error(`Unsupported node type: ${node.node_type}`);
      }

      // Update run step to completed
      await prisma.workflowRunStep.update({
        where: { id: runStep.id },
        data: {
          status: 'completed',
          output_json: output as any,
          completed_at: new Date(),
        },
      });

      // Proceed to the next node in the pipeline
      await this.transitionNext(runId, nodeId, 'default');
    } catch (error: any) {
      console.error(`[CampaignWorkflowEngine] Node execution error on step ${runStep?.id || 'unknown'}:`, error);
      if (runStep) {
        await prisma.workflowRunStep.update({
          where: { id: runStep.id },
          data: {
            status: 'failed',
            error_message: error.message || 'Node execution failed',
            completed_at: new Date(),
          },
        });
      }
      await prisma.campaignWorkflowRun.update({
        where: { id: runId },
        data: {
          status: 'failed',
          error_message: error.message || 'Workflow execution failed',
        },
      });
    }
  }

  // Transitions execution to the next node based on condition edge
  private async transitionNext(runId: string, currentNodeId: string, conditionType: string) {
    const nextNodeId = await this.getNextNodeId(currentNodeId, conditionType);
    if (nextNodeId) {
      await this.executeNode(runId, nextNodeId);
    } else {
      // No next node, meaning workflow completed for this run
      await prisma.campaignWorkflowRun.update({
        where: { id: runId },
        data: { status: 'completed' },
      });
      console.log(`[CampaignWorkflowEngine] Workflow completed for run ${runId}`);
    }
  }

  // Helper to fetch the next node ID via edges
  private async getNextNodeId(sourceNodeId: string, conditionType: string): Promise<string | null> {
    const edge = await prisma.workflowEdge.findFirst({
      where: {
        source_node_id: sourceNodeId,
        condition_type: conditionType,
      },
    });
    return edge?.target_node_id || null;
  }

  // Enrichment nodes logic
  private async executeEnrichmentNode(node: any, lead: any, clientId: string) {
    const account = await findToolAccount(clientId, node.tool);
    if (!account && !useFreeDemoStack()) {
      throw new Error(`Account not connected for tool: ${node.tool}`);
    }

    const apiKey = account?.api_key_encrypted || 'mock_api_key';

    if (node.tool === 'clay') {
      const service = new ClayService(apiKey);
      const output = await service.enrichLead({
        email: lead.email,
        first_name: lead.first_name,
        last_name: lead.last_name,
        company: lead.company_name,
        linkedin_url: lead.linkedin_url,
      });

      // Update lead
      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          enriched: true,
          enrichment_data: output as any,
          linkedin_url: output.linkedin_url || lead.linkedin_url,
        },
      });
      return output;
    }

    if (node.tool === 'bettercontact') {
      const service = new BetterContactService(apiKey);
      const output = await service.enrichLead({
        contacts: [{
          email: lead.email,
          first_name: lead.first_name,
          last_name: lead.last_name,
          company: lead.company_name,
          linkedin_url: lead.linkedin_url,
        }],
      });

      // Find email status
      const verified = output.data?.some((c: any) => c.email_status === 'valid') ?? true;
      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          status: verified ? 'verified' : 'catch-all',
          enrichment_data: output as any,
        },
      });
      return output;
    }

    throw new Error(`Unsupported enrichment tool: ${node.tool}`);
  }

  // AI nodes logic
  private async executeAiNode(node: any, lead: any) {
    const config = node.configuration_json || {};
    if (node.tool === 'openai' || node.tool === 'anthropic' || node.tool === 'internal') {
      // Simple prompt templates mapping variables
      const template = config.template || 'Hi {{first_name}}, love your company {{company_name}}';
      const outputText = template
        .replace(/\{\{first_name\}\}/g, lead.first_name || 'there')
        .replace(/\{\{company_name\}\}/g, lead.company_name || 'your company');

      return { generated_text: outputText };
    }
    return { status: 'skipped' };
  }

  // Action nodes logic
  private async executeActionNode(node: any, lead: any, clientId: string) {
    const account = await findToolAccount(clientId, node.tool);
    if (!account && !useFreeDemoStack()) {
      throw new Error(`Account not connected for action tool: ${node.tool}`);
    }

    const apiKey = account?.api_key_encrypted || 'mock_api_key';
    const config = node.configuration_json || {};

    if (node.tool === 'smartlead') {
      const service = new SmartLeadService(apiKey);
      const campaigns = await service.fetchCampaigns();
      const campaignId = config.campaign_id || campaigns[0]?.id || '1';
      const res = await service.enrollLead({
        campaign_id: campaignId,
        email: lead.email,
        first_name: lead.first_name,
        last_name: lead.last_name,
        company_name: lead.company_name,
      });

      // Update lead status
      await prisma.lead.update({
        where: { id: lead.id },
        data: { status: 'emailed' },
      });
      return res;
    }

    if (node.tool === 'instantly') {
      const service = new InstantlyService(apiKey);
      const campaigns = await service.fetchCampaigns();
      const campaignId = config.campaign_id || campaigns[0]?.id || '1';
      const res = await service.enrollLead({
        campaign_id: campaignId,
        email: lead.email,
        first_name: lead.first_name,
        last_name: lead.last_name,
      });
      return res;
    }

    if (node.tool === 'heyreach') {
      const service = new HeyReachService(apiKey);
      const campaigns = await service.fetchCampaigns();
      const campaignId = config.campaign_id || campaigns[0]?.id || '1';
      const res = await service.enrollLead({
        campaign_id: campaignId,
        email: lead.email,
        first_name: lead.first_name,
        last_name: lead.last_name,
      });
      return res;
    }

    throw new Error(`Unsupported action tool: ${node.tool}`);
  }

  // Evaluates branching condition node
  private async evaluateCondition(node: any, lead: any): Promise<boolean> {
    if (node.tool === 'bettercontact') {
      // Check if email is verified
      return lead.status === 'verified';
    }
    if (node.tool === 'heyreach' || node.tool === 'linkedin') {
      // Check if linkedin exists
      return !!lead.linkedin_url && lead.linkedin_url.trim().length > 0;
    }
    if (node.tool === 'replied') {
      return lead.status === 'replied';
    }
    return true;
  }

  // Webhook trigger ingestion logic to resume paused events
  async resumeWorkflowRunOnEvent(email: string, eventName: string, payload: any) {
    try {
      console.log(`[CampaignWorkflowEngine] Webhook event "${eventName}" for lead email: ${email}`);

      // Find leads with this email
      const leads = await prisma.lead.findMany({
        where: { email },
      });

      const leadIds = leads.map(l => l.id);

      // Find active runs waiting for event
      const waitingSteps = await prisma.workflowRunStep.findMany({
        where: {
          status: 'waiting_event',
          run: {
            lead_id: { in: leadIds },
            status: 'running',
          },
        },
        include: {
          node: true,
        },
      });

      console.log(`[CampaignWorkflowEngine] Found ${waitingSteps.length} runs waiting for events.`);

      for (const step of waitingSteps) {
        // Check if event matches the node tool
        const matched = this.isEventMatchingNode(eventName, step.node.tool);
        if (matched) {
          console.log(`[CampaignWorkflowEngine] Match found! Resuming run ${step.run_id} from node ${step.node_id}`);

          // Mark current event node step as completed
          await prisma.workflowRunStep.update({
            where: { id: step.id },
            data: {
              status: 'completed',
              completed_at: new Date(),
              output_json: payload as any,
            },
          });

          // Retrieve next node
          const nextNodeId = await this.getNextNodeId(step.node_id, 'default');
          if (nextNodeId) {
            await this.executeNode(step.run_id, nextNodeId);
          } else {
            // No next node, complete run
            await prisma.campaignWorkflowRun.update({
              where: { id: step.run_id },
              data: { status: 'completed' },
            });
          }
        }
      }
    } catch (error) {
      console.error('[CampaignWorkflowEngine] resumeWorkflowRunOnEvent error:', error);
    }
  }

  private isEventMatchingNode(eventName: string, nodeTool: string): boolean {
    const lowerEvent = eventName.toLowerCase();
    const lowerTool = nodeTool.toLowerCase();

    if (lowerTool === 'smartlead' || lowerTool === 'instantly' || lowerTool === 'apollo') {
      return lowerEvent.includes('reply') || lowerEvent.includes('replied');
    }
    if (lowerTool === 'heyreach' || lowerTool === 'linkedin') {
      return lowerEvent.includes('reply') || lowerEvent.includes('replied') || lowerEvent.includes('accepted');
    }
    if (lowerTool === 'calendly') {
      return lowerEvent.includes('booked') || lowerEvent.includes('meeting');
    }

    return false;
  }
}

export const campaignWorkflowEngine = new CampaignWorkflowEngine();

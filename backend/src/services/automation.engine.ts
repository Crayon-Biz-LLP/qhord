import { prisma } from '../lib/prisma';
import { workflowQueue } from '../queue/workflow-queue';
import { WorkflowToolAdapter } from './tool-adapters/WorkflowToolAdapter';
import { ApolloAdapter } from './tool-adapters/ApolloAdapter';
import { SmartleadAdapter } from './tool-adapters/SmartleadAdapter';

export class AutomationEngine {
  private adapters: Record<string, WorkflowToolAdapter> = {
    'apollo': new ApolloAdapter(),
    'smartlead': new SmartleadAdapter(),
  };

  /**
   * Starts a workflow execution run
   */
  async startRun(workflowId: string, triggerPayload: any, clientId: string, recordId?: string) {
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: { nodes: true, edges: true }
    });

    if (!workflow || !workflow.isActive || workflow.status !== 'active') {
      console.warn(`[AutomationEngine] Workflow ${workflowId} not active.`);
      return;
    }

    const triggerNode = workflow.nodes.find(n => n.node_type === 'trigger');
    if (!triggerNode) {
      console.error(`[AutomationEngine] No trigger node found for workflow ${workflowId}`);
      return;
    }

    // Create a new run
    const run = await prisma.workflowRun.create({
      data: {
        workflow_id: workflowId,
        triggerSource: triggerNode.action || triggerNode.tool || 'manual',
        triggerPayload: triggerPayload,
        status: 'running',
        startedAt: new Date(),
        totalRecords: 1,
        currentNodeId: triggerNode.id
      }
    });

    // Queue job to process the next step
    await workflowQueue.add(`run-${run.id}-${Date.now()}`, {
      runId: run.id,
      nodeId: triggerNode.id,
      recordId: recordId,
      input: triggerPayload,
      clientId: clientId
    });

    return run.id;
  }

  /**
   * Processes a single node execution via BullMQ worker
   */
  async processStep(jobData: { runId: string, nodeId: string, recordId?: string, input: any, clientId: string }) {
    const { runId, nodeId, recordId, input, clientId } = jobData;
    
    // Create run step log
    const step = await prisma.workflowRunStep.create({
      data: {
        run_id: runId,
        node_id: nodeId,
        record_id: recordId,
        input_json: input,
        status: 'running',
        started_at: new Date(),
      },
      include: { node: true }
    });

    try {
      let output = input; // Default output is just passing input through
      
      const node = step.node;
      
      if (node.node_type === 'trigger') {
         // Trigger nodes just pass payload through
         output = input;
      } else if (node.node_type === 'action' || node.node_type === 'source' || node.node_type === 'enrichment') {
         // Execute tool action
         const adapter = this.adapters[node.tool?.toLowerCase() || ''];
         if (adapter) {
           const result = await adapter.execute(node.action!, node.configuration_json as Record<string, unknown>, {
              workspaceId: 'system', clientAccountId: clientId, workflowRunId: runId, recordId
           });
           
           if (!result.success) {
               throw new Error(result.error || 'Unknown adapter error');
           }

           output = { ...input, [node.tool!]: result.output };
         } else {
           console.warn(`[AutomationEngine] No adapter found for tool: ${node.tool}`);
         }
      }

      await prisma.workflowRunStep.update({
        where: { id: step.id },
        data: {
          status: 'completed',
          output_json: output,
          completed_at: new Date()
        }
      });

      // Find next node via edges
      const edges = await prisma.workflowEdge.findMany({
        where: { source_node_id: nodeId }
      });

      if (edges.length > 0) {
        // Enqueue next steps
        for (const edge of edges) {
           await workflowQueue.add(`run-${runId}-${edge.target_node_id}`, {
             runId,
             nodeId: edge.target_node_id,
             recordId,
             input: output,
             clientId
           });
        }
      } else {
        // Workflow complete
        await prisma.workflowRun.update({
          where: { id: runId },
          data: { status: 'completed', completedAt: new Date() }
        });
      }

    } catch (error: any) {
      console.error(`[AutomationEngine] Step ${step.id} failed:`, error);
      await prisma.workflowRunStep.update({
        where: { id: step.id },
        data: {
          status: 'failed',
          error_message: error.message,
          completed_at: new Date()
        }
      });
      await prisma.workflowRun.update({
        where: { id: runId },
        data: { status: 'failed', error_message: error.message, completedAt: new Date() }
      });
    }
  }
}

export const automationEngine = new AutomationEngine();

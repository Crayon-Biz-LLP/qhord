import { prisma } from '../lib/prisma';
import { nodeProcessorFactory } from './nodes';
import { WorkflowNode, WorkflowEdge } from '@prisma/client';

export class WorkflowEngine {
  async executeRun(runId: string) {
    const run = await prisma.workflowRun.findUnique({
      where: { id: runId },
      include: { workflow: true }
    });

    if (!run) throw new Error('Run not found');

    const nodes = await prisma.workflowNode.findMany({ where: { workflow_id: run.workflow_id } });
    const edges = await prisma.workflowEdge.findMany({ where: { workflow_id: run.workflow_id } });

    // Mark run as running
    await prisma.workflowRun.update({
      where: { id: runId },
      data: { status: 'running', startedAt: new Date() }
    });

    try {
      // Find trigger node
      const triggerNode = nodes.find(n => n.node_type === 'trigger');
      if (!triggerNode) throw new Error('No trigger node found');

      // State to hold outputs
      const previousOutputs: Record<string, any> = {};

      if (run.triggerPayload) {
        previousOutputs[triggerNode.id] = run.triggerPayload;
      }

      await this.processNode(triggerNode.id, nodes, edges, runId, run.workflow.client_id, previousOutputs);

      await prisma.workflowRun.update({
        where: { id: runId },
        data: { status: 'completed', completedAt: new Date() }
      });
    } catch (error: any) {
      console.error(`Run ${runId} failed:`, error);
      await prisma.workflowRun.update({
        where: { id: runId },
        data: { status: 'failed', completedAt: new Date(), error_message: error.message }
      });
    }
  }

  private async processNode(
    nodeId: string, 
    nodes: WorkflowNode[], 
    edges: WorkflowEdge[], 
    runId: string, 
    clientId: string,
    previousOutputs: Record<string, any>
  ): Promise<void> {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    if (node.node_type !== 'trigger') {
      // Create Run Step
      const step = await prisma.workflowRunStep.create({
        data: {
          run_id: runId,
          node_id: node.id,
          status: 'running',
          started_at: new Date(),
          input_json: previousOutputs
        }
      });

      const processor = nodeProcessorFactory.getProcessor(node.tool);
      
      try {
        const result = await processor.execute(node, previousOutputs, {
          prisma,
          runId,
          workflowId: node.workflow_id,
          clientId,
          previousOutputs
        });

        await prisma.workflowRunStep.update({
          where: { id: step.id },
          data: {
            status: result.status,
            output_json: result.output,
            error_message: result.error,
            error_code: result.errorCode,
            completed_at: new Date()
          }
        });

        if (result.status === 'failed') {
          throw new Error(`Node ${node.id} failed: ${result.error}`);
        }

        previousOutputs[node.id] = result.output;
      } catch (error: any) {
        await prisma.workflowRunStep.update({
          where: { id: step.id },
          data: {
            status: 'failed',
            error_message: error.message,
            completed_at: new Date()
          }
        });
        throw error;
      }
    }

    // Find next edges
    const outgoingEdges = edges.filter(e => e.source_node_id === node.id);
    if (outgoingEdges.length === 0) return;

    // Handle If/Else Branching Evaluation
    if (node.tool === 'if_else' || node.tool === 'branch') {
        // Evaluate conditions on edges
        let matchedEdge = null;
        for (const edge of outgoingEdges) {
            const condition = edge.conditionJson as any;
            if (!condition || Object.keys(condition).length === 0) {
               // Default path if no condition
               if (!matchedEdge) matchedEdge = edge;
            } else {
               // Very basic condition evaluation for now
               // Expecting condition: { field: "lead.status", operator: "equals", value: "Replied" }
               // In reality, this needs a robust jsonpath/lodash get evaluation against previousOutputs
               matchedEdge = edge; // Simulate matching the first one for now
               break;
            }
        }
        
        if (matchedEdge) {
            await this.processNode(matchedEdge.target_node_id, nodes, edges, runId, clientId, previousOutputs);
        }
    } else {
        // Sequential flow (usually just one outgoing edge)
        for (const edge of outgoingEdges) {
            await this.processNode(edge.target_node_id, nodes, edges, runId, clientId, previousOutputs);
        }
    }
  }
}

export const workflowEngine = new WorkflowEngine();

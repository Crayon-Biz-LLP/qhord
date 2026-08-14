import { prisma } from '../lib/prisma';
import { nodeProcessorFactory } from './nodes';
import { WorkflowNode, WorkflowEdge } from '@prisma/client';

export class WorkflowEngine {
  async executeRun(runId: string, isTestMode: boolean = false) {
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

    const testTrace: string[] = [];

    try {
      // Find trigger node
      const triggerNode = nodes.find(n => n.node_type === 'trigger');
      if (!triggerNode) throw new Error('No trigger node found');

      // State to hold outputs
      const previousOutputs: Record<string, any> = {};

      if (run.triggerPayload) {
        previousOutputs[triggerNode.id] = run.triggerPayload;
      }

      await this.processNode(triggerNode.id, nodes, edges, runId, run.workflow.client_id, previousOutputs, isTestMode, testTrace);

      await prisma.workflowRun.update({
        where: { id: runId },
        data: { status: 'completed', completedAt: new Date() }
      });

      return { success: true, trace: testTrace };
    } catch (error: any) {
      console.error(`Run ${runId} failed:`, error);
      await prisma.workflowRun.update({
        where: { id: runId },
        data: { status: 'failed', completedAt: new Date(), error_message: error.message }
      });
      return { success: false, error: error.message, trace: testTrace };
    }
  }

  private async processNode(
    nodeId: string, 
    nodes: WorkflowNode[], 
    edges: WorkflowEdge[], 
    runId: string, 
    clientId: string,
    previousOutputs: Record<string, any>,
    isTestMode: boolean,
    testTrace: string[]
  ): Promise<void> {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    if (isTestMode) {
      testTrace.push(`Starting node: ${node.tool} / ${node.action}`);
    }

    const isLogicNode = node.tool === 'if_else' || node.tool === 'branch';

    if (node.node_type !== 'trigger' && !isLogicNode) {
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
          previousOutputs,
          isTestMode,
          testTrace
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
          if (isTestMode) testTrace.push(`❌ Node failed: ${result.error}`);
          throw new Error(`Node ${node.id} failed: ${result.error}`);
        }

        if (isTestMode) testTrace.push(`✓ Node executed successfully.`);
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
    } else {
       if (isTestMode) testTrace.push(`✓ ${isLogicNode ? 'Logic' : 'Trigger'} node resolved.`);
    }

    // Find next edges
    const outgoingEdges = edges.filter(e => e.source_node_id === node.id);
    if (outgoingEdges.length === 0) return;

    // Handle If/Else Branching Evaluation
    if (node.tool === 'if_else' || node.tool === 'branch') {
        let matchedEdge = null;
        let defaultEdge = null;

        for (const edge of outgoingEdges) {
            const condition = edge.conditionJson as any;
            if (!condition || Object.keys(condition).length === 0) {
               if (!defaultEdge) defaultEdge = edge;
            } else {
               // Evaluate condition
               const { field, operator, value } = condition;
               // Extract value from previous outputs
               let actualValue: any = undefined;
               if (field && typeof field === 'string') {
                 // Dynamic resolution if field has a dot path e.g. "Apollo_123.output.contacts.0.email"
                 // To do this we can require the user to configure condition field without {{}} or with, and strip it.
                 const path = field.replace(/[{}]/g, ''); 
                 
                 const parts = path.trim().split('.');
                 let current: any = previousOutputs;
                 for (const part of parts) {
                   if (current === undefined || current === null) break;
                   current = current[part];
                 }
                 actualValue = current;
               }
               
               let isMatch = false;
               if (operator === 'equals' && actualValue == value) isMatch = true;
               else if (operator === 'not_equals' && actualValue != value) isMatch = true;
               else if (operator === 'contains' && String(actualValue).includes(String(value))) isMatch = true;
               else if (operator === 'greater_than' && Number(actualValue) > Number(value)) isMatch = true;
               else if (operator === 'less_than' && Number(actualValue) < Number(value)) isMatch = true;
               else if (operator === 'is_empty' && !actualValue) isMatch = true;
               else if (operator === 'is_not_empty' && actualValue) isMatch = true;

               if (isMatch) {
                 matchedEdge = edge;
                 break;
               }
            }
        }
        
        const finalEdge = matchedEdge || defaultEdge;
        if (finalEdge) {
            if (isTestMode) testTrace.push(`↳ Branched to edge ${finalEdge.id}`);
            await this.processNode(finalEdge.target_node_id, nodes, edges, runId, clientId, previousOutputs, isTestMode, testTrace);
        } else {
            if (isTestMode) testTrace.push(`⚠ No branch matched, stopping.`);
        }
    } else {
        // Sequential flow (usually just one outgoing edge)
        for (const edge of outgoingEdges) {
            await this.processNode(edge.target_node_id, nodes, edges, runId, clientId, previousOutputs, isTestMode, testTrace);
        }
    }
  }
}

export const workflowEngine = new WorkflowEngine();

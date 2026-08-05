import { WorkflowNode, WorkflowRunStep, PrismaClient } from '@prisma/client';

export interface NodeExecutionResult {
  status: 'completed' | 'failed' | 'waiting_event';
  output?: any;
  error?: string;
  errorCode?: string;
}

export interface NodeProcessorContext {
  prisma: PrismaClient;
  runId: string;
  workflowId: string;
  clientId: string;
  previousOutputs: Record<string, any>; // outputs keyed by node_id
}

export interface NodeProcessor {
  execute(node: WorkflowNode, input: any, context: NodeProcessorContext): Promise<NodeExecutionResult>;
}

export class NodeProcessorFactory {
  private processors = new Map<string, NodeProcessor>();

  register(toolName: string, processor: NodeProcessor) {
    this.processors.set(toolName, processor);
  }

  getProcessor(toolName: string): NodeProcessor {
    const processor = this.processors.get(toolName);
    if (!processor) {
      // Fallback processor if none is registered
      return {
        execute: async (node) => ({
          status: 'completed',
          output: { message: `Simulated execution for tool: ${toolName}`, action: node.action }
        })
      };
    }
    return processor;
  }
}

export const nodeProcessorFactory = new NodeProcessorFactory();

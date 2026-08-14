import { WorkflowNode, WorkflowRunStep, PrismaClient } from '@prisma/client';
import { ApolloProcessor } from './apollo';
import { ClayProcessor } from './clay';
import { HeyReachProcessor } from './heyreach';
import { SmartleadProcessor } from './smartlead';
import { BetterContactProcessor } from './bettercontact';
import { InstantlyProcessor } from './instantly';
import { CalendlyProcessor } from './calendly';
import { GojiberryProcessor } from './gojiberry';

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
  isTestMode?: boolean;
  testTrace?: string[];
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
      // Throw error if processor is not implemented
      return {
        execute: async (node) => ({
          status: 'failed',
          error: `Action not implemented: ${toolName} -> ${node.action}`
        })
      };
    }
    return processor;
  }
}

export const nodeProcessorFactory = new NodeProcessorFactory();

// Register concrete implementations
nodeProcessorFactory.register('Apollo', new ApolloProcessor());
nodeProcessorFactory.register('Clay', new ClayProcessor());
nodeProcessorFactory.register('HeyReach', new HeyReachProcessor());
nodeProcessorFactory.register('Smartlead', new SmartleadProcessor());
nodeProcessorFactory.register('BetterContact', new BetterContactProcessor());
nodeProcessorFactory.register('Instantly', new InstantlyProcessor());
nodeProcessorFactory.register('Calendly', new CalendlyProcessor());
nodeProcessorFactory.register('Gojiberry', new GojiberryProcessor());

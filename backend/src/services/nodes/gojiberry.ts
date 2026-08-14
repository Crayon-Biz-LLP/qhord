import axios from 'axios';
import { WorkflowNode } from '@prisma/client';
import { NodeProcessor, NodeProcessorContext, NodeExecutionResult } from './index';
import { interpolateConfig } from './utils';
import { BaseProcessor } from './base';

export class GojiberryProcessor extends BaseProcessor implements NodeProcessor {
  async execute(node: WorkflowNode, input: any, context: NodeProcessorContext): Promise<NodeExecutionResult> {
    try {
      const config = interpolateConfig(node.configuration_json || {}, context.previousOutputs);

      // Verify credentials just like other processors
      const creds = await this.getCredentials('Gojiberry', config, context);
      if ('status' in creds && creds.status === 'failed') {
        return creds;
      }
      
      if (context.isTestMode) {
        context.testTrace?.push(`⚠ [Test Mode] Gojiberry integration is currently pending API documentation.`);
        return { status: 'completed', output: { success: true, message: 'Gojiberry test stub' } };
      }

      return {
        status: 'failed',
        error: `Action '${node.action}' is not supported yet for Gojiberry. Pending official API documentation integration.`
      };

    } catch (error: any) {
      console.error('[GojiberryProcessor] Error:', error?.response?.data || error.message);
      return this.handleError(error, 'Gojiberry');
    }
  }
}

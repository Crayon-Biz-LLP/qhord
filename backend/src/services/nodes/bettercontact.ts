import axios from 'axios';
import { WorkflowNode } from '@prisma/client';
import { NodeProcessor, NodeProcessorContext, NodeExecutionResult } from './index';
import { interpolateConfig } from './utils';
import { BaseProcessor } from './base';

export class BetterContactProcessor extends BaseProcessor implements NodeProcessor {
  async execute(node: WorkflowNode, input: any, context: NodeProcessorContext): Promise<NodeExecutionResult> {
    try {
      const config = interpolateConfig(node.configuration_json || {}, context.previousOutputs);

      const creds = await this.getCredentials('BetterContact', config, context);
      if ('status' in creds && creds.status === 'failed') {
        return creds;
      }
      const { apiKey } = creds as { apiKey: string; account: any };

      const betterContactClient = axios.create({
        baseURL: 'https://api.bettercontact.io/v1',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      });

      if (context.isTestMode) {
        context.testTrace?.push(`⚠ [Test Mode] Skipping actual BetterContact ${node.action} execution.`);
        return { status: 'completed', output: { success: true, enriched: true } };
      }

      switch (node.action) {
        case 'find_email':
        case 'enrich_contact': {
          const response = await betterContactClient.post('/enrich', config);
          return { status: 'completed', output: response.data };
        }

        default:
          return {
            status: 'failed',
            error: `Action '${node.action}' is not supported yet for BetterContact.`
          };
      }
    } catch (error: any) {
      console.error('[BetterContactProcessor] Error:', error?.response?.data || error.message);
      return this.handleError(error, 'BetterContact');
    }
  }
}

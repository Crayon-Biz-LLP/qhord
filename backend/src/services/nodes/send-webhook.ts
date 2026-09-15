import axios from 'axios';
import { WorkflowNode } from '@prisma/client';
import { NodeProcessor, NodeProcessorContext, NodeExecutionResult } from './index';
import { interpolateConfig } from './utils';
import { BaseProcessor } from './base';

const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

// Generic outbound webhook — no third-party account required, just a URL the user controls.
export class SendWebhookProcessor extends BaseProcessor implements NodeProcessor {
  async execute(node: WorkflowNode, input: any, context: NodeProcessorContext): Promise<NodeExecutionResult> {
    try {
      const config = interpolateConfig(node.configuration_json || {}, context.previousOutputs);

      if (!config.url) {
        return { status: 'failed', error: 'Missing url for send_webhook action.' };
      }

      const method = ALLOWED_METHODS.includes((config.method || '').toUpperCase()) ? config.method.toUpperCase() : 'POST';

      let headers: Record<string, string> = {};
      if (config.headers) {
        if (typeof config.headers === 'string') {
          try {
            headers = JSON.parse(config.headers);
          } catch {
            return { status: 'failed', error: 'Headers must be valid JSON.' };
          }
        } else {
          headers = config.headers;
        }
      }

      let data: any = undefined;
      if (config.body) {
        if (typeof config.body === 'string') {
          try {
            data = JSON.parse(config.body);
          } catch {
            data = config.body; // allow a plain-text body
          }
        } else {
          data = config.body;
        }
      }

      if (context.isTestMode) {
        context.testTrace?.push(`⚠ [Test Mode] Skipping actual outbound request to ${config.url}.`);
        return { status: 'completed', output: { success: true, url: config.url, method } };
      }

      const response = await axios.request({ url: config.url, method, headers, data, timeout: 15000, validateStatus: () => true });
      if (response.status >= 400) {
        return { status: 'failed', error: `Webhook responded with HTTP ${response.status}.`, errorCode: String(response.status) };
      }

      return { status: 'completed', output: { statusCode: response.status, data: response.data } };
    } catch (error: any) {
      console.error('[SendWebhookProcessor] Error:', error?.response?.data || error.message);
      return this.handleError(error, 'Webhook');
    }
  }
}

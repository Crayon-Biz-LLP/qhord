import { WorkflowNode } from '@prisma/client';
import { NodeProcessor, NodeProcessorContext, NodeExecutionResult } from './index';
import { interpolateConfig } from './utils';
import { BaseProcessor } from './base';
import { prepareWebhookRequest, executeWebhook, openStoredSecret, describeWebhookError, WebhookConfigError } from './webhook-request';

// Generic outbound webhook — no third-party account required, just a URL the user controls.
export class SendWebhookProcessor extends BaseProcessor implements NodeProcessor {
  async execute(node: WorkflowNode, input: any, context: NodeProcessorContext): Promise<NodeExecutionResult> {
    try {
      const config = interpolateConfig(node.configuration_json || {}, context.previousOutputs);

      if (context.isTestMode) {
        // Validate the configuration but never send in a workflow test run.
        prepareWebhookRequest(config, '');
        context.testTrace?.push(`⚠ [Test Mode] Skipping actual ${String(config.method || 'GET').toUpperCase()} request to ${config.url}.`);
        return { status: 'completed', output: { success: true, url: config.url, method: config.method || 'GET' } };
      }

      let secret = '';
      try {
        secret = openStoredSecret(config.authSecret);
      } catch {
        return { status: 'failed', error: 'Could not read the saved authentication secret. Re-enter it in the Send webhook settings.' };
      }

      const result = await executeWebhook(prepareWebhookRequest(config, secret));
      if (result.status >= 400) {
        return { status: 'failed', error: `Webhook responded with HTTP ${result.status}.`, errorCode: String(result.status) };
      }

      return { status: 'completed', output: { statusCode: result.status, data: result.data } };
    } catch (error: any) {
      if (!(error instanceof WebhookConfigError)) {
        console.error('[SendWebhookProcessor] Error:', error?.message);
      }
      return { status: 'failed', error: `[Webhook] ${describeWebhookError(error)}` };
    }
  }
}

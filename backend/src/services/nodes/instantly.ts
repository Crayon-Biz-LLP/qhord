import axios from 'axios';
import { WorkflowNode } from '@prisma/client';
import { NodeProcessor, NodeProcessorContext, NodeExecutionResult } from './index';
import { interpolateConfig } from './utils';
import { BaseProcessor } from './base';

export class InstantlyProcessor extends BaseProcessor implements NodeProcessor {
  async execute(node: WorkflowNode, input: any, context: NodeProcessorContext): Promise<NodeExecutionResult> {
    try {
      const config = interpolateConfig(node.configuration_json || {}, context.previousOutputs);

      const creds = await this.getCredentials('Instantly', config, context);
      if ('status' in creds && creds.status === 'failed') {
        return creds;
      }
      const { apiKey } = creds as { apiKey: string; account: any };

      const instantlyClient = axios.create({
        baseURL: 'https://api.instantly.ai/api/v2',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      });

      switch (node.action) {
        case 'add_lead': {
          const payload = {
            campaign_id: config.campaign_id,
            leads: [
              {
                email: config.email,
                first_name: config.first_name,
                last_name: config.last_name,
                company_name: config.company_name,
                custom_variables: config.custom_fields || {}
              }
            ]
          };

          if (context.isTestMode) {
            context.testTrace?.push(`⚠ [Test Mode] Skipping actual Instantly add_lead execution.`);
            return { status: 'completed', output: { success: true, uploaded: 1 } };
          }

          if (!config.campaign_id) {
            // Technically Instantly can add leads without campaign, but usually they are tied.
            // Some endpoints like /api/v2/leads exist. Let's assume add_to_campaign logic if campaign_id is present.
          }

          const endpoint = config.campaign_id ? `/campaigns/${config.campaign_id}/leads` : `/leads`;
          const response = await instantlyClient.post(endpoint, payload);
          return { status: 'completed', output: response.data };
        }

        case 'add_to_campaign': {
           const payload = {
            leads: [
              { email: config.email }
            ]
          };

          if (context.isTestMode) {
            context.testTrace?.push(`⚠ [Test Mode] Skipping actual Instantly add_to_campaign execution.`);
            return { status: 'completed', output: { success: true, added: 1 } };
          }

          if (!config.campaign_id) {
            return { status: 'failed', error: 'Missing campaign_id for Instantly action.' };
          }

          const response = await instantlyClient.post(`/campaigns/${config.campaign_id}/leads`, payload);
          return { status: 'completed', output: response.data };
        }

        case 'send_email': {
          if (context.isTestMode) {
            context.testTrace?.push(`⚠ [Test Mode] Skipping actual Instantly send_email execution.`);
            return { status: 'completed', output: { success: true } };
          }
          return { status: 'completed', output: { success: true, mock: 'send_email' } };
        }

        default:
          return {
            status: 'failed',
            error: `Action '${node.action}' is not supported yet for Instantly.`
          };
      }
    } catch (error: any) {
      console.error('[InstantlyProcessor] Error:', error?.response?.data || error.message);
      return this.handleError(error, 'Instantly');
    }
  }
}

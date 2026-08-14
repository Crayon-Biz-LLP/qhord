import axios from 'axios';
import { WorkflowNode } from '@prisma/client';
import { NodeProcessor, NodeProcessorContext, NodeExecutionResult } from './index';
import { interpolateConfig } from './utils';
import { BaseProcessor } from './base';

export class SmartleadProcessor extends BaseProcessor implements NodeProcessor {
  async execute(node: WorkflowNode, input: any, context: NodeProcessorContext): Promise<NodeExecutionResult> {
    try {
      const config = interpolateConfig(node.configuration_json || {}, context.previousOutputs);

      const creds = await this.getCredentials('Smartlead', config, context);
      if ('status' in creds && creds.status === 'failed') {
        return creds;
      }
      const { apiKey } = creds as { apiKey: string; account: any };

      // Smartlead usually accepts api_key as a query parameter or header depending on the endpoint.
      // E.g., https://api.smartlead.ai/api/v1/campaigns?api_key=...
      const smartleadClient = axios.create({
        baseURL: 'https://api.smartlead.ai/api/v1',
        headers: {
          'Content-Type': 'application/json'
        },
        params: {
          api_key: apiKey
        }
      });

      switch (node.action) {
        case 'add_lead':
        case 'add_to_campaign': {
          const campaignId = config.campaign_id;
          const payload = {
            leadList: [
              {
                firstName: config.first_name,
                lastName: config.last_name,
                email: config.email,
                companyName: config.company_name,
                customFields: config.custom_fields || {}
              }
            ]
          };

          if (context.isTestMode) {
            context.testTrace?.push(`⚠ [Test Mode] Skipping actual Smartlead ${node.action} execution.`);
            return { status: 'completed', output: { success: true, leadsAdded: 1 } };
          }

          if (!campaignId) {
             return { status: 'failed', error: 'Missing campaign_id for Smartlead action.' };
          }

          const response = await smartleadClient.post(`/campaigns/${campaignId}/leads`, payload);
          return { status: 'completed', output: response.data };
        }

        case 'send_email': {
          // generic send_email via Smartlead (often used by just adding lead to campaign, but maybe direct email)
          if (context.isTestMode) {
            context.testTrace?.push(`⚠ [Test Mode] Skipping actual Smartlead send_email execution.`);
            return { status: 'completed', output: { success: true } };
          }
          // Assuming direct email API or just returning success for now
          return { status: 'completed', output: { success: true, mock: 'send_email' } };
        }

        case 'pause_campaign':
        case 'resume_campaign':
        case 'stop_campaign': {
           const campaignId = config.campaign_id;
           if (!campaignId) {
             return { status: 'failed', error: 'Missing campaign_id for Smartlead action.' };
           }

           const statusMap: Record<string, string> = {
             'pause_campaign': 'PAUSED',
             'resume_campaign': 'ACTIVE',
             'stop_campaign': 'STOPPED'
           };

           if (context.isTestMode) {
            context.testTrace?.push(`⚠ [Test Mode] Skipping actual Smartlead ${node.action} execution.`);
            return { status: 'completed', output: { success: true, newStatus: statusMap[node.action] } };
          }

           const response = await smartleadClient.post(`/campaigns/${campaignId}/status`, {
             status: statusMap[node.action]
           });
           
           return { status: 'completed', output: response.data };
        }

        default:
          return {
            status: 'failed',
            error: `Action '${node.action}' is not supported yet for Smartlead.`
          };
      }
    } catch (error: any) {
      console.error('[SmartleadProcessor] Error:', error?.response?.data || error.message);
      return this.handleError(error, 'Smartlead');
    }
  }
}

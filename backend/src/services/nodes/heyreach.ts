import axios from 'axios';
import { WorkflowNode } from '@prisma/client';
import { NodeProcessor, NodeProcessorContext, NodeExecutionResult } from './index';
import { interpolateConfig } from './utils';
import { BaseProcessor } from './base';

export class HeyReachProcessor extends BaseProcessor implements NodeProcessor {
  async execute(node: WorkflowNode, input: any, context: NodeProcessorContext): Promise<NodeExecutionResult> {
    try {
      const config = interpolateConfig(node.configuration_json || {}, context.previousOutputs);

      const creds = await this.getCredentials('HeyReach', config, context);
      if ('status' in creds && creds.status === 'failed') {
        return creds;
      }
      const { apiKey } = creds as { apiKey: string; account: any };

      const heyreachClient = axios.create({
        baseURL: 'https://api.heyreach.io/v1',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey // Assuming X-API-Key based on standard HeyReach API format
        }
      });

      switch (node.action) {
        case 'send_connection_request': {
          const payload = {
            profile_url: config.profile_url,
            message: config.message,
            campaign_id: config.campaign_id
          };

          if (context.isTestMode) {
            context.testTrace?.push(`⚠ [Test Mode] Skipping actual HeyReach send_connection_request execution.`);
            return { status: 'completed', output: { success: true, request_id: 'test_req_123' } };
          }

          const response = await heyreachClient.post('/linkedin/connection-requests', payload);
          return { status: 'completed', output: response.data };
        }

        case 'send_linkedin_message': {
          const payload = {
            profile_url: config.profile_url,
            message: config.message_template || config.message,
            campaign_id: config.campaign_id
          };

          if (context.isTestMode) {
            context.testTrace?.push(`⚠ [Test Mode] Skipping actual HeyReach send_linkedin_message execution.`);
            return { status: 'completed', output: { success: true, message_id: 'test_msg_123' } };
          }

          const response = await heyreachClient.post('/linkedin/messages', payload);
          return { status: 'completed', output: response.data };
        }

        case 'visit_profile':
        case 'like_post':
        case 'follow_profile':
        case 'send_follow_up': {
          if (context.isTestMode) {
            context.testTrace?.push(`⚠ [Test Mode] Skipping actual HeyReach ${node.action} execution.`);
            return { status: 'completed', output: { success: true } };
          }

          const endpoint = `/linkedin/${node.action.replace('_', '-')}`;
          const response = await heyreachClient.post(endpoint, config);
          return { status: 'completed', output: response.data };
        }

        default:
          return {
            status: 'failed',
            error: `Action '${node.action}' is not supported yet for HeyReach.`
          };
      }
    } catch (error: any) {
      console.error('[HeyReachProcessor] Error:', error?.response?.data || error.message);
      return this.handleError(error, 'HeyReach');
    }
  }
}

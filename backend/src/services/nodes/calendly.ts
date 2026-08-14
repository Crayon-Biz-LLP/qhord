import axios from 'axios';
import { WorkflowNode } from '@prisma/client';
import { NodeProcessor, NodeProcessorContext, NodeExecutionResult } from './index';
import { interpolateConfig } from './utils';
import { BaseProcessor } from './base';

export class CalendlyProcessor extends BaseProcessor implements NodeProcessor {
  async execute(node: WorkflowNode, input: any, context: NodeProcessorContext): Promise<NodeExecutionResult> {
    try {
      const config = interpolateConfig(node.configuration_json || {}, context.previousOutputs);

      const creds = await this.getCredentials('Calendly', config, context);
      if ('status' in creds && creds.status === 'failed') {
        return creds;
      }
      const { apiKey } = creds as { apiKey: string; account: any };

      const calendlyClient = axios.create({
        baseURL: 'https://api.calendly.com',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      });

      switch (node.action) {
        case 'create_scheduling_link':
        case 'book_meeting': {
          // Calendly API v2 allows creating single-use scheduling links
          const payload = {
            max_event_count: 1,
            owner: config.event_type || 'https://api.calendly.com/event_types/placeholder',
            owner_type: 'EventType'
          };

          if (context.isTestMode) {
            context.testTrace?.push(`⚠ [Test Mode] Skipping actual Calendly ${node.action} execution.`);
            return { 
              status: 'completed', 
              output: { 
                booking_url: 'https://calendly.com/test/30min' 
              } 
            };
          }

          const response = await calendlyClient.post('/scheduling_links', payload);
          return { status: 'completed', output: response.data };
        }

        case 'cancel_meeting': {
          if (context.isTestMode) {
            context.testTrace?.push(`⚠ [Test Mode] Skipping actual Calendly cancel_meeting execution.`);
            return { status: 'completed', output: { success: true } };
          }

          if (!config.event_uuid) {
            return { status: 'failed', error: 'Missing event_uuid for Calendly cancellation.' };
          }

          const response = await calendlyClient.post(`/scheduled_events/${config.event_uuid}/cancellation`, {
            reason: config.reason || 'Cancelled via Workflow'
          });
          return { status: 'completed', output: response.data };
        }

        default:
          return {
            status: 'failed',
            error: `Action '${node.action}' is not supported yet for Calendly.`
          };
      }
    } catch (error: any) {
      console.error('[CalendlyProcessor] Error:', error?.response?.data || error.message);
      return this.handleError(error, 'Calendly');
    }
  }
}

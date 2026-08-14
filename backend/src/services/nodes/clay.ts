import axios from 'axios';
import { WorkflowNode } from '@prisma/client';
import { NodeProcessor, NodeProcessorContext, NodeExecutionResult } from './index';
import { interpolateConfig } from './utils';
import { BaseProcessor } from './base';

export class ClayProcessor extends BaseProcessor implements NodeProcessor {
  async execute(node: WorkflowNode, input: any, context: NodeProcessorContext): Promise<NodeExecutionResult> {
    try {
      const config = interpolateConfig(node.configuration_json || {}, context.previousOutputs);

      // Fetch API Key
      const creds = await this.getCredentials('Clay', config, context);
      if ('status' in creds && creds.status === 'failed') {
        return creds;
      }
      const { apiKey } = creds as { apiKey: string; account: any };

      const clayClient = axios.create({
        baseURL: 'https://api.clay.com/v3', // Standard Clay API
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      });

      switch (node.action) {
        case 'import_table': {
          const payload = {
            table_id: config.table_id,
            data: config.data
          };

          if (context.isTestMode) {
            context.testTrace?.push(`⚠ [Test Mode] Skipping actual Clay import_table execution.`);
            return { status: 'completed', output: { success: true, table_id: config.table_id || 'test_table' } };
          }

          // We'd post to a webhook or actual table endpoint. 
          // Clay usually uses webhooks for inbound data to tables, but let's assume /tables/{id}/records
          const response = await clayClient.post(`/tables/${payload.table_id}/records`, { records: payload.data });
          return { status: 'completed', output: response.data };
        }

        case 'email_enrichment': {
          const payload = {
            email: config.email
          };

          if (context.isTestMode) {
            context.testTrace?.push(`⚠ [Test Mode] Skipping actual Clay email_enrichment execution.`);
            return { 
              status: 'completed', 
              output: { enriched: true, email: payload.email, data: { name: 'Test User' } } 
            };
          }

          // Clay often requires creating a run or using a specific integration endpoint
          // For now, this is a placeholder generic structure representing standard API use
          const response = await clayClient.post('/enrich/email', payload);
          return { status: 'completed', output: response.data };
        }
        
        case 'company_enrichment': {
          const payload = {
            domain: config.domain,
            company_name: config.company_name
          };

          if (context.isTestMode) {
            context.testTrace?.push(`⚠ [Test Mode] Skipping actual Clay company_enrichment execution.`);
            return { 
              status: 'completed', 
              output: { enriched: true, domain: payload.domain, data: { industry: 'Software' } } 
            };
          }

          const response = await clayClient.post('/enrich/company', payload);
          return { status: 'completed', output: response.data };
        }

        default:
          return {
            status: 'failed',
            error: `Action '${node.action}' is not supported yet for Clay.`
          };
      }
    } catch (error: any) {
      console.error('[ClayProcessor] Error:', error?.response?.data || error.message);
      return this.handleError(error, 'Clay');
    }
  }
}

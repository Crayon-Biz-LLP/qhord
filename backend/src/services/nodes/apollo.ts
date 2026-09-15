import axios from 'axios';
import { WorkflowNode } from '@prisma/client';
import { NodeProcessor, NodeProcessorContext, NodeExecutionResult } from './index';
import { interpolateConfig } from './utils';
import { BaseProcessor } from './base';

export class ApolloProcessor extends BaseProcessor implements NodeProcessor {
  async execute(node: WorkflowNode, input: any, context: NodeProcessorContext): Promise<NodeExecutionResult> {
    try {
      // 1. Resolve configuration with interpolated variables
      const config = interpolateConfig(node.configuration_json || {}, context.previousOutputs);

      // 2. Fetch API Key securely using BaseProcessor
      const creds = await this.getCredentials('Apollo', config, context);
      if ('status' in creds && creds.status === 'failed') {
        return creds; // Return the error result
      }
      const { apiKey } = creds as { apiKey: string; account: any };

      // 3. Set up Axios client for Apollo.
      // Base URL and `x-api-key` header per https://docs.apollo.io/reference — the
      // legacy convention of passing `api_key` in the request body is no longer documented.
      const apolloClient = axios.create({
        baseURL: 'https://api.apollo.io/api/v1',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        }
      });

      // 4. Route based on Action
      switch (node.action) {
        case 'search_people': {
          // Map UI config fields to Apollo's documented People API Search parameters.
          const payload = {
            q_person_name: config.keywords || undefined,
            person_titles: config.titles ? config.titles.split(',').map((t: string) => t.trim()) : undefined,
            person_locations: config.locations ? config.locations.split(',').map((t: string) => t.trim()) : undefined,
            q_organization_domains_list: config.company_names ? config.company_names.split(',').map((t: string) => t.trim()) : undefined,
          };

          if (context.isTestMode) {
            context.testTrace?.push(`⚠ [Test Mode] Skipping actual Apollo search_people execution.`);
            return {
              status: 'completed',
              output: {
                contacts: [
                  { first_name: 'Test', last_name: 'User', email: 'test@example.com', organization_name: 'Mock Inc.' }
                ]
              }
            };
          }

          const response = await apolloClient.post('/mixed_people/api_search', payload);
          return {
            status: 'completed',
            output: response.data
          };
        }

        case 'enrich_contact': {
          const payload = {
            email: config.email,
            first_name: config.first_name,
            last_name: config.last_name,
            organization_name: config.organization_name
          };

          if (context.isTestMode) {
            context.testTrace?.push(`⚠ [Test Mode] Skipping actual Apollo enrich_contact execution.`);
            return {
              status: 'completed',
              output: {
                person: { first_name: config.first_name || 'Enriched', email: config.email, linkedin_url: 'https://linkedin.com/in/test' }
              }
            };
          }

          // Apollo's People Enrichment endpoint takes these as query parameters, not a JSON body.
          const response = await apolloClient.post('/people/match', null, { params: payload });
          return {
            status: 'completed',
            output: response.data
          };
        }

        case 'create_contact': {
           const payload = {
             first_name: config.first_name,
             last_name: config.last_name,
             email: config.email,
             organization_name: config.organization_name,
             title: config.title
           };

           if (context.isTestMode) {
             context.testTrace?.push(`⚠ [Test Mode] Skipping actual Apollo create_contact execution.`);
             return {
               status: 'completed',
               output: { contact: payload }
             };
           }

           const response = await apolloClient.post('/contacts', payload);
           return {
             status: 'completed',
             output: response.data
           };
        }

        // Add cases for update_contact, create_account, update_account, create_deal, update_deal, create_task as needed.

        default:
          return {
            status: 'failed',
            error: `Action '${node.action}' is not supported yet for Apollo.`
          };
      }

    } catch (error: any) {
      console.error('[ApolloProcessor] Error:', error?.response?.data || error.message);
      return this.handleError(error, 'Apollo');
    }
  }
}

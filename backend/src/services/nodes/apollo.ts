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

      // 3. Set up Axios client for Apollo
      const apolloClient = axios.create({
        baseURL: 'https://api.apollo.io/v1',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      // Inject API key into payload or headers based on Apollo API standard
      // Apollo usually accepts api_key in the request body or via query params.
      // We will inject it into the body payload.
      const basePayload = { api_key: apiKey };

      // 4. Route based on Action
      switch (node.action) {
        case 'search_people': {
          // Map UI config fields to Apollo's expected parameters
          const payload = {
            ...basePayload,
            q_keywords: config.keywords,
            person_titles: config.titles ? config.titles.split(',').map((t: string) => t.trim()) : undefined,
            person_locations: config.locations ? config.locations.split(',').map((t: string) => t.trim()) : undefined,
            organization_names: config.company_names ? config.company_names.split(',').map((t: string) => t.trim()) : undefined,
            // Add more standard fields as we implement them in UI
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

          const response = await apolloClient.post('/mixed_people/search', payload);
          return {
            status: 'completed',
            output: response.data
          };
        }

        case 'enrich_contact': {
          const payload = {
            ...basePayload,
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

          const response = await apolloClient.post('/people/match', payload);
          return {
            status: 'completed',
            output: response.data
          };
        }

        case 'create_contact': {
           const payload = {
             ...basePayload,
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

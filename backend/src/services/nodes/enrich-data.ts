import axios from 'axios';
import { WorkflowNode } from '@prisma/client';
import { NodeProcessor, NodeProcessorContext, NodeExecutionResult } from './index';
import { interpolateConfig } from './utils';
import { BaseProcessor } from './base';

// Apollo bulk enrichment — people: https://docs.apollo.io/reference/bulk-people-enrichment
//                          organization: https://docs.apollo.io/reference/organization-enrichment
export class EnrichDataProcessor extends BaseProcessor implements NodeProcessor {
  async execute(node: WorkflowNode, input: any, context: NodeProcessorContext): Promise<NodeExecutionResult> {
    try {
      const config = interpolateConfig(node.configuration_json || {}, context.previousOutputs);

      const creds = await this.getCredentials('Apollo', config, context);
      if ('status' in creds && creds.status === 'failed') {
        return creds;
      }
      const { apiKey } = creds as { apiKey: string; account: any };

      const mode = config.mode === 'organization' ? 'organization' : 'people';

      if (mode === 'organization') {
        if (!config.domain && !config.website && !config.linkedinUrl) {
          return { status: 'failed', error: 'Organization enrichment requires at least one of: domain, website, linkedinUrl.' };
        }

        if (context.isTestMode) {
          context.testTrace?.push(`⚠ [Test Mode] Skipping actual Apollo enrich_data (organization) execution.`);
          return { status: 'completed', output: { organization: { name: config.name || 'Test Org', domain: config.domain } } };
        }

        const response = await axios.get('https://api.apollo.io/api/v1/organizations/enrich', {
          headers: { 'x-api-key': apiKey },
          params: {
            domain: config.domain || undefined,
            website: config.website || undefined,
            linkedin_url: config.linkedinUrl || undefined,
            name: config.name || undefined
          }
        });
        return { status: 'completed', output: response.data };
      }

      // People mode (bulk, up to 10 per Apollo's limit)
      let details: any[] = [];
      if (config.details) {
        if (typeof config.details === 'string') {
          try {
            details = JSON.parse(config.details);
          } catch {
            return { status: 'failed', error: 'details must be valid JSON (an array of person objects).' };
          }
        } else {
          details = config.details;
        }
      }
      if (!Array.isArray(details) || details.length === 0) {
        return { status: 'failed', error: 'details must be a non-empty JSON array of person objects (email, name, organization_name, linkedin_url, etc).' };
      }
      if (details.length > 10) {
        return { status: 'failed', error: 'Apollo bulk people enrichment supports a maximum of 10 people per request.' };
      }

      if (context.isTestMode) {
        context.testTrace?.push(`⚠ [Test Mode] Skipping actual Apollo enrich_data (people) execution.`);
        return { status: 'completed', output: { matches: details.map((d) => ({ ...d, enriched: true })) } };
      }

      const response = await axios.post(
        'https://api.apollo.io/api/v1/people/bulk_match',
        { details },
        { headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey } }
      );
      return { status: 'completed', output: response.data };
    } catch (error: any) {
      console.error('[EnrichDataProcessor] Error:', error?.response?.data || error.message);
      return this.handleError(error, 'Apollo');
    }
  }
}

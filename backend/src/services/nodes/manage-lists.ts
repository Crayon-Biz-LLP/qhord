import axios from 'axios';
import { WorkflowNode } from '@prisma/client';
import { NodeProcessor, NodeProcessorContext, NodeExecutionResult } from './index';
import { interpolateConfig, splitCsv } from './utils';
import { BaseProcessor } from './base';

// Apollo "Add records to a list" — https://docs.apollo.io/reference/add-records-to-a-list
// Auto-creates the list if the given label name doesn't exist yet, so this single call
// covers both "create list" and "add to list" from the block library's "Manage Lists" action.
export class ManageListsProcessor extends BaseProcessor implements NodeProcessor {
  async execute(node: WorkflowNode, input: any, context: NodeProcessorContext): Promise<NodeExecutionResult> {
    try {
      const config = interpolateConfig(node.configuration_json || {}, context.previousOutputs);

      const creds = await this.getCredentials('Apollo', config, context);
      if ('status' in creds && creds.status === 'failed') {
        return creds;
      }
      const { apiKey } = creds as { apiKey: string; account: any };

      const entityIds = splitCsv(config.entityIds);
      const labelNames = splitCsv(config.labelNames);
      const modality = config.modality === 'accounts' ? 'accounts' : 'contacts';

      if (entityIds.length === 0) {
        return { status: 'failed', error: 'entityIds must be a non-empty comma-separated list of Apollo contact/account IDs.' };
      }
      if (labelNames.length === 0) {
        return { status: 'failed', error: 'labelNames must be a non-empty comma-separated list of list names.' };
      }

      if (context.isTestMode) {
        context.testTrace?.push(`⚠ [Test Mode] Skipping actual Apollo manage_lists execution.`);
        return { status: 'completed', output: { labels: labelNames.map((name) => ({ name, modality, cached_count: entityIds.length })) } };
      }

      const response = await axios.post(
        'https://api.apollo.io/api/v1/labels/add_entity_ids_to_label_names',
        { entity_ids: entityIds, label_names: labelNames, modality },
        { headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey } }
      );
      return { status: 'completed', output: response.data };
    } catch (error: any) {
      console.error('[ManageListsProcessor] Error:', error?.response?.data || error.message);
      return this.handleError(error, 'Apollo');
    }
  }
}

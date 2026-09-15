import axios from 'axios';
import { WorkflowNode } from '@prisma/client';
import { NodeProcessor, NodeProcessorContext, NodeExecutionResult } from './index';
import { interpolateConfig, splitCsv } from './utils';
import { BaseProcessor } from './base';

// Apollo "Add contacts to a sequence" — https://docs.apollo.io/reference/add-contacts-to-sequence
export class ManageSequencesProcessor extends BaseProcessor implements NodeProcessor {
  async execute(node: WorkflowNode, input: any, context: NodeProcessorContext): Promise<NodeExecutionResult> {
    try {
      const config = interpolateConfig(node.configuration_json || {}, context.previousOutputs);

      const creds = await this.getCredentials('Apollo', config, context);
      if ('status' in creds && creds.status === 'failed') {
        return creds;
      }
      const { apiKey } = creds as { apiKey: string; account: any };

      const sequenceId = config.sequenceId;
      const contactIds = splitCsv(config.contactIds);
      const sendEmailFromAccountId = config.sendEmailFromAccountId;

      if (!sequenceId) return { status: 'failed', error: 'Missing sequenceId for Apollo manage_sequences action.' };
      if (contactIds.length === 0) return { status: 'failed', error: 'contactIds must be a non-empty comma-separated list of Apollo contact IDs.' };
      if (!sendEmailFromAccountId) return { status: 'failed', error: 'Missing sendEmailFromAccountId (the Apollo email sending account to send from) for Apollo manage_sequences action.' };

      if (context.isTestMode) {
        context.testTrace?.push(`⚠ [Test Mode] Skipping actual Apollo manage_sequences execution.`);
        return { status: 'completed', output: { emailer_campaign: { id: sequenceId, active: true }, contacts: contactIds.map((id) => ({ id })) } };
      }

      // Apollo takes these as query parameters on the POST, not a JSON body.
      const response = await axios.post(
        `https://api.apollo.io/api/v1/emailer_campaigns/${sequenceId}/add_contact_ids`,
        null,
        {
          headers: { 'x-api-key': apiKey },
          params: {
            emailer_campaign_id: sequenceId,
            'contact_ids[]': contactIds,
            send_email_from_email_account_id: sendEmailFromAccountId,
            status: config.status === 'paused' ? 'paused' : undefined
          }
        }
      );
      return { status: 'completed', output: response.data };
    } catch (error: any) {
      console.error('[ManageSequencesProcessor] Error:', error?.response?.data || error.message);
      return this.handleError(error, 'Apollo');
    }
  }
}

import { WorkflowNode } from '@prisma/client';
import { NodeProcessor, NodeProcessorContext, NodeExecutionResult } from './index';
import { interpolateConfig } from './utils';
import { BaseProcessor } from './base';

const UPDATABLE_FIELDS = ['email', 'first_name', 'last_name', 'title', 'company_name', 'domain', 'linkedin_url', 'industry', 'status'] as const;

// Updates a Lead record — the closest thing to a "contact/account" tied to a client in this schema.
export class UpdateContactAccountProcessor extends BaseProcessor implements NodeProcessor {
  async execute(node: WorkflowNode, input: any, context: NodeProcessorContext): Promise<NodeExecutionResult> {
    try {
      const config = interpolateConfig(node.configuration_json || {}, context.previousOutputs);

      if (!config.leadId) {
        return { status: 'failed', error: 'Missing leadId for update_contact_account action.' };
      }

      const data: Record<string, any> = {};
      for (const field of UPDATABLE_FIELDS) {
        if (config[field] !== undefined && config[field] !== '') data[field] = config[field];
      }
      if (Object.keys(data).length === 0) {
        return { status: 'failed', error: 'No fields provided to update.' };
      }

      if (context.isTestMode) {
        context.testTrace?.push(`⚠ [Test Mode] Skipping actual contact update.`);
        return { status: 'completed', output: { id: config.leadId, ...data } };
      }

      const lead = await context.prisma.lead.update({ where: { id: config.leadId }, data });
      return { status: 'completed', output: lead };
    } catch (error: any) {
      if (error.code === 'P2025') {
        return { status: 'failed', error: 'Contact (lead) not found.' };
      }
      console.error('[UpdateContactAccountProcessor] Error:', error.message);
      return this.handleError(error, 'Contacts');
    }
  }
}

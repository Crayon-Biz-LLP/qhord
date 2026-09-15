import axios from 'axios';
import { WorkflowNode } from '@prisma/client';
import { NodeProcessor, NodeProcessorContext, NodeExecutionResult } from './index';
import { interpolateConfig } from './utils';
import { BaseProcessor } from './base';

// Apollo "Create a Task" — https://docs.apollo.io/reference/create-a-task
const VALID_TYPES = ['call', 'outreach_manual_email', 'linkedin_step_connect', 'linkedin_step_message', 'linkedin_step_view_profile', 'linkedin_step_interact_post', 'action_item'];
const VALID_STATUSES = ['scheduled', 'completed', 'skipped'];

export class AssignManualTasksProcessor extends BaseProcessor implements NodeProcessor {
  async execute(node: WorkflowNode, input: any, context: NodeProcessorContext): Promise<NodeExecutionResult> {
    try {
      const config = interpolateConfig(node.configuration_json || {}, context.previousOutputs);

      const creds = await this.getCredentials('Apollo', config, context);
      if ('status' in creds && creds.status === 'failed') {
        return creds;
      }
      const { apiKey } = creds as { apiKey: string; account: any };

      if (!config.userId) return { status: 'failed', error: 'Missing userId (Apollo task owner) for Apollo assign_manual_tasks action.' };
      if (!config.contactId) return { status: 'failed', error: 'Missing contactId for Apollo assign_manual_tasks action.' };
      if (!config.dueAt) return { status: 'failed', error: 'Missing dueAt (ISO 8601 date/time) for Apollo assign_manual_tasks action.' };

      const type = VALID_TYPES.includes(config.type) ? config.type : 'action_item';
      const status = VALID_STATUSES.includes(config.status) ? config.status : 'scheduled';

      const payload: Record<string, any> = {
        user_id: config.userId,
        contact_id: config.contactId,
        type,
        status,
        due_at: config.dueAt,
        priority: ['high', 'medium', 'low'].includes(config.priority) ? config.priority : 'medium'
      };
      if (config.title) payload.title = config.title;
      if (config.note) payload.note = config.note;

      if (context.isTestMode) {
        context.testTrace?.push(`⚠ [Test Mode] Skipping actual Apollo assign_manual_tasks execution.`);
        return { status: 'completed', output: { id: 'test_task_123', ...payload } };
      }

      const response = await axios.post('https://api.apollo.io/api/v1/tasks', payload, {
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey }
      });
      return { status: 'completed', output: response.data };
    } catch (error: any) {
      console.error('[AssignManualTasksProcessor] Error:', error?.response?.data || error.message);
      return this.handleError(error, 'Apollo');
    }
  }
}

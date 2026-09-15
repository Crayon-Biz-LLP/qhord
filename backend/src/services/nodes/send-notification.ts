import { WorkflowNode } from '@prisma/client';
import { NodeProcessor, NodeProcessorContext, NodeExecutionResult } from './index';
import { interpolateConfig } from './utils';
import { BaseProcessor } from './base';

// Creates an in-app Notification row for the operator who owns the workflow.
export class SendNotificationProcessor extends BaseProcessor implements NodeProcessor {
  async execute(node: WorkflowNode, input: any, context: NodeProcessorContext): Promise<NodeExecutionResult> {
    try {
      const config = interpolateConfig(node.configuration_json || {}, context.previousOutputs);

      if (!config.title) return { status: 'failed', error: 'Missing title for send_notifications action.' };
      if (!config.message) return { status: 'failed', error: 'Missing message for send_notifications action.' };

      if (context.isTestMode) {
        context.testTrace?.push(`⚠ [Test Mode] Skipping actual notification creation.`);
        return { status: 'completed', output: { success: true, title: config.title, message: config.message } };
      }

      const workflow = await context.prisma.workflow.findUnique({
        where: { id: context.workflowId },
        select: { created_by_operator_id: true }
      });
      if (!workflow) {
        return { status: 'failed', error: 'Could not resolve the workflow owner to notify.' };
      }

      const notification = await context.prisma.notification.create({
        data: {
          operator_id: workflow.created_by_operator_id,
          type: config.type || 'workflow',
          title: config.title,
          message: config.message,
          entity_id: config.entity_id || undefined,
          entity_type: config.entity_type || undefined
        }
      });

      return { status: 'completed', output: notification };
    } catch (error: any) {
      console.error('[SendNotificationProcessor] Error:', error.message);
      return this.handleError(error, 'Notifications');
    }
  }
}

import { WorkflowNode } from '@prisma/client';
import { NodeProcessor, NodeProcessorContext, NodeExecutionResult } from './index';
import { interpolateConfig } from './utils';
import { BaseProcessor } from './base';

// Create/update against the real Deal model (name, contact, amount, stage, health, campaign,
// owner) — mirrors backend/src/routes/deals.ts so workflow-driven deals stay consistent with
// the Pipeline UI. Every read/write is scoped to the workflow's own client.
export class ManageDealsProcessor extends BaseProcessor implements NodeProcessor {
  async execute(node: WorkflowNode, input: any, context: NodeProcessorContext): Promise<NodeExecutionResult> {
    try {
      const config = interpolateConfig(node.configuration_json || {}, context.previousOutputs);
      const isUpdate = config.deal_action === 'update';

      if (context.isTestMode) {
        context.testTrace?.push(`⚠ [Test Mode] Skipping actual deal ${isUpdate ? 'update' : 'creation'}.`);
        return { status: 'completed', output: { id: 'test_deal_123', ...config } };
      }

      const health = config.health !== undefined && config.health !== '' ? parseInt(config.health, 10) : undefined;

      if (config.campaignId) {
        const campaign = await context.prisma.campaign.findFirst({
          where: { id: config.campaignId, client_id: context.clientId },
          select: { id: true }
        });
        if (!campaign) {
          return { status: 'failed', error: 'Campaign not found for this client.' };
        }
      }

      if (isUpdate) {
        if (!config.dealId) {
          return { status: 'failed', error: 'Missing dealId for manage_deals update action.' };
        }
        const { count } = await context.prisma.deal.updateMany({
          where: { id: config.dealId, client_id: context.clientId },
          data: {
            name: config.name || undefined,
            contact: config.contact || undefined,
            amount: config.amount || undefined,
            stage: config.stage || undefined,
            campaign_id: config.campaignId || undefined,
            owner_operator_id: config.owner_operator_id || undefined,
            health
          }
        });
        if (count === 0) {
          return { status: 'failed', error: 'Deal not found for this client.' };
        }
        const deal = await context.prisma.deal.findUnique({ where: { id: config.dealId } });
        return { status: 'completed', output: deal };
      }

      if (!config.name || !config.contact || !config.amount || !config.stage) {
        return { status: 'failed', error: 'Missing required fields (name, contact, amount, stage) for manage_deals create action.' };
      }

      if (!config.allowDuplicates) {
        const existing = await context.prisma.deal.findFirst({
          where: { client_id: context.clientId, name: config.name, contact: config.contact }
        });
        if (existing) {
          return { status: 'completed', output: existing };
        }
      }

      const deal = await context.prisma.deal.create({
        data: {
          name: config.name,
          contact: config.contact,
          amount: config.amount,
          stage: config.stage,
          campaign_id: config.campaignId || undefined,
          owner_operator_id: config.owner_operator_id || undefined,
          health: health ?? 80,
          avatar: config.contact.charAt(0).toUpperCase(),
          client_id: context.clientId
        }
      });
      return { status: 'completed', output: deal };
    } catch (error: any) {
      if (error.code === 'P2025') {
        return { status: 'failed', error: 'Deal not found.' };
      }
      console.error('[ManageDealsProcessor] Error:', error.message);
      return this.handleError(error, 'Deals');
    }
  }
}

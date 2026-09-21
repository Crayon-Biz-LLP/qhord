import { WorkflowNode } from '@prisma/client';
import { NodeProcessor, NodeProcessorContext, NodeExecutionResult } from './index';
import { interpolateConfig, splitCsv } from './utils';
import { BaseProcessor } from './base';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Ids/emails a record might carry, whatever shape the trigger or loop item happens to have.
function contactHints(record: any): { ids: string[]; emails: string[] } {
  if (!record || typeof record !== 'object') return { ids: [], emails: [] };
  const strings = (...values: any[]) =>
    values.filter(v => typeof v === 'string' && v.trim()).map((v: string) => v.trim());
  return {
    ids: strings(record.lead?.id, record.contact?.id, record.lead_id, record.leadId, record.contact_id, record.contactId, record.reply?.contact_id, record.id),
    emails: strings(record.lead?.email, record.contact?.email, record.email, record.reply?.email, record.meeting?.email, record.body?.email),
  };
}

// Finds the lead record(s) this workflow run is about: the current loop item if inside a loop,
// otherwise the trigger. A lead id wins; failing that, the email (a person can have one lead row
// per campaign, so every row for that email is returned). Always scoped to the workflow's client.
async function resolveRunContacts(context: NodeProcessorContext): Promise<{ id: string; campaign_id: string | null }[]> {
  const sources = [context.previousOutputs?.loop?.item, context.previousOutputs?.trigger];
  for (const source of sources) {
    const { ids, emails } = contactHints(source);

    const validIds = ids.filter(id => UUID_RE.test(id));
    if (validIds.length > 0) {
      const byId = await context.prisma.lead.findMany({
        where: { id: { in: validIds }, client_id: context.clientId },
        select: { id: true, campaign_id: true }
      });
      if (byId.length > 0) return byId;
    }

    for (const email of emails) {
      const byEmail = await context.prisma.lead.findMany({
        where: { client_id: context.clientId, email: { equals: email, mode: 'insensitive' } },
        select: { id: true, campaign_id: true }
      });
      if (byEmail.length > 0) return byEmail;
    }
  }
  return [];
}

// Links the workflow run's contact to / unlinks it from a Qhord campaign (Lead.campaign_id).
//
// This records membership only — campaigns execute as a one-shot pipeline of steps, so linking
// a lead does not by itself start sending to it. A lead belongs to at most one campaign, so
// "add" moves it from whichever campaign it was in. Every read and write is scoped to the
// workflow's own client, so a workflow can never touch another client's leads or campaigns.
export class ManageCampaignsProcessor extends BaseProcessor implements NodeProcessor {
  async execute(node: WorkflowNode, input: any, context: NodeProcessorContext): Promise<NodeExecutionResult> {
    try {
      const config = interpolateConfig(node.configuration_json || {}, context.previousOutputs);
      const action = config.campaignAction === 'remove' ? 'remove' : 'add';
      const removeScope = config.removeScope === 'specific' ? 'specific' : 'all';

      if (action === 'add' && !config.campaignId) {
        return { status: 'failed', error: 'Choose a campaign to add the contact to.' };
      }
      const campaignIds = splitCsv(config.campaignIds);
      if (action === 'remove' && removeScope === 'specific' && campaignIds.length === 0) {
        return { status: 'failed', error: 'Choose at least one campaign to remove the contact from.' };
      }

      if (context.isTestMode) {
        context.testTrace?.push(`⚠ [Test Mode] Skipping actual ${action} of the workflow's contact ${action === 'add' ? 'to' : 'from'} campaign(s).`);
        return { status: 'completed', output: { action, contacts: 1, updated: 1 } };
      }

      const contacts = await resolveRunContacts(context);
      if (contacts.length === 0) {
        return {
          status: 'failed',
          error: "Couldn't find a contact for this workflow run. The trigger (or loop item) needs to carry a lead id or an email that matches a lead for this client."
        };
      }
      const contactIds = contacts.map(c => c.id);

      if (action === 'add') {
        const campaign = UUID_RE.test(String(config.campaignId))
          ? await context.prisma.campaign.findFirst({
              where: { id: config.campaignId, client_id: context.clientId },
              select: { id: true, name: true }
            })
          : null;
        if (!campaign) {
          return { status: 'failed', error: 'Campaign not found for this client.' };
        }

        const { count } = await context.prisma.lead.updateMany({
          where: { id: { in: contactIds }, client_id: context.clientId },
          data: { campaign_id: campaign.id }
        });
        return {
          status: 'completed',
          output: { action, campaignId: campaign.id, campaignName: campaign.name, contacts: contactIds.length, updated: count }
        };
      }

      const validCampaignIds = campaignIds.filter(id => UUID_RE.test(id));
      if (removeScope === 'specific' && validCampaignIds.length === 0) {
        return { status: 'failed', error: 'The selected campaigns are not valid campaign IDs.' };
      }

      const { count } = await context.prisma.lead.updateMany({
        where: {
          id: { in: contactIds },
          client_id: context.clientId,
          campaign_id: removeScope === 'specific' ? { in: validCampaignIds } : { not: null }
        },
        data: { campaign_id: null }
      });
      return { status: 'completed', output: { action, scope: removeScope, contacts: contactIds.length, updated: count } };
    } catch (error: any) {
      console.error('[ManageCampaignsProcessor] Error:', error.message);
      return this.handleError(error, 'Campaigns');
    }
  }
}

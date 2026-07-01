import { prisma } from '../lib/prisma';
import { decrypt } from '../config/encryption';
import { ApolloService } from './apollo.service';
import { InstantlyService } from './instantly.service';
import { SmartLeadService } from './smartlead.service';
import { HunterService } from './hunter.service';
import { BrevoService } from './brevo.service';
import { ClayService } from './clay.service';
import { HeyReachService } from './heyreach.service';
import { GojiberryService } from './gojiberry.service';
import { HubSpotService } from './hubspot.service';
import { SalesforceService } from './salesforce.service';
import { CalendlyService } from './calendly.service';
import { BetterContactsService } from './bettercontacts.service';

export interface McpToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export class McpToolTranslator {
  async execute(toolName: string, args: Record<string, unknown>, clientId: string): Promise<McpToolResult> {
    try {
      const provider = toolName.split('_')[0];
      const apiKey = await this.resolveApiKey(provider, clientId);
      if (!apiKey) {
        return { success: false, error: `No API key configured for ${provider}` };
      }
      return await this.route(provider, toolName, apiKey, args);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown execution error';
      return { success: false, error: message };
    }
  }

  private async resolveApiKey(provider: string, clientId: string): Promise<string> {
    const account = await prisma.clientToolAccount.findFirst({
      where: { client_id: clientId, tool_name: { equals: provider, mode: 'insensitive' } },
    });
    if (!account?.api_key_encrypted) return '';
    try {
      return decrypt(account.api_key_encrypted).trim();
    } catch {
      return '';
    }
  }

  private async route(provider: string, toolName: string, apiKey: string, args: Record<string, unknown>): Promise<McpToolResult> {
    switch (toolName) {
      case 'apollo_search_contacts': {
        const svc = new ApolloService(apiKey);
        const data = await svc.searchLeads({ ...args, limit: Math.min(Number(args.limit) || 25, 100) });
        return { success: true, data };
      }
      case 'apollo_enrich_company': {
        const svc = new ApolloService(apiKey);
        const data = await svc.enrichOrganization(args);
        return { success: true, data };
      }
      case 'instantly_add_leads': {
        const svc = new InstantlyService(apiKey);
        const data = await svc.addLeads(args);
        return { success: true, data };
      }
      case 'smartlead_create_campaign': {
        const svc = new SmartLeadService(apiKey);
        const data = await svc.createCampaign(args);
        return { success: true, data };
      }
      case 'smartlead_add_leads': {
        const svc = new SmartLeadService(apiKey);
        const data = await svc.addLeadsToCampaign(args);
        return { success: true, data };
      }
      case 'hunter_search_leads': {
        const svc = new HunterService(apiKey);
        const data = await svc.searchLeads({ ...args, limit: Math.min(Number(args.limit) || 10, 25) });
        return { success: true, data };
      }
      case 'hunter_verify_email': {
        const svc = new HunterService(apiKey);
        const data = await svc.verifyEmail(args as { email: string });
        return { success: true, data };
      }
      case 'brevo_create_campaign': {
        const svc = new BrevoService(apiKey);
        const data = await svc.createCampaign(args);
        return { success: true, data };
      }
      case 'brevo_send_transactional': {
        const svc = new BrevoService(apiKey);
        const data = await svc.sendTransactional(args as any);
        return { success: true, data };
      }
      case 'clay_enrich_leads': {
        const svc = new ClayService(apiKey);
        const data = await svc.sendLeads(args);
        return { success: true, data };
      }
      case 'heyreach_add_leads': {
        const svc = new HeyReachService(apiKey);
        const data = await svc.addLeadsToCampaign(args);
        return { success: true, data };
      }
      case 'gojiberry_search_leads': {
        const svc = new GojiberryService(apiKey);
        const data = await svc.searchLeads(args);
        return { success: true, data };
      }
      case 'gojiberry_enrich_lead': {
        const svc = new GojiberryService(apiKey);
        const data = await svc.enrichLead(args);
        return { success: true, data };
      }
      case 'hubspot_create_contact': {
        const svc = new HubSpotService(apiKey);
        const data = await svc.createContact(args);
        return { success: true, data };
      }
      case 'hubspot_search_contacts': {
        const svc = new HubSpotService(apiKey);
        const data = await svc.searchContacts(args);
        return { success: true, data };
      }
      case 'salesforce_create_lead': {
        const svc = new SalesforceService(apiKey);
        const data = await svc.createLead(args);
        return { success: true, data };
      }
      case 'calendly_create_scheduling_link': {
        const svc = new CalendlyService(apiKey);
        const data = await svc.createSchedulingLink(args);
        return { success: true, data };
      }
      case 'bettercontacts_enrich': {
        const svc = new BetterContactsService(apiKey);
        const data = await svc.enrichContacts(args);
        return { success: true, data };
      }
      default:
        return { success: false, error: `Unknown tool: ${toolName}` };
    }
  }
}

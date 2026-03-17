import { query } from '../config/db';
import { decrypt } from '../config/encryption';
import {
  ClientToolAccount,
  Execution,
  ExecutionRequestPayload,
  ToolName,
  ExecutionStatus
} from '../types';
import { ApolloService } from './apollo.service';
import { ClayService } from './clay.service';
import { HeyReachService } from './heyreach.service';
import { SmartLeadService } from './smartlead.service';

const SUPPORTED_TOOLS: ToolName[] = ['apollo', 'clay', 'heyreach', 'smartlead'];

export class ExecutionEngine {
  async execute(request: ExecutionRequestPayload, operatorId: string): Promise<Execution> {
    const { clientId, tool, toolAccountId, contextId, action, payload } = request;

    if (!SUPPORTED_TOOLS.includes(tool)) {
      throw new Error(`Unsupported tool: ${tool}`);
    }

    const accountResult = await query<ClientToolAccount>(
      'SELECT * FROM client_tool_accounts WHERE id = $1 AND client_id = $2',
      [toolAccountId, clientId]
    );
    const account = accountResult.rows[0];
    if (!account) {
      throw new Error('Tool account not found for client');
    }

    const apiKey = decrypt(account.api_key_encrypted);

    const executionInsert = await query<Execution>(
      `INSERT INTO executions (
        client_id, tool_name, tool_account_id, context_id, action, status,
        request_payload, response_payload, error_message, triggered_by_operator_id
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [
        clientId,
        tool,
        toolAccountId,
        contextId ?? null,
        action,
        'pending',
        payload,
        null,
        null,
        operatorId
      ]
    );
    let execution = executionInsert.rows[0];

    let status: ExecutionStatus = 'success';
    let responsePayload: any = null;
    let errorMessage: string | null = null;

    try {
      responsePayload = await this.dispatchToTool(tool, apiKey, action, payload);
    } catch (err: any) {
      status = 'error';
      errorMessage = err?.message || 'Execution failed';
    }

    const updated = await query<Execution>(
      'UPDATE executions SET status = $1, response_payload = $2, error_message = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
      [status, responsePayload, errorMessage, execution.id]
    );
    execution = updated.rows[0];

    return execution;
  }

  private async dispatchToTool(tool: ToolName, apiKey: string, action: string, payload: any): Promise<any> {
    switch (tool) {
      case 'apollo': {
        const service = new ApolloService(apiKey);
        if (action === 'search_leads') return service.searchLeads(payload);
        if (action === 'search_organizations') return service.searchOrganizations(payload);
        if (action === 'enrich_person') return service.enrichPerson(payload);
        if (action === 'enrich_organization') return service.enrichOrganization(payload);
        if (action === 'list_sequences') return service.listSequences(payload);
        if (action === 'add_to_sequence') return service.addToSequence(payload);
        if (action === 'list_mailboxes') return service.listMailboxes(payload);
        if (action === 'list_labels') return service.listLabels(payload);

        // Contacts
        if (action === 'create_contact') return service.createContact(payload);
        if (action === 'update_contact') return service.updateContact(payload);

        // Accounts
        if (action === 'create_account') return service.createAccount(payload);
        if (action === 'update_account') return service.updateAccount(payload);

        // Enrichment
        if (action === 'bulk_people_enrich') return service.bulkPeopleEnrich(payload);

        // Deals
        if (action === 'create_deal') return service.createDeal(payload);
        if (action === 'list_deals') return service.listDeals(payload);

        // Tasks
        if (action === 'create_task') return service.createTask(payload);
        if (action === 'search_tasks') return service.searchTasks(payload);

        // Calls
        if (action === 'create_call') return service.createCall(payload);
        if (action === 'search_calls') return service.searchCalls(payload);

        // Misc
        if (action === 'health') return service.health(payload);
        if (action === 'get_users') return service.getUsers(payload);
        // legacy handlers
        if (action === 'create_list') return service.createList(payload);
        if (action === 'launch_sequence') return service.launchSequence(payload);
        break;
      }
      case 'clay': {
        const service = new ClayService(apiKey);
        if (action === 'send_leads') return service.sendLeads(payload);
        if (action === 'run_workflow') return service.runWorkflow(payload);
        if (action === 'fetch_enrichment_output') return service.fetchEnrichmentOutput(payload);
        break;
      }
      case 'heyreach': {
        const service = new HeyReachService(apiKey);
        if (action === 'get_all_campaigns') return service.getAllCampaigns(payload);
        if (action === 'get_campaign_by_id') return service.getCampaignById(payload);
        if (action === 'add_leads_to_campaign') return service.addLeadsToCampaign(payload);

        if (action === 'get_conversations') return service.getConversations(payload);
        if (action === 'send_message') return service.sendMessage(payload);

        if (action === 'get_all_linkedin_accounts') return service.getAllLinkedInAccounts(payload);

        if (action === 'get_all_lists') return service.getAllLists(payload);
        if (action === 'create_empty_list') return service.createEmptyList(payload);

        if (action === 'get_lead') return service.getLead(payload);

        // Legacy
        if (action === 'create_campaign') return service.createCampaign(payload);
        if (action === 'push_leads') return service.pushLeads(payload);
        if (action === 'fetch_replies') return service.fetchReplies(payload);
        break;
      }
      case 'smartlead': {
        const service = new SmartLeadService(apiKey);
        if (action === 'get_all_campaigns') return service.getAllCampaigns(payload);
        if (action === 'get_campaign_by_id') return service.getCampaignById(payload);
        if (action === 'create_campaign') return service.createCampaign(payload);
        if (action === 'update_campaign_schedule') return service.updateCampaignSchedule(payload);
        if (action === 'get_campaign_statistics') return service.getCampaignStatistics(payload);
        if (action === 'add_leads_to_campaign') return service.addLeadsToCampaign(payload);
        if (action === 'get_leads_by_campaign') return service.getLeadsByCampaign(payload);
        if (action === 'get_lead_by_email') return service.getLeadByEmail(payload);
        if (action === 'update_lead_status') return service.updateLeadStatus(payload);
        if (action === 'get_all_email_accounts') return service.getAllEmailAccounts(payload);
        if (action === 'add_email_account_to_campaign') return service.addEmailAccountToCampaign(payload);
        break;
      }
      default:
        break;
    }

    throw new Error(`Unsupported action "${action}" for tool "${tool}"`);
  }
}


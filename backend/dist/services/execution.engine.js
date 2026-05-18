"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionEngine = void 0;
const prisma_1 = require("../lib/prisma");
const encryption_1 = require("../config/encryption");
const apollo_service_1 = require("./apollo.service");
const clay_service_1 = require("./clay.service");
const heyreach_service_1 = require("./heyreach.service");
const smartlead_service_1 = require("./smartlead.service");
const SUPPORTED_TOOLS = ['apollo', 'clay', 'heyreach', 'smartlead'];
class ExecutionEngine {
    async execute(request, operatorId) {
        const { clientId, tool, toolAccountId, contextId, action, payload } = request;
        if (!SUPPORTED_TOOLS.includes(tool)) {
            throw new Error(`Unsupported tool: ${tool}`);
        }
        const account = await prisma_1.prisma.clientToolAccount.findFirst({
            where: {
                id: toolAccountId,
                client_id: clientId
            }
        });
        if (!account) {
            throw new Error('Tool account not found for client');
        }
        const apiKey = (0, encryption_1.decrypt)(account.api_key_encrypted);
        const execution = await prisma_1.prisma.execution.create({
            data: {
                client_id: clientId,
                tool_name: tool,
                tool_account_id: toolAccountId,
                context_id: contextId ?? null,
                action,
                status: 'pending',
                request_payload: payload ?? undefined,
                triggered_by_operator_id: operatorId
            }
        });
        let status = 'success';
        let responsePayload = null;
        let errorMessage = null;
        try {
            responsePayload = await this.dispatchToTool(tool, apiKey, action, payload);
        }
        catch (err) {
            status = 'error';
            errorMessage = err?.message || 'Execution failed';
        }
        const updated = await prisma_1.prisma.execution.update({
            where: { id: execution.id },
            data: {
                status: status,
                response_payload: responsePayload ?? undefined,
                error_message: errorMessage
            }
        });
        return updated;
    }
    async dispatchToTool(tool, apiKey, action, payload) {
        switch (tool) {
            case 'apollo': {
                const service = new apollo_service_1.ApolloService(apiKey);
                if (action === 'search_leads')
                    return service.searchLeads(payload);
                if (action === 'search_organizations')
                    return service.searchOrganizations(payload);
                if (action === 'enrich_person')
                    return service.enrichPerson(payload);
                if (action === 'enrich_organization')
                    return service.enrichOrganization(payload);
                if (action === 'list_sequences')
                    return service.listSequences(payload);
                if (action === 'add_to_sequence')
                    return service.addToSequence(payload);
                if (action === 'list_mailboxes')
                    return service.listMailboxes(payload);
                if (action === 'list_labels')
                    return service.listLabels(payload);
                // Contacts
                if (action === 'create_contact')
                    return service.createContact(payload);
                if (action === 'update_contact')
                    return service.updateContact(payload);
                // Accounts
                if (action === 'create_account')
                    return service.createAccount(payload);
                if (action === 'update_account')
                    return service.updateAccount(payload);
                // Enrichment
                if (action === 'bulk_people_enrich')
                    return service.bulkPeopleEnrich(payload);
                // Deals
                if (action === 'create_deal')
                    return service.createDeal(payload);
                if (action === 'list_deals')
                    return service.listDeals(payload);
                // Tasks
                if (action === 'create_task')
                    return service.createTask(payload);
                if (action === 'search_tasks')
                    return service.searchTasks(payload);
                // Calls
                if (action === 'create_call')
                    return service.createCall(payload);
                if (action === 'search_calls')
                    return service.searchCalls(payload);
                // Misc
                if (action === 'health')
                    return service.health(payload);
                if (action === 'get_users')
                    return service.getUsers(payload);
                // legacy handlers
                if (action === 'create_list')
                    return service.createList(payload);
                if (action === 'launch_sequence')
                    return service.launchSequence(payload);
                break;
            }
            case 'clay': {
                const service = new clay_service_1.ClayService(apiKey);
                if (action === 'send_leads')
                    return service.sendLeads(payload);
                if (action === 'run_workflow')
                    return service.runWorkflow(payload);
                if (action === 'fetch_enrichment_output')
                    return service.fetchEnrichmentOutput(payload);
                break;
            }
            case 'heyreach': {
                const service = new heyreach_service_1.HeyReachService(apiKey);
                if (action === 'get_all_campaigns')
                    return service.getAllCampaigns(payload);
                if (action === 'get_campaign_by_id')
                    return service.getCampaignById(payload);
                if (action === 'add_leads_to_campaign')
                    return service.addLeadsToCampaign(payload);
                if (action === 'get_conversations')
                    return service.getConversations(payload);
                if (action === 'send_message')
                    return service.sendMessage(payload);
                if (action === 'get_all_linkedin_accounts')
                    return service.getAllLinkedInAccounts(payload);
                if (action === 'get_all_lists')
                    return service.getAllLists(payload);
                if (action === 'create_empty_list')
                    return service.createEmptyList(payload);
                if (action === 'get_lead')
                    return service.getLead(payload);
                // Legacy
                if (action === 'create_campaign')
                    return service.createCampaign(payload);
                if (action === 'push_leads')
                    return service.pushLeads(payload);
                if (action === 'fetch_replies')
                    return service.fetchReplies(payload);
                break;
            }
            case 'smartlead': {
                const service = new smartlead_service_1.SmartLeadService(apiKey);
                if (action === 'get_all_campaigns')
                    return service.getAllCampaigns(payload);
                if (action === 'get_campaign_by_id')
                    return service.getCampaignById(payload);
                if (action === 'create_campaign')
                    return service.createCampaign(payload);
                if (action === 'update_campaign_schedule')
                    return service.updateCampaignSchedule(payload);
                if (action === 'get_campaign_statistics')
                    return service.getCampaignStatistics(payload);
                if (action === 'add_leads_to_campaign')
                    return service.addLeadsToCampaign(payload);
                if (action === 'get_leads_by_campaign')
                    return service.getLeadsByCampaign(payload);
                if (action === 'get_lead_by_email')
                    return service.getLeadByEmail(payload);
                if (action === 'update_lead_status')
                    return service.updateLeadStatus(payload);
                if (action === 'get_all_email_accounts')
                    return service.getAllEmailAccounts(payload);
                if (action === 'add_email_account_to_campaign')
                    return service.addEmailAccountToCampaign(payload);
                break;
            }
            default:
                break;
        }
        throw new Error(`Unsupported action "${action}" for tool "${tool}"`);
    }
}
exports.ExecutionEngine = ExecutionEngine;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionEngine = void 0;
const prisma_1 = require("../lib/prisma");
const encryption_1 = require("../config/encryption");
const apollo_service_1 = require("./apollo.service");
const clay_service_1 = require("./clay.service");
const heyreach_service_1 = require("./heyreach.service");
const smartlead_service_1 = require("./smartlead.service");
const hunter_service_1 = require("./hunter.service");
const brevo_service_1 = require("./brevo.service");
const bettercontacts_service_1 = require("./bettercontacts.service");
const calendly_service_1 = require("./calendly.service");
const instantly_service_1 = require("./instantly.service");
const hubspot_service_1 = require("./hubspot.service");
const salesforce_service_1 = require("./salesforce.service");
const pipeline_leads_1 = require("../ai/pipeline/pipeline-leads");
const SUPPORTED_TOOLS = ['apollo', 'clay', 'heyreach', 'smartlead', 'hunter', 'brevo', 'bettercontacts', 'calendly', 'instantly', 'hubspot', 'salesforce'];
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
        const apiKey = await this.resolveApiKey(tool, account);
        const mode = this.getExecutionMode();
        const shouldUseMock = this.shouldUseMockExecution(mode, apiKey);
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
            responsePayload = shouldUseMock
                ? this.buildMockExecutionResult(tool, action, payload, mode)
                : await this.dispatchToTool(tool, apiKey, action, payload);
        }
        catch (err) {
            status = 'error';
            const apolloErr = err?.response?.data;
            errorMessage =
                (typeof apolloErr === 'object' && apolloErr?.error) ||
                    err?.message ||
                    'Execution failed';
            if (apolloErr)
                responsePayload = apolloErr;
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
    getExecutionMode() {
        const raw = (process.env.EXECUTION_MODE || 'auto').toLowerCase();
        if (raw === 'mock' || raw === 'live' || raw === 'auto') {
            return raw;
        }
        return 'auto';
    }
    shouldUseMockExecution(mode, apiKey) {
        if (mode === 'mock')
            return true;
        if (mode === 'live')
            return false;
        return !apiKey || apiKey.trim().length === 0;
    }
    async resolveApiKey(tool, account) {
        let apiKey = '';
        try {
            apiKey = (0, encryption_1.decrypt)(account.api_key_encrypted).trim();
        }
        catch {
            apiKey = '';
        }
        if (apiKey)
            return apiKey;
        const envVar = tool === 'apollo'
            ? 'APOLLO_API_KEY'
            : tool === 'clay'
                ? 'CLAY_API_KEY'
                : tool === 'smartlead'
                    ? 'SMARTLEAD_API_KEY'
                    : tool === 'hunter'
                        ? 'HUNTER_API_KEY'
                        : tool === 'brevo'
                            ? 'BREVO_API_KEY'
                            : tool === 'bettercontacts'
                                ? 'BETTERCONTACTS_API_KEY'
                                : tool === 'calendly'
                                    ? 'CALENDLY_API_KEY'
                                    : tool === 'instantly'
                                        ? 'INSTANTLY_API_KEY'
                                        : tool === 'hubspot'
                                            ? 'HUBSPOT_API_KEY'
                                            : tool === 'salesforce'
                                                ? 'SALESFORCE_ACCESS_TOKEN'
                                                : null;
        const fromEnv = envVar ? process.env[envVar]?.trim() : '';
        if (!fromEnv)
            return '';
        await prisma_1.prisma.clientToolAccount.update({
            where: { id: account.id },
            data: { api_key_encrypted: (0, encryption_1.encrypt)(fromEnv) },
        });
        return fromEnv;
    }
    /** Map pipeline/compiler payloads to Apollo mixed_people/search shape */
    normalizeApolloPayload(action, payload) {
        if (action !== 'search_leads')
            return payload;
        if (payload.q != null)
            return payload;
        const query = payload.query ?? payload.q;
        const limit = Math.min(Number(payload.limit) || 50, 100);
        const filters = {
            ...(payload.filters || {}),
        };
        if (payload.industries) {
            filters.industries =
                typeof payload.industries === 'string'
                    ? payload.industries.split(',').map((s) => s.trim()).filter(Boolean)
                    : payload.industries;
        }
        if (payload.locations) {
            filters.locations =
                typeof payload.locations === 'string'
                    ? payload.locations.split(',').map((s) => s.trim()).filter(Boolean)
                    : payload.locations;
        }
        return {
            q: query,
            persona: payload.persona,
            filters,
            pagination: { per_page: limit, page: 1 },
        };
    }
    buildMockExecutionResult(tool, action, payload, mode) {
        const base = {
            mode: 'mock',
            reason: mode === 'mock' ? 'forced_by_env' : 'missing_api_key_auto_fallback',
            tool,
            action,
            accepted: true,
            simulated_at: new Date().toISOString(),
            payload,
        };
        if (tool === 'apollo' && action === 'search_leads') {
            const limit = Math.min(Number(payload?.limit) || 25, 100);
            const leads = (0, pipeline_leads_1.generateMockLeads)(limit, {
                industry: String(payload?.query || payload?.industries || 'B2B').slice(0, 60),
            });
            return { ...base, people: leads, leads, total: leads.length };
        }
        if (tool === 'clay' && (action === 'send_leads' || action === 'run_workflow')) {
            let rows = [];
            try {
                if (typeof payload?.rows_json === 'string') {
                    rows = JSON.parse(payload.rows_json);
                }
            }
            catch {
                rows = [];
            }
            const enriched = rows.map((r, i) => ({
                ...r,
                email: r.email || `enriched${i + 1}@example.com`,
                verified: true,
                enriched_at: new Date().toISOString(),
            }));
            return { ...base, enriched, job_id: `mock_clay_${Date.now()}`, rows_sent: enriched.length };
        }
        if (tool === 'clay' && action === 'fetch_enrichment_output') {
            return { ...base, enriched: [], job_id: payload?.job_id, status: 'complete' };
        }
        if (tool === 'smartlead' && action === 'create_campaign') {
            const id = Math.floor(10000 + Math.random() * 89999);
            return { ...base, campaign_id: id, id, name: payload?.name };
        }
        if (tool === 'smartlead' && action === 'add_leads_to_campaign') {
            const list = payload?.lead_list || [];
            let count = Array.isArray(list) ? list.length : 0;
            if (!count && typeof payload?.lead_list_json === 'string') {
                try {
                    count = JSON.parse(payload.lead_list_json).length;
                }
                catch {
                    count = 0;
                }
            }
            return {
                ...base,
                campaign_id: payload?.campaign_id,
                added: count,
                lead_list: list,
            };
        }
        if (tool === 'hunter' && action === 'search_leads') {
            const limit = Math.min(Number(payload?.limit) || 10, 25);
            const leads = (0, pipeline_leads_1.generateMockLeads)(limit, {
                industry: String(payload?.query || 'SaaS').slice(0, 60),
            });
            return {
                ...base,
                provider: 'hunter',
                people: leads,
                leads,
                total: leads.length,
                note: 'mock_fallback',
            };
        }
        if (tool === 'hunter' && action === 'verify_emails') {
            return { ...base, provider: 'hunter', verified: [], enriched: [] };
        }
        if (tool === 'brevo' && action === 'prepare_campaign') {
            const id = Math.floor(10000 + Math.random() * 89999);
            return { ...base, provider: 'brevo', campaign_id: id, list_id: id + 1, id };
        }
        if (tool === 'brevo' && action === 'sync_contacts') {
            const contacts = payload?.contacts || [];
            return {
                ...base,
                provider: 'brevo',
                added_count: Array.isArray(contacts) ? contacts.length : 0,
            };
        }
        if (tool === 'brevo' && action === 'send_campaign_now') {
            return {
                ...base,
                provider: 'brevo',
                campaign_id: payload?.campaign_id,
                sent: true,
                simulated: true,
            };
        }
        if (tool === 'bettercontacts' && action === 'enrich_contacts') {
            const contacts = payload?.contacts || [];
            const enriched = (Array.isArray(contacts) ? contacts : []).map((c, i) => ({
                ...c,
                email: c.email || `enriched${i + 1}@example.com`,
                phone: c.phone || undefined,
                verified: true,
            }));
            return {
                ...base,
                provider: 'bettercontacts',
                request_id: `mock_bc_${Date.now()}`,
                data: enriched,
                summary: { total: enriched.length, valid: enriched.length },
            };
        }
        if (tool === 'bettercontacts' && action === 'get_enrichment_results') {
            return {
                ...base,
                provider: 'bettercontacts',
                status: 'terminated',
                data: [],
                summary: { total: 0, valid: 0 },
            };
        }
        if (tool === 'calendly' && action === 'create_scheduling_link') {
            const uuid = `mock_evt_${Date.now()}`;
            return {
                ...base,
                provider: 'calendly',
                scheduling_link: {
                    uri: `https://api.calendly.com/scheduled_events/${uuid}`,
                    booking_url: `https://calendly.com/mock/booking/${uuid}`,
                    max_event_count: payload?.max_event_count ?? 1,
                    owner: payload?.owner,
                    event_type: payload?.event_type,
                },
            };
        }
        if (tool === 'calendly' && action === 'list_event_types') {
            return {
                ...base,
                provider: 'calendly',
                collection: [
                    {
                        uri: 'https://api.calendly.com/event_types/mock_1',
                        name: '30 Minute Meeting',
                        duration: 30,
                        active: true,
                    },
                ],
            };
        }
        if (tool === 'calendly' && action === 'list_scheduled_events') {
            return {
                ...base,
                provider: 'calendly',
                collection: [],
            };
        }
        // ---- Smartlead additional mocks ----
        if (tool === 'smartlead' && action === 'get_all_campaigns') {
            return { ...base, campaigns: [] };
        }
        if (tool === 'smartlead' && action === 'get_campaign_by_id') {
            return { ...base, campaign_id: payload?.campaign_id, name: 'Mock Campaign' };
        }
        if (tool === 'smartlead' && action === 'update_campaign_schedule') {
            return { ...base, campaign_id: payload?.campaign_id, updated: true };
        }
        if (tool === 'smartlead' && action === 'get_campaign_statistics') {
            return { ...base, campaign_id: payload?.campaign_id, sent: 0, opened: 0, replied: 0 };
        }
        if (tool === 'smartlead' && action === 'get_leads_by_campaign') {
            return { ...base, leads: [] };
        }
        if (tool === 'smartlead' && action === 'get_lead_by_email') {
            return { ...base, email: payload?.email, found: false };
        }
        if (tool === 'smartlead' && action === 'update_lead_status') {
            return { ...base, updated: true };
        }
        if (tool === 'smartlead' && action === 'get_all_email_accounts') {
            return { ...base, email_accounts: [] };
        }
        if (tool === 'smartlead' && action === 'add_email_account_to_campaign') {
            return { ...base, campaign_id: payload?.campaign_id, added: true };
        }
        // ---- HeyReach mocks ----
        if (tool === 'heyreach' && action === 'get_all_campaigns') {
            return { ...base, campaigns: [] };
        }
        if (tool === 'heyreach' && action === 'get_campaign_by_id') {
            return { ...base, id: payload?.id, name: 'Mock Campaign' };
        }
        if (tool === 'heyreach' && action === 'add_leads_to_campaign') {
            return { ...base, added: Array.isArray(payload?.leads) ? payload.leads.length : 0 };
        }
        if (tool === 'heyreach' && action === 'get_conversations') {
            return { ...base, conversations: [] };
        }
        if (tool === 'heyreach' && action === 'send_message') {
            return { ...base, sent: true, message_id: `mock_msg_${Date.now()}` };
        }
        if (tool === 'heyreach' && action === 'get_all_linkedin_accounts') {
            return { ...base, accounts: [] };
        }
        if (tool === 'heyreach' && action === 'get_all_lists') {
            return { ...base, lists: [] };
        }
        if (tool === 'heyreach' && action === 'create_empty_list') {
            return { ...base, list_id: `mock_list_${Date.now()}` };
        }
        if (tool === 'heyreach' && action === 'get_lead') {
            return { ...base, lead: null };
        }
        if (tool === 'heyreach' && action === 'create_campaign') {
            return { ...base, campaign_id: `mock_hr_${Date.now()}` };
        }
        if (tool === 'heyreach' && action === 'push_leads') {
            return { ...base, pushed: Array.isArray(payload?.leads) ? payload.leads.length : 0 };
        }
        if (tool === 'heyreach' && action === 'fetch_replies') {
            return { ...base, replies: [] };
        }
        // ---- Instantly mocks ----
        if (tool === 'instantly' && action === 'list_campaigns') {
            return { ...base, campaigns: [] };
        }
        if (tool === 'instantly' && action === 'create_campaign') {
            return { ...base, campaign_id: `mock_inst_${Date.now()}`, name: payload?.name };
        }
        if (tool === 'instantly' && action === 'add_leads') {
            return { ...base, campaign_id: payload?.campaign_id, added: Array.isArray(payload?.leads) ? payload.leads.length : 0 };
        }
        if (tool === 'instantly' && action === 'get_campaign') {
            return { ...base, campaign_id: payload?.campaign_id, status: 'active' };
        }
        if (tool === 'instantly' && action === 'get_campaign_stats') {
            return { ...base, campaign_id: payload?.campaign_id, sent: 0, opened: 0, replied: 0 };
        }
        if (tool === 'instantly' && action === 'list_workspaces') {
            return { ...base, workspaces: [] };
        }
        // ---- HubSpot mocks ----
        if (tool === 'hubspot' && action === 'create_contact') {
            return { ...base, id: `mock_hs_contact_${Date.now()}`, properties: payload?.properties || {} };
        }
        if (tool === 'hubspot' && action === 'search_contacts') {
            return { ...base, results: [], total: 0 };
        }
        if (tool === 'hubspot' && action === 'get_contact') {
            return { ...base, id: payload?.contact_id, properties: {} };
        }
        if (tool === 'hubspot' && action === 'update_contact') {
            return { ...base, id: payload?.contact_id, updated: true };
        }
        if (tool === 'hubspot' && action === 'create_deal') {
            return { ...base, id: `mock_hs_deal_${Date.now()}`, properties: payload?.properties || {} };
        }
        if (tool === 'hubspot' && action === 'search_deals') {
            return { ...base, results: [], total: 0 };
        }
        if (tool === 'hubspot' && action === 'get_pipelines') {
            return { ...base, results: [] };
        }
        if (tool === 'hubspot' && action === 'create_company') {
            return { ...base, id: `mock_hs_company_${Date.now()}`, properties: payload?.properties || {} };
        }
        if (tool === 'hubspot' && action === 'search_companies') {
            return { ...base, results: [], total: 0 };
        }
        // ---- Salesforce mocks ----
        if (tool === 'salesforce' && action === 'query') {
            return { ...base, totalSize: 0, records: [] };
        }
        if (tool === 'salesforce' && action === 'search') {
            return { ...base, searchRecords: [] };
        }
        if (tool === 'salesforce' && action === 'create_lead') {
            return { ...base, id: `mock_sf_lead_${Date.now()}`, success: true };
        }
        if (tool === 'salesforce' && action === 'update_lead') {
            return { ...base, id: payload?.lead_id, success: true };
        }
        if (tool === 'salesforce' && action === 'get_lead') {
            return { ...base, Id: payload?.lead_id, FirstName: '', LastName: '', Company: '' };
        }
        if (tool === 'salesforce' && action === 'create_contact') {
            return { ...base, id: `mock_sf_contact_${Date.now()}`, success: true };
        }
        if (tool === 'salesforce' && action === 'update_contact') {
            return { ...base, id: payload?.contact_id, success: true };
        }
        if (tool === 'salesforce' && action === 'get_contact') {
            return { ...base, Id: payload?.contact_id, FirstName: '', LastName: '', Email: '' };
        }
        if (tool === 'salesforce' && action === 'create_opportunity') {
            return { ...base, id: `mock_sf_opp_${Date.now()}`, success: true };
        }
        if (tool === 'salesforce' && action === 'update_opportunity') {
            return { ...base, id: payload?.opportunity_id, success: true };
        }
        if (tool === 'salesforce' && action === 'create_account') {
            return { ...base, id: `mock_sf_acc_${Date.now()}`, success: true };
        }
        if (tool === 'salesforce' && action === 'describe_object') {
            return { ...base, name: payload?.object_name, fields: [] };
        }
        return base;
    }
    async dispatchToTool(tool, apiKey, action, payload) {
        switch (tool) {
            case 'apollo': {
                const service = new apollo_service_1.ApolloService(apiKey);
                const apolloPayload = payload && typeof payload === 'object'
                    ? this.normalizeApolloPayload(action, payload)
                    : payload;
                if (action === 'search_leads')
                    return service.searchLeads(apolloPayload);
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
            case 'hunter': {
                const service = new hunter_service_1.HunterService(apiKey);
                if (action === 'search_leads')
                    return service.searchLeads(payload);
                if (action === 'discover')
                    return service.discover(payload);
                if (action === 'domain_search')
                    return service.domainSearch(payload);
                if (action === 'verify_emails')
                    return service.verifyEmails(payload);
                if (action === 'verify_email')
                    return service.verifyEmail(payload);
                break;
            }
            case 'brevo': {
                const service = new brevo_service_1.BrevoService(apiKey);
                if (action === 'prepare_campaign')
                    return service.prepareCampaign(payload);
                if (action === 'create_list')
                    return service.createList(payload);
                if (action === 'create_contact')
                    return service.createContact(payload);
                if (action === 'sync_contacts')
                    return service.syncContacts(payload);
                if (action === 'create_campaign')
                    return service.createCampaign(payload);
                if (action === 'send_campaign_now')
                    return service.sendCampaignNow(payload);
                if (action === 'send_transactional')
                    return service.sendTransactional(payload);
                break;
            }
            case 'bettercontacts': {
                const service = new bettercontacts_service_1.BetterContactsService(apiKey);
                if (action === 'enrich_contacts')
                    return service.enrichContacts(payload);
                if (action === 'get_enrichment_results')
                    return service.getEnrichmentResults(payload);
                break;
            }
            case 'instantly': {
                const instService = new instantly_service_1.InstantlyService(apiKey);
                if (action === 'list_campaigns')
                    return instService.listCampaigns(payload);
                if (action === 'create_campaign')
                    return instService.createCampaign(payload);
                if (action === 'add_leads')
                    return instService.addLeads(payload);
                if (action === 'get_campaign')
                    return instService.getCampaign(payload);
                if (action === 'get_campaign_stats')
                    return instService.getCampaignStats(payload);
                if (action === 'list_workspaces')
                    return instService.listWorkspaces(payload);
                break;
            }
            case 'hubspot': {
                const hsService = new hubspot_service_1.HubSpotService(apiKey);
                if (action === 'create_contact')
                    return hsService.createContact(payload);
                if (action === 'search_contacts')
                    return hsService.searchContacts(payload);
                if (action === 'get_contact')
                    return hsService.getContact(payload);
                if (action === 'update_contact')
                    return hsService.updateContact(payload);
                if (action === 'create_deal')
                    return hsService.createDeal(payload);
                if (action === 'search_deals')
                    return hsService.searchDeals(payload);
                if (action === 'get_pipelines')
                    return hsService.getPipelines(payload);
                if (action === 'create_company')
                    return hsService.createCompany(payload);
                if (action === 'search_companies')
                    return hsService.searchCompanies(payload);
                break;
            }
            case 'salesforce': {
                const sfService = new salesforce_service_1.SalesforceService(apiKey);
                if (action === 'query')
                    return sfService.query(payload);
                if (action === 'search')
                    return sfService.search(payload);
                if (action === 'create_lead')
                    return sfService.createLead(payload);
                if (action === 'update_lead')
                    return sfService.updateLead(payload);
                if (action === 'get_lead')
                    return sfService.getLead(payload);
                if (action === 'create_contact')
                    return sfService.createContact(payload);
                if (action === 'update_contact')
                    return sfService.updateContact(payload);
                if (action === 'get_contact')
                    return sfService.getContact(payload);
                if (action === 'create_opportunity')
                    return sfService.createOpportunity(payload);
                if (action === 'update_opportunity')
                    return sfService.updateOpportunity(payload);
                if (action === 'create_account')
                    return sfService.createAccount(payload);
                if (action === 'describe_object')
                    return sfService.describeObject(payload);
                break;
            }
            case 'calendly': {
                const service = new calendly_service_1.CalendlyService(apiKey);
                if (action === 'get_current_user')
                    return service.getCurrentUser();
                if (action === 'list_event_types')
                    return service.listEventTypes(payload);
                if (action === 'create_scheduling_link') {
                    const linkPayload = { ...payload };
                    if (!linkPayload.owner || !linkPayload.event_type) {
                        const user = await service.getCurrentUser();
                        const userUri = user?.resource?.uri;
                        const orgUri = user?.resource?.current_organization;
                        if (!linkPayload.owner)
                            linkPayload.owner = userUri;
                        const types = await service.listEventTypes({ user: userUri });
                        const eventType = types?.collection?.[0]?.uri;
                        if (eventType) {
                            linkPayload.event_type = eventType;
                            linkPayload.owner = eventType;
                        }
                    }
                    return service.createSchedulingLink(linkPayload);
                }
                if (action === 'list_scheduled_events')
                    return service.listScheduledEvents(payload);
                if (action === 'create_webhook_subscription')
                    return service.createWebhookSubscription(payload);
                break;
            }
            default:
                break;
        }
        throw new Error(`Unsupported action "${action}" for tool "${tool}"`);
    }
}
exports.ExecutionEngine = ExecutionEngine;

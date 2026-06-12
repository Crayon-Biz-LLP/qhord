"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeyReachService = void 0;
const axios_1 = __importDefault(require("axios"));
const baseURL = process.env.HEYREACH_BASE_URL || 'https://api.heyreach.io';
class HeyReachService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.client = axios_1.default.create({ baseURL });
    }
    authHeaders() {
        return {
            'X-API-KEY': this.apiKey,
            'Content-Type': 'application/json'
        };
    }
    // --- Campaigns ---
    async getAllCampaigns(payload) {
        const response = await this.client.post('/api/public/campaign/GetAll', payload, {
            headers: this.authHeaders()
        });
        return response.data;
    }
    async getCampaignById(payload) {
        const response = await this.client.get('/api/public/campaign/GetById', {
            params: { id: payload.id },
            headers: this.authHeaders()
        });
        return response.data;
    }
    async addLeadsToCampaign(payload) {
        const response = await this.client.post('/api/public/campaign/AddLeadsToCampaignV2', payload, {
            headers: this.authHeaders()
        });
        return response.data;
    }
    // --- Inbox ---
    async getConversations(payload) {
        const response = await this.client.post('/api/public/inbox/GetConversationsV2', payload, {
            headers: this.authHeaders()
        });
        return response.data;
    }
    async sendMessage(payload) {
        const response = await this.client.post('/api/public/inbox/SendMessage', payload, {
            headers: this.authHeaders()
        });
        return response.data;
    }
    // --- LinkedIn Accounts ---
    async getAllLinkedInAccounts(payload) {
        const response = await this.client.post('/api/public/linkedin-account/GetAll', payload, {
            headers: this.authHeaders()
        });
        return response.data;
    }
    // --- Lists ---
    async getAllLists(payload) {
        const response = await this.client.post('/api/public/list/GetAll', payload, {
            headers: this.authHeaders()
        });
        return response.data;
    }
    async createEmptyList(payload) {
        const response = await this.client.post('/api/public/list/CreateEmptyList', payload, {
            headers: this.authHeaders()
        });
        return response.data;
    }
    // --- Leads ---
    async getLead(payload) {
        const response = await this.client.post('/api/public/lead/GetLead', payload, {
            headers: this.authHeaders()
        });
        return response.data;
    }
    // Legacy (Keep to prevent breaking existing actions that were added previously, if any)
    async createCampaign(payload) {
        const response = await this.client.post('/v1/campaigns', payload, {
            headers: this.authHeaders()
        });
        return response.data;
    }
    async pushLeads(payload) {
        const response = await this.client.post('/v1/leads/push', payload, {
            headers: this.authHeaders()
        });
        return response.data;
    }
    async fetchReplies(payload) {
        const response = await this.client.post('/v1/replies/search', payload, {
            headers: this.authHeaders()
        });
        return response.data;
    }
    // --- Standardized integrations interface ---
    async validateConnection() {
        try {
            await this.getAllLinkedInAccounts({});
            return { success: true };
        }
        catch (err) {
            return { success: false, error: err.message || 'Validation failed' };
        }
    }
    async registerWebhook(url, event) {
        return { success: true, webhookId: `mock_heyreach_webhook_${Date.now()}` };
    }
    async fetchCampaigns() {
        try {
            const data = await this.getAllCampaigns({});
            const campaigns = Array.isArray(data) ? data : data?.campaigns || [];
            return campaigns.map((c) => ({
                id: String(c.id || c.campaign_id),
                name: c.name || c.campaign_name || 'Unnamed campaign'
            }));
        }
        catch {
            return [];
        }
    }
    async enrollLead(payload) {
        return this.addLeadsToCampaign({
            campaign_id: payload.campaign_id,
            leads: [{
                    id: payload.lead_id || `lead_${Date.now()}`,
                    email: payload.email,
                    first_name: payload.first_name,
                    last_name: payload.last_name
                }]
        });
    }
    async enrichLead(payload) {
        throw new Error('Data enrichment not supported on HeyReach service');
    }
    async checkReply(payload) {
        try {
            const data = await this.getConversations({ lead_id: payload.lead_id });
            const convs = data.conversations || [];
            const hasReplied = convs.some((c) => c.status === 'replied' || c.unread_count > 0);
            return { replied: hasReplied };
        }
        catch {
            return { replied: false };
        }
    }
    async sendLinkedInAction(payload) {
        if (payload.action === 'send_message' || payload.action === 'message') {
            return this.sendMessage({
                lead_id: payload.lead_id,
                text: payload.message || ''
            });
        }
        return { success: true, action: payload.action, lead_id: payload.lead_id };
    }
    async getSenderHealth() {
        try {
            const data = await this.getAllLinkedInAccounts({});
            const accounts = data.accounts || data || [];
            return accounts.map((acc) => ({
                id: acc.id,
                username: acc.username || acc.email,
                status: acc.status || 'active',
                health_status: acc.health_status || 'good'
            }));
        }
        catch {
            return [];
        }
    }
    async handleWebhookEvent(event) {
        const eventType = event.type || 'linkedin_replied';
        const email = event.lead?.email || event.email;
        return {
            event: eventType,
            email,
            raw: event
        };
    }
}
exports.HeyReachService = HeyReachService;

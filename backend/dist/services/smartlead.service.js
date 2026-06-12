"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartLeadService = void 0;
const axios_1 = __importDefault(require("axios"));
const baseURL = process.env.SMARTLEAD_BASE_URL || 'https://server.smartlead.ai/api/v1';
class SmartLeadService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.client = axios_1.default.create({ baseURL });
    }
    params(extra = {}) {
        return { api_key: this.apiKey, ...extra };
    }
    // ── Campaigns ──────────────────────────────────────────────
    async getAllCampaigns(payload) {
        const response = await this.client.get('/campaigns', {
            params: this.params(),
        });
        return response.data;
    }
    async getCampaignById(payload) {
        const { campaign_id } = payload;
        const response = await this.client.get(`/campaigns/${campaign_id}`, {
            params: this.params(),
        });
        return response.data;
    }
    async createCampaign(payload) {
        const response = await this.client.post('/campaigns/create', payload, {
            params: this.params(),
        });
        return response.data;
    }
    async updateCampaignSchedule(payload) {
        const { campaign_id, ...body } = payload;
        const response = await this.client.post(`/campaigns/${campaign_id}/schedule`, body, {
            params: this.params(),
        });
        return response.data;
    }
    async getCampaignStatistics(payload) {
        const { campaign_id } = payload;
        const response = await this.client.get(`/campaigns/${campaign_id}/statistics`, {
            params: this.params(),
        });
        return response.data;
    }
    // ── Leads ──────────────────────────────────────────────────
    async addLeadsToCampaign(payload) {
        const { campaign_id, lead_list, settings } = payload;
        const response = await this.client.post(`/campaigns/${campaign_id}/leads`, {
            lead_list,
            settings,
        }, {
            params: this.params(),
        });
        return response.data;
    }
    async getLeadsByCampaign(payload) {
        const { campaign_id, offset, limit } = payload;
        const response = await this.client.get(`/campaigns/${campaign_id}/leads`, {
            params: this.params({ offset: offset ?? 0, limit: limit ?? 100 }),
        });
        return response.data;
    }
    async getLeadByEmail(payload) {
        const { email } = payload;
        const response = await this.client.get('/leads/', {
            params: this.params({ email }),
        });
        return response.data;
    }
    async updateLeadStatus(payload) {
        const response = await this.client.post('/leads/status', payload, {
            params: this.params(),
        });
        return response.data;
    }
    // ── Email Accounts ─────────────────────────────────────────
    async getAllEmailAccounts(payload) {
        const response = await this.client.get('/email-accounts', {
            params: this.params(),
        });
        return response.data;
    }
    async addEmailAccountToCampaign(payload) {
        const { campaign_id, email_account_ids } = payload;
        const response = await this.client.post(`/campaigns/${campaign_id}/email-accounts`, {
            email_account_ids,
        }, {
            params: this.params(),
        });
        return response.data;
    }
    // --- Standardized integrations interface ---
    async validateConnection() {
        try {
            await this.getAllEmailAccounts({});
            return { success: true };
        }
        catch (err) {
            return { success: false, error: err.message || 'Validation failed' };
        }
    }
    async registerWebhook(url, event) {
        return { success: true, webhookId: `mock_smartlead_webhook_${Date.now()}` };
    }
    async fetchCampaigns() {
        try {
            const data = await this.getAllCampaigns({});
            const campaigns = Array.isArray(data) ? data : data?.campaigns || [];
            return campaigns.map((c) => ({
                id: String(c.id),
                name: c.name || 'Unnamed campaign'
            }));
        }
        catch {
            return [];
        }
    }
    async enrollLead(payload) {
        return this.addLeadsToCampaign({
            campaign_id: payload.campaign_id,
            lead_list: [{
                    email: payload.email,
                    first_name: payload.first_name,
                    last_name: payload.last_name,
                    company_name: payload.company_name
                }]
        });
    }
    async enrichLead(payload) {
        throw new Error('Data enrichment not supported on Smartlead service');
    }
    async checkReply(payload) {
        try {
            const data = await this.getLeadByEmail({ email: payload.email });
            const lead = data?.lead || data;
            const replied = lead?.is_replied || lead?.status === 'replied';
            return { replied: !!replied };
        }
        catch {
            return { replied: false };
        }
    }
    async sendLinkedInAction(payload) {
        throw new Error('LinkedIn actions not supported on Smartlead service');
    }
    async getSenderHealth() {
        try {
            const data = await this.getAllEmailAccounts({});
            const accounts = data.email_accounts || data || [];
            return accounts.map((acc) => ({
                id: acc.id,
                email: acc.from_email || acc.email,
                status: acc.status || 'active',
                health_score: acc.health_score || 90
            }));
        }
        catch {
            return [];
        }
    }
    async handleWebhookEvent(event) {
        const eventType = event.event_type || 'email_replied';
        const email = event.lead?.email || event.email;
        return {
            event: eventType,
            email,
            raw: event
        };
    }
}
exports.SmartLeadService = SmartLeadService;

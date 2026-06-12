"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstantlyService = void 0;
const axios_1 = __importDefault(require("axios"));
const baseURL = process.env.INSTANTLY_BASE_URL || 'https://api.instantly.ai/api/v1';
class InstantlyService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.client = axios_1.default.create({ baseURL });
    }
    headers() {
        return {
            'X-API-Key': this.apiKey,
            'Content-Type': 'application/json',
        };
    }
    async listCampaigns(payload) {
        const response = await this.client.get('/campaign/list', {
            headers: this.headers(),
            params: payload,
        });
        return response.data;
    }
    async createCampaign(payload) {
        const response = await this.client.post('/campaign/create', payload, {
            headers: this.headers(),
        });
        return response.data;
    }
    async addLeads(payload) {
        const { campaign_id, leads } = payload;
        const response = await this.client.post(`/campaign/${campaign_id}/leads/add`, { leads }, {
            headers: this.headers(),
        });
        return response.data;
    }
    async getCampaign(payload) {
        const { campaign_id } = payload;
        const response = await this.client.get(`/campaign/${campaign_id}`, {
            headers: this.headers(),
        });
        return response.data;
    }
    async getCampaignStats(payload) {
        const { campaign_id } = payload;
        const response = await this.client.get(`/campaign/${campaign_id}/stats`, {
            headers: this.headers(),
        });
        return response.data;
    }
    async listWorkspaces(payload) {
        const response = await this.client.get('/workspace/list', {
            headers: this.headers(),
        });
        return response.data;
    }
    // --- Standardized integrations interface ---
    async validateConnection() {
        try {
            await this.listWorkspaces({});
            return { success: true };
        }
        catch (err) {
            return { success: false, error: err.message || 'Validation failed' };
        }
    }
    async registerWebhook(url, event) {
        return { success: true, webhookId: `mock_instantly_webhook_${Date.now()}` };
    }
    async fetchCampaigns() {
        try {
            const data = await this.listCampaigns({});
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
        return this.addLeads({
            campaign_id: payload.campaign_id,
            leads: [{
                    email: payload.email,
                    first_name: payload.first_name,
                    last_name: payload.last_name
                }]
        });
    }
    async enrichLead(payload) {
        throw new Error('Data enrichment not supported on Instantly service');
    }
    async checkReply(payload) {
        return { replied: false };
    }
    async sendLinkedInAction(payload) {
        throw new Error('LinkedIn actions not supported on Instantly service');
    }
    async getSenderHealth() {
        try {
            const data = await this.listWorkspaces({});
            const workspaces = Array.isArray(data) ? data : data?.workspaces || [];
            return workspaces.map((w) => ({
                id: w.id,
                name: w.name,
                status: 'active',
                health_score: 98
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
exports.InstantlyService = InstantlyService;

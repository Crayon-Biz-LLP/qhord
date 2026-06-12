"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClayService = void 0;
const axios_1 = __importDefault(require("axios"));
const baseURL = process.env.CLAY_BASE_URL || 'https://api.clay.run';
class ClayService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.client = axios_1.default.create({ baseURL });
    }
    authHeaders() {
        return {
            Authorization: `Bearer ${this.apiKey}`
        };
    }
    async sendLeads(payload) {
        const response = await this.client.post('/v1/leads/send', payload, {
            headers: this.authHeaders()
        });
        return response.data;
    }
    async runWorkflow(payload) {
        const response = await this.client.post('/v1/workflows/run', payload, {
            headers: this.authHeaders()
        });
        return response.data;
    }
    async fetchEnrichmentOutput(payload) {
        const response = await this.client.post('/v1/enrichment/output', payload, {
            headers: this.authHeaders()
        });
        return response.data;
    }
    // --- Standardized integrations interface ---
    async validateConnection() {
        try {
            if (!this.apiKey || this.apiKey.trim().length === 0) {
                return { success: false, error: 'API Key missing' };
            }
            return { success: true };
        }
        catch (err) {
            return { success: false, error: err.message };
        }
    }
    async registerWebhook(url, event) {
        return { success: false, error: 'Webhooks not supported on Clay service' };
    }
    async fetchCampaigns() {
        return [];
    }
    async enrollLead(payload) {
        throw new Error('Lead enrollment not supported on Clay service');
    }
    async enrichLead(payload) {
        return this.runWorkflow(payload);
    }
    async checkReply(payload) {
        return { replied: false };
    }
    async sendLinkedInAction(payload) {
        throw new Error('LinkedIn actions not supported on Clay service');
    }
    async getSenderHealth() {
        return [];
    }
    async handleWebhookEvent(event) {
        return {
            event: 'data_enrichment_completed',
            email: event.email,
            raw: event
        };
    }
}
exports.ClayService = ClayService;

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
}
exports.HeyReachService = HeyReachService;

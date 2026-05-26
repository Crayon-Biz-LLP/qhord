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
}
exports.InstantlyService = InstantlyService;

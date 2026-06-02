"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HubSpotService = void 0;
const axios_1 = __importDefault(require("axios"));
const baseURL = process.env.HUBSPOT_BASE_URL || 'https://api.hubapi.com';
class HubSpotService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.client = axios_1.default.create({ baseURL });
    }
    headers() {
        return {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
        };
    }
    async createContact(payload) {
        const response = await this.client.post('/crm/v3/objects/contacts', {
            properties: payload.properties || payload,
        }, { headers: this.headers() });
        return response.data;
    }
    async searchContacts(payload) {
        const response = await this.client.post('/crm/v3/objects/contacts/search', {
            query: payload.query,
            limit: payload.limit || 50,
            properties: payload.properties,
        }, { headers: this.headers() });
        return response.data;
    }
    async getContact(payload) {
        const { contact_id } = payload;
        const response = await this.client.get(`/crm/v3/objects/contacts/${contact_id}`, {
            headers: this.headers(),
        });
        return response.data;
    }
    async updateContact(payload) {
        const { contact_id, ...properties } = payload;
        const response = await this.client.patch(`/crm/v3/objects/contacts/${contact_id}`, {
            properties,
        }, { headers: this.headers() });
        return response.data;
    }
    async createDeal(payload) {
        const response = await this.client.post('/crm/v3/objects/deals', {
            properties: payload.properties || payload,
        }, { headers: this.headers() });
        return response.data;
    }
    async searchDeals(payload) {
        const response = await this.client.post('/crm/v3/objects/deals/search', {
            query: payload.query,
            limit: payload.limit || 50,
            properties: payload.properties,
        }, { headers: this.headers() });
        return response.data;
    }
    async getPipelines(payload) {
        const response = await this.client.get('/crm/v3/pipelines/deals', {
            headers: this.headers(),
        });
        return response.data;
    }
    async createCompany(payload) {
        const response = await this.client.post('/crm/v3/objects/companies', {
            properties: payload.properties || payload,
        }, { headers: this.headers() });
        return response.data;
    }
    async searchCompanies(payload) {
        const response = await this.client.post('/crm/v3/objects/companies/search', {
            query: payload.query,
            limit: payload.limit || 50,
        }, { headers: this.headers() });
        return response.data;
    }
}
exports.HubSpotService = HubSpotService;

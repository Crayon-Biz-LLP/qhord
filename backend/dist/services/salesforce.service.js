"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesforceService = void 0;
const axios_1 = __importDefault(require("axios"));
const baseURL = process.env.SALESFORCE_BASE_URL || 'https://your-instance.salesforce.com/services/data/v58.0';
class SalesforceService {
    constructor(accessToken) {
        this.accessToken = accessToken;
        this.client = axios_1.default.create({ baseURL });
    }
    headers() {
        return {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
        };
    }
    async query(payload) {
        const { q } = payload;
        const response = await this.client.get('/query', {
            headers: this.headers(),
            params: { q },
        });
        return response.data;
    }
    async search(payload) {
        const { q } = payload;
        const response = await this.client.get('/search', {
            headers: this.headers(),
            params: { q },
        });
        return response.data;
    }
    async createLead(payload) {
        const response = await this.client.post('/sobjects/Lead', payload.properties || payload, {
            headers: this.headers(),
        });
        return response.data;
    }
    async updateLead(payload) {
        const { lead_id, ...properties } = payload;
        const response = await this.client.patch(`/sobjects/Lead/${lead_id}`, properties, {
            headers: this.headers(),
        });
        return response.data;
    }
    async getLead(payload) {
        const { lead_id } = payload;
        const response = await this.client.get(`/sobjects/Lead/${lead_id}`, {
            headers: this.headers(),
        });
        return response.data;
    }
    async createContact(payload) {
        const response = await this.client.post('/sobjects/Contact', payload.properties || payload, {
            headers: this.headers(),
        });
        return response.data;
    }
    async updateContact(payload) {
        const { contact_id, ...properties } = payload;
        const response = await this.client.patch(`/sobjects/Contact/${contact_id}`, properties, {
            headers: this.headers(),
        });
        return response.data;
    }
    async getContact(payload) {
        const { contact_id } = payload;
        const response = await this.client.get(`/sobjects/Contact/${contact_id}`, {
            headers: this.headers(),
        });
        return response.data;
    }
    async createOpportunity(payload) {
        const response = await this.client.post('/sobjects/Opportunity', payload.properties || payload, {
            headers: this.headers(),
        });
        return response.data;
    }
    async updateOpportunity(payload) {
        const { opportunity_id, ...properties } = payload;
        const response = await this.client.patch(`/sobjects/Opportunity/${opportunity_id}`, properties, {
            headers: this.headers(),
        });
        return response.data;
    }
    async createAccount(payload) {
        const response = await this.client.post('/sobjects/Account', payload.properties || payload, {
            headers: this.headers(),
        });
        return response.data;
    }
    async describeObject(payload) {
        const { object_name } = payload;
        const response = await this.client.get(`/sobjects/${object_name}/describe`, {
            headers: this.headers(),
        });
        return response.data;
    }
}
exports.SalesforceService = SalesforceService;

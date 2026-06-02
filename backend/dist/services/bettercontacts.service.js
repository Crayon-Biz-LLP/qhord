"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BetterContactsService = void 0;
const axios_1 = __importDefault(require("axios"));
const baseURL = 'https://app.bettercontact.rocks/api/v2';
class BetterContactsService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.client = axios_1.default.create({ baseURL, timeout: 60000 });
    }
    headers() {
        return {
            'X-API-Key': this.apiKey,
            'Content-Type': 'application/json',
            Accept: 'application/json',
        };
    }
    async enrichContacts(payload) {
        const data = (payload.contacts || []).slice(0, 50);
        const res = await this.client.post('/async', {
            data,
            enrich_email_address: payload.enrich_email ?? true,
            enrich_phone_number: payload.enrich_phone ?? false,
        }, { headers: this.headers() });
        return { ...res.data, provider: 'bettercontacts', request_id: res.data.id };
    }
    async getEnrichmentResults(payload) {
        const res = await this.client.get(`/async/${payload.request_id}`, {
            headers: this.headers(),
        });
        return res.data;
    }
}
exports.BetterContactsService = BetterContactsService;

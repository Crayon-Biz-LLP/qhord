"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendlyService = void 0;
const axios_1 = __importDefault(require("axios"));
const baseURL = 'https://api.calendly.com';
class CalendlyService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.client = axios_1.default.create({ baseURL, timeout: 60000 });
    }
    headers() {
        return {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
        };
    }
    async getCurrentUser() {
        const res = await this.client.get('/users/me', { headers: this.headers() });
        return res.data;
    }
    async listEventTypes(payload) {
        const params = {};
        if (payload.user)
            params.user = payload.user;
        const res = await this.client.get('/event_types', {
            params,
            headers: this.headers(),
        });
        return res.data;
    }
    async createSchedulingLink(payload) {
        const body = {
            max_event_count: payload.max_event_count ?? 1,
            owner: payload.event_type || payload.owner,
            owner_type: 'EventType',
        };
        const res = await this.client.post('/scheduling_links', body, {
            headers: this.headers(),
        });
        return res.data;
    }
    async listScheduledEvents(payload) {
        const params = {};
        if (payload.user)
            params.user = payload.user;
        if (payload.organization)
            params.organization = payload.organization;
        if (payload.status)
            params.status = payload.status;
        if (payload.count)
            params.count = payload.count;
        const res = await this.client.get('/scheduled_events', {
            params,
            headers: this.headers(),
        });
        return res.data;
    }
    async createWebhookSubscription(payload) {
        const body = {
            url: payload.url,
            events: payload.events || ['invitee.created', 'invitee.canceled'],
            organization: payload.organization,
            user: payload.user,
            scope: payload.organization ? 'organization' : 'user',
        };
        const res = await this.client.post('/webhook_subscriptions', body, {
            headers: this.headers(),
        });
        return res.data;
    }
}
exports.CalendlyService = CalendlyService;

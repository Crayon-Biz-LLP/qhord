"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApolloService = void 0;
const axios_1 = __importDefault(require("axios"));
const baseURL = process.env.APOLLO_BASE_URL || 'https://api.apollo.io';
class ApolloService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.client = axios_1.default.create({ baseURL });
    }
    authHeaders() {
        return {
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json',
            'api-key': this.apiKey // Apollo uses 'api-key' in headers or payload (though token in Bearer is sometimes used, usually it's x-api-key or api-key).
        };
    }
    // 1. Search Contacts (Leads)
    async searchLeads(payload) {
        const response = await this.client.post('/api/v1/mixed_people/search', {
            api_key: this.apiKey,
            ...payload
        }, {
            headers: this.authHeaders()
        });
        return response.data;
    }
    // 2. Search Organizations (Accounts)
    async searchOrganizations(payload) {
        const response = await this.client.post('/api/v1/mixed_companies/search', {
            api_key: this.apiKey,
            ...payload
        }, {
            headers: this.authHeaders()
        });
        return response.data;
    }
    // 3. Enrich Person (Find email/info)
    async enrichPerson(payload) {
        const response = await this.client.post('/api/v1/people/match', {
            api_key: this.apiKey,
            ...payload
        }, {
            headers: this.authHeaders()
        });
        return response.data;
    }
    // 4. Enrich Organization
    async enrichOrganization(payload) {
        const response = await this.client.get('/api/v1/organizations/enrich', {
            params: { api_key: this.apiKey, ...payload },
            headers: this.authHeaders()
        });
        return response.data;
    }
    // 5. List Sequences (Emailer Campaigns)
    async listSequences(payload) {
        const response = await this.client.post('/api/v1/emailer_campaigns/search', {
            api_key: this.apiKey,
            ...payload
        }, {
            headers: this.authHeaders()
        });
        return response.data;
    }
    // 6. Add Contacts to Sequence
    async addToSequence(payload) {
        // Requires emailer_campaign_id in payload, and contact_ids array, along with optional email_account_id
        // Endpoint: /api/v1/emailer_campaigns/{emailer_campaign_id}/add_contact_ids
        const campaignId = payload.emailer_campaign_id;
        if (!campaignId) {
            throw new Error("emailer_campaign_id is required to add to sequence.");
        }
        const response = await this.client.post(`/api/v1/emailer_campaigns/${campaignId}/add_contact_ids`, {
            api_key: this.apiKey,
            ...payload
        }, {
            headers: this.authHeaders()
        });
        return response.data;
    }
    // 7. List Mailboxes / Email Accounts
    async listMailboxes(payload) {
        const response = await this.client.get('/api/v1/email_accounts', {
            params: { api_key: this.apiKey, ...payload },
            headers: this.authHeaders()
        });
        return response.data;
    }
    // 8. List Contact Lists / Labels
    async listLabels(payload) {
        const response = await this.client.post('/api/v1/labels/search', {
            api_key: this.apiKey,
            ...payload
        }, {
            headers: this.authHeaders()
        });
        return response.data;
    }
    // --- Contacts ---
    async createContact(payload) {
        const response = await this.client.post('/v1/contacts', {
            api_key: this.apiKey,
            ...payload
        }, { headers: this.authHeaders() });
        return response.data;
    }
    async updateContact(payload) {
        const { contact_id, ...data } = payload;
        const response = await this.client.put(`/v1/contacts/${contact_id}`, {
            api_key: this.apiKey,
            ...data
        }, { headers: this.authHeaders() });
        return response.data;
    }
    // --- Accounts ---
    async createAccount(payload) {
        const response = await this.client.post('/v1/accounts', {
            api_key: this.apiKey,
            ...payload
        }, { headers: this.authHeaders() });
        return response.data;
    }
    async updateAccount(payload) {
        const { account_id, ...data } = payload;
        const response = await this.client.put(`/v1/accounts/${account_id}`, {
            api_key: this.apiKey,
            ...data
        }, { headers: this.authHeaders() });
        return response.data;
    }
    // --- Bulk Enrichment ---
    async bulkPeopleEnrich(payload) {
        const response = await this.client.post('/v1/people/bulk_match', {
            api_key: this.apiKey,
            ...payload
        }, { headers: this.authHeaders() });
        return response.data;
    }
    // --- Deals ---
    async createDeal(payload) {
        const response = await this.client.post('/v1/deals', {
            api_key: this.apiKey,
            ...payload
        }, { headers: this.authHeaders() });
        return response.data;
    }
    async listDeals(payload) {
        const response = await this.client.get('/v1/deals', {
            params: { api_key: this.apiKey, ...payload },
            headers: this.authHeaders()
        });
        return response.data;
    }
    // --- Tasks ---
    async createTask(payload) {
        const response = await this.client.post('/v1/tasks', {
            api_key: this.apiKey,
            ...payload
        }, { headers: this.authHeaders() });
        return response.data;
    }
    async searchTasks(payload) {
        const response = await this.client.post('/v1/tasks/search', {
            api_key: this.apiKey,
            ...payload
        }, { headers: this.authHeaders() });
        return response.data;
    }
    // --- Calls ---
    async createCall(payload) {
        const response = await this.client.post('/v1/calls', {
            api_key: this.apiKey,
            ...payload
        }, { headers: this.authHeaders() });
        return response.data;
    }
    async searchCalls(payload) {
        const response = await this.client.get('/v1/calls', {
            params: { api_key: this.apiKey, ...payload },
            headers: this.authHeaders()
        });
        return response.data;
    }
    // --- Misc ---
    async health(payload) {
        const response = await this.client.get('/v1/auth/health', {
            params: { api_key: this.apiKey, ...payload },
            headers: this.authHeaders()
        });
        return response.data;
    }
    async getUsers(payload) {
        const response = await this.client.get('/v1/users', {
            params: { api_key: this.apiKey, ...payload },
            headers: this.authHeaders()
        });
        return response.data;
    }
    // Legacy kept for backward compatibility if it's already used
    async createList(payload) {
        const response = await this.client.post('/v1/lists', {
            api_key: this.apiKey,
            ...payload
        }, {
            headers: this.authHeaders()
        });
        return response.data;
    }
    async launchSequence(payload) {
        const response = await this.client.post('/v1/sequences/launch', {
            api_key: this.apiKey,
            ...payload
        }, {
            headers: this.authHeaders()
        });
        return response.data;
    }
}
exports.ApolloService = ApolloService;

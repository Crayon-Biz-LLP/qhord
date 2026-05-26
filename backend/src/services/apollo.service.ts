import axios from 'axios';

const baseURL = process.env.APOLLO_BASE_URL || 'https://api.apollo.io';

export class ApolloService {
  private client = axios.create({ baseURL });

  constructor(private apiKey: string) { }

  private authHeaders() {
    return {
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json',
      'X-Api-Key': this.apiKey,
    };
  }

  private stripApiKey<T extends Record<string, unknown>>(payload: T): Omit<T, 'api_key'> {
    if (!payload) return payload;
    const { api_key: _removed, ...rest } = payload;
    return rest as Omit<T, 'api_key'>;
  }

  // 1. Search Contacts (Leads)
  async searchLeads(payload: any): Promise<any> {
    const response = await this.client.post('/api/v1/mixed_people/search', this.stripApiKey(payload ?? {}), {
      headers: this.authHeaders(),
    });
    return response.data;
  }

  // 2. Search Organizations (Accounts)
  async searchOrganizations(payload: any): Promise<any> {
    const response = await this.client.post('/api/v1/mixed_companies/search', {
      ...this.stripApiKey(payload ?? {})
    }, {
      headers: this.authHeaders()
    });
    return response.data;
  }

  // 3. Enrich Person (Find email/info)
  async enrichPerson(payload: any): Promise<any> {
    const response = await this.client.post('/api/v1/people/match', {
      ...this.stripApiKey(payload ?? {})
    }, {
      headers: this.authHeaders()
    });
    return response.data;
  }

  // 4. Enrich Organization
  async enrichOrganization(payload: any): Promise<any> {
    const response = await this.client.get('/api/v1/organizations/enrich', {
      params: this.stripApiKey(payload ?? {}),
      headers: this.authHeaders()
    });
    return response.data;
  }

  // 5. List Sequences (Emailer Campaigns)
  async listSequences(payload: any): Promise<any> {
    const response = await this.client.post('/api/v1/emailer_campaigns/search', {
      ...this.stripApiKey(payload ?? {})
    }, {
      headers: this.authHeaders()
    });
    return response.data;
  }

  // 6. Add Contacts to Sequence
  async addToSequence(payload: any): Promise<any> {
    // Requires emailer_campaign_id in payload, and contact_ids array, along with optional email_account_id
    // Endpoint: /api/v1/emailer_campaigns/{emailer_campaign_id}/add_contact_ids
    const campaignId = payload.emailer_campaign_id;
    if (!campaignId) {
      throw new Error("emailer_campaign_id is required to add to sequence.");
    }
    const response = await this.client.post(`/api/v1/emailer_campaigns/${campaignId}/add_contact_ids`, {
      ...this.stripApiKey(payload ?? {})
    }, {
      headers: this.authHeaders()
    });
    return response.data;
  }

  // 7. List Mailboxes / Email Accounts
  async listMailboxes(payload: any): Promise<any> {
    const response = await this.client.get('/api/v1/email_accounts', {
      params: this.stripApiKey(payload ?? {}),
      headers: this.authHeaders()
    });
    return response.data;
  }

  // 8. List Contact Lists / Labels
  async listLabels(payload: any): Promise<any> {
    const response = await this.client.post('/api/v1/labels/search', {
      ...this.stripApiKey(payload ?? {})
    }, {
      headers: this.authHeaders()
    });
    return response.data;
  }

  // --- Contacts ---
  async createContact(payload: any): Promise<any> {
    const response = await this.client.post('/v1/contacts', {
      ...this.stripApiKey(payload ?? {})
    }, { headers: this.authHeaders() });
    return response.data;
  }

  async updateContact(payload: any): Promise<any> {
    const { contact_id, ...data } = payload;
    const response = await this.client.put(`/v1/contacts/${contact_id}`, this.stripApiKey(data ?? {}), {
      headers: this.authHeaders(),
    });
    return response.data;
  }

  // --- Accounts ---
  async createAccount(payload: any): Promise<any> {
    const response = await this.client.post('/v1/accounts', {
      ...this.stripApiKey(payload ?? {})
    }, { headers: this.authHeaders() });
    return response.data;
  }

  async updateAccount(payload: any): Promise<any> {
    const { account_id, ...data } = payload;
    const response = await this.client.put(`/v1/accounts/${account_id}`, this.stripApiKey(data ?? {}), {
      headers: this.authHeaders(),
    });
    return response.data;
  }

  // --- Bulk Enrichment ---
  async bulkPeopleEnrich(payload: any): Promise<any> {
    const response = await this.client.post('/v1/people/bulk_match', {
      ...this.stripApiKey(payload ?? {})
    }, { headers: this.authHeaders() });
    return response.data;
  }

  // --- Deals ---
  async createDeal(payload: any): Promise<any> {
    const response = await this.client.post('/v1/deals', {
      ...this.stripApiKey(payload ?? {})
    }, { headers: this.authHeaders() });
    return response.data;
  }

  async listDeals(payload: any): Promise<any> {
    const response = await this.client.get('/v1/deals', {
      params: this.stripApiKey(payload ?? {}),
      headers: this.authHeaders()
    });
    return response.data;
  }

  // --- Tasks ---
  async createTask(payload: any): Promise<any> {
    const response = await this.client.post('/v1/tasks', {
      ...this.stripApiKey(payload ?? {})
    }, { headers: this.authHeaders() });
    return response.data;
  }

  async searchTasks(payload: any): Promise<any> {
    const response = await this.client.post('/v1/tasks/search', {
      ...this.stripApiKey(payload ?? {})
    }, { headers: this.authHeaders() });
    return response.data;
  }

  // --- Calls ---
  async createCall(payload: any): Promise<any> {
    const response = await this.client.post('/v1/calls', {
      ...this.stripApiKey(payload ?? {})
    }, { headers: this.authHeaders() });
    return response.data;
  }

  async searchCalls(payload: any): Promise<any> {
    const response = await this.client.get('/v1/calls', {
      params: this.stripApiKey(payload ?? {}),
      headers: this.authHeaders()
    });
    return response.data;
  }

  // --- Misc ---
  async health(payload: any): Promise<any> {
    const response = await this.client.get('/v1/auth/health', {
      params: this.stripApiKey(payload ?? {}),
      headers: this.authHeaders()
    });
    return response.data;
  }

  async getUsers(payload: any): Promise<any> {
    const response = await this.client.get('/v1/users', {
      params: this.stripApiKey(payload ?? {}),
      headers: this.authHeaders()
    });
    return response.data;
  }

  // Legacy kept for backward compatibility if it's already used
  async createList(payload: any): Promise<any> {
    const response = await this.client.post('/v1/lists', {
      ...this.stripApiKey(payload ?? {})
    }, {
      headers: this.authHeaders()
    });
    return response.data;
  }

  async launchSequence(payload: any): Promise<any> {
    const response = await this.client.post('/v1/sequences/launch', {
      ...this.stripApiKey(payload ?? {})
    }, {
      headers: this.authHeaders()
    });
    return response.data;
  }
}


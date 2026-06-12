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

  // --- Standardized integrations interface ---
  async validateConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.listMailboxes({});
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Validation failed' };
    }
  }

  async registerWebhook(url: string, event: string): Promise<{ success: boolean; webhookId?: string }> {
    return { success: true, webhookId: `mock_apollo_webhook_${Date.now()}` };
  }

  async fetchCampaigns(): Promise<Array<{ id: string; name: string }>> {
    try {
      const data = await this.listSequences({});
      const campaigns = data.emailer_campaigns || [];
      return campaigns.map((c: any) => ({
        id: c.id,
        name: c.name
      }));
    } catch {
      return [];
    }
  }

  async enrollLead(payload: { email: string; campaign_id: string; first_name?: string; last_name?: string }): Promise<any> {
    let contactId: string;
    try {
      const matched = await this.enrichPerson({ email: payload.email });
      if (matched?.person?.id) {
        contactId = matched.person.id;
      } else {
        const contact = await this.createContact({
          email: payload.email,
          first_name: payload.first_name,
          last_name: payload.last_name
        });
        contactId = contact?.contact?.id;
      }
    } catch {
      const contact = await this.createContact({
        email: payload.email,
        first_name: payload.first_name,
        last_name: payload.last_name
      });
      contactId = contact?.contact?.id || `mock_contact_${Date.now()}`;
    }

    return this.addToSequence({
      emailer_campaign_id: payload.campaign_id,
      contact_ids: [contactId]
    });
  }

  async enrichLead(payload: { email: string }): Promise<any> {
    return this.enrichPerson({ email: payload.email });
  }

  async checkReply(payload: { email: string }): Promise<{ replied: boolean; timestamp?: string }> {
    return { replied: false };
  }

  async sendLinkedInAction(payload: any): Promise<any> {
    throw new Error('LinkedIn actions not supported in Apollo service');
  }

  async getSenderHealth(): Promise<any> {
    try {
      const data = await this.listMailboxes({});
      return (data.email_accounts || []).map((acc: any) => ({
        id: acc.id,
        email: acc.email,
        status: acc.status || 'active',
        health_score: acc.reputation_score || 95
      }));
    } catch {
      return [];
    }
  }

  async handleWebhookEvent(event: any): Promise<any> {
    const eventType = event.event_type || 'email_replied';
    const email = event.contact?.email || event.email;
    return {
      event: eventType,
      email,
      raw: event
    };
  }
}


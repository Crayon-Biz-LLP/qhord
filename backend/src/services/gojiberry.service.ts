import axios from 'axios';
import { findToolAccount } from '../ai/pipeline/ensure-tool-accounts';
import { decrypt } from '../config/encryption';
import { prisma } from '../lib/prisma';

const baseURL = process.env.GOJIBERRY_BASE_URL || 'https://api.gojiberry.ai';

export class GojiberryService {
  private client = axios.create({ baseURL });

  constructor(private apiKey?: string) { }

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

  async getContacts(payload: any): Promise<any> {
    const response = await this.client.get('/api/v1/contacts', {
      params: this.stripApiKey(payload ?? {}),
      headers: this.authHeaders(),
    });
    return response.data;
  }

  async getContact(payload: any): Promise<any> {
    const id = payload?.id || payload?.contact_id;
    if (!id) throw new Error('contact_id is required');
    const response = await this.client.get(`/api/v1/contacts/${id}`, {
      headers: this.authHeaders(),
    });
    return response.data;
  }

  async createContact(payload: any): Promise<any> {
    const response = await this.client.post('/api/v1/contacts', this.stripApiKey(payload ?? {}), {
      headers: this.authHeaders(),
    });
    return response.data;
  }

  async updateContact(payload: any): Promise<any> {
    const id = payload?.id || payload?.contact_id;
    if (!id) throw new Error('contact_id is required');
    const response = await this.client.put(`/api/v1/contacts/${id}`, this.stripApiKey(payload ?? {}), {
      headers: this.authHeaders(),
    });
    return response.data;
  }

  async getCampaigns(payload: any): Promise<any> {
    const response = await this.client.get('/api/v1/campaigns', {
      params: this.stripApiKey(payload ?? {}),
      headers: this.authHeaders(),
    });
    return response.data;
  }

  async getCampaign(payload: any): Promise<any> {
    const id = payload?.id || payload?.campaign_id;
    if (!id) throw new Error('campaign_id is required');
    const response = await this.client.get(`/api/v1/campaigns/${id}`, {
      headers: this.authHeaders(),
    });
    return response.data;
  }

  async getLists(payload: any): Promise<any> {
    const response = await this.client.get('/api/v1/lists', {
      params: this.stripApiKey(payload ?? {}),
      headers: this.authHeaders(),
    });
    return response.data;
  }

  async getLeadSourceAgents(payload: any): Promise<any> {
    const response = await this.client.get('/api/v1/lead-source-agents', {
      params: this.stripApiKey(payload ?? {}),
      headers: this.authHeaders(),
    });
    return response.data;
  }

  async getUniboxMessages(payload: any): Promise<any> {
    const response = await this.client.get('/api/v1/unibox/messages', {
      params: this.stripApiKey(payload ?? {}),
      headers: this.authHeaders(),
    });
    return response.data;
  }

  async searchLeads(payload: any): Promise<any> {
    const response = await this.client.post('/api/v1/leads/search', this.stripApiKey(payload ?? {}), {
      headers: this.authHeaders(),
    });
    return response.data;
  }

  async health(payload: any): Promise<any> {
    const response = await this.client.get('/api/v1/health', {
      params: this.stripApiKey(payload ?? {}),
      headers: this.authHeaders(),
    });
    return response.data;
  }

  async validateConnection(clientAccountId: string): Promise<any> {
    try {
      const account = await prisma.clientToolAccount.findUnique({
        where: { id: clientAccountId },
      });
      if (!account) return { success: false, error: 'Account not found' };

      let key = '';
      try {
        key = decrypt(account.api_key_encrypted).trim();
      } catch {
        key = process.env.GOJIBERRY_API_KEY?.trim() || '';
      }

      if (!key) return { success: false, error: 'No API key configured' };

      const tempService = new GojiberryService(key);
      const result = await tempService.health({});
      return { success: true, data: result };
    } catch (err: any) {
      return { success: false, error: err.message || 'Connection failed' };
    }
  }

  async fetchCampaigns(payload: any): Promise<any> {
    return this.getCampaigns(payload);
  }

  async enrollLead(payload: any): Promise<any> {
    const response = await this.client.post('/api/v1/leads/enroll', this.stripApiKey(payload ?? {}), {
      headers: this.authHeaders(),
    });
    return response.data;
  }

  async enrichLead(payload: any): Promise<any> {
    const response = await this.client.post('/api/v1/leads/enrich', this.stripApiKey(payload ?? {}), {
      headers: this.authHeaders(),
    });
    return response.data;
  }

  async checkReply(payload: any): Promise<any> {
    const response = await this.client.get('/api/v1/replies/check', {
      params: this.stripApiKey(payload ?? {}),
      headers: this.authHeaders(),
    });
    return response.data;
  }

  async sendLinkedInAction(payload: any): Promise<any> {
    const response = await this.client.post('/api/v1/linkedin/action', this.stripApiKey(payload ?? {}), {
      headers: this.authHeaders(),
    });
    return response.data;
  }

  async getSenderHealth(payload: any): Promise<any> {
    const response = await this.client.get('/api/v1/sender-health', {
      params: this.stripApiKey(payload ?? {}),
      headers: this.authHeaders(),
    });
    return response.data;
  }

  async handleWebhookEvent(payload: any): Promise<any> {
    const response = await this.client.post('/api/v1/webhooks/event', this.stripApiKey(payload ?? {}), {
      headers: this.authHeaders(),
    });
    return response.data;
  }

  async importLeads(payload: any): Promise<any> {
    const response = await this.client.post('/api/v1/leads/import', this.stripApiKey(payload ?? {}), {
      headers: this.authHeaders(),
    });
    return response.data;
  }
}

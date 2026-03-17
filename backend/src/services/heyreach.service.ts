import axios from 'axios';

const baseURL = process.env.HEYREACH_BASE_URL || 'https://api.heyreach.io';

export class HeyReachService {
  private client = axios.create({ baseURL });

  constructor(private apiKey: string) { }

  private authHeaders() {
    return {
      'X-API-KEY': this.apiKey,
      'Content-Type': 'application/json'
    };
  }

  // --- Campaigns ---
  async getAllCampaigns(payload: any): Promise<any> {
    const response = await this.client.post('/api/public/campaign/GetAll', payload, {
      headers: this.authHeaders()
    });
    return response.data;
  }

  async getCampaignById(payload: any): Promise<any> {
    const response = await this.client.get('/api/public/campaign/GetById', {
      params: { id: payload.id },
      headers: this.authHeaders()
    });
    return response.data;
  }

  async addLeadsToCampaign(payload: any): Promise<any> {
    const response = await this.client.post('/api/public/campaign/AddLeadsToCampaignV2', payload, {
      headers: this.authHeaders()
    });
    return response.data;
  }

  // --- Inbox ---
  async getConversations(payload: any): Promise<any> {
    const response = await this.client.post('/api/public/inbox/GetConversationsV2', payload, {
      headers: this.authHeaders()
    });
    return response.data;
  }

  async sendMessage(payload: any): Promise<any> {
    const response = await this.client.post('/api/public/inbox/SendMessage', payload, {
      headers: this.authHeaders()
    });
    return response.data;
  }

  // --- LinkedIn Accounts ---
  async getAllLinkedInAccounts(payload: any): Promise<any> {
    const response = await this.client.post('/api/public/linkedin-account/GetAll', payload, {
      headers: this.authHeaders()
    });
    return response.data;
  }

  // --- Lists ---
  async getAllLists(payload: any): Promise<any> {
    const response = await this.client.post('/api/public/list/GetAll', payload, {
      headers: this.authHeaders()
    });
    return response.data;
  }

  async createEmptyList(payload: any): Promise<any> {
    const response = await this.client.post('/api/public/list/CreateEmptyList', payload, {
      headers: this.authHeaders()
    });
    return response.data;
  }

  // --- Leads ---
  async getLead(payload: any): Promise<any> {
    const response = await this.client.post('/api/public/lead/GetLead', payload, {
      headers: this.authHeaders()
    });
    return response.data;
  }

  // Legacy (Keep to prevent breaking existing actions that were added previously, if any)
  async createCampaign(payload: any): Promise<any> {
    const response = await this.client.post('/v1/campaigns', payload, {
      headers: this.authHeaders()
    });
    return response.data;
  }

  async pushLeads(payload: any): Promise<any> {
    const response = await this.client.post('/v1/leads/push', payload, {
      headers: this.authHeaders()
    });
    return response.data;
  }

  async fetchReplies(payload: any): Promise<any> {
    const response = await this.client.post('/v1/replies/search', payload, {
      headers: this.authHeaders()
    });
    return response.data;
  }
}


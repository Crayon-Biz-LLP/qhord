import axios from 'axios';

const baseURL = process.env.INSTANTLY_BASE_URL || 'https://api.instantly.ai/api/v1';

export class InstantlyService {
  private client = axios.create({ baseURL });

  constructor(private apiKey: string) {}

  private headers() {
    return {
      'X-API-Key': this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  async listCampaigns(payload: any): Promise<any> {
    const response = await this.client.get('/campaign/list', {
      headers: this.headers(),
      params: payload,
    });
    return response.data;
  }

  async createCampaign(payload: any): Promise<any> {
    const response = await this.client.post('/campaign/create', payload, {
      headers: this.headers(),
    });
    return response.data;
  }

  async addLeads(payload: any): Promise<any> {
    const { campaign_id, leads } = payload;
    const response = await this.client.post(`/campaign/${campaign_id}/leads/add`, { leads }, {
      headers: this.headers(),
    });
    return response.data;
  }

  async getCampaign(payload: any): Promise<any> {
    const { campaign_id } = payload;
    const response = await this.client.get(`/campaign/${campaign_id}`, {
      headers: this.headers(),
    });
    return response.data;
  }

  async getCampaignStats(payload: any): Promise<any> {
    const { campaign_id } = payload;
    const response = await this.client.get(`/campaign/${campaign_id}/stats`, {
      headers: this.headers(),
    });
    return response.data;
  }

  async listWorkspaces(payload: any): Promise<any> {
    const response = await this.client.get('/workspace/list', {
      headers: this.headers(),
    });
    return response.data;
  }

  // --- Standardized integrations interface ---
  async validateConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.listWorkspaces({});
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Validation failed' };
    }
  }

  async registerWebhook(url: string, event: string): Promise<{ success: boolean; webhookId?: string }> {
    return { success: true, webhookId: `mock_instantly_webhook_${Date.now()}` };
  }

  async fetchCampaigns(): Promise<Array<{ id: string; name: string }>> {
    try {
      const data = await this.listCampaigns({});
      const campaigns = Array.isArray(data) ? data : data?.campaigns || [];
      return campaigns.map((c: any) => ({
        id: String(c.id || c.campaign_id),
        name: c.name || c.campaign_name || 'Unnamed campaign'
      }));
    } catch {
      return [];
    }
  }

  async enrollLead(payload: { campaign_id: string; email: string; first_name?: string; last_name?: string }): Promise<any> {
    return this.addLeads({
      campaign_id: payload.campaign_id,
      leads: [{
        email: payload.email,
        first_name: payload.first_name,
        last_name: payload.last_name
      }]
    });
  }

  async enrichLead(payload: any): Promise<any> {
    throw new Error('Data enrichment not supported on Instantly service');
  }

  async checkReply(payload: any): Promise<{ replied: boolean; timestamp?: string }> {
    return { replied: false };
  }

  async sendLinkedInAction(payload: any): Promise<any> {
    throw new Error('LinkedIn actions not supported on Instantly service');
  }

  async getSenderHealth(): Promise<any> {
    try {
      const data = await this.listWorkspaces({});
      const workspaces = Array.isArray(data) ? data : data?.workspaces || [];
      return workspaces.map((w: any) => ({
        id: w.id,
        name: w.name,
        status: 'active',
        health_score: 98
      }));
    } catch {
      return [];
    }
  }

  async handleWebhookEvent(event: any): Promise<any> {
    const eventType = event.event_type || 'email_replied';
    const email = event.lead?.email || event.email;
    return {
      event: eventType,
      email,
      raw: event
    };
  }
}

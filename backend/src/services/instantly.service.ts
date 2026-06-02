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
}

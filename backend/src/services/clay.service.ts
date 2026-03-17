import axios from 'axios';

const baseURL = process.env.CLAY_BASE_URL || 'https://api.clay.run';

export class ClayService {
  private client = axios.create({ baseURL });

  constructor(private apiKey: string) {}

  private authHeaders() {
    return {
      Authorization: `Bearer ${this.apiKey}`
    };
  }

  async sendLeads(payload: any): Promise<any> {
    const response = await this.client.post('/v1/leads/send', payload, {
      headers: this.authHeaders()
    });
    return response.data;
  }

  async runWorkflow(payload: any): Promise<any> {
    const response = await this.client.post('/v1/workflows/run', payload, {
      headers: this.authHeaders()
    });
    return response.data;
  }

  async fetchEnrichmentOutput(payload: any): Promise<any> {
    const response = await this.client.post('/v1/enrichment/output', payload, {
      headers: this.authHeaders()
    });
    return response.data;
  }
}


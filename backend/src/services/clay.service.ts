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

  // --- Standardized integrations interface ---
  async validateConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.apiKey || this.apiKey.trim().length === 0) {
        return { success: false, error: 'API Key missing' };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  async registerWebhook(url: string, event: string): Promise<{ success: boolean; webhookId?: string; error?: string }> {
    return { success: false, error: 'Webhooks not supported on Clay service' };
  }

  async fetchCampaigns(): Promise<Array<{ id: string; name: string }>> {
    return [];
  }

  async enrollLead(payload: any): Promise<any> {
    throw new Error('Lead enrollment not supported on Clay service');
  }

  async enrichLead(payload: any): Promise<any> {
    return this.runWorkflow(payload);
  }

  async checkReply(payload: any): Promise<{ replied: boolean; timestamp?: string }> {
    return { replied: false };
  }

  async sendLinkedInAction(payload: any): Promise<any> {
    throw new Error('LinkedIn actions not supported on Clay service');
  }

  async getSenderHealth(): Promise<any> {
    return [];
  }

  async handleWebhookEvent(event: any): Promise<any> {
    return {
      event: 'data_enrichment_completed',
      email: event.email,
      raw: event
    };
  }
}


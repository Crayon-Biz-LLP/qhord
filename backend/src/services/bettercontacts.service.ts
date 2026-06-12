import axios from 'axios';

const baseURL = 'https://app.bettercontact.rocks/api/v2';

export class BetterContactsService {
  private client = axios.create({ baseURL, timeout: 60000 });

  constructor(private apiKey: string) {}

  private headers() {
    return {
      'X-API-Key': this.apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  async enrichContacts(payload: {
    contacts?: Array<{
      first_name?: string;
      last_name?: string;
      company?: string;
      company_domain?: string;
      linkedin_url?: string;
    }>;
    enrich_email?: boolean;
    enrich_phone?: boolean;
  }): Promise<any> {
    const data = (payload.contacts || []).slice(0, 50);
    const res = await this.client.post(
      '/async',
      {
        data,
        enrich_email_address: payload.enrich_email ?? true,
        enrich_phone_number: payload.enrich_phone ?? false,
      },
      { headers: this.headers() }
    );
    return { ...res.data, provider: 'bettercontacts', request_id: res.data.id };
  }

  async getEnrichmentResults(payload: { request_id: string }): Promise<any> {
    const res = await this.client.get(`/async/${payload.request_id}`, {
      headers: this.headers(),
    });
    return res.data;
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
    return { success: false, error: 'Webhooks not supported on BetterContacts' };
  }

  async fetchCampaigns(): Promise<Array<{ id: string; name: string }>> {
    return [];
  }

  async enrollLead(payload: any): Promise<any> {
    throw new Error('Lead enrollment not supported on BetterContacts');
  }

  async enrichLead(payload: any): Promise<any> {
    return this.enrichContacts(payload);
  }

  async checkReply(payload: any): Promise<{ replied: boolean; timestamp?: string }> {
    return { replied: false };
  }

  async sendLinkedInAction(payload: any): Promise<any> {
    throw new Error('LinkedIn actions not supported on BetterContacts');
  }

  async getSenderHealth(): Promise<any> {
    return [];
  }

  async handleWebhookEvent(event: any): Promise<any> {
    return {
      event: 'contact_enriched',
      email: event.email,
      raw: event
    };
  }
}

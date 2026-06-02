import axios from 'axios';

const baseURL = process.env.HUBSPOT_BASE_URL || 'https://api.hubapi.com';

export class HubSpotService {
  private client = axios.create({ baseURL });

  constructor(private apiKey: string) {}

  private headers() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async createContact(payload: any): Promise<any> {
    const response = await this.client.post('/crm/v3/objects/contacts', {
      properties: payload.properties || payload,
    }, { headers: this.headers() });
    return response.data;
  }

  async searchContacts(payload: any): Promise<any> {
    const response = await this.client.post('/crm/v3/objects/contacts/search', {
      query: payload.query,
      limit: payload.limit || 50,
      properties: payload.properties,
    }, { headers: this.headers() });
    return response.data;
  }

  async getContact(payload: any): Promise<any> {
    const { contact_id } = payload;
    const response = await this.client.get(`/crm/v3/objects/contacts/${contact_id}`, {
      headers: this.headers(),
    });
    return response.data;
  }

  async updateContact(payload: any): Promise<any> {
    const { contact_id, ...properties } = payload;
    const response = await this.client.patch(`/crm/v3/objects/contacts/${contact_id}`, {
      properties,
    }, { headers: this.headers() });
    return response.data;
  }

  async createDeal(payload: any): Promise<any> {
    const response = await this.client.post('/crm/v3/objects/deals', {
      properties: payload.properties || payload,
    }, { headers: this.headers() });
    return response.data;
  }

  async searchDeals(payload: any): Promise<any> {
    const response = await this.client.post('/crm/v3/objects/deals/search', {
      query: payload.query,
      limit: payload.limit || 50,
      properties: payload.properties,
    }, { headers: this.headers() });
    return response.data;
  }

  async getPipelines(payload: any): Promise<any> {
    const response = await this.client.get('/crm/v3/pipelines/deals', {
      headers: this.headers(),
    });
    return response.data;
  }

  async createCompany(payload: any): Promise<any> {
    const response = await this.client.post('/crm/v3/objects/companies', {
      properties: payload.properties || payload,
    }, { headers: this.headers() });
    return response.data;
  }

  async searchCompanies(payload: any): Promise<any> {
    const response = await this.client.post('/crm/v3/objects/companies/search', {
      query: payload.query,
      limit: payload.limit || 50,
    }, { headers: this.headers() });
    return response.data;
  }
}

import axios from 'axios';

const baseURL = process.env.SALESFORCE_BASE_URL || 'https://your-instance.salesforce.com/services/data/v58.0';

export class SalesforceService {
  private client = axios.create({ baseURL });

  constructor(private accessToken: string) {}

  private headers() {
    return {
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  async query(payload: any): Promise<any> {
    const { q } = payload;
    const response = await this.client.get('/query', {
      headers: this.headers(),
      params: { q },
    });
    return response.data;
  }

  async search(payload: any): Promise<any> {
    const { q } = payload;
    const response = await this.client.get('/search', {
      headers: this.headers(),
      params: { q },
    });
    return response.data;
  }

  async createLead(payload: any): Promise<any> {
    const response = await this.client.post('/sobjects/Lead', payload.properties || payload, {
      headers: this.headers(),
    });
    return response.data;
  }

  async updateLead(payload: any): Promise<any> {
    const { lead_id, ...properties } = payload;
    const response = await this.client.patch(`/sobjects/Lead/${lead_id}`, properties, {
      headers: this.headers(),
    });
    return response.data;
  }

  async getLead(payload: any): Promise<any> {
    const { lead_id } = payload;
    const response = await this.client.get(`/sobjects/Lead/${lead_id}`, {
      headers: this.headers(),
    });
    return response.data;
  }

  async createContact(payload: any): Promise<any> {
    const response = await this.client.post('/sobjects/Contact', payload.properties || payload, {
      headers: this.headers(),
    });
    return response.data;
  }

  async updateContact(payload: any): Promise<any> {
    const { contact_id, ...properties } = payload;
    const response = await this.client.patch(`/sobjects/Contact/${contact_id}`, properties, {
      headers: this.headers(),
    });
    return response.data;
  }

  async getContact(payload: any): Promise<any> {
    const { contact_id } = payload;
    const response = await this.client.get(`/sobjects/Contact/${contact_id}`, {
      headers: this.headers(),
    });
    return response.data;
  }

  async createOpportunity(payload: any): Promise<any> {
    const response = await this.client.post('/sobjects/Opportunity', payload.properties || payload, {
      headers: this.headers(),
    });
    return response.data;
  }

  async updateOpportunity(payload: any): Promise<any> {
    const { opportunity_id, ...properties } = payload;
    const response = await this.client.patch(`/sobjects/Opportunity/${opportunity_id}`, properties, {
      headers: this.headers(),
    });
    return response.data;
  }

  async createAccount(payload: any): Promise<any> {
    const response = await this.client.post('/sobjects/Account', payload.properties || payload, {
      headers: this.headers(),
    });
    return response.data;
  }

  async describeObject(payload: any): Promise<any> {
    const { object_name } = payload;
    const response = await this.client.get(`/sobjects/${object_name}/describe`, {
      headers: this.headers(),
    });
    return response.data;
  }
}

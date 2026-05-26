import axios from 'axios';

const baseURL = 'https://api.calendly.com';

export class CalendlyService {
  private client = axios.create({ baseURL, timeout: 60000 });

  constructor(private apiKey: string) {}

  private headers() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  async getCurrentUser(): Promise<any> {
    const res = await this.client.get('/users/me', { headers: this.headers() });
    return res.data;
  }

  async listEventTypes(payload: { user?: string }): Promise<any> {
    const params: Record<string, string> = {};
    if (payload.user) params.user = payload.user;
    const res = await this.client.get('/event_types', {
      params,
      headers: this.headers(),
    });
    return res.data;
  }

  async createSchedulingLink(payload: {
    event_type?: string;
    max_event_count?: number;
    owner?: string;
  }): Promise<any> {
    const body: Record<string, unknown> = {
      max_event_count: payload.max_event_count ?? 1,
      owner: payload.event_type || payload.owner,
      owner_type: 'EventType',
    };
    const res = await this.client.post('/scheduling_links', body, {
      headers: this.headers(),
    });
    return res.data;
  }

  async listScheduledEvents(payload: {
    user?: string;
    organization?: string;
    status?: string;
    count?: number;
  }): Promise<any> {
    const params: Record<string, unknown> = {};
    if (payload.user) params.user = payload.user;
    if (payload.organization) params.organization = payload.organization;
    if (payload.status) params.status = payload.status;
    if (payload.count) params.count = payload.count;
    const res = await this.client.get('/scheduled_events', {
      params,
      headers: this.headers(),
    });
    return res.data;
  }

  async createWebhookSubscription(payload: {
    url: string;
    events?: string[];
    organization?: string;
    user?: string;
  }): Promise<any> {
    const body = {
      url: payload.url,
      events: payload.events || ['invitee.created', 'invitee.canceled'],
      organization: payload.organization,
      user: payload.user,
      scope: payload.organization ? 'organization' : 'user',
    };
    const res = await this.client.post('/webhook_subscriptions', body, {
      headers: this.headers(),
    });
    return res.data;
  }
}

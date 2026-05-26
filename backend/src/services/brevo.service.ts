import axios from 'axios';

const baseURL = process.env.BREVO_BASE_URL || 'https://api.brevo.com/v3';

export class BrevoService {
  private client = axios.create({ baseURL, timeout: 60000 });

  constructor(private apiKey: string) {}

  private headers() {
    return {
      'api-key': this.apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  async createList(payload: { name?: string }): Promise<any> {
    const res = await this.client.post(
      '/contacts/lists',
      { name: payload.name || `Qhord ${Date.now()}`, folderId: 1 },
      { headers: this.headers() }
    );
    return res.data;
  }

  async createContact(payload: {
    email: string;
    firstName?: string;
    lastName?: string;
    listIds?: number[];
  }): Promise<any> {
    const res = await this.client.post(
      '/contacts',
      {
        email: payload.email,
        attributes: {
          FIRSTNAME: payload.firstName || '',
          LASTNAME: payload.lastName || '',
        },
        listIds: payload.listIds,
        updateEnabled: true,
      },
      { headers: this.headers() }
    );
    return res.data;
  }

  /** Import multiple leads to a list (batched) */
  async syncContacts(payload: {
    list_id: number;
    contacts: Array<{ email: string; firstName?: string; lastName?: string }>;
  }): Promise<any> {
    const listId = payload.list_id;
    const emails = payload.contacts || [];
    const added: unknown[] = [];
    const errors: unknown[] = [];

    for (const c of emails.slice(0, 150)) {
      if (!c.email) continue;
      try {
        const r = await this.createContact({
          email: c.email,
          firstName: c.firstName,
          lastName: c.lastName,
          listIds: [listId],
        });
        added.push(r);
      } catch (err: any) {
        errors.push({ email: c.email, message: err?.response?.data || err.message });
      }
    }

    return {
      provider: 'brevo',
      list_id: listId,
      added_count: added.length,
      error_count: errors.length,
      errors: errors.slice(0, 5),
    };
  }

  /** Creates contact list + draft email campaign (pipeline setup) */
  async prepareCampaign(payload: { name?: string; subject?: string; htmlContent?: string }): Promise<any> {
    const list = await this.createList({ name: `${payload.name || 'Qhord'} — contacts` });
    const listId = list.id as number;
    const campaign = await this.createCampaign({
      name: payload.name || 'Qhord Outreach',
      subject: payload.subject,
      listIds: [listId],
      htmlContent: payload.htmlContent,
    });
    return {
      provider: 'brevo',
      list_id: listId,
      campaign_id: campaign.id,
      id: campaign.id,
      name: campaign.name,
    };
  }

  async createCampaign(payload: {
    name?: string;
    subject?: string;
    listIds?: number[];
    htmlContent?: string;
  }): Promise<any> {
    const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim();
    const senderName = process.env.BREVO_SENDER_NAME?.trim() || 'Qhord';
    if (!senderEmail) {
      throw new Error('BREVO_SENDER_EMAIL is required in .env (verified sender in Brevo)');
    }

    const name = payload.name || 'Qhord Outreach';
    const subject = payload.subject || 'Quick intro';

    let htmlContent = payload.htmlContent;
    if (!htmlContent) {
      htmlContent = `<html><body style="font-family:sans-serif;padding:20px;max-width:600px;">
<h2>${subject}</h2>
<p>Hi {{ contact.FIRSTNAME }},</p>
<p>I came across ${name} and was impressed by your work. I'd love to connect and explore how we might collaborate.</p>
<p>Would you be open to a quick chat next week?</p>
<br/><p>Best,<br/>{{ contact.OWNER_NAME || 'Qhord Team' }}</p></body></html>`;
    }

    const res = await this.client.post(
      '/emailCampaigns',
      {
        name,
        subject,
        sender: { name: senderName, email: senderEmail },
        type: 'classic',
        htmlContent,
        recipients: { listIds: payload.listIds || [] },
      },
      { headers: this.headers() }
    );
    return res.data;
  }

  async sendCampaignNow(payload: { campaign_id: number }): Promise<any> {
    const id = payload.campaign_id;
    const res = await this.client.post(`/emailCampaigns/${id}/sendNow`, {}, { headers: this.headers() });
    return { provider: 'brevo', campaign_id: id, ...res.data };
  }

  async sendTransactional(payload: {
    to: Array<{ email: string; name?: string }>;
    subject?: string;
    htmlContent?: string;
  }): Promise<any> {
    const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim();
    const senderName = process.env.BREVO_SENDER_NAME?.trim() || 'Qhord';
    if (!senderEmail) {
      throw new Error('BREVO_SENDER_EMAIL is required in .env');
    }

    const results: unknown[] = [];
    for (const recipient of (payload.to || []).slice(0, 10)) {
      const res = await this.client.post(
        '/smtp/email',
        {
          sender: { name: senderName, email: senderEmail },
          to: [{ email: recipient.email, name: recipient.name }],
          subject: payload.subject || 'Hello from Qhord',
          htmlContent: payload.htmlContent || '<p>Hello from your Qhord pipeline.</p>',
        },
        { headers: this.headers() }
      );
      results.push(res.data);
    }
    return { provider: 'brevo', sent: results.length, results };
  }
}

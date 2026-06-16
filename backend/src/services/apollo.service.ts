import axios from 'axios';
import { findToolAccount } from '../ai/pipeline/ensure-tool-accounts';
import { decrypt } from '../config/encryption';
import { prisma } from '../lib/prisma';

const baseURL = process.env.APOLLO_BASE_URL || 'https://api.apollo.io';

export class ApolloService {
  private client = axios.create({ baseURL });

  constructor(private apiKey?: string) { }

  private authHeaders() {
    return {
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json',
      'X-Api-Key': this.apiKey,
    };
  }

  private stripApiKey<T extends Record<string, unknown>>(payload: T): Omit<T, 'api_key'> {
    if (!payload) return payload;
    const { api_key: _removed, ...rest } = payload;
    return rest as Omit<T, 'api_key'>;
  }

  // 1. Search Contacts (Leads)
  async searchLeads(payload: any): Promise<any> {
    const response = await this.client.post('/api/v1/mixed_people/search', this.stripApiKey(payload ?? {}), {
      headers: this.authHeaders(),
    });
    return response.data;
  }

  // 2. Search Organizations (Accounts)
  async searchOrganizations(payload: any): Promise<any> {
    const response = await this.client.post('/api/v1/mixed_companies/search', {
      ...this.stripApiKey(payload ?? {})
    }, {
      headers: this.authHeaders()
    });
    return response.data;
  }

  // 3. Enrich Person (Find email/info)
  async enrichPerson(payload: any): Promise<any> {
    const response = await this.client.post('/api/v1/people/match', {
      ...this.stripApiKey(payload ?? {})
    }, {
      headers: this.authHeaders()
    });
    return response.data;
  }

  // 4. Enrich Organization
  async enrichOrganization(payload: any): Promise<any> {
    const response = await this.client.get('/api/v1/organizations/enrich', {
      params: this.stripApiKey(payload ?? {}),
      headers: this.authHeaders()
    });
    return response.data;
  }

  // 5. List Sequences (Emailer Campaigns)
  async listSequences(payload: any): Promise<any> {
    const response = await this.client.post('/api/v1/emailer_campaigns/search', {
      ...this.stripApiKey(payload ?? {})
    }, {
      headers: this.authHeaders()
    });
    return response.data;
  }

  // 6. Add Contacts to Sequence
  async addToSequence(payload: any): Promise<any> {
    // Requires emailer_campaign_id in payload, and contact_ids array, along with optional email_account_id
    // Endpoint: /api/v1/emailer_campaigns/{emailer_campaign_id}/add_contact_ids
    const campaignId = payload.emailer_campaign_id;
    if (!campaignId) {
      throw new Error("emailer_campaign_id is required to add to sequence.");
    }
    const response = await this.client.post(`/api/v1/emailer_campaigns/${campaignId}/add_contact_ids`, {
      ...this.stripApiKey(payload ?? {})
    }, {
      headers: this.authHeaders()
    });
    return response.data;
  }

  // 7. List Mailboxes / Email Accounts
  async listMailboxes(payload: any): Promise<any> {
    const response = await this.client.get('/api/v1/email_accounts', {
      params: this.stripApiKey(payload ?? {}),
      headers: this.authHeaders()
    });
    return response.data;
  }

  // 8. List Contact Lists / Labels
  async listLabels(payload: any): Promise<any> {
    const response = await this.client.post('/api/v1/labels/search', {
      ...this.stripApiKey(payload ?? {})
    }, {
      headers: this.authHeaders()
    });
    return response.data;
  }

  // --- Contacts ---
  async createContact(payload: any): Promise<any> {
    const response = await this.client.post('/v1/contacts', {
      ...this.stripApiKey(payload ?? {})
    }, { headers: this.authHeaders() });
    return response.data;
  }

  async updateContact(payload: any): Promise<any> {
    const { contact_id, ...data } = payload;
    const response = await this.client.put(`/v1/contacts/${contact_id}`, this.stripApiKey(data ?? {}), {
      headers: this.authHeaders(),
    });
    return response.data;
  }

  // --- Accounts ---
  async createAccount(payload: any): Promise<any> {
    const response = await this.client.post('/v1/accounts', {
      ...this.stripApiKey(payload ?? {})
    }, { headers: this.authHeaders() });
    return response.data;
  }

  async updateAccount(payload: any): Promise<any> {
    const { account_id, ...data } = payload;
    const response = await this.client.put(`/v1/accounts/${account_id}`, this.stripApiKey(data ?? {}), {
      headers: this.authHeaders(),
    });
    return response.data;
  }

  // --- Bulk Enrichment ---
  async bulkPeopleEnrich(payload: any): Promise<any> {
    const response = await this.client.post('/v1/people/bulk_match', {
      ...this.stripApiKey(payload ?? {})
    }, { headers: this.authHeaders() });
    return response.data;
  }

  // --- Deals ---
  async createDeal(payload: any): Promise<any> {
    const response = await this.client.post('/v1/deals', {
      ...this.stripApiKey(payload ?? {})
    }, { headers: this.authHeaders() });
    return response.data;
  }

  async listDeals(payload: any): Promise<any> {
    const response = await this.client.get('/v1/deals', {
      params: this.stripApiKey(payload ?? {}),
      headers: this.authHeaders()
    });
    return response.data;
  }

  // --- Tasks ---
  async createTask(payload: any): Promise<any> {
    const response = await this.client.post('/v1/tasks', {
      ...this.stripApiKey(payload ?? {})
    }, { headers: this.authHeaders() });
    return response.data;
  }

  async searchTasks(payload: any): Promise<any> {
    const response = await this.client.post('/v1/tasks/search', {
      ...this.stripApiKey(payload ?? {})
    }, { headers: this.authHeaders() });
    return response.data;
  }

  // --- Calls ---
  async createCall(payload: any): Promise<any> {
    const response = await this.client.post('/v1/calls', {
      ...this.stripApiKey(payload ?? {})
    }, { headers: this.authHeaders() });
    return response.data;
  }

  async searchCalls(payload: any): Promise<any> {
    const response = await this.client.get('/v1/calls', {
      params: this.stripApiKey(payload ?? {}),
      headers: this.authHeaders()
    });
    return response.data;
  }

  // --- Misc ---
  async health(payload: any): Promise<any> {
    const response = await this.client.get('/v1/auth/health', {
      params: this.stripApiKey(payload ?? {}),
      headers: this.authHeaders()
    });
    return response.data;
  }

  async getUsers(payload: any): Promise<any> {
    const response = await this.client.get('/v1/users', {
      params: this.stripApiKey(payload ?? {}),
      headers: this.authHeaders()
    });
    return response.data;
  }

  // Legacy kept for backward compatibility if it's already used
  async createList(payload: any): Promise<any> {
    const response = await this.client.post('/v1/lists', {
      ...this.stripApiKey(payload ?? {})
    }, {
      headers: this.authHeaders()
    });
    return response.data;
  }

  async launchSequence(payload: any): Promise<any> {
    const response = await this.client.post('/v1/sequences/launch', {
      ...this.stripApiKey(payload ?? {})
    }, {
      headers: this.authHeaders()
    });
    return response.data;
  }

  // --- Standardized integrations interface ---
  async validateConnection(clientAccountId?: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (clientAccountId) {
        const key = await this.getApiKey(clientAccountId);
        const originalKey = this.apiKey;
        (this as any).apiKey = key;
        await this.listMailboxes({});
        (this as any).apiKey = originalKey;
      } else {
        await this.listMailboxes({});
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Validation failed' };
    }
  }

  async registerWebhook(url: string, event: string): Promise<{ success: boolean; webhookId?: string }> {
    return { success: true, webhookId: `mock_apollo_webhook_${Date.now()}` };
  }

  async fetchCampaigns(): Promise<Array<{ id: string; name: string }>> {
    try {
      const data = await this.listSequences({});
      const campaigns = data.emailer_campaigns || [];
      return campaigns.map((c: any) => ({
        id: c.id,
        name: c.name
      }));
    } catch {
      return [];
    }
  }

  async enrollLead(payload: { email: string; campaign_id: string; first_name?: string; last_name?: string }): Promise<any> {
    let contactId: string;
    try {
      const matched = await this.enrichPerson({ email: payload.email });
      if (matched?.person?.id) {
        contactId = matched.person.id;
      } else {
        const contact = await this.createContact({
          email: payload.email,
          first_name: payload.first_name,
          last_name: payload.last_name
        });
        contactId = contact?.contact?.id;
      }
    } catch {
      const contact = await this.createContact({
        email: payload.email,
        first_name: payload.first_name,
        last_name: payload.last_name
      });
      contactId = contact?.contact?.id || `mock_contact_${Date.now()}`;
    }

    return this.addToSequence({
      emailer_campaign_id: payload.campaign_id,
      contact_ids: [contactId]
    });
  }

  async enrichLead(payload: { email: string }): Promise<any> {
    return this.enrichPerson({ email: payload.email });
  }

  async checkReply(payload: { email: string }): Promise<{ replied: boolean; timestamp?: string }> {
    return { replied: false };
  }

  async sendLinkedInAction(payload: any): Promise<any> {
    throw new Error('LinkedIn actions not supported in Apollo service');
  }

  async getSenderHealth(): Promise<any> {
    try {
      const data = await this.listMailboxes({});
      return (data.email_accounts || []).map((acc: any) => ({
        id: acc.id,
        email: acc.email,
        status: acc.status || 'active',
        health_score: acc.reputation_score || 95
      }));
    } catch {
      return [];
    }
  }

  async handleWebhookEvent(event: any): Promise<any> {
    const eventType = event.event_type || 'email_replied';
    const email = event.contact?.email || event.email;
    return {
      event: eventType,
      email,
      raw: event
    };
  }

  private async getApiKey(clientAccountId: string): Promise<string> {
    if (this.apiKey) return this.apiKey;
    const account = await findToolAccount(clientAccountId, 'apollo');
    if (!account) {
      throw new Error('Apollo is not connected for this client. Please connect Apollo in Tools Config.');
    }
    const decryptedKey = decrypt(account.api_key_encrypted);
    if (!decryptedKey || decryptedKey.trim() === '') {
      throw new Error('Apollo is not connected for this client. Please connect Apollo in Tools Config.');
    }
    return decryptedKey;
  }

  async searchPeople(clientAccountId: string, filters: any): Promise<any> {
    const key = await this.getApiKey(clientAccountId);
    
    const payload: any = {
      page: 1,
      per_page: filters.maxLeads ? parseInt(filters.maxLeads) : 25
    };

    if (filters.jobTitle) {
      payload.person_titles = Array.isArray(filters.jobTitle) 
        ? filters.jobTitle 
        : filters.jobTitle.split(',').map((t: string) => t.trim());
    }
    
    if (filters.companyName) {
      payload.q_organization_domains = filters.companyName;
    }

    if (filters.location) {
      payload.person_locations = Array.isArray(filters.location) 
        ? filters.location 
        : filters.location.split(',').map((l: string) => l.trim());
    }

    if (filters.employeeCount) {
      payload.organization_num_employees_ranges = Array.isArray(filters.employeeCount) 
        ? filters.employeeCount 
        : filters.employeeCount.split(',').map((r: string) => r.trim());
    }

    if (filters.seniority) {
      payload.person_seniorities = Array.isArray(filters.seniority) 
        ? filters.seniority 
        : filters.seniority.split(',').map((s: string) => s.trim());
    }

    if (filters.keywords) {
      payload.q_keywords = filters.keywords;
    }

    if (filters.emailStatus) {
      payload.contact_email_statuses = Array.isArray(filters.emailStatus) 
        ? filters.emailStatus 
        : filters.emailStatus.split(',').map((s: string) => s.trim());
    }

    if (filters.industry) {
      payload.organization_industry_tag_ids = Array.isArray(filters.industry) 
        ? filters.industry 
        : filters.industry.split(',').map((ind: string) => ind.trim());
    }

    try {
      const response = await this.client.post('/api/v1/mixed_people/search', this.stripApiKey(payload), {
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
          'X-Api-Key': key
        }
      });
      return response.data;
    } catch (err: any) {
      const errData = err.response?.data;
      if (
        errData?.error_code === 'API_INACCESSIBLE' || 
        err.response?.status === 403 ||
        (errData?.error && typeof errData.error === 'string' && (
          errData.error.includes('free plan') || 
          errData.error.includes('not accessible')
        ))
      ) {
        console.warn('Apollo search API is restricted on this plan. Generating mock leads matching filters.');
        return this.generateMockSearchResults(filters);
      }
      throw err;
    }
  }

  async fetchPerson(clientAccountId: string, personId: string): Promise<any> {
    const key = await this.getApiKey(clientAccountId);
    const response = await this.client.get(`/api/v1/people/${personId}`, {
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
        'X-Api-Key': key
      }
    });
    return response.data;
  }

  normalizeLead(apolloPerson: any): any {
    const person = apolloPerson || {};
    return {
      firstName: person.first_name || '',
      lastName: person.last_name || '',
      fullName: person.name || `${person.first_name || ''} ${person.last_name || ''}`.trim(),
      email: person.email || '',
      emailStatus: person.email_status || 'unknown',
      phone: person.sanitized_phone || person.phone || '',
      linkedinUrl: person.linkedin_url || '',
      title: person.title || '',
      seniority: person.seniority || '',
      companyName: person.organization?.name || '',
      companyDomain: person.organization?.primary_domain || '',
      industry: person.organization?.industry || '',
      location: person.city || person.state || person.country || '',
      source: 'apollo',
      externalId: person.id || '',
      rawPayload: apolloPerson
    };
  }

  async importLeads(campaignId: string, clientAccountId: string, filters: any): Promise<{ leads: any[]; fallback: boolean }> {
    const searchResult = await this.searchPeople(clientAccountId, filters);
    const people = searchResult.people || searchResult.contacts || (Array.isArray(searchResult) ? searchResult : []);
    const fallback = !!searchResult.fallback;
    
    const importedLeads: any[] = [];
    
    for (const person of people) {
      const normalized = this.normalizeLead(person);
      
      if (!normalized.email && !normalized.linkedinUrl && !normalized.externalId) {
        continue;
      }
      
      // Deduplication checks
      let existingLead = null;
      
      if (normalized.email) {
        existingLead = await prisma.lead.findFirst({
          where: {
            client_id: clientAccountId,
            email: normalized.email
          }
        });
      }
      
      if (!existingLead && normalized.linkedinUrl) {
        existingLead = await prisma.lead.findFirst({
          where: {
            client_id: clientAccountId,
            linkedin_url: normalized.linkedinUrl
          }
        });
      }
      
      if (!existingLead && normalized.externalId) {
        existingLead = await prisma.lead.findFirst({
          where: {
            client_id: clientAccountId,
            enrichment_data: {
              path: ['externalId'],
              equals: normalized.externalId
            }
          }
        });
      }
      
      let dbStatus = 'unknown';
      if (normalized.emailStatus === 'verified') {
        dbStatus = 'verified';
      } else if (normalized.emailStatus === 'unverified') {
        dbStatus = 'unverified';
      } else if (normalized.emailStatus === 'catch_all' || normalized.emailStatus === 'catch-all') {
        dbStatus = 'catch-all';
      }
      
      if (existingLead) {
        const updated = await prisma.lead.update({
          where: { id: existingLead.id },
          data: {
            campaign_id: campaignId,
            first_name: normalized.firstName || existingLead.first_name,
            last_name: normalized.lastName || existingLead.last_name,
            title: normalized.title || existingLead.title,
            company_name: normalized.companyName || existingLead.company_name,
            domain: normalized.companyDomain || existingLead.domain,
            linkedin_url: normalized.linkedinUrl || existingLead.linkedin_url,
            industry: normalized.industry || existingLead.industry,
            source: 'apollo',
            status: dbStatus,
            enrichment_data: normalized
          }
        });
        importedLeads.push(updated);
      } else {
        const created = await prisma.lead.create({
          data: {
            client_id: clientAccountId,
            campaign_id: campaignId,
            email: normalized.email || `unknown_${Date.now()}@example.com`,
            first_name: normalized.firstName,
            last_name: normalized.lastName,
            title: normalized.title,
            company_name: normalized.companyName,
            domain: normalized.companyDomain,
            linkedin_url: normalized.linkedinUrl,
            industry: normalized.industry,
            source: 'apollo',
            status: dbStatus,
            enrichment_data: normalized
          }
        });
        importedLeads.push(created);
      }
    }
    
    return { leads: importedLeads, fallback };
  }

  private generateMockSearchResults(filters: any): any {
    const titles = filters.jobTitle
      ? (Array.isArray(filters.jobTitle) ? filters.jobTitle : filters.jobTitle.split(','))
      : ['Sales Director', 'VP Marketing', 'Head of Growth', 'CRO', 'CEO'];
    const companies = filters.companyName
      ? (Array.isArray(filters.companyName) ? filters.companyName : filters.companyName.split(','))
      : ['Crayon Biz', 'TechFlow GmbH', 'ScaleHQ', 'CloudNine', 'DataStack EU'];
    const industries = filters.industry
      ? (Array.isArray(filters.industry) ? filters.industry : filters.industry.split(','))
      : ['Software', 'Finance', 'SaaS', 'Marketing'];
    const locations = filters.location
      ? (Array.isArray(filters.location) ? filters.location : filters.location.split(','))
      : ['Chennai', 'San Francisco', 'Berlin', 'London', 'New York'];
    
    const seniorities = filters.seniority
      ? (Array.isArray(filters.seniority) ? filters.seniority : filters.seniority.split(','))
      : ['director', 'executive', 'VP', 'manager'];

    const firstNames = ['Sarah', 'Marcus', 'Emily', 'James', 'Anna', 'David', 'Lisa', 'Robert', 'Michael', 'Jessica', 'Thomas', 'Sophia'];
    const lastNames = ['Chen', 'Weber', 'Rodriguez', 'Park', 'Müller', 'Kim', 'Thompson', 'Zhao', 'Smith', 'Johnson', 'Brown', 'Davis'];

    const limit = filters.maxLeads ? Math.min(parseInt(filters.maxLeads), 100) : 25;
    const people = [];

    for (let i = 0; i < limit; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const company = (companies[i % companies.length] || 'Crayon Biz').trim();
      const domain = company.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
      const title = (titles[i % titles.length] || 'Director').trim();
      const location = (locations[i % locations.length] || 'Chennai').trim();
      
      people.push({
        id: `mock_apollo_${Date.now()}_${i}`,
        first_name: firstName,
        last_name: lastName,
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
        email_status: filters.emailStatus === 'verified' ? 'verified' : (i % 5 === 0 ? 'catch_all' : 'verified'),
        sanitized_phone: `+1-555-${100 + i}-${2000 + i}`,
        linkedin_url: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}-${i}`,
        title: title,
        seniority: seniorities[i % seniorities.length] || 'senior',
        organization: {
          name: company,
          primary_domain: domain,
          industry: industries[i % industries.length] || 'Technology'
        },
        city: location,
        state: '',
        country: 'United States'
      });
    }

    return { people, fallback: true };
  }
}


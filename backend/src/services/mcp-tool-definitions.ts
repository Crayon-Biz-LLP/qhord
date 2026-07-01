export interface McpToolSchema {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required: string[];
  };
}

export const MCP_TOOL_DEFINITIONS: McpToolSchema[] = [
  {
    name: 'apollo_search_contacts',
    description: 'Search for B2B contacts and leads using Apollo.io with filtering by titles, industries, company size, and location.',
    inputSchema: {
      type: 'object',
      properties: {
        titles: { type: 'array', items: { type: 'string' }, description: 'Target job titles (e.g. ["CEO", "VP of Sales"])' },
        industries: { type: 'array', items: { type: 'string' }, description: 'Target industries (e.g. ["SaaS", "Fintech"])' },
        locations: { type: 'array', items: { type: 'string' }, description: 'Target locations (e.g. ["United States", "United Kingdom"])' },
        limit: { type: 'number', default: 25, description: 'Max results to return (1-100)' },
        query: { type: 'string', description: 'Free-text search query' },
      },
      required: [],
    },
  },
  {
    name: 'apollo_enrich_company',
    description: 'Enrich company/organization data using Apollo.io by domain or name.',
    inputSchema: {
      type: 'object',
      properties: {
        domain: { type: 'string', description: 'Company domain (e.g. "openai.com")' },
        organization_name: { type: 'string', description: 'Company name' },
      },
      required: [],
    },
  },
  {
    name: 'instantly_add_leads',
    description: 'Add leads to an Instantly campaign for cold email outreach.',
    inputSchema: {
      type: 'object',
      properties: {
        campaign_id: { type: 'string', description: 'Instantly campaign ID' },
        leads: { type: 'array', items: { type: 'object', properties: { email: { type: 'string' }, first_name: { type: 'string' }, last_name: { type: 'string' } } }, description: 'Array of leads with email and name' },
      },
      required: ['campaign_id', 'leads'],
    },
  },
  {
    name: 'smartlead_create_campaign',
    description: 'Create a new email campaign in Smartlead.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Campaign name' },
        subject: { type: 'string', description: 'Email subject line' },
      },
      required: ['name'],
    },
  },
  {
    name: 'smartlead_add_leads',
    description: 'Add leads to a Smartlead campaign for email sequencing.',
    inputSchema: {
      type: 'object',
      properties: {
        campaign_id: { type: 'string', description: 'Smartlead campaign ID' },
        lead_list: { type: 'array', items: { type: 'object', properties: { email: { type: 'string' }, firstName: { type: 'string' }, lastName: { type: 'string' } } } },
      },
      required: ['campaign_id', 'lead_list'],
    },
  },
  {
    name: 'hunter_search_leads',
    description: 'Search for leads and email addresses using Hunter.io domain search.',
    inputSchema: {
      type: 'object',
      properties: {
        domain: { type: 'string', description: 'Company domain to search' },
        company: { type: 'string', description: 'Company name' },
        limit: { type: 'number', default: 10 },
      },
      required: [],
    },
  },
  {
    name: 'hunter_verify_email',
    description: 'Verify a single email address deliverability using Hunter.io.',
    inputSchema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email', description: 'Email to verify' },
      },
      required: ['email'],
    },
  },
  {
    name: 'brevo_create_campaign',
    description: 'Create an email campaign in Brevo (Sendinblue) for broadcast sends.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Campaign name' },
        subject: { type: 'string', description: 'Email subject' },
        htmlContent: { type: 'string', description: 'HTML email body' },
        listId: { type: 'number', description: 'Target list ID' },
      },
      required: ['name', 'subject'],
    },
  },
  {
    name: 'brevo_send_transactional',
    description: 'Send a transactional email via Brevo API.',
    inputSchema: {
      type: 'object',
      properties: {
        to: { type: 'string', format: 'email', description: 'Recipient email' },
        subject: { type: 'string', description: 'Email subject' },
        htmlContent: { type: 'string', description: 'HTML body' },
      },
      required: ['to', 'subject', 'htmlContent'],
    },
  },
  {
    name: 'clay_enrich_leads',
    description: 'Enrich lead data using Clay.com enrichment workflows.',
    inputSchema: {
      type: 'object',
      properties: {
        rows_json: { type: 'string', description: 'JSON string of lead rows to enrich' },
        enrichment_fields: { type: 'array', items: { type: 'string' }, description: 'Fields to enrich (e.g. ["email", "phone", "linkedin"])' },
      },
      required: ['rows_json'],
    },
  },
  {
    name: 'heyreach_add_leads',
    description: 'Add leads to a LinkedIn outreach campaign via HeyReach.',
    inputSchema: {
      type: 'object',
      properties: {
        campaign_id: { type: 'string', description: 'HeyReach campaign ID' },
        leads: { type: 'array', items: { type: 'object', properties: { linkedinUrl: { type: 'string' }, name: { type: 'string' } } } },
      },
      required: ['campaign_id', 'leads'],
    },
  },
  {
    name: 'gojiberry_search_leads',
    description: 'Search for AI-powered leads using Gojiberry AI prospecting.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query for target leads' },
        limit: { type: 'number', default: 25 },
        filters: { type: 'object', description: 'Additional filters' },
      },
      required: ['query'],
    },
  },
  {
    name: 'gojiberry_enrich_lead',
    description: 'Enrich a single lead with additional data points via Gojiberry.',
    inputSchema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email', description: 'Lead email to enrich' },
      },
      required: ['email'],
    },
  },
  {
    name: 'hubspot_create_contact',
    description: 'Create a contact record in HubSpot CRM.',
    inputSchema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
        firstname: { type: 'string' },
        lastname: { type: 'string' },
        company: { type: 'string' },
        jobtitle: { type: 'string' },
      },
      required: ['email'],
    },
  },
  {
    name: 'hubspot_search_contacts',
    description: 'Search contacts in HubSpot CRM by query.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        limit: { type: 'number', default: 10 },
      },
      required: ['query'],
    },
  },
  {
    name: 'salesforce_create_lead',
    description: 'Create a lead record in Salesforce CRM.',
    inputSchema: {
      type: 'object',
      properties: {
        FirstName: { type: 'string' },
        LastName: { type: 'string' },
        Company: { type: 'string' },
        Email: { type: 'string', format: 'email' },
        Title: { type: 'string' },
      },
      required: ['LastName', 'Company'],
    },
  },
  {
    name: 'calendly_create_scheduling_link',
    description: 'Create a Calendly scheduling link for meeting booking.',
    inputSchema: {
      type: 'object',
      properties: {
        event_type: { type: 'string', description: 'Calendly event type URI' },
        max_event_count: { type: 'number', default: 1 },
      },
      required: ['event_type'],
    },
  },
  {
    name: 'bettercontacts_enrich',
    description: 'Enrich contact data using BetterContacts.',
    inputSchema: {
      type: 'object',
      properties: {
        contacts: { type: 'array', items: { type: 'object', properties: { email: { type: 'string' }, name: { type: 'string' } } } },
      },
      required: ['contacts'],
    },
  },
];

export interface ToolCapability {
  name: string;
  description: string;
  category: string;
  actions: ToolAction[];
  required_params: string[];
  supported_sequences: string[][];
  credit_cost: number;
  subscription_required: 'free' | 'starter' | 'pro';
}

export interface ToolAction {
  name: string;
  description: string;
  params: Record<string, any>;
  prerequisites: string[];
  credit_cost: number;
}

export interface ToolSequence {
  name: string;
  description: string;
  tools: string[];
  actions: string[];
  total_credit_cost: number;
  use_case: string;
}

export interface SubscriptionPlan {
  name: string;
  level: 'free' | 'starter' | 'pro';
  credits_per_month: number;
  tools_available: string[];
  features: string[];
  price: number;
}

// Complete Tool Registry
export const TOOL_REGISTRY: Record<string, ToolCapability> = {
  'Apollo': {
    name: 'Apollo',
    description: 'Lead generation and contact enrichment platform',
    category: 'Lead Generation',
    actions: [
      {
        name: 'search_people',
        description: 'Search for people based on criteria',
        params: { title: 'string', company: 'string', location: 'string' },
        prerequisites: [],
        credit_cost: 1
      },
      {
        name: 'search_companies', 
        description: 'Search for companies based on criteria',
        params: { industry: 'string', size: 'string', location: 'string' },
        prerequisites: [],
        credit_cost: 1
      },
      {
        name: 'enrich_contact',
        description: 'Enrich contact information',
        params: { email: 'string', linkedin_url: 'string' },
        prerequisites: ['search_people'],
        credit_cost: 1
      }
    ],
    required_params: ['api_key'],
    supported_sequences: [
      ['search_people'],
      ['search_companies'],
      ['search_people', 'enrich_contact'],
      ['search_companies', 'search_people']
    ],
    credit_cost: 1,
    subscription_required: 'free'
  },

  'Smartlead': {
    name: 'Smartlead',
    description: 'Email campaign automation and tracking',
    category: 'Email Marketing',
    actions: [
      {
        name: 'create_campaign',
        description: 'Create email campaign',
        params: { name: 'string', subject: 'string', template: 'string' },
        prerequisites: [],
        credit_cost: 2
      },
      {
        name: 'send_campaign',
        description: 'Send email campaign to leads',
        params: { campaign_id: 'string', lead_list: 'array' },
        prerequisites: ['create_campaign'],
        credit_cost: 2
      },
      {
        name: 'track_replies',
        description: 'Track email replies and engagement',
        params: { campaign_id: 'string', time_range: 'string' },
        prerequisites: ['send_campaign'],
        credit_cost: 1
      }
    ],
    required_params: ['api_key'],
    supported_sequences: [
      ['create_campaign', 'send_campaign'],
      ['create_campaign', 'send_campaign', 'track_replies']
    ],
    credit_cost: 2,
    subscription_required: 'starter'
  },

  'Clay': {
    name: 'Clay',
    description: 'Data enrichment and verification platform',
    category: 'Data Enrichment',
    actions: [
      {
        name: 'enrich_person',
        description: 'Enrich person data with additional info',
        params: { email: 'string', name: 'string' },
        prerequisites: [],
        credit_cost: 1
      },
      {
        name: 'enrich_company',
        description: 'Enrich company data with additional info',
        params: { domain: 'string', company_name: 'string' },
        prerequisites: [],
        credit_cost: 1
      },
      {
        name: 'verify_email',
        description: 'Verify email deliverability',
        params: { email: 'string' },
        prerequisites: [],
        credit_cost: 1
      }
    ],
    required_params: ['api_key'],
    supported_sequences: [
      ['enrich_person'],
      ['enrich_company'],
      ['verify_email'],
      ['enrich_person', 'verify_email'],
      ['enrich_company', 'enrich_person']
    ],
    credit_cost: 1,
    subscription_required: 'starter'
  },

  'HeyReach': {
    name: 'HeyReach',
    description: 'LinkedIn outreach and multi-channel automation',
    category: 'LinkedIn Outreach',
    actions: [
      {
        name: 'add_leads_to_campaign',
        description: 'Add leads to a LinkedIn outreach campaign',
        params: { campaign_id: 'string', leads: 'array' },
        prerequisites: [],
        credit_cost: 2
      },
      {
        name: 'send_message',
        description: 'Send LinkedIn message to lead',
        params: { lead_id: 'string', message: 'string' },
        prerequisites: [],
        credit_cost: 1
      },
      {
        name: 'get_conversations',
        description: 'Fetch LinkedIn conversations',
        params: {},
        prerequisites: [],
        credit_cost: 1
      }
    ],
    required_params: ['api_key'],
    supported_sequences: [
      ['add_leads_to_campaign'],
      ['add_leads_to_campaign', 'send_message'],
      ['add_leads_to_campaign', 'send_message', 'get_conversations']
    ],
    credit_cost: 2,
    subscription_required: 'pro'
  },

  'Instantly': {
    name: 'Instantly',
    description: 'Cold email platform with deliverability optimization',
    category: 'Email Marketing',
    actions: [
      {
        name: 'create_campaign',
        description: 'Create an email campaign',
        params: { name: 'string', subject: 'string', template: 'string' },
        prerequisites: [],
        credit_cost: 2
      },
      {
        name: 'add_leads',
        description: 'Add leads to an existing campaign',
        params: { campaign_id: 'string', leads: 'array' },
        prerequisites: ['create_campaign'],
        credit_cost: 1
      },
      {
        name: 'get_campaign_stats',
        description: 'Get campaign sending statistics',
        params: { campaign_id: 'string' },
        prerequisites: ['create_campaign'],
        credit_cost: 1
      }
    ],
    required_params: ['api_key'],
    supported_sequences: [
      ['create_campaign', 'add_leads'],
      ['create_campaign', 'add_leads', 'get_campaign_stats']
    ],
    credit_cost: 2,
    subscription_required: 'starter'
  },

  'Salesforce': {
    name: 'Salesforce',
    description: 'Enterprise CRM for sales pipeline and account management',
    category: 'CRM',
    actions: [
      {
        name: 'query',
        description: 'Run SOQL query',
        params: { q: 'string' },
        prerequisites: [],
        credit_cost: 1
      },
      {
        name: 'create_lead',
        description: 'Create a new lead record',
        params: { properties: 'object' },
        prerequisites: [],
        credit_cost: 1
      },
      {
        name: 'create_contact',
        description: 'Create a new contact record',
        params: { properties: 'object' },
        prerequisites: [],
        credit_cost: 1
      },
      {
        name: 'create_opportunity',
        description: 'Create a new opportunity',
        params: { properties: 'object' },
        prerequisites: [],
        credit_cost: 1
      },
      {
        name: 'create_account',
        description: 'Create a new account',
        params: { properties: 'object' },
        prerequisites: [],
        credit_cost: 1
      }
    ],
    required_params: ['access_token'],
    supported_sequences: [
      ['query'],
      ['create_lead'],
      ['create_contact', 'create_opportunity'],
      ['query', 'create_lead']
    ],
    credit_cost: 1,
    subscription_required: 'pro'
  },

  'HubSpot': {
    name: 'HubSpot',
    description: 'CRM platform for contacts, deals, and pipeline management',
    category: 'CRM',
    actions: [
      {
        name: 'create_contact',
        description: 'Create a new contact in CRM',
        params: { properties: 'object' },
        prerequisites: [],
        credit_cost: 1
      },
      {
        name: 'search_contacts',
        description: 'Search contacts by query',
        params: { query: 'string', limit: 'number' },
        prerequisites: [],
        credit_cost: 1
      },
      {
        name: 'create_deal',
        description: 'Create a new deal in pipeline',
        params: { properties: 'object' },
        prerequisites: [],
        credit_cost: 1
      },
      {
        name: 'get_pipelines',
        description: 'Get deal pipelines and stages',
        params: {},
        prerequisites: [],
        credit_cost: 1
      }
    ],
    required_params: ['api_key'],
    supported_sequences: [
      ['create_contact'],
      ['create_contact', 'create_deal'],
      ['search_contacts'],
      ['get_pipelines', 'create_deal']
    ],
    credit_cost: 1,
    subscription_required: 'starter'
  }
};

// Common Tool Sequences
export const TOOL_SEQUENCES: ToolSequence[] = [
  {
    name: 'Lead Generation & Email',
    description: 'Generate leads and send email campaign',
    tools: ['Apollo', 'Smartlead'],
    actions: ['search_people', 'create_campaign', 'send_campaign'],
    total_credit_cost: 5,
    use_case: 'Generate new leads and start email outreach'
  },
  {
    name: 'Lead Enrichment & Email',
    description: 'Find leads, enrich data, and send emails',
    tools: ['Apollo', 'Clay', 'Smartlead'],
    actions: ['search_people', 'enrich_person', 'create_campaign', 'send_campaign'],
    total_credit_cost: 6,
    use_case: 'Comprehensive lead generation with data enrichment'
  },
  {
    name: 'Multi-Channel Outreach',
    description: 'Email and LinkedIn multi-channel campaign',
    tools: ['Apollo', 'Smartlead', 'HeyReach'],
    actions: ['search_people', 'create_campaign', 'send_campaign', 'add_leads_to_campaign'],
    total_credit_cost: 7,
    use_case: 'Reach leads through email and LinkedIn'
  },
  {
    name: 'Full Funnel Pipeline',
    description: 'Complete pipeline from lead gen to CRM and outreach',
    tools: ['Apollo', 'Hunter', 'HubSpot', 'Brevo'],
    actions: ['search_people', 'search_leads', 'create_contact', 'create_deal', 'create_campaign', 'send_campaign'],
    total_credit_cost: 8,
    use_case: 'Lead gen → CRM → Email outreach'
  },
  {
    name: 'Cold Email with Instantly',
    description: 'Generate leads and send cold email via Instantly',
    tools: ['Hunter', 'Instantly'],
    actions: ['search_leads', 'create_campaign', 'add_leads'],
    total_credit_cost: 5,
    use_case: 'Cold email outreach with deliverability focus'
  },
  {
    name: 'CRM Pipeline Sync',
    description: 'Enrich leads and sync to HubSpot CRM',
    tools: ['Hunter', 'BetterContacts', 'HubSpot'],
    actions: ['search_leads', 'enrich_contacts', 'create_contact', 'create_deal'],
    total_credit_cost: 4,
    use_case: 'Lead enrichment and CRM sync'
  }
];

// Subscription Plans
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    name: 'Free Trial',
    level: 'free',
    credits_per_month: 1000,
    tools_available: ['Hunter'],
    features: ['Basic lead generation', 'Dashboard access'],
    price: 0
  },
  {
    name: 'Starter',
    level: 'starter',
    credits_per_month: 5000,
    tools_available: ['Hunter', 'Brevo', 'BetterContacts', 'Instantly', 'HubSpot'],
    features: ['Lead generation', 'Email campaigns', 'Enrichment', 'CRM', 'Analytics'],
    price: 99
  },
  {
    name: 'Pro',
    level: 'pro',
    credits_per_month: 20000,
    tools_available: ['Hunter', 'Brevo', 'BetterContacts', 'Calendly', 'Smartlead', 'HeyReach', 'Instantly', 'HubSpot', 'Salesforce'],
    features: ['All tools', 'Full pipeline', 'CRM (HubSpot + Salesforce)', 'LinkedIn outreach', 'Multi-channel', 'Priority support'],
    price: 299
  }
];

export class ToolRegistry {
  static getAllTools(): ToolCapability[] {
    return Object.values(TOOL_REGISTRY);
  }

  static getTool(name: string): ToolCapability | undefined {
    return TOOL_REGISTRY[name];
  }

  static getToolsByCategory(category: string): ToolCapability[] {
    return Object.values(TOOL_REGISTRY).filter(tool => tool.category === category);
  }

  static getToolsBySubscription(level: 'free' | 'starter' | 'pro'): ToolCapability[] {
    return Object.values(TOOL_REGISTRY).filter(tool => 
      tool.subscription_required === 'free' || 
      tool.subscription_required === level ||
      (level === 'pro' && tool.subscription_required !== 'starter')
    );
  }

  static getAvailableTools(userTools: string[]): ToolCapability[] {
    return userTools.map(toolName => TOOL_REGISTRY[toolName]).filter(Boolean);
  }

  static calculateSequenceCost(sequence: string[]): number {
    return sequence.reduce((total, toolName) => {
      const tool = TOOL_REGISTRY[toolName];
      return total + (tool?.credit_cost || 0);
    }, 0);
  }

  static validateSequence(sequence: string[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    sequence.forEach(toolName => {
      if (!TOOL_REGISTRY[toolName]) {
        errors.push(`Tool ${toolName} not found in registry`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static getRecommendedSequences(userIntent: string, availableTools: string[]): ToolSequence[] {
    // Simple keyword matching for recommendations
    const intent = userIntent.toLowerCase();
    const recommendations: ToolSequence[] = [];

    TOOL_SEQUENCES.forEach(sequence => {
      if (sequence.tools.every(tool => availableTools.includes(tool))) {
        const useCase = sequence.use_case.toLowerCase();
        if (intent.includes('email') && useCase.includes('email')) {
          recommendations.push(sequence);
        } else if (intent.includes('sms') && useCase.includes('sms')) {
          recommendations.push(sequence);
        } else if (intent.includes('enrich') && useCase.includes('enrich')) {
          recommendations.push(sequence);
        } else if (intent.includes('multi') && useCase.includes('multi')) {
          recommendations.push(sequence);
        }
      }
    });

    return recommendations;
  }

  static checkToolAccess(toolName: string, userPlan: 'free' | 'starter' | 'pro'): boolean {
    const tool = TOOL_REGISTRY[toolName];
    if (!tool) return false;

    return tool.subscription_required === 'free' || 
           tool.subscription_required === userPlan ||
           (userPlan === 'pro' && tool.subscription_required !== 'starter');
  }

  static getSubscriptionPlan(level: 'free' | 'starter' | 'pro'): SubscriptionPlan | undefined {
    return SUBSCRIPTION_PLANS.find(plan => plan.level === level);
  }
}

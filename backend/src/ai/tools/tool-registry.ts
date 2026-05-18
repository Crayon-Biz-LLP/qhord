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
    description: 'SMS marketing and communication platform',
    category: 'SMS Marketing',
    actions: [
      {
        name: 'send_sms',
        description: 'Send SMS campaign',
        params: { message: 'string', phone_numbers: 'array' },
        prerequisites: [],
        credit_cost: 2
      },
      {
        name: 'track_conversions',
        description: 'Track SMS conversions and responses',
        params: { campaign_id: 'string', time_range: 'string' },
        prerequisites: ['send_sms'],
        credit_cost: 1
      },
      {
        name: 'manage_contacts',
        description: 'Manage SMS contact lists',
        params: { contacts: 'array', list_name: 'string' },
        prerequisites: [],
        credit_cost: 1
      }
    ],
    required_params: ['api_key'],
    supported_sequences: [
      ['manage_contacts', 'send_sms'],
      ['manage_contacts', 'send_sms', 'track_conversions']
    ],
    credit_cost: 2,
    subscription_required: 'pro'
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
    description: 'Email and SMS multi-channel campaign',
    tools: ['Apollo', 'Smartlead', 'HeyReach'],
    actions: ['search_people', 'create_campaign', 'send_campaign', 'send_sms'],
    total_credit_cost: 7,
    use_case: 'Reach leads through multiple channels'
  },
  {
    name: 'Full Funnel Pipeline',
    description: 'Complete pipeline from lead gen to multi-channel outreach',
    tools: ['Apollo', 'Clay', 'Smartlead', 'HeyReach'],
    actions: ['search_people', 'enrich_person', 'verify_email', 'create_campaign', 'send_campaign', 'send_sms'],
    total_credit_cost: 9,
    use_case: 'Complete GTM automation pipeline'
  }
];

// Subscription Plans
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    name: 'Free Trial',
    level: 'free',
    credits_per_month: 1000,
    tools_available: ['Apollo'],
    features: ['Basic lead generation', 'Campaign creation', 'Dashboard access'],
    price: 0
  },
  {
    name: 'Starter',
    level: 'starter',
    credits_per_month: 5000,
    tools_available: ['Apollo', 'Smartlead', 'Clay'],
    features: ['Advanced lead generation', 'Email campaigns', 'Data enrichment', 'Analytics'],
    price: 99
  },
  {
    name: 'Pro',
    level: 'pro',
    credits_per_month: 20000,
    tools_available: ['Apollo', 'Smartlead', 'Clay', 'HeyReach'],
    features: ['All tools', 'Multi-channel campaigns', 'Advanced analytics', 'Priority support', 'Custom integrations'],
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

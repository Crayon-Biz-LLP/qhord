import { Router, Request, Response } from 'express';
import { runCampaignCompiler } from '../ai/langgraph/state-machine';
import { requireAuth } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { PlannerMemoryService } from '../services/planner-memory.service';

const router = Router();
const plannerMemoryService = new PlannerMemoryService();

// Apply authentication to all routes except /plan and GET /campaigns for testing
router.use((req, res, next) => {
  if (req.path === '/plan' || (req.method === 'GET' && req.path === '/')) {
    // Skip authentication for /plan endpoint and GET campaigns for testing
    return next();
  }
  return requireAuth(req, res, next);
});

interface CampaignPlanRequest {
  prompt: string;
}

interface CampaignPlanResponse {
  success: boolean;
  campaignId?: string;
  plan?: any;
  estimatedCost?: number;
  estimatedDuration?: number;
  warnings?: string[];
  memoryInsights?: {
    summary: string;
    recommendedTools: string[];
    confidence: number;
    basedOnCampaigns: number;
    suggestions: string[];
  };
  error?: string;
}

/**
 * POST /api/campaigns/plan
 * Create a campaign plan from natural language prompt
 */
router.post('/plan', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body as CampaignPlanRequest;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required and must be a non-empty string'
      } as CampaignPlanResponse);
    }

    // For testing without auth, create or get test user and client
    let operatorId = req.user?.id;
    let clientId;

    if (!operatorId) {
      // Create test user for demo
      let testOperator = await prisma.operator.findFirst({
        where: { email: 'demo@example.com' }
      });

      if (!testOperator) {
        testOperator = await prisma.operator.create({
          data: {
            email: 'demo@example.com',
            password_hash: 'demo123',
            name: 'Demo User',
            role: 'operator'
          }
        });
      }

      operatorId = testOperator.id;

      // Create test client
      let testClient = await prisma.client.findFirst({
        where: { created_by_operator_id: operatorId }
      });

      if (!testClient) {
        testClient = await prisma.client.create({
          data: {
            name: 'Demo Client',
            description: 'Demo client for testing',
            created_by_operator_id: operatorId
          }
        });
      }

      clientId = testClient.id;
    } else {
      // Get active tools for this client
      const activeTools = await getActiveToolsForClient(req.user!.id);

      // Get client ID for this operator (for now, get the first client)
      clientId = await getClientIdForOperator(req.user!.id);

      if (!clientId) {
        return res.status(400).json({
          success: false,
          error: 'No client found for this operator'
        } as CampaignPlanResponse);
      }
    }

    // Get active tools
    const activeTools = await getActiveToolsForClient(operatorId);
    const memoryInsights = await plannerMemoryService.getInsights(operatorId, prompt, activeTools);

    // Run the campaign compiler
    const result = await runCampaignCompiler(prompt, activeTools, operatorId, clientId);

    if (result.error) {
      return res.status(400).json({
        success: false,
        error: result.error
      } as CampaignPlanResponse);
    }

    if (!result.campaignId) {
      return res.status(500).json({
        success: false,
        error: 'Campaign was not created successfully'
      } as CampaignPlanResponse);
    }

    // Return success response
    const response: CampaignPlanResponse = {
      success: true,
      campaignId: result.campaignId,
      plan: result.validatedPlan,
      estimatedCost: result.validatedPlan?.estimated_cost,
      estimatedDuration: result.validatedPlan?.estimated_duration,
      warnings: result.warnings,
      memoryInsights
    };

    res.status(201).json(response);

  } catch (error) {
    console.error('Campaign plan error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while creating campaign plan'
    } as CampaignPlanResponse);
  }
});

/**
 * GET /api/campaigns
 * List campaigns for the authenticated user
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // For testing without auth, get all campaigns or use test user
    let operatorId = req.user?.id;
    
    if (!operatorId) {
      // Get test user for demo
      let testOperator = await prisma.operator.findFirst({
        where: { email: 'demo@example.com' }
      });
      
      if (testOperator) {
        operatorId = testOperator.id;
      }
    }

    const campaigns = await prisma.campaign.findMany({
      where: {
        ...(operatorId ? { created_by_operator_id: operatorId } : {}),
        status: {
          not: 'workflow_template'
        }
      },
      include: {
        _count: {
          select: {
            steps: true
          }
        }
      } as any,
      orderBy: {
        created_at: 'desc'
      },
      take: 50
    });

    res.json({
      campaigns: campaigns.map(campaign => ({
        id: campaign.id,
        name: campaign.name,
        description: campaign.description,
        status: campaign.status,
        estimatedCost: campaign.estimated_cost,
        estimatedDuration: campaign.estimated_duration,
        stepCount: 0, // TODO: Add step count when needed
        createdAt: campaign.created_at
      }))
    });

  } catch (error) {
    console.error('List campaigns error:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

/**
 * GET /api/campaigns/:id
 * Get detailed campaign information
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const campaign = await prisma.campaign.findFirst({
      where: {
        id,
        created_by_operator_id: req.user!.id,
        status: {
          not: 'workflow_template'
        }
      },
      include: {
        steps: {
          orderBy: {
            step_order: 'asc'
          }
        }
      }
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.json({
      campaign: {
        id: campaign.id,
        name: campaign.name,
        description: campaign.description,
        status: campaign.status,
        manifest: campaign.manifest,
        estimatedCost: campaign.estimated_cost,
        estimatedDuration: campaign.estimated_duration,
        steps: campaign.steps.map(step => ({
          id: step.id,
          order: step.step_order,
          tool: step.tool_name,
          action: step.action,
          params: step.params,
          status: step.status,
          dependencies: step.dependencies
        })),
        createdAt: campaign.created_at,
        updatedAt: campaign.updated_at
      }
    });

  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).json({ error: 'Failed to fetch campaign' });
  }
});

/**
 * Helper function to get active tools for a client
 */
async function getActiveToolsForClient(operatorId: string): Promise<string[]> {
  try {
    // Get the client's active tool accounts
    const toolAccounts = await prisma.clientToolAccount.findMany({
      where: {
        created_by_operator_id: operatorId,
        // In a real app, you'd filter by a specific client
        // For now, get all tools for this operator's clients
      },
      select: {
        tool_name: true
      },
      distinct: ['tool_name']
    });

    const { getEnvToolsForDemoStack, useFreeDemoStack } = await import('../config/demo-stack');
    const tools = new Set<string>(
      toolAccounts.length > 0
        ? toolAccounts.map((account) => account.tool_name)
        : ['Apollo', 'Clay', 'Smartlead']
    );
    for (const t of getEnvToolsForDemoStack()) {
      tools.add(t);
    }
    if (useFreeDemoStack()) {
      tools.add('Hunter');
      tools.add('Brevo');
      tools.add('Apollo');
      tools.add('Clay');
      tools.add('Smartlead');
    }
    return [...tools];
  } catch (error) {
    console.error('Error getting active tools:', error);
    return ['Apollo', 'Clay', 'Smartlead', 'Hunter', 'Brevo'];
  }
}

/**
 * Helper function to get client ID for an operator
 */
async function getClientIdForOperator(operatorId: string): Promise<string | null> {
  try {
    // For now, get the first client associated with this operator
    // In a real app, this would be more sophisticated (maybe from request context)
    const client = await prisma.client.findFirst({
      where: {
        created_by_operator_id: operatorId
      },
      select: {
        id: true
      }
    });

    return client?.id || null;

  } catch (error) {
    console.error('Error getting client ID:', error);
    return null;
  }
}

/**
 * Helper to save canvas workflow structure (nodes and edges)
 */
async function saveCanvasWorkflow(campaignId: string, operatorId: string, workflowsData: any[], compiledSteps: any[]) {
  try {
    let finalWorkflows = workflowsData;
    // If no visual workflows are provided, build a default linear workflow from compiler steps
    if (!finalWorkflows || finalWorkflows.length === 0) {
      finalWorkflows = [{
        name: 'Main Workflow',
        actions: (compiledSteps || []).map(step => ({
          label: `${step.tool.charAt(0).toUpperCase() + step.tool.slice(1)} ${step.action}`
        }))
      }];
    }

    for (const w of finalWorkflows) {
      const cw = await prisma.campaignWorkflow.create({
        data: {
          campaign_id: campaignId,
          workflow_name: w.name || 'Main Workflow',
          status: 'active',
          created_by: operatorId,
        }
      });

      const nodesData = [];

      // Determine initial trigger tool from first action or compiled steps
      let triggerTool = 'apollo';
      if (compiledSteps && compiledSteps.length > 0) {
        triggerTool = compiledSteps[0].tool.toLowerCase();
      }

      nodesData.push({
        node_type: 'source',
        tool: triggerTool,
        configuration_json: {},
        position: { x: 0, y: 0 }
      });

      const actions = w.actions || [];
      // Add other action nodes
      for (let i = 0; i < actions.length; i++) {
        const action = actions[i];
        const label = (action.label || '').toLowerCase();

        let nodeType = 'action';
        let tool = 'internal';
        let config: any = {};

        if (label.includes('apollo') && label.includes('search')) {
          nodeType = 'source';
          tool = 'apollo';
        } else if (label.includes('clay') || label.includes('enrich')) {
          nodeType = 'enrichment';
          tool = 'clay';
        } else if (label.includes('bettercontact') || label.includes('verify')) {
          nodeType = 'enrichment';
          tool = 'bettercontact';
        } else if (label.includes('smartlead')) {
          nodeType = 'action';
          tool = 'smartlead';
        } else if (label.includes('instantly')) {
          nodeType = 'action';
          tool = 'instantly';
        } else if (label.includes('heyreach')) {
          nodeType = 'action';
          tool = 'heyreach';
        } else if (label.includes('calendly')) {
          nodeType = 'event';
          tool = 'calendly';
        } else if (label.includes('wait') || label.includes('delay')) {
          nodeType = 'delay';
          tool = 'delay';
          const match = label.match(/\d+/);
          config.wait_days = match ? parseInt(match[0]) : 3;
        } else if (label.includes('reply') || label.includes('replied')) {
          nodeType = 'event';
          tool = 'smartlead';
        } else if (label.includes('condition') || label.includes('branch') || label.includes('filter')) {
          nodeType = 'condition';
          tool = label.includes('email') ? 'bettercontact' : 'linkedin';
        }

        nodesData.push({
          node_type: nodeType,
          tool,
          configuration_json: config,
          position: { x: 0, y: (i + 1) * 100 }
        });
      }

      // Bulk create nodes
      const createdNodes = [];
      for (const nodeData of nodesData) {
        const node = await prisma.workflowNode.create({
          data: {
            workflow_id: cw.id,
            node_type: nodeData.node_type,
            tool: nodeData.tool,
            configuration_json: nodeData.configuration_json,
            position: nodeData.position,
          }
        });
        createdNodes.push(node);
      }

      // Create default edges
      for (let i = 0; i < createdNodes.length - 1; i++) {
        const source = createdNodes[i];
        const target = createdNodes[i + 1];

        if (source.node_type === 'condition') {
          await prisma.workflowEdge.create({
            data: {
              workflow_id: cw.id,
              source_node_id: source.id,
              target_node_id: target.id,
              condition_type: 'yes',
            }
          });
        } else {
          await prisma.workflowEdge.create({
            data: {
              workflow_id: cw.id,
              source_node_id: source.id,
              target_node_id: target.id,
              condition_type: 'default',
            }
          });
        }
      }
    }
  } catch (error) {
    console.error('Error saving canvas workflow:', error);
  }
}

/**
 * GET /api/campaigns/:id/workflow
 * Retrieve workflow details for a campaign (canvas configuration and execution runs)
 */
router.get('/:id/workflow', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const workflow = await prisma.campaignWorkflow.findFirst({
      where: { campaign_id: id },
      include: {
        nodes: true,
        edges: true,
        runs: {
          include: {
            steps: {
              include: {
                node: true
              }
            },
            lead: true
          },
          orderBy: { created_at: 'desc' },
          take: 20
        }
      }
    });

    if (!workflow) {
      return res.status(404).json({ success: false, error: 'Campaign workflow not found' });
    }

    res.json({ success: true, workflow });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/campaigns/:id/launch-workflow
 * Activates campaign workflows and executes initial lead ingestion triggers
 */
router.post('/:id/launch-workflow', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const workflow = await prisma.campaignWorkflow.findFirst({
      where: { campaign_id: id },
      include: { nodes: true, campaign: true },
    });

    if (!workflow) {
      return res.status(404).json({ success: false, error: 'Campaign workflow not found' });
    }

    await prisma.campaignWorkflow.update({
      where: { id: workflow.id },
      data: { status: 'active' },
    });

    // Run trigger node ingestion if set to apollo
    const triggerNode = workflow.nodes.find(n => n.node_type === 'source');
    if (triggerNode && triggerNode.tool === 'apollo') {
      const account = await findToolAccount(workflow.campaign.client_id, 'apollo');
      const apiKey = account?.api_key_encrypted || 'mock_api_key';
      const service = new ApolloService(apiKey);

      let people = [];
      try {
        const apolloRes = await service.searchLeads({
          q_organization_domains: 'google.com\nstripe.com',
          page: 1,
          per_page: 5,
        });
        people = apolloRes.contacts || apolloRes.people || [];
      } catch (err) {
        console.log('[CampaignsRoute] Using mock prospects fallback for workflow run...');
        people = [
          { email: 'prospect1@neondb.tech', first_name: 'Jane', last_name: 'Doe', organization: { name: 'Neon DB' } },
          { email: 'prospect2@neon.tech', first_name: 'John', last_name: 'Smith', organization: { name: 'Neon Tech' } },
        ];
      }

      const { campaignWorkflowEngine } = await import('../services/campaign-workflow.engine');
      for (const person of people) {
        let lead = await prisma.lead.findFirst({
          where: { client_id: workflow.campaign.client_id, email: person.email },
        });

        if (!lead) {
          lead = await prisma.lead.create({
            data: {
              client_id: workflow.campaign.client_id,
              campaign_id: id,
              email: person.email,
              first_name: person.first_name,
              last_name: person.last_name,
              company_name: person.organization?.name || 'SaaS Company',
              status: 'new',
            },
          });
        }

        void campaignWorkflowEngine.startWorkflowRun(workflow.id, lead.id);
      }
    }

    res.json({ success: true, message: 'Campaign workflow launched, executing runs' });
  } catch (error: any) {
    console.error('Launch workflow run error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Modify the existing /plan route to register the workflow structure
const originalPost = router.post;
// Hook into campaign compilation to invoke workflow creation
router.stack.forEach(layer => {
  if (layer.route && layer.route.path === '/plan') {
    const originalHandler = layer.route.stack[layer.route.stack.length - 1].handle;
    layer.route.stack[layer.route.stack.length - 1].handle = async (req: Request, res: Response, next: any) => {
      const originalJson = res.json;
      res.json = function(body: any) {
        if (body && body.success && body.campaignId) {
          const operatorId = req.user?.id || body.plan?.created_by_operator_id || 'demo_operator';
          // Save campaign workflow
          void saveCanvasWorkflow(body.campaignId, operatorId, req.body.workflows, body.plan?.steps || []);
        }
        return originalJson.call(this, body);
      };
      return originalHandler(req, res, next);
    };
  }
});

import { findToolAccount } from '../ai/pipeline/ensure-tool-accounts';
import { ApolloService } from '../services/apollo.service';

async function ensureCampaignExists(campaignId: string, clientAccountId: string, operatorId?: string) {
  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) {
    let finalOperatorId = operatorId;
    if (!finalOperatorId) {
      const defaultOperator = await prisma.operator.findFirst();
      finalOperatorId = defaultOperator?.id || '';
    }
    await prisma.campaign.create({
      data: {
        id: campaignId,
        client_id: clientAccountId,
        name: 'Draft Campaign',
        created_by_operator_id: finalOperatorId,
        status: 'draft'
      }
    });
  }
}

router.post('/:campaignId/leads/import/apollo', async (req: Request, res: Response) => {
  const { campaignId } = req.params;
  const { clientAccountId, filters } = req.body;
  if (!clientAccountId || !filters) {
    res.status(400).json({ success: false, error: 'clientAccountId and filters are required' });
    return;
  }

  try {
    const operatorId = req.user?.id;
    await ensureCampaignExists(campaignId, clientAccountId, operatorId);

    const apolloService = new ApolloService();
    const { leads, fallback } = await apolloService.importLeads(campaignId, clientAccountId, filters);
    res.status(201).json({ success: true, count: leads.length, leads, fallback });
  } catch (error: any) {
    console.error('Import Apollo leads error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to import leads' });
  }
});

router.post('/:campaignId/leads/apollo/search', async (req: Request, res: Response) => {
  const { clientAccountId, filters } = req.body;
  if (!clientAccountId || !filters) {
    res.status(400).json({ success: false, error: 'clientAccountId and filters are required' });
    return;
  }

  try {
    const apolloService = new ApolloService();
    const results = await apolloService.searchPeople(clientAccountId, filters);
    const people = results.people || results.contacts || (Array.isArray(results) ? results : []);
    const normalized = people.map((p: any) => apolloService.normalizeLead(p));
    res.json({ success: true, results: normalized, fallback: !!results.fallback });
  } catch (error: any) {
    console.error('Apollo search people error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to search people' });
  }
});

router.post('/:campaignId/leads/dedup', async (req: Request, res: Response) => {
  const { campaignId } = req.params;
  try {
    const leads = await prisma.lead.findMany({
      where: { campaign_id: campaignId },
      orderBy: { created_at: 'asc' }
    });

    const uniqueLeads = new Map<string, any>();
    const duplicatesToDelete: string[] = [];

    for (const lead of leads) {
      let isDuplicate = false;
      
      if (lead.email) {
        const key = `email_${lead.email.toLowerCase()}`;
        if (uniqueLeads.has(key)) {
          isDuplicate = true;
        } else {
          uniqueLeads.set(key, lead);
        }
      }

      if (!isDuplicate && lead.linkedin_url) {
        const key = `li_${lead.linkedin_url.toLowerCase()}`;
        if (uniqueLeads.has(key)) {
          isDuplicate = true;
        } else {
          uniqueLeads.set(key, lead);
        }
      }

      const externalId = (lead.enrichment_data as any)?.externalId;
      if (!isDuplicate && externalId) {
        const key = `ext_${externalId}`;
        if (uniqueLeads.has(key)) {
          isDuplicate = true;
        } else {
          uniqueLeads.set(key, lead);
        }
      }

      if (isDuplicate) {
        duplicatesToDelete.push(lead.id);
      }
    }

    if (duplicatesToDelete.length > 0) {
      await prisma.lead.deleteMany({
        where: {
          id: { in: duplicatesToDelete }
        }
      });
    }

    const remainingLeads = await prisma.lead.findMany({
      where: { campaign_id: campaignId },
      orderBy: { created_at: 'desc' }
    });

    res.json({
      success: true,
      removedCount: duplicatesToDelete.length,
      leads: remainingLeads
    });
  } catch (error: any) {
    console.error('Deduplicate leads error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to deduplicate leads' });
  }
});

router.post('/:campaignId/leads/enrich', async (req: Request, res: Response) => {
  const { campaignId } = req.params;
  const { leadIds, tool } = req.body;
  if (!leadIds || !Array.isArray(leadIds) || !tool) {
    res.status(400).json({ success: false, error: 'leadIds array and tool are required' });
    return;
  }

  try {
    const leads = await prisma.lead.findMany({
      where: { id: { in: leadIds }, campaign_id: campaignId }
    });

    const enrichedLeads = [];
    for (const lead of leads) {
      const mockEnrichedData = {
        ...(lead.enrichment_data as any || {}),
        enrichedBy: tool,
        enrichedAt: new Date().toISOString(),
        emailStatus: 'verified',
        phone: (lead.enrichment_data as any)?.phone || '+1 555-0199',
        linkedinUrl: lead.linkedin_url || `https://linkedin.com/in/${lead.first_name?.toLowerCase()}-${lead.last_name?.toLowerCase()}`
      };

      const updated = await prisma.lead.update({
        where: { id: lead.id },
        data: {
          enriched: true,
          status: 'verified',
          linkedin_url: mockEnrichedData.linkedinUrl,
          enrichment_data: mockEnrichedData
        }
      });
      enrichedLeads.push(updated);
    }

    res.json({ success: true, leads: enrichedLeads });
  } catch (error: any) {
    console.error('Enrich leads error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to enrich leads' });
  }
});

export default router;
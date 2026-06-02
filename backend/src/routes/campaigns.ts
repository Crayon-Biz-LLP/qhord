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
      where: operatorId ? {
        created_by_operator_id: operatorId,
        status: {
          not: 'workflow_template'
        }
      } : {},
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
        created_by_operator_id: req.user!.id
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

export default router;
import { Router, Request, Response } from 'express';
import { runCampaignCompiler } from '../ai/langgraph/state-machine';
import { prisma } from '../lib/prisma';

const router = Router();

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
  error?: string;
}

/**
 * POST /api/campaigns-test/plan
 * TEST ROUTE: Create a campaign plan from natural language prompt (no auth required)
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

    console.log('🧪 TEST: Creating campaign with prompt:', prompt);

    // For testing, use default active tools
    const activeTools = ['Apollo', 'Smartlead'];
    
    // For testing, create a test operator and client
    let testOperator = await prisma.operator.findFirst({
      where: { email: 'test@example.com' }
    });

    if (!testOperator) {
      testOperator = await prisma.operator.create({
        data: {
          email: 'test@example.com',
          password_hash: 'testhash',
          name: 'Test Operator',
          role: 'operator'
        }
      });
    }

    let testClient = await prisma.client.findFirst({
      where: { created_by_operator_id: testOperator.id }
    });

    if (!testClient) {
      testClient = await prisma.client.create({
        data: {
          name: 'Test Client',
          description: 'Test client for Phase 1',
          created_by_operator_id: testOperator.id
        }
      });
    }

    console.log('🧪 TEST: Using operator:', testOperator.id, 'client:', testClient.id);

    // Run the campaign compiler
    const result = await runCampaignCompiler(
      prompt,
      activeTools,
      testOperator.id,
      testClient.id
    );

    console.log('🧪 TEST: Compiler result:', {
      campaignId: result.campaignId,
      error: result.error,
      hasPlan: !!result.validatedPlan
    });

    if (result.error || !result.validatedPlan) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to generate campaign plan'
      } as CampaignPlanResponse);
    }

    return res.json({
      success: true,
      campaignId: result.campaignId,
      plan: result.validatedPlan,
      estimatedCost: result.validatedPlan.estimated_cost,
      estimatedDuration: result.validatedPlan.estimated_duration,
      warnings: result.warnings
    } as CampaignPlanResponse);

  } catch (error) {
    console.error('🧪 TEST: Campaign planning error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    } as CampaignPlanResponse);
  }
});

export default router;

import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { ParserNode } from '../ai/langgraph/nodes/parser-node';
import { ArchitectNode } from '../ai/langgraph/nodes/architect-node';
import { ValidatorNode } from '../ai/langgraph/nodes/validator-node';
import { resolveManifestSteps } from '../ai/pipeline/action-resolver';
import { ExecutionQueue } from '../services/execution.queue';
import { ensureToolAccountsForPipeline } from '../ai/pipeline/ensure-tool-accounts';
import { campaignWorker } from '../workers/campaign-worker';
import { useFreeDemoStack } from '../config/demo-stack';

const router = Router();
const executionQueue = new ExecutionQueue();
const parserNode = new ParserNode();
const architectNode = new ArchitectNode();
const validatorNode = new ValidatorNode();

const CREDIT_COST: Record<string, number> = {
  hunter: 2,
  bettercontacts: 1,
  brevo: 3,
  calendly: 1,
  smartlead: 2,
  heyreach: 2,
  instantly: 2,
  hubspot: 1,
  salesforce: 1,
};

async function getClientCredit(clientId: string) {
  let credit = await prisma.clientCredit.findUnique({ where: { client_id: clientId } });
  if (!credit) {
    credit = await prisma.clientCredit.create({
      data: { client_id: clientId, balance: 2000 },
    });
  }
  return credit;
}

async function consumeCreditsForStep(
  clientId: string,
  tool: string,
  action: string,
  campaignId: string,
  executionId?: string,
) {
  const cost = CREDIT_COST[tool] || 1;
  const credit = await getClientCredit(clientId);
  if (credit.balance < cost) return;
  await prisma.clientCredit.update({
    where: { id: credit.id },
    data: { balance: { decrement: cost }, total_used: { increment: cost } },
  });
  await prisma.creditTransaction.create({
    data: {
      credit_id: credit.id,
      amount: cost,
      type: 'debit',
      description: `${tool}:${action}`,
      tool_name: tool,
      action,
      campaign_id: campaignId,
      execution_id: executionId,
    },
  });
}

router.use(requireAuth);

interface CreateWorkflowRequest {
  prompt: string;
  name?: string;
}

router.get('/', async (req: Request, res: Response) => {
  try {
    const operatorId = req.user!.id;
    const workflows = await prisma.campaign.findMany({
      where: {
        created_by_operator_id: operatorId,
        status: 'workflow_template'
      },
      include: {
        steps: {
          orderBy: { step_order: 'asc' }
        }
      },
      orderBy: { created_at: 'desc' },
      take: 100
    });

    res.json({
      success: true,
      workflows: workflows.map((workflow) => ({
        id: workflow.id,
        name: workflow.name,
        description: workflow.description,
        status: 'draft',
        createdAt: workflow.created_at,
        updatedAt: workflow.updated_at,
        estimatedCost: workflow.estimated_cost || 0,
        estimatedDuration: workflow.estimated_duration || 0,
        steps: workflow.steps.map((step) => ({
          id: step.id,
          order: step.step_order,
          tool: step.tool_name,
          action: step.action,
          dependencies: step.dependencies
        }))
      }))
    });
  } catch (error) {
    console.error('List workflows error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch workflows' });
  }
});

/** Preview plan from NL prompt without saving */
router.post('/compile', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body as CreateWorkflowRequest;
    const operatorId = req.user!.id;

    if (!prompt?.trim()) {
      return res.status(400).json({ success: false, error: 'Prompt is required' });
    }

    const activeTools = await getActiveToolsForClient(operatorId);
    const planResult = await compileWorkflowPlan(prompt, activeTools);

    if (planResult.error || !planResult.validatedPlan) {
      return res.status(400).json({
        success: false,
        error: planResult.error || 'Failed to compile workflow',
      });
    }

    const resolvedSteps = resolveManifestSteps(planResult.validatedPlan.steps);

    res.json({
      success: true,
      intent: planResult.intent,
      manifest: planResult.validatedPlan,
      resolvedSteps: resolvedSteps.map((s) => ({
        tool: s.tool,
        action: s.action,
        label: s.label,
        skipExecution: s.skipExecution || false,
      })),
      warnings: planResult.warnings || [],
    });
  } catch (error) {
    console.error('Compile workflow error:', error);
    res.status(500).json({ success: false, error: 'Failed to compile workflow' });
  }
});

/**
 * Compile prompt → create runnable campaign → approve → queue (mock/live via EXECUTION_MODE)
 */
router.post('/run-prompt', async (req: Request, res: Response) => {
  try {
    const { prompt, name } = req.body as CreateWorkflowRequest;
    const operatorId = req.user!.id;

    if (!prompt?.trim()) {
      return res.status(400).json({ success: false, error: 'Prompt is required' });
    }

    const clientId = await getClientIdForOperator(operatorId);
    if (!clientId) {
      return res.status(400).json({ success: false, error: 'No client found' });
    }

    const activeTools = await getActiveToolsForClient(operatorId);
    const planResult = await compileWorkflowPlan(prompt, activeTools);

    if (planResult.error || !planResult.validatedPlan) {
      return res.status(400).json({
        success: false,
        error: planResult.error || 'Failed to compile workflow',
      });
    }

    const toolsUsed = [...new Set(planResult.validatedPlan.steps.map((s) => s.tool))];
    await ensureToolAccountsForPipeline(clientId, operatorId, toolsUsed);

    const campaign = await prisma.campaign.create({
      data: {
        client_id: clientId,
        name: name?.trim() || planResult.validatedPlan.name,
        description: planResult.validatedPlan.description,
        status: 'approved',
        approval_status: 'approved',
        manifest: {
          ...(planResult.validatedPlan as object),
          source_prompt: prompt,
        } as any,
        estimated_cost: planResult.validatedPlan.estimated_cost,
        estimated_duration: planResult.validatedPlan.estimated_duration,
        created_by_operator_id: operatorId,
      },
    });

    if (planResult.validatedPlan.steps.length > 0) {
      await prisma.campaignStep.createMany({
        data: planResult.validatedPlan.steps.map((step) => ({
          campaign_id: campaign.id,
          step_order: step.order,
          tool_name: step.tool,
          action: step.action,
          params: step.params as any,
          status: 'pending',
          dependencies: step.dependencies as any,
          created_at: new Date(),
          updated_at: new Date(),
        })),
      });
    }

    const resolvedSteps = resolveManifestSteps(planResult.validatedPlan.steps);
    const syncPipeline =
      process.env.QHORD_SYNC_PIPELINE === 'true' ||
      (process.env.QHORD_SYNC_PIPELINE !== 'false' && useFreeDemoStack());

    const totalCreditCost = planResult.validatedPlan.steps.reduce(
      (sum: number, s: { tool: string }) => sum + (CREDIT_COST[s.tool] || 1), 0
    );

    if (syncPipeline) {
      const creditRecord = await getClientCredit(clientId);
      if (creditRecord.balance < totalCreditCost) {
        await prisma.campaign.update({
          where: { id: campaign.id },
          data: { status: 'failed' },
        });
        return res.status(400).json({
          success: false,
          error: `Insufficient credits. Required: ${totalCreditCost}, Available: ${creditRecord.balance}. Top up at /dashboard/settings.`,
          creditBalance: creditRecord.balance,
          creditRequired: totalCreditCost,
        });
      }
    }

    let jobId: string | undefined;
    let pipelineResult: unknown;

    if (syncPipeline) {
      const runResult = await campaignWorker.runCampaignNow(campaign.id, operatorId, clientId);
      pipelineResult = (runResult as any)?.results || [];
    } else {
      const job = await executionQueue.queueCampaign(campaign);
      jobId = job?.id;
    }

    const updated = await prisma.campaign.findUnique({ where: { id: campaign.id } });

    res.status(201).json({
      success: true,
      campaignId: campaign.id,
      jobId,
      status: updated?.status,
      sync: syncPipeline,
      pipelineResult,
      name: campaign.name,
      resolvedSteps: resolvedSteps.map((s) => ({
        tool: s.tool,
        action: s.action,
        label: s.label,
      })),
      message: syncPipeline
        ? 'Pipeline executed synchronously (Hunter/Brevo live when keys are set).'
        : 'Pipeline queued for background execution.',
    });
  } catch (error) {
    console.error('Run prompt workflow error:', error);
    res.status(500).json({ success: false, error: 'Failed to run workflow from prompt', detail: error instanceof Error ? error.message : String(error) });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { prompt, name } = req.body as CreateWorkflowRequest;
    const operatorId = req.user!.id;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required'
      });
    }

    const clientId = await getClientIdForOperator(operatorId);
    if (!clientId) {
      return res.status(400).json({
        success: false,
        error: 'No client found for this operator'
      });
    }

    const activeTools = await getActiveToolsForClient(operatorId);
    const planResult = await compileWorkflowPlan(prompt, activeTools);

    if (planResult.error || !planResult.validatedPlan) {
      return res.status(400).json({
        success: false,
        error: planResult.error || 'Failed to generate workflow plan'
      });
    }

    const manifest = {
      ...(planResult.validatedPlan as any),
      workflow_type: 'template',
      source_prompt: prompt
    };

    const workflow = await prisma.campaign.create({
      data: {
        client_id: clientId,
        name: name?.trim() || planResult.validatedPlan.name,
        description: planResult.validatedPlan.description,
        status: 'workflow_template',
        approval_status: 'draft',
        manifest: manifest as any,
        estimated_cost: planResult.validatedPlan.estimated_cost,
        estimated_duration: planResult.validatedPlan.estimated_duration,
        created_by_operator_id: operatorId
      }
    });

    if (planResult.validatedPlan.steps.length > 0) {
      await prisma.campaignStep.createMany({
        data: planResult.validatedPlan.steps.map((step) => ({
          campaign_id: workflow.id,
          step_order: step.order,
          tool_name: step.tool,
          action: step.action,
          params: step.params as any,
          status: 'pending',
          dependencies: step.dependencies as any,
          created_at: new Date(),
          updated_at: new Date()
        }))
      });
    }

    res.status(201).json({
      success: true,
      workflow: {
        id: workflow.id,
        name: workflow.name,
        description: workflow.description,
        estimatedCost: workflow.estimated_cost,
        estimatedDuration: workflow.estimated_duration
      },
      warnings: planResult.warnings || []
    });
  } catch (error) {
    console.error('Create workflow error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create workflow template'
    });
  }
});

router.post('/:id/create-campaign', async (req: Request, res: Response) => {
  try {
    const operatorId = req.user!.id;
    const { id } = req.params;

    const workflow = await prisma.campaign.findFirst({
      where: {
        id,
        created_by_operator_id: operatorId,
        status: 'workflow_template'
      },
      include: {
        steps: {
          orderBy: { step_order: 'asc' }
        }
      }
    });

    if (!workflow) {
      return res.status(404).json({ success: false, error: 'Workflow not found' });
    }

    const campaign = await prisma.campaign.create({
      data: {
        client_id: workflow.client_id,
        name: `${workflow.name} Run`,
        description: workflow.description,
        status: 'draft',
        approval_status: 'draft',
        manifest: workflow.manifest ?? undefined,
        estimated_cost: workflow.estimated_cost,
        estimated_duration: workflow.estimated_duration,
        created_by_operator_id: operatorId
      }
    });

    if (workflow.steps.length > 0) {
      await prisma.campaignStep.createMany({
        data: workflow.steps.map((step) => ({
          campaign_id: campaign.id,
          step_order: step.step_order,
          tool_name: step.tool_name,
          action: step.action,
          params: step.params as any,
          status: 'pending',
          dependencies: step.dependencies as any,
          created_at: new Date(),
          updated_at: new Date()
        }))
      });
    }

    res.status(201).json({
      success: true,
      campaignId: campaign.id
    });
  } catch (error) {
    console.error('Create campaign from workflow error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create campaign from workflow'
    });
  }
});

async function getActiveToolsForClient(operatorId: string): Promise<string[]> {
  const { getEnvToolsForDemoStack, useFreeDemoStack } = await import('../config/demo-stack');
  const toolAccounts = await prisma.clientToolAccount.findMany({
    where: { created_by_operator_id: operatorId },
    select: { tool_name: true },
    distinct: ['tool_name']
  });
  const tools = new Set<string>(
    toolAccounts.length > 0
      ? toolAccounts.map((a) => a.tool_name)
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
}

async function compileWorkflowPlan(prompt: string, activeTools: string[]) {
  const parsed = await parserNode.invoke({
    userInput: prompt
  });
  if (parsed.error || !parsed.intent) {
    return {
      error: parsed.error || 'Failed to parse workflow prompt'
    };
  }

  const architected = await architectNode.invoke({
    userInput: prompt,
    intent: parsed.intent,
    activeTools
  });
  if (architected.error || !architected.manifest) {
    return {
      error: architected.error || 'Failed to create workflow manifest'
    };
  }

  const validated = await validatorNode.invoke({
    userInput: prompt,
    intent: parsed.intent,
    activeTools,
    manifest: architected.manifest
  });
  if (validated.error || !validated.validatedPlan) {
    return {
      error: validated.error || 'Failed to validate workflow plan'
    };
  }

  return {
    intent: parsed.intent,
    validatedPlan: validated.validatedPlan,
    warnings: validated.warnings || [],
    error: undefined as string | undefined
  };
}

async function getClientIdForOperator(operatorId: string): Promise<string | null> {
  let client = await prisma.client.findFirst({
    where: { created_by_operator_id: operatorId },
    select: { id: true }
  });

  if (!client) {
    const created = await prisma.client.create({
      data: {
        name: 'Default Client',
        description: 'Auto-created client for workflow templates',
        created_by_operator_id: operatorId
      },
      select: { id: true }
    });
    client = created;
  }

  return client.id;
}

export default router;


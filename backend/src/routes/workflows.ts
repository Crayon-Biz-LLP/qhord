import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { workflowEngine } from '../services/workflowEngine';
import {
  SECRET_PLACEHOLDER,
  sealNodeConfig,
  maskNodeConfig,
  openStoredSecret,
  prepareWebhookRequest,
  executeWebhook,
  describeWebhookError,
  WebhookConfigError,
} from '../services/nodes/webhook-request';

const router = Router();
router.use(requireAuth);

// ── GET /api/workflows ───────────────────────────────────────────
router.get('/', async (req: Request, res: Response) => {
  try {
    const clientId = req.query.clientId as string | undefined;
    const status = req.query.status as string | undefined;
    if (!clientId) return res.status(400).json({ success: false, error: 'clientId query parameter is required' });

    const workflows = await prisma.workflow.findMany({
      where: { 
        client_id: clientId,
        ...(status ? { status } : {})
      },
      orderBy: { created_at: 'desc' },
      take: 100
    });

    res.json({ success: true, workflows });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch workflows' });
  }
});

// ── POST /api/workflows ──────────────────────────────────────────
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, status, clientId, nodes } = req.body;
    const operatorId = req.user!.id;
    if (!clientId) return res.status(400).json({ success: false, error: 'clientId is required' });

    const triggerNode = nodes?.find((n: any) => n.nodeType === 'trigger');

    const wf = await prisma.workflow.create({
      data: {
        name: name || 'Untitled Automation',
        triggerType: triggerNode?.action || 'manual',
        triggerTool: triggerNode?.tool || null,
        status: status || 'draft',
        created_by_operator_id: operatorId,
        client_id: clientId,
        nodes: {
          create: nodes?.map((n: any) => ({
            id: n.id,
            node_type: n.nodeType,
            tool: n.tool,
            action: n.action,
            label: n.label,
            configuration_json: sealNodeConfig(n.tool, n.configurationJson || {}),
            position: n.position || {}
          })) || []
        },
        edges: {
          create: req.body.edges?.map((e: any) => ({
            id: e.id,
            source_node_id: e.source,
            target_node_id: e.target,
            branchKey: e.sourceHandle || e.branchKey,
            conditionJson: e.conditionJson || {}
          })) || []
        }
      }
    });

    res.status(201).json({ success: true, workflow: wf });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to create workflow' });
  }
});

// ── GET /api/workflows/:id ───────────────────────────────────────
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const wf = await prisma.workflow.findUnique({
      where: { id: req.params.id },
      include: { nodes: true, edges: true }
    });
    if (!wf) return res.status(404).json({ success: false, error: 'Workflow not found' });
    const workflow = {
      ...wf,
      nodes: wf.nodes.map(n => ({ ...n, configuration_json: maskNodeConfig(n.tool, n.configuration_json) }))
    };
    res.json({ success: true, workflow });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to fetch workflow' });
  }
});

// ── PUT /api/workflows/:id ───────────────────────────────────────
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, status, nodes } = req.body;
    const triggerNode = nodes?.find((n: any) => n.nodeType === 'trigger');

    const wf = await prisma.workflow.update({
      where: { id: req.params.id },
      data: {
        name,
        status,
        triggerType: triggerNode?.action || 'manual',
        triggerTool: triggerNode?.tool || null
      }
    });

    if (nodes) {
       // Nodes are replaced wholesale below, so grab the stored (encrypted) webhook configs
       // first — an unchanged "saved" secret marker from the UI must resolve back to them.
       const existingWebhookNodes = await prisma.workflowNode.findMany({
         where: { workflow_id: wf.id, tool: 'send_webhook' },
         select: { id: true, configuration_json: true }
       });
       const existingConfigById = new Map(existingWebhookNodes.map(n => [n.id, n.configuration_json as any]));

       await prisma.workflowEdge.deleteMany({ where: { workflow_id: wf.id } });
       await prisma.workflowNode.deleteMany({ where: { workflow_id: wf.id } });
       await prisma.workflowNode.createMany({
          data: nodes.map((n: any) => ({
             id: n.id, // Frontend must provide UUIDs
             workflow_id: wf.id,
             node_type: n.nodeType,
             tool: n.tool,
             action: n.action,
             label: n.label,
             configuration_json: sealNodeConfig(n.tool, n.configurationJson || {}, existingConfigById.get(n.id)),
             position: n.position || {}
          }))
       });

       if (req.body.edges && req.body.edges.length > 0) {
          await prisma.workflowEdge.createMany({
             data: req.body.edges.map((e: any) => ({
                id: e.id,
                workflow_id: wf.id,
                source_node_id: e.source,
                target_node_id: e.target,
                branchKey: e.sourceHandle || e.branchKey,
                conditionJson: e.conditionJson || {}
             }))
          });
       }
    }

    res.json({ success: true, workflow: wf });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update workflow' });
  }
});

// ── POST /api/workflows/test-webhook ─────────────────────────────
// Powers the "Test connection" button on the Send webhook block: sends the request exactly as
// the block is currently configured (including unsaved edits) and reports what came back.
router.post('/test-webhook', async (req: Request, res: Response) => {
  try {
    const { config, workflowId, nodeId } = req.body || {};
    if (!config || typeof config !== 'object') {
      return res.status(400).json({ success: false, error: 'config is required' });
    }

    let secret = '';
    if (config.authSecret === SECRET_PLACEHOLDER) {
      // The browser only holds a marker; resolve the real secret from the operator's own node.
      const stored = workflowId && nodeId
        ? await prisma.workflowNode.findFirst({
            where: { id: nodeId, workflow_id: workflowId, workflow: { created_by_operator_id: req.user!.id } },
            select: { configuration_json: true }
          })
        : null;
      const storedSecret = (stored?.configuration_json as any)?.authSecret;
      if (!storedSecret) {
        return res.status(400).json({ success: false, error: 'No saved secret found for this block. Re-enter it to test.' });
      }
      secret = openStoredSecret(storedSecret);
    } else if (config.authSecret) {
      secret = String(config.authSecret);
    }

    const result = await executeWebhook(prepareWebhookRequest(config, secret));
    const bodyText = typeof result.data === 'string' ? result.data : JSON.stringify(result.data ?? '');

    res.json({
      success: true,
      ok: result.status >= 200 && result.status < 400,
      status: result.status,
      statusText: result.statusText,
      durationMs: result.durationMs,
      bodyPreview: (bodyText || '').slice(0, 1000)
    });
  } catch (error: any) {
    if (error instanceof WebhookConfigError) {
      return res.status(400).json({ success: false, error: error.message });
    }
    // The request itself failed (unreachable host, timeout, blocked address...) — report it to the UI.
    res.json({ success: false, error: describeWebhookError(error) });
  }
});

// ── GET /api/workflows/:id/runs ──────────────────────────────────
router.get('/:id/runs', async (req: Request, res: Response) => {
  try {
    const runs = await prisma.workflowRun.findMany({
      where: { workflow_id: req.params.id },
      orderBy: { startedAt: 'desc' }
    });
    res.json({ success: true, runs });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch runs' });
  }
});

// ── POST /api/workflows/:id/runs ─────────────────────────────────
router.post('/:id/runs', async (req: Request, res: Response) => {
  try {
    const { triggerPayload } = req.body;
    const run = await prisma.workflowRun.create({
      data: {
        workflow_id: req.params.id,
        status: 'pending',
        triggerPayload
      }
    });

    // Fire and forget (in a real app, send to a queue)
    workflowEngine.executeRun(run.id).catch(console.error);

    res.json({ success: true, run });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to start run' });
  }
});

// ── POST /api/workflows/:id/test ─────────────────────────────────
router.post('/:id/test', async (req: Request, res: Response) => {
  try {
    const { triggerPayload } = req.body;
    const run = await prisma.workflowRun.create({
      data: {
        workflow_id: req.params.id,
        status: 'pending',
        triggerPayload
      }
    });

    // Wait for the test execution to complete and get the trace
    const result = await workflowEngine.executeRun(run.id, true);

    res.json({ success: true, run, trace: result?.trace || [], result });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to test workflow' });
  }
});
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.workflow.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Workflow deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete workflow' });
  }
});

export default router;

import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { workflowEngine } from '../services/workflowEngine';

const router = Router();
router.use(requireAuth);

// ── GET /api/workflows ───────────────────────────────────────────
router.get('/', async (req: Request, res: Response) => {
  try {
    const clientId = req.query.clientId as string | undefined;
    if (!clientId) return res.status(400).json({ success: false, error: 'clientId query parameter is required' });

    const workflows = await prisma.workflow.findMany({
      where: { client_id: clientId },
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
            configuration_json: n.configurationJson || {},
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
    res.json({ success: true, workflow: wf });
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
             configuration_json: n.configurationJson || {},
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

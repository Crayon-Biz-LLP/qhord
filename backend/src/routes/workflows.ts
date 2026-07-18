import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { prisma } from '../lib/prisma';

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
            node_type: n.nodeType,
            tool: n.tool,
            action: n.action,
            label: n.label,
            configuration_json: n.configurationJson || {},
            position: n.position || {}
          })) || []
        }
      }
    });

    res.status(201).json({ success: true, workflow: wf });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create workflow' });
  }
});

// ── GET /api/workflows/:id ───────────────────────────────────────
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const wf = await prisma.workflow.findUnique({
      where: { id: req.params.id },
      include: { nodes: true }
    });
    if (!wf) return res.status(404).json({ success: false, error: 'Workflow not found' });
    res.json({ success: true, workflow: wf });
  } catch (error) {
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
       await prisma.workflowNode.deleteMany({ where: { workflow_id: wf.id } });
       await prisma.workflowNode.createMany({
          data: nodes.map((n: any) => ({
             workflow_id: wf.id,
             node_type: n.nodeType,
             tool: n.tool,
             action: n.action,
             label: n.label,
             configuration_json: n.configurationJson || {},
             position: n.position || {}
          }))
       });
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

// ── DELETE /api/workflows/:id ────────────────────────────────────
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.workflow.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Workflow deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete workflow' });
  }
});

export default router;

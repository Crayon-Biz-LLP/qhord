import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth';
import { campaignWorkflowEngine } from '../services/campaign-workflow.engine';
import { emitEvent } from '../services/websocket.service';

const router = Router();

router.use(requireAuth);

// GET /api/pending-approvals — list pending actions for a client
router.get('/', async (req: Request, res: Response) => {
  try {
    const { client_id } = req.query;
    const where: any = { status: 'pending' };
    if (client_id) where.client_id = client_id as string;

    const actions = await prisma.pendingAction.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });

    res.json({ actions });
  } catch (err: any) {
    console.error('Fetch pending approvals error', err);
    res.status(500).json({ message: 'Failed to fetch pending approvals' });
  }
});

// POST /api/pending-approvals/:id/approve
router.post('/:id/approve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const action = await prisma.pendingAction.findUnique({ where: { id } });

    if (!action) {
      res.status(404).json({ message: 'Pending action not found' });
      return;
    }
    if (action.status !== 'pending') {
      res.status(400).json({ message: `Action already ${action.status}` });
      return;
    }

    await prisma.pendingAction.update({
      where: { id },
      data: {
        status: 'approved',
        approved_by: req.user!.id,
      },
    });

    // Resume the workflow run if it was held
    if (action.run_id) {
      await campaignWorkflowEngine.resumeRunAfterApproval(action.run_id, action.node_id!);
    }

    emitEvent('approvals', 'approval:updated', { id: action.id, status: 'approved' });

    // If this action is linked to a campaign, check if all are approved
    if (action.campaign_id) {
      const remaining = await prisma.pendingAction.count({
        where: { campaign_id: action.campaign_id, status: 'pending' },
      });
      if (remaining === 0) {
        await prisma.campaign.update({
          where: { id: action.campaign_id },
          data: { status: 'approved', approval_status: 'approved' },
        });
        emitEvent('campaigns', 'campaign:updated', { campaign_id: action.campaign_id, status: 'approved' });
      }
    }

    res.json({ success: true, message: 'Action approved' });
  } catch (err: any) {
    console.error('Approve action error', err);
    res.status(500).json({ message: 'Failed to approve action' });
  }
});

// POST /api/pending-approvals/:id/reject
router.post('/:id/reject', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body as { reason?: string };
    const action = await prisma.pendingAction.findUnique({ where: { id } });

    if (!action) {
      res.status(404).json({ message: 'Pending action not found' });
      return;
    }
    if (action.status !== 'pending') {
      res.status(400).json({ message: `Action already ${action.status}` });
      return;
    }

    await prisma.pendingAction.update({
      where: { id },
      data: {
        status: 'rejected',
        rejected_by: req.user!.id,
        rejection_reason: reason || null,
      },
    });

    res.json({ success: true, message: 'Action rejected' });
  } catch (err: any) {
    console.error('Reject action error', err);
    res.status(500).json({ message: 'Failed to reject action' });
  }
});

export default router;

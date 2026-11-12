import express from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, requireRole } from '../middleware/auth';
import { ExecutionQueue } from '../services/execution.queue';

const router = express.Router();

// Apply authentication to all routes
router.use(requireAuth);

/**
 * POST /api/execution/trigger
 * Manually trigger execution of approved campaigns. Admin-only: this used
 * to queue every approved campaign on the platform for any authenticated
 * operator who called it — now scoped to the caller's own campaigns, and
 * gated to admins since it's a bulk/operational action.
 */
router.post('/trigger', requireRole(['admin']), async (req: express.Request, res: express.Response) => {
  try {
    const operatorId = req.user!.id;

    console.log('🚀 Manual execution trigger requested by operator:', operatorId);

    // Import execution queue
    const executionQueue = new ExecutionQueue();

    // Trigger execution of this operator's own approved campaigns
    await executionQueue.triggerApprovedCampaigns({ operatorId });
    
    res.json({ 
      success: true, 
      message: 'Execution triggered for approved campaigns' 
    });
    
  } catch (error: any) {
    console.error('❌ Failed to trigger execution:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to trigger execution' 
    });
  }
});

/**
 * GET /api/execution/status/:campaignId
 * Get execution status of a specific campaign
 */
router.get('/status/:campaignId', async (req: express.Request, res: express.Response) => {
  try {
    const { campaignId } = req.params;
    const operatorId = req.user!.id;
    
    // Get campaign with execution status
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        created_by_operator_id: operatorId,
        status: { not: 'workflow_template' }
      }
    });
    
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    
    res.json({ 
      success: true, 
      campaign: {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        created_at: campaign.created_at,
        updated_at: campaign.updated_at
      }
    });
    
  } catch (error: any) {
    console.error('❌ Failed to get execution status:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to get execution status' 
    });
  }
});

export default router;

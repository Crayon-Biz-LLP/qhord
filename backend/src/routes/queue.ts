import { Router, Request, Response } from 'express';
import { ExecutionQueue } from '../services/execution.queue';
import { requireAuth } from '../middleware/auth';

const router = Router();
const executionQueue = new ExecutionQueue();

// Get queue status
router.get('/status', requireAuth, async (req: Request, res: Response) => {
  try {
    const status = await executionQueue.getQueueStatus();
    res.json({ 
      success: true, 
      data: status 
    });
  } catch (error) {
    console.error('Queue status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get queue status' 
    });
  }
});

// Get specific job status
router.get('/jobs/:jobId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const jobStatus = await executionQueue.getJobStatus(jobId);
    
    if (!jobStatus) {
      return res.status(404).json({ 
        success: false, 
        message: 'Job not found' 
      });
    }

    res.json({ 
      success: true, 
      data: jobStatus 
    });
  } catch (error) {
    console.error('Job status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get job status' 
    });
  }
});

// Pause queue (admin only)
router.post('/pause', requireAuth, async (req: Request, res: Response) => {
  try {
    await executionQueue.pauseQueue();
    res.json({ 
      success: true, 
      message: 'Queue paused successfully' 
    });
  } catch (error) {
    console.error('Pause queue error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to pause queue' 
    });
  }
});

// Resume queue (admin only)
router.post('/resume', requireAuth, async (req: Request, res: Response) => {
  try {
    await executionQueue.resumeQueue();
    res.json({ 
      success: true, 
      message: 'Queue resumed successfully' 
    });
  } catch (error) {
    console.error('Resume queue error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to resume queue' 
    });
  }
});

// Clear queue (admin only)
router.post('/clear', requireAuth, async (req: Request, res: Response) => {
  try {
    await executionQueue.clearQueue();
    res.json({ 
      success: true, 
      message: 'Queue cleared successfully' 
    });
  } catch (error) {
    console.error('Clear queue error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to clear queue' 
    });
  }
});

// Trigger approved campaigns (admin only)
router.post('/trigger-approved', requireAuth, async (req: Request, res: Response) => {
  try {
    await executionQueue.triggerApprovedCampaigns();
    res.json({ 
      success: true, 
      message: 'Approved campaigns triggered successfully' 
    });
  } catch (error) {
    console.error('Trigger approved campaigns error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to trigger approved campaigns' 
    });
  }
});

export default router;

import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { SubscriptionService } from '../services/subscription-service.disabled';
import { ToolRegistry } from '../ai/tools/tool-registry';

const router = Router();

// Apply authentication to all routes
router.use(requireAuth);

// Get user's subscription status
router.get('/status', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const subscription = await SubscriptionService.getUserCredits(userId);
    
    res.json({
      success: true,
      subscription
    });
  } catch (error) {
    console.error('Error getting subscription status:', error);
    res.status(500).json({ error: 'Failed to get subscription status' });
  }
});

// Get user's credits
router.get('/credits', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const credits = await SubscriptionService.getUserCredits(userId);
    
    res.json({
      success: true,
      credits
    });
  } catch (error) {
    console.error('Error getting credits:', error);
    res.status(500).json({ error: 'Failed to get credits' });
  }
});

// Get available tools for user's plan
router.get('/tools', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const subscription = await SubscriptionService.getUserCredits(userId);
    
    const availableTools = ['apollo', 'smartlead', 'clay'].map(toolName => {
      const tool = ToolRegistry.getTool(toolName);
      return tool ? {
        name: tool.name,
        description: tool.description,
        category: tool.category,
        actions: tool.actions,
        credit_cost: tool.credit_cost
      } : null;
    }).filter(Boolean);

    res.json({
      success: true,
      tools: availableTools
    });
  } catch (error) {
    console.error('Error getting available tools:', error);
    res.status(500).json({ error: 'Failed to get available tools' });
  }
});

// Check if user can access a specific tool
router.post('/check-tool-access', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { toolName } = req.body;

    if (!toolName) {
      return res.status(400).json({ error: 'Tool name is required' });
    }

    const access = await SubscriptionService.checkToolAccess(userId, toolName);
    
    res.json({
      success: true,
      access
    });
  } catch (error) {
    console.error('Error checking tool access:', error);
    res.status(500).json({ error: 'Failed to check tool access' });
  }
});

// Get usage history
router.get('/usage-history', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 50;
    const history = await SubscriptionService.trackUsage(userId, 0);
    
    res.json({
      success: true,
      history
    });
  } catch (error) {
    console.error('Error getting usage history:', error);
    res.status(500).json({ error: 'Failed to get usage history' });
  }
});

// Get usage statistics
router.get('/usage-stats', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const stats = { total_usage: 100, campaigns_run: 5 };
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error getting usage stats:', error);
    res.status(500).json({ error: 'Failed to get usage stats' });
  }
});

// Get all subscription plans
router.get('/plans', async (req: Request, res: Response) => {
  try {
    const plans = ToolRegistry.getAllTools();
    const subscriptionPlans = ToolRegistry.getSubscriptionPlan('free');
    
    res.json({
      success: true,
      plans: [
        {
          name: 'Free Trial',
          level: 'free',
          credits_per_month: 1000,
          tools_available: ['Apollo'],
          features: ['Basic lead generation', 'Campaign creation', 'Dashboard access'],
          price: 0
        },
        {
          name: 'Starter',
          level: 'starter',
          credits_per_month: 5000,
          tools_available: ['Apollo', 'Smartlead', 'Clay'],
          features: ['Advanced lead generation', 'Email campaigns', 'Data enrichment', 'Analytics'],
          price: 99
        },
        {
          name: 'Pro',
          level: 'pro',
          credits_per_month: 20000,
          tools_available: ['Apollo', 'Smartlead', 'Clay', 'HeyReach'],
          features: ['All tools', 'Multi-channel campaigns', 'Advanced analytics', 'Priority support', 'Custom integrations'],
          price: 299
        }
      ]
    });
  } catch (error) {
    console.error('Error getting subscription plans:', error);
    res.status(500).json({ error: 'Failed to get subscription plans' });
  }
});

// Upgrade subscription (simulated payment)
router.post('/upgrade', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { plan } = req.body;

    if (!plan || !['starter', 'pro'].includes(plan)) {
      return res.status(400).json({ error: 'Valid plan (starter or pro) is required' });
    }

    // Simulate payment processing
    const paymentResult = { success: true, message: 'Payment processed' };
    
    if (paymentResult.success) {
      res.json({
        success: true,
        message: `Successfully upgraded to ${plan} plan`,
        transaction_id: 'txn_12345'
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Payment processing failed'
      });
    }
  } catch (error) {
    console.error('Error upgrading subscription:', error);
    res.status(500).json({ error: 'Failed to upgrade subscription' });
  }
});

// Consume credits for an action
router.post('/consume-credits', async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { action, credits, tool, campaignId } = req.body;

    if (!action || !credits || !tool) {
      return res.status(400).json({ error: 'Action, credits, and tool are required' });
    }

    const success = await SubscriptionService.trackUsage(userId, -credits);
    
    if (success !== undefined) {
      res.json({
        success: true,
        message: `Consumed ${credits} credits for ${action}`
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Insufficient credits or error consuming credits'
      });
    }
  } catch (error) {
    console.error('Error consuming credits:', error);
    res.status(500).json({ error: 'Failed to consume credits' });
  }
});

export default router;

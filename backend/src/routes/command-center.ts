import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { prisma } from '../lib/prisma';

const router = Router();

// Apply authentication to all routes
router.use(requireAuth);

// Get Command Center metrics
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const operatorId = req.user!.id;
    
    // Get campaign statistics
    const campaignStats = await prisma.$queryRaw`
      SELECT 
        COUNT(*) as total_campaigns,
        SUM(CASE WHEN status = 'executing' THEN 1 ELSE 0 END) as active_campaigns,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_campaigns,
        SUM(CASE WHEN status = 'pending_approval' THEN 1 ELSE 0 END) as pending_campaigns,
        AVG(CASE WHEN status = 'completed' THEN estimated_cost ELSE NULL END) as avg_cost
      FROM campaigns 
      WHERE created_by_operator_id = ${operatorId}
    ` as any[];

    const stats = campaignStats[0] || {
      total_campaigns: 0,
      active_campaigns: 0,
      completed_campaigns: 0,
      pending_campaigns: 0,
      avg_cost: 0
    };

    // Calculate GTM Health (based on campaign performance)
    const gtmHealth = stats.active_campaigns > 0 ? 
      Math.min(95, 70 + (stats.completed_campaigns * 5)) : 85;

    // Get execution metrics (mock data for now since table doesn't exist)
    const executionMetrics = {
      total_emails: Math.floor(Math.random() * 2000) + 500,
      total_replies: Math.floor(Math.random() * 100) + 20,
      total_meetings: Math.floor(Math.random() * 50) + 10,
      avg_reply_rate: 3.5,
      pipeline_value: Math.floor(Math.random() * 500000) + 100000,
      at_risk_value: Math.floor(Math.random() * 50000) + 10000
    };

    // Calculate reply rate
    const replyRate = executionMetrics.total_emails > 0 ? 
      (executionMetrics.total_replies / executionMetrics.total_emails * 100) : 0;

    const metrics = {
      kpis: [
        { 
          label: "GTM HEALTH", 
          value: `${gtmHealth}%`, 
          change: stats.active_campaigns > 0 ? "+2%" : "0%", 
          trend: "up" 
        },
        { 
          label: "ACTIVE", 
          value: stats.active_campaigns.toString(), 
          change: `${stats.active_campaigns} running`, 
          trend: "neutral" 
        },
        { 
          label: "REPLY RATE", 
          value: `${replyRate.toFixed(1)}%`, 
          change: "+1.2% vs last week", 
          trend: "up" 
        },
        { 
          label: "MEETINGS", 
          value: executionMetrics.total_meetings.toString(), 
          change: "+3 today", 
          trend: "up" 
        },
        { 
          label: "PIPELINE", 
          value: `$${Math.floor(executionMetrics.pipeline_value / 1000)}K`, 
          change: `+$${Math.floor(executionMetrics.pipeline_value * 0.1 / 1000)}K this week`, 
          trend: "up" 
        },
        { 
          label: "AT RISK", 
          value: `$${Math.floor(executionMetrics.at_risk_value / 1000)}K`, 
          change: "2 campaigns", 
          trend: "down" 
        },
        { 
          label: "DELIVERABILITY", 
          value: "98.2%", 
          change: "Healthy", 
          trend: "neutral" 
        },
        { 
          label: "UNLOCKED", 
          value: `$${Math.floor(executionMetrics.at_risk_value * 0.8 / 1000)}K`, 
          change: "Recoverable", 
          trend: "up" 
        }
      ],
      aiOperator: {
        status: "Online",
        mode: "Assisted",
        protectedRevenue: `$${Math.floor(executionMetrics.pipeline_value * 0.8)}`,
        unlockedRevenue: `$${Math.floor(executionMetrics.at_risk_value * 0.8)}`,
        safeActions: stats.active_campaigns + 2,
        risksAvoided: Math.floor(Math.random() * 5) + 1
      }
    };

    res.json({
      success: true,
      metrics
    });
  } catch (error) {
    console.error('Error getting command center metrics:', error);
    res.status(500).json({ error: 'Failed to fetch command center metrics' });
  }
});

// Get priorities (high-risk campaigns/issues)
router.get('/priorities', async (req: Request, res: Response) => {
  try {
    const operatorId = req.user!.id;
    
    // Get campaigns that need attention
    const campaigns = await prisma.$queryRaw`
      SELECT 
        id,
        name,
        status,
        estimated_cost,
        created_at,
        updated_at
      FROM campaigns 
      WHERE created_by_operator_id = ${operatorId}
        AND (status = 'pending_approval' OR status = 'failed' OR updated_at < NOW() - INTERVAL '7 days')
      ORDER BY updated_at DESC
      LIMIT 5
    ` as any[];

    const priorities = campaigns.map((campaign: any, index: number) => {
      const riskLevel = campaign.status === 'failed' ? 'HIGH RISK' : 
                       campaign.status === 'pending_approval' ? 'MEDIUM' : 'LOW';
      
      const entity = campaign.name || `Campaign ${campaign.id.substring(0, 8)}`;
      const title = campaign.status === 'failed' ? 'Campaign failed - needs attention' :
                   campaign.status === 'pending_approval' ? 'Awaiting approval' :
                   'Campaign inactive for 7+ days';
      
      const impact = campaign.status === 'failed' ? `$${Math.floor(campaign.estimated_cost * 0.8)} pipeline at risk` :
                    campaign.status === 'pending_approval' ? `$${Math.floor(campaign.estimated_cost)} pending approval` :
                    `Stalled campaign worth $${Math.floor(campaign.estimated_cost)}`;

      return {
        id: campaign.id,
        type: riskLevel,
        entity,
        title,
        impact,
        color: riskLevel === 'HIGH RISK' ? 'text-red-500' : 
               riskLevel === 'MEDIUM' ? 'text-[#D4AF37]' : 'text-blue-500',
        bg: riskLevel === 'HIGH RISK' ? 'bg-red-50' : 
             riskLevel === 'MEDIUM' ? 'bg-brand-gold/5' : 'bg-blue-50'
      };
    });

    // Add some system priorities if no campaign priorities
    if (priorities.length === 0) {
      priorities.push(
        {
          id: 'system-1',
          type: 'MEDIUM',
          entity: 'System',
          title: 'Review campaign performance',
          impact: 'Optimize active campaigns for better results',
          color: 'text-[#D4AF37]',
          bg: 'bg-brand-gold/5'
        }
      );
    }

    res.json({
      success: true,
      priorities
    });
  } catch (error) {
    console.error('Error getting priorities:', error);
    res.status(500).json({ error: 'Failed to fetch priorities' });
  }
});

// Get recommendations
router.get('/recommendations', async (req: Request, res: Response) => {
  try {
    const operatorId = req.user!.id;
    
    // Get active campaigns for recommendations
    const activeCampaigns = await prisma.$queryRaw`
      SELECT 
        id,
        name,
        status,
        estimated_cost
      FROM campaigns 
      WHERE created_by_operator_id = ${operatorId}
        AND status = 'executing'
      ORDER BY created_at DESC
      LIMIT 3
    ` as any[];

    const recommendations = activeCampaigns.map((campaign: any) => {
      const entity = campaign.name || `Campaign ${campaign.id.substring(0, 8)}`;
      
      // Generate recommendations based on campaign status
      const recommendations = [
        {
          entity,
          title: 'Increase volume +15%',
          impact: 'Performance above benchmark',
          benefit: `+$${Math.floor(campaign.estimated_cost * 0.15)}K estimated pipeline`,
          icon: 'TrendingUp'
        },
        {
          entity,
          title: 'Optimize send time',
          impact: 'Better engagement rates',
          benefit: '+$${Math.floor(campaign.estimated_cost * 0.1)}K estimated pipeline',
          icon: 'Clock'
        }
      ];

      return recommendations[Math.floor(Math.random() * recommendations.length)];
    });

    // Add system recommendation if no active campaigns
    if (recommendations.length === 0) {
      recommendations.push({
        entity: 'System',
        title: 'Create new campaign',
        impact: 'No active campaigns',
        benefit: 'Start generating pipeline value',
        icon: 'Plus'
      });
    }

    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// Get live activity
router.get('/live-activity', async (req: Request, res: Response) => {
  try {
    const operatorId = req.user!.id;
    
    // Get recent campaign activity
    const recentCampaigns = await prisma.$queryRaw`
      SELECT 
        id,
        name,
        status,
        created_at,
        updated_at
      FROM campaigns 
      WHERE created_by_operator_id = ${operatorId}
        AND updated_at >= NOW() - INTERVAL '24 hours'
      ORDER BY updated_at DESC
      LIMIT 5
    ` as any[];

    const liveActivity = recentCampaigns.map((campaign: any) => {
      const entity = campaign.name || `Campaign ${campaign.id.substring(0, 8)}`;
      const timeDiff = Date.now() - new Date(campaign.updated_at).getTime();
      const minutesAgo = Math.floor(timeDiff / (1000 * 60));
      
      let activity = '';
      let icon = 'Activity';
      let type = 'info';
      
      if (campaign.status === 'executing') {
        activity = 'Campaign started execution';
        icon = 'Play';
      } else if (campaign.status === 'completed') {
        activity = 'Campaign completed successfully';
        icon = 'CheckCircle';
      } else if (campaign.status === 'failed') {
        activity = 'Campaign execution failed';
        icon = 'XCircle';
        type = 'error';
      } else {
        activity = 'Campaign status updated';
        icon = 'RefreshCw';
      }

      return {
        icon,
        entity,
        text: activity,
        time: minutesAgo < 60 ? `${minutesAgo}m ago` : `${Math.floor(minutesAgo / 60)}h ago`,
        type
      };
    });

    // Add mock system activity if no recent activity
    if (liveActivity.length === 0) {
      liveActivity.push(
        {
          icon: 'Search',
          entity: 'System',
          text: 'AI Engine processing campaign requests',
          time: '2m ago',
          type: 'info'
        },
        {
          icon: 'Zap',
          entity: 'System',
          text: 'Execution queue monitoring active campaigns',
          time: '5m ago',
          type: 'info'
        }
      );
    }

    res.json({
      success: true,
      liveActivity
    });
  } catch (error) {
    console.error('Error getting live activity:', error);
    res.status(500).json({ error: 'Failed to fetch live activity' });
  }
});

// Get campaign health table
router.get('/health-table', async (req: Request, res: Response) => {
  try {
    const operatorId = req.user!.id;
    
    // Get recent campaigns with health data
    const campaigns = await prisma.$queryRaw`
      SELECT 
        id,
        name,
        status,
        estimated_cost,
        created_at,
        updated_at
      FROM campaigns 
      WHERE created_by_operator_id = ${operatorId}
      ORDER BY updated_at DESC
      LIMIT 10
    ` as any[];

    const healthTable = campaigns.map((campaign: any) => {
      const name = campaign.name || `Campaign ${campaign.id.substring(0, 8)}`;
      const status = campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1);
      
      // Calculate mock health based on status
      let health = '—';
      if (campaign.status === 'executing') {
        health = `${Math.floor(Math.random() * 20) + 75}%`;
      } else if (campaign.status === 'completed') {
        health = `${Math.floor(Math.random() * 15) + 85}%`;
      } else if (campaign.status === 'failed') {
        health = `${Math.floor(Math.random() * 30) + 40}%`;
      }
      
      // Mock tools based on campaign name
      const tools = name.toLowerCase().includes('email') ? ['Smartlead'] :
                   name.toLowerCase().includes('lead') ? ['Apollo'] :
                   name.toLowerCase().includes('enrich') ? ['Clay'] :
                   ['Apollo', 'Smartlead'];
      
      // Mock metrics
      const replies = campaign.status === 'completed' ? Math.floor(Math.random() * 50) + 10 : 0;
      const meetings = campaign.status === 'completed' ? Math.floor(Math.random() * 10) + 1 : 0;
      const pipeline = campaign.status === 'completed' ? `$${Math.floor(campaign.estimated_cost * 0.8 / 1000)}K` : '—';

      return {
        name,
        status,
        health,
        tools,
        replies,
        mtgs: meetings,
        pipeline
      };
    });

    res.json({
      success: true,
      healthTable
    });
  } catch (error) {
    console.error('Error getting health table:', error);
    res.status(500).json({ error: 'Failed to fetch health table' });
  }
});

export default router;

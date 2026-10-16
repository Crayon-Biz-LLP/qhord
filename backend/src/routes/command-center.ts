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

    // Calculate GTM Health (based on real campaign performance)
    const gtmHealth = stats.active_campaigns > 0 ?
      Math.min(95, 70 + (stats.completed_campaigns * 5)) : 85;

    // Real pipeline/at-risk figures from Deals tied to this operator's clients.
    // Deal.amount is free-text ("$50K", "1200", ...) — same parsing the
    // Pipeline page already uses for its own totals.
    const parseAmount = (amt: string | null | undefined): number => {
      if (!amt) return 0;
      const clean = amt.replace(/[^0-9.]/g, '');
      let val = parseFloat(clean) || 0;
      const lower = amt.toLowerCase();
      if (lower.includes('k')) val *= 1000;
      if (lower.includes('m')) val *= 1000000;
      return val;
    };

    const deals = await prisma.deal.findMany({
      where: { client: { created_by_operator_id: operatorId } },
      select: { amount: true, health: true }
    });

    const pipelineValue = deals.reduce((sum, d) => sum + parseAmount(d.amount), 0);
    const atRiskDeals = deals.filter((d) => d.health < 50);
    const atRiskValue = atRiskDeals.reduce((sum, d) => sum + parseAmount(d.amount), 0);

    // Reply rate, meetings and deliverability have no real tracking source
    // yet (no reply/meeting aggregation exists across campaigns) — shown
    // honestly as "not tracked" rather than a fabricated number.
    const metrics = {
      kpis: [
        {
          label: "GTM HEALTH",
          value: `${gtmHealth}%`,
          change: stats.active_campaigns > 0 ? "Based on active campaigns" : "No active campaigns",
          trend: "up"
        },
        {
          label: "ACTIVE",
          value: stats.active_campaigns.toString(),
          change: `${stats.active_campaigns} running`,
          trend: "neutral"
        },
        {
          label: "COMPLETED",
          value: stats.completed_campaigns.toString(),
          change: `${stats.total_campaigns} total`,
          trend: "neutral"
        },
        {
          label: "PIPELINE",
          value: pipelineValue > 0 ? `$${Math.floor(pipelineValue / 1000)}K` : "—",
          change: deals.length > 0 ? `${deals.length} deal(s)` : "No deals yet",
          trend: "neutral"
        },
        {
          label: "AT RISK",
          value: atRiskValue > 0 ? `$${Math.floor(atRiskValue / 1000)}K` : "—",
          change: atRiskDeals.length > 0 ? `${atRiskDeals.length} deal(s) below 50% health` : "None flagged",
          trend: atRiskValue > 0 ? "down" : "neutral"
        },
        {
          label: "REPLY RATE",
          value: "—",
          change: "Not tracked yet",
          trend: "neutral"
        },
        {
          label: "MEETINGS",
          value: "—",
          change: "Not tracked yet",
          trend: "neutral"
        },
        {
          label: "DELIVERABILITY",
          value: "—",
          change: "Not tracked yet",
          trend: "neutral"
        }
      ]
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

    const campaigns = await prisma.campaign.findMany({
      where: { created_by_operator_id: operatorId, status: { not: 'workflow_template' } },
      orderBy: { updated_at: 'desc' },
      take: 10,
      include: {
        steps: { select: { tool_name: true } },
        deals: { select: { amount: true } }
      }
    });

    const parseAmount = (amt: string | null | undefined): number => {
      if (!amt) return 0;
      const clean = amt.replace(/[^0-9.]/g, '');
      let val = parseFloat(clean) || 0;
      const lower = amt.toLowerCase();
      if (lower.includes('k')) val *= 1000;
      if (lower.includes('m')) val *= 1000000;
      return val;
    };

    const healthTable = campaigns.map((campaign) => {
      const name = campaign.name || `Campaign ${campaign.id.substring(0, 8)}`;
      const status = campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1);

      // Real tools this campaign actually uses, from its own steps —
      // not guessed from the campaign's name.
      const tools = [...new Set(campaign.steps.map((s) => s.tool_name))];

      const pipelineValue = campaign.deals.reduce((sum, d) => sum + parseAmount(d.amount), 0);

      return {
        name,
        status,
        // No deliverability/bounce/reply tracking exists yet to compute a
        // real health score — shown honestly rather than randomized.
        health: '—',
        tools: tools.length > 0 ? tools : ['—'],
        replies: 0,
        mtgs: 0,
        pipeline: pipelineValue > 0 ? `$${Math.floor(pipelineValue / 1000)}K` : '—'
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

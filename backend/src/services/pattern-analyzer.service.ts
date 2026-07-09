import { prisma } from '../lib/prisma';

interface ToolPattern {
  tool: string;
  count: number;
  successRate: number;
  avgRating: number;
}

interface TimePattern {
  hour: number;
  dayOfWeek: number;
  campaignCount: number;
}

interface ICPCluster {
  industries: string[];
  campaignCount: number;
  avgSuccessRate: number;
  commonTools: string[];
}

interface PatternAnalysis {
  totalCampaigns: number;
  toolPatterns: ToolPattern[];
  timePatterns: TimePattern[];
  icpClusters: ICPCluster[];
  recurringToolChains: { chain: string; count: number; avgRating: number }[];
  recommendations: string[];
}

export class PatternAnalyzerService {
  async analyze(workspaceId: string): Promise<PatternAnalysis> {
    const operators = await prisma.operator.findMany({ where: { workspace_id: workspaceId } });
    const operatorIds = operators.map((o) => o.id);

    const campaigns = await prisma.campaign.findMany({
      where: { created_by_operator_id: { in: operatorIds } },
      include: {
        steps: true,
        client: { select: { industry: true } },
      },
      orderBy: { created_at: 'desc' },
      take: 200,
    });

    const campaignIds = campaigns.map((c) => c.id);
    const feedbackLogs = await prisma.feedbackLog.findMany({
      where: { execution_log: { campaign_id: { in: campaignIds } } },
      include: { execution_log: { select: { campaign_id: true } } },
    });

    const feedbackByCampaign = new Map<string, number[]>();
    for (const f of feedbackLogs) {
      const cId = f.execution_log.campaign_id;
      if (cId) {
        const ratings = feedbackByCampaign.get(cId) || [];
        ratings.push(f.rating);
        feedbackByCampaign.set(cId, ratings);
      }
    }

    const toolMap = new Map<string, { count: number; successes: number; totalRating: number; ratingCount: number }>();
    for (const c of campaigns) {
      const usedTools = new Set<string>();
      for (const s of c.steps) usedTools.add(s.tool_name);

      const ratings = feedbackByCampaign.get(c.id) || [];
      const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

      for (const tool of usedTools) {
        const entry = toolMap.get(tool) || { count: 0, successes: 0, totalRating: 0, ratingCount: 0 };
        entry.count++;
        if (c.status === 'completed' || c.status === 'approved') entry.successes++;
        if (ratings.length > 0) {
          entry.totalRating += avgRating;
          entry.ratingCount++;
        }
        toolMap.set(tool, entry);
      }
    }

    const toolPatterns: ToolPattern[] = [...toolMap.entries()]
      .map(([tool, d]) => ({
        tool,
        count: d.count,
        successRate: d.count > 0 ? d.successes / d.count : 0,
        avgRating: d.ratingCount > 0 ? Math.round((d.totalRating / d.ratingCount) * 10) / 10 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const timeMap = new Map<string, Set<string>>();
    for (const c of campaigns) {
      const d = new Date(c.created_at);
      const key = `${d.getHours()}-${d.getDay()}`;
      const set = timeMap.get(key) || new Set<string>();
      set.add(c.id);
      timeMap.set(key, set);
    }
    const timePatterns: TimePattern[] = [...timeMap.entries()]
      .map(([key, set]) => {
        const [hour, dayOfWeek] = key.split('-').map(Number);
        return { hour, dayOfWeek, campaignCount: set.size };
      })
      .sort((a, b) => b.campaignCount - a.campaignCount)
      .slice(0, 10);

    const icpMap = new Map<string, { industries: Set<string>; campaignSet: Set<string>; successes: number }>();
    for (const c of campaigns) {
      const industry = c.client?.industry || 'Unknown';
      const entry = icpMap.get(industry) || { industries: new Set<string>(), campaignSet: new Set<string>(), successes: 0 };
      entry.industries.add(industry);
      entry.campaignSet.add(c.id);
      if (c.status === 'completed' || c.status === 'approved') entry.successes++;
      icpMap.set(industry, entry);
    }
    const icpClusters: ICPCluster[] = [...icpMap.entries()].map(([key, entry]) => {
      const toolFreq = new Map<string, number>();
      for (const cId of entry.campaignSet) {
        const c = campaigns.find((x) => x.id === cId);
        if (c) for (const s of c.steps) toolFreq.set(s.tool_name, (toolFreq.get(s.tool_name) || 0) + 1);
      }
      return {
        industries: [...entry.industries],
        campaignCount: entry.campaignSet.size,
        avgSuccessRate: entry.campaignSet.size > 0 ? entry.successes / entry.campaignSet.size : 0,
        commonTools: [...toolFreq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t]) => t),
      };
    }).sort((a, b) => b.campaignCount - a.campaignCount);

    const chainMap = new Map<string, { count: number; totalRating: number; ratingCount: number }>();
    for (const c of campaigns) {
      const chain = c.steps.map((s) => s.tool_name).join(' → ');
      if (chain) {
        const entry = chainMap.get(chain) || { count: 0, totalRating: 0, ratingCount: 0 };
        entry.count++;
        const ratings = feedbackByCampaign.get(c.id) || [];
        if (ratings.length > 0) {
          const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
          entry.totalRating += avg;
          entry.ratingCount++;
        }
        chainMap.set(chain, entry);
      }
    }
    const recurringToolChains = [...chainMap.entries()]
      .filter(([, d]) => d.count > 1)
      .map(([chain, d]) => ({
        chain,
        count: d.count,
        avgRating: d.ratingCount > 0 ? Math.round((d.totalRating / d.ratingCount) * 10) / 10 : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const recommendations: string[] = [];
    if (toolPatterns.length > 0) {
      const best = toolPatterns[0];
      recommendations.push(`Highest usage tool: "${best.tool}" (${best.count} campaigns, ${(best.successRate * 100).toFixed(0)}% success).`);
    }
    const highSuccess = toolPatterns.filter((t) => t.successRate >= 0.8 && t.count >= 3);
    if (highSuccess.length > 0) {
      recommendations.push(`High-success tools: ${highSuccess.map((t) => `"${t.tool}"`).join(', ')} — consider using these more.`);
    }
    const lowSuccess = toolPatterns.filter((t) => t.successRate < 0.4 && t.count >= 2);
    if (lowSuccess.length > 0) {
      recommendations.push(`Low-success tools: ${lowSuccess.map((t) => `"${t.tool}"`).join(', ')} — review configuration or consider alternatives.`);
    }
    const bestChain = recurringToolChains[0];
    if (bestChain) {
      recommendations.push(`Best performing tool chain: "${bestChain.chain}" (${bestChain.count} uses, rating ${bestChain.avgRating}/5).`);
    }
    if (recommendations.length === 0) {
      recommendations.push('Not enough campaign data for pattern-based recommendations. Create more campaigns to unlock insights.');
    }

    return { totalCampaigns: campaigns.length, toolPatterns, timePatterns, icpClusters, recurringToolChains, recommendations };
  }
}

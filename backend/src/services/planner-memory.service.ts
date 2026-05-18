import { prisma } from '../lib/prisma';

interface MemoryInsight {
  summary: string;
  recommendedTools: string[];
  confidence: number;
  basedOnCampaigns: number;
  suggestions: string[];
}

export class PlannerMemoryService {
  async getInsights(operatorId: string, prompt: string, activeTools: string[]): Promise<MemoryInsight> {
    const campaigns = await prisma.campaign.findMany({
      where: {
        created_by_operator_id: operatorId,
        status: {
          not: 'workflow_template'
        }
      },
      include: {
        steps: true
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 30
    });

    if (campaigns.length === 0) {
      return {
        summary: 'No prior campaign history found yet. Using prompt-first planning.',
        recommendedTools: activeTools.slice(0, 2),
        confidence: 0.2,
        basedOnCampaigns: 0,
        suggestions: [
          'Start with Apollo for sourcing and Smartlead for outreach.',
          'Create 2-3 campaign runs so memory can personalize recommendations.'
        ]
      };
    }

    const toolCounts = new Map<string, number>();
    let completed = 0;
    let failed = 0;

    for (const campaign of campaigns) {
      if (campaign.status === 'completed') completed += 1;
      if (campaign.status === 'failed') failed += 1;
      for (const step of campaign.steps) {
        toolCounts.set(step.tool_name, (toolCounts.get(step.tool_name) || 0) + 1);
      }
    }

    const sortedTools = [...toolCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([tool]) => tool)
      .filter((tool) => activeTools.includes(tool));

    const recommendedTools = sortedTools.length > 0 ? sortedTools.slice(0, 3) : activeTools.slice(0, 3);
    const successRate = completed + failed > 0 ? completed / (completed + failed) : 0.5;
    const confidence = Math.min(0.95, 0.35 + campaigns.length * 0.02);

    const promptLower = prompt.toLowerCase();
    const suggestions: string[] = [];
    if (promptLower.includes('enrich') && !activeTools.includes('Clay')) {
      suggestions.push('Prompt asks for enrichment, but Clay is not active. Enable Clay for higher-quality results.');
    }
    if (promptLower.includes('email') && !activeTools.includes('Smartlead')) {
      suggestions.push('Prompt asks for email outreach, but Smartlead is not active.');
    }
    if (suggestions.length === 0) {
      suggestions.push(`Top historical tools for this operator: ${recommendedTools.join(', ')}.`);
      suggestions.push(`Historical completion trend: ${(successRate * 100).toFixed(0)}% success on finished runs.`);
    }

    return {
      summary: `Memory analyzed ${campaigns.length} past campaigns to personalize this plan.`,
      recommendedTools,
      confidence: Number(confidence.toFixed(2)),
      basedOnCampaigns: campaigns.length,
      suggestions
    };
  }
}


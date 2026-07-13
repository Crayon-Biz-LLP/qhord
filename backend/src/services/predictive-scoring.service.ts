import { prisma } from '../lib/prisma';
import { AiProviderFactory } from '../ai/providers/ai-provider.factory';

interface CampaignScoreResult {
  campaignId: string;
  overallScore: number;
  confidence: number;
  deliverabilityScore: number;
  engagementScore: number;
  conversionScore: number;
  riskScore: number;
  recommendations: string[];
}

interface HistoricalData {
  avgOpenRate: number;
  avgReplyRate: number;
  avgConversionRate: number;
  avgBounceRate: number;
  totalCampaigns: number;
  topPerformingTools: string[];
  worstPerformingTools: string[];
}

export class PredictiveScoringService {
  async getHistoricalData(workspaceId: string): Promise<HistoricalData> {
    const operators = await prisma.operator.findMany({ where: { workspace_id: workspaceId } });
    const operatorIds = operators.map((o) => o.id);

    const campaigns = await prisma.campaign.findMany({
      where: { created_by_operator_id: { in: operatorIds }, status: 'completed' },
      include: { steps: true },
      take: 100,
    });

    if (campaigns.length === 0) {
      return {
        avgOpenRate: 0.25,
        avgReplyRate: 0.05,
        avgConversionRate: 0.02,
        avgBounceRate: 0.03,
        totalCampaigns: 0,
        topPerformingTools: [],
        worstPerformingTools: [],
      };
    }

    const toolPerformance = new Map<string, { success: number; total: number }>();

    for (const c of campaigns) {
      for (const s of c.steps) {
        if (!toolPerformance.has(s.tool_name)) {
          toolPerformance.set(s.tool_name, { success: 0, total: 0 });
        }
        const data = toolPerformance.get(s.tool_name)!;
        data.total++;
        if (s.status === 'completed') data.success++;
      }
    }

    const sortedTools = [...toolPerformance.entries()]
      .map(([tool, data]) => ({ tool, rate: data.success / data.total }))
      .sort((a, b) => b.rate - a.rate);

    return {
      avgOpenRate: 0.25,
      avgReplyRate: 0.05,
      avgConversionRate: 0.02,
      avgBounceRate: 0.03,
      totalCampaigns: campaigns.length,
      topPerformingTools: sortedTools.slice(0, 3).map((t) => t.tool),
      worstPerformingTools: sortedTools.slice(-3).map((t) => t.tool),
    };
  }

  async scoreCampaign(campaignId: string): Promise<CampaignScoreResult> {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { steps: true, client: true },
    });

    if (!campaign) throw new Error('Campaign not found');

    const historical = await this.getHistoricalData(campaign.client ? await this.getWorkspaceId(campaign.client_id) : '');

    const toolNames = campaign.steps.map((s) => s.tool_name);
    const hasEmailTool = toolNames.some((t) => ['smartlead', 'instantly', 'heyreach'].includes(t));
    const hasEnrichmentTool = toolNames.some((t) => ['apollo', 'clay', 'bettercontact'].includes(t));
    const hasLinkedInTool = toolNames.some((t) => t === 'linkedin');
    const stepCount = campaign.steps.length;

    let deliverabilityScore = 50;
    if (hasEmailTool) deliverabilityScore += 20;
    if (hasEnrichmentTool) deliverabilityScore += 15;
    if (stepCount >= 3) deliverabilityScore += 10;
    if (campaign.steps.some((s) => s.tool_name === 'bettercontact')) deliverabilityScore += 10;
    deliverabilityScore = Math.min(100, deliverabilityScore);

    let engagementScore = 40;
    if (hasLinkedInTool) engagementScore += 20;
    if (hasEmailTool) engagementScore += 15;
    if (stepCount >= 4) engagementScore += 10;
    if (campaign.steps.some((s) => s.tool_name === 'calendly')) engagementScore += 10;
    engagementScore = Math.min(100, engagementScore);

    let conversionScore = 30;
    if (hasEmailTool && hasEnrichmentTool) conversionScore += 25;
    if (stepCount >= 5) conversionScore += 15;
    if (campaign.steps.some((s) => s.tool_name === 'calendly')) conversionScore += 15;
    conversionScore = Math.min(100, conversionScore);

    let riskScore = 50;
    if (stepCount < 3) riskScore += 20;
    if (!hasEmailTool) riskScore += 15;
    if (stepCount > 8) riskScore += 10;
    riskScore = Math.min(100, riskScore);

    const overallScore = Math.round(
      deliverabilityScore * 0.3 +
      engagementScore * 0.3 +
      conversionScore * 0.25 +
      (100 - riskScore) * 0.15,
    );

    const recommendations: string[] = [];

    if (!hasEmailTool) {
      recommendations.push('Add an email sending tool (Smartlead, Instantly, or HeyReach) for better reach');
    }
    if (!hasEnrichmentTool) {
      recommendations.push('Add an enrichment tool (Apollo, Clay, or BetterContact) to improve data quality');
    }
    if (stepCount < 3) {
      recommendations.push('Consider adding more steps to increase touchpoints');
    }
    if (stepCount > 7) {
      recommendations.push('Workflow is complex - consider simplifying to reduce failure points');
    }
    if (!hasLinkedInTool) {
      recommendations.push('Add LinkedIn outreach for multi-channel engagement');
    }
    if (deliverabilityScore < 60) {
      recommendations.push('Improve deliverability by adding email verification step');
    }
    if (engagementScore < 50) {
      recommendations.push('Add personalization steps to increase engagement');
    }

    const confidence = Math.min(0.95, 0.5 + (historical.totalCampaigns / 50) * 0.45);

    const score = await prisma.campaignScore.upsert({
      where: { campaign_id: campaignId },
      update: {
        overall_score: overallScore,
        confidence,
        deliverability_score: deliverabilityScore,
        engagement_score: engagementScore,
        conversion_score: conversionScore,
        risk_score: riskScore,
        recommendations,
      },
      create: {
        campaign_id: campaignId,
        overall_score: overallScore,
        confidence,
        deliverability_score: deliverabilityScore,
        engagement_score: engagementScore,
        conversion_score: conversionScore,
        risk_score: riskScore,
        recommendations,
      },
    });

    return {
      campaignId,
      overallScore,
      confidence,
      deliverabilityScore,
      engagementScore,
      conversionScore,
      riskScore,
      recommendations,
    };
  }

  async getScore(campaignId: string): Promise<CampaignScoreResult | null> {
    const score = await prisma.campaignScore.findUnique({
      where: { campaign_id: campaignId },
    });

    if (!score) return null;

    return {
      campaignId: score.campaign_id,
      overallScore: score.overall_score,
      confidence: score.confidence,
      deliverabilityScore: score.deliverability_score,
      engagementScore: score.engagement_score,
      conversionScore: score.conversion_score,
      riskScore: score.risk_score,
      recommendations: score.recommendations as string[],
    };
  }

  async getTopRecommendations(workspaceId: string, limit = 5): Promise<string[]> {
    const operators = await prisma.operator.findMany({ where: { workspace_id: workspaceId } });
    const operatorIds = operators.map((o) => o.id);

    const scores = await prisma.campaignScore.findMany({
      where: {
        campaign: { created_by_operator_id: { in: operatorIds } },
      },
      orderBy: { overall_score: 'asc' },
      take: limit,
    });

    const allRecommendations = scores.flatMap((s) => s.recommendations as string[]);
    const uniqueRecommendations = [...new Set(allRecommendations)];

    return uniqueRecommendations.slice(0, 10);
  }

  private async getWorkspaceId(clientId: string): Promise<string> {
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) return '';

    const operator = await prisma.operator.findUnique({ where: { id: client.created_by_operator_id } });
    return operator?.workspace_id || '';
  }
}

export const predictiveScoringService = new PredictiveScoringService();

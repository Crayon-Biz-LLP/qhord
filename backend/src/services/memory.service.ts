import { prisma } from '../lib/prisma';

interface MemoryContext {
  workspaceId: string;
  preferences: Record<string, any>;
  conversationHistory: { role: string; content: string; createdAt: Date }[];
  feedbackSummary: { total: number; avgRating: number; recentComments: string[] };
  campaignStats: { total: number; completed: number; failed: number; topTools: string[] };
  lastConsolidation: { at: Date | null; patternsFound: number };
}

export class MemoryService {
  async getMemoryContext(workspaceId: string): Promise<MemoryContext> {
    const operators = await prisma.operator.findMany({ where: { workspace_id: workspaceId } });
    const operatorIds = operators.map((o) => o.id);

    const [preferences, conversationHistory, feedbackLogs, campaignsWithSteps, lastConsolidation] =
      await Promise.all([
        prisma.agentMemory.findMany({ where: { workspace_id: workspaceId } }),
        prisma.conversationMemory.findMany({
          where: { workspace_id: workspaceId },
          orderBy: { created_at: 'desc' },
          take: 50,
        }),
        prisma.feedbackLog.findMany({
          where: { operator_id: { in: operatorIds } },
          orderBy: { created_at: 'desc' },
          take: 100,
        }),
        prisma.campaign.findMany({
          where: { created_by_operator_id: { in: operatorIds } },
          include: { steps: true },
        }),
        prisma.memoryConsolidation.findFirst({
          where: { workspace_id: workspaceId, status: 'completed' },
          orderBy: { started_at: 'desc' },
        }),
      ]);

    const prefMap: Record<string, any> = {};
    for (const p of preferences) prefMap[p.key] = p.value;

    const toolFrequency = new Map<string, number>();
    for (const c of campaignsWithSteps) {
      for (const s of c.steps) {
        toolFrequency.set(s.tool_name, (toolFrequency.get(s.tool_name) || 0) + 1);
      }
    }
    const topTools = [...toolFrequency.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([t]) => t);

    const ratings = feedbackLogs.filter((f) => f.rating).map((f) => f.rating);
    const avgRating =
      ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : 0;

    return {
      workspaceId,
      preferences: prefMap,
      conversationHistory: conversationHistory.map((c) => ({
        role: c.role,
        content: c.content,
        createdAt: c.created_at,
      })),
      feedbackSummary: {
        total: feedbackLogs.length,
        avgRating: Math.round(avgRating * 10) / 10,
        recentComments: feedbackLogs.filter((f) => f.comment).slice(0, 10).map((f) => f.comment!),
      },
      campaignStats: {
        total: campaignsWithSteps.length,
        completed: campaignsWithSteps.filter((c) => c.status === 'completed').length,
        failed: campaignsWithSteps.filter((c) => c.status === 'failed').length,
        topTools,
      },
      lastConsolidation: {
        at: lastConsolidation?.completed_at || null,
        patternsFound: lastConsolidation?.patterns_found || 0,
      },
    };
  }

  async consolidateMemory(workspaceId: string): Promise<{ patternsFound: number; summary: string }> {
    const record = await prisma.memoryConsolidation.create({
      data: { workspace_id: workspaceId, status: 'running', campaigns_analyzed: 0 },
    });

    try {
      const operators = await prisma.operator.findMany({ where: { workspace_id: workspaceId } });
      const operatorIds = operators.map((o) => o.id);

      const campaigns = await prisma.campaign.findMany({
        where: { created_by_operator_id: { in: operatorIds } },
        include: { steps: true },
        take: 100,
      });

      const patternFrequency = new Map<string, number>();

      for (const c of campaigns) {
        const chain = c.steps.map((s) => s.tool_name).sort().join('+');
        if (chain) {
          const key = `tool_chain:${chain}`;
          patternFrequency.set(key, (patternFrequency.get(key) || 0) + 1);
        }
      }

      const feedbackLogs = await prisma.feedbackLog.findMany({
        where: { operator_id: { in: operatorIds } },
        include: { execution_log: true },
      });

      const campaignFeedback = new Map<string, number[]>();
      for (const f of feedbackLogs) {
        const cId = f.execution_log.campaign_id;
        if (cId) {
          const ratings = campaignFeedback.get(cId) || [];
          ratings.push(f.rating);
          campaignFeedback.set(cId, ratings);
        }
      }

      for (const c of campaigns) {
        const ratings = campaignFeedback.get(c.id) || [];
        if (ratings.length > 0) {
          const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
          if (avg >= 4) {
            const chain = c.steps.map((s) => s.tool_name).sort().join('+');
            if (chain) patternFrequency.set(`high_rating:${chain}`, (patternFrequency.get(`high_rating:${chain}`) || 0) + 1);
          }
        }
      }

      const sortedPatterns = [...patternFrequency.entries()]
        .filter(([, count]) => count > 1)
        .sort((a, b) => b[1] - a[1]);

      const patternsFound = sortedPatterns.length;
      const summary = patternsFound > 0
        ? `Found ${patternsFound} recurring patterns across ${campaigns.length} campaigns. Top: "${sortedPatterns[0]?.[0]}" (${sortedPatterns[0]?.[1]} times).`
        : `No recurring patterns found across ${campaigns.length} campaigns.`;

      for (const [pattern, count] of sortedPatterns.slice(0, 20)) {
        await prisma.agentMemory.upsert({
          where: { workspace_id_key: { workspace_id: workspaceId, key: `pattern:${pattern}` } },
          update: { value: { count, detected_at: new Date() }, confidence: Math.min(count / campaigns.length, 1), source: 'auto' },
          create: {
            workspace_id: workspaceId,
            key: `pattern:${pattern}`,
            value: { count, detected_at: new Date() },
            category: 'pattern',
            confidence: Math.min(count / campaigns.length, 1),
            source: 'auto',
          },
        });
      }

      await prisma.memoryConsolidation.update({
        where: { id: record.id },
        data: {
          status: 'completed',
          campaigns_analyzed: campaigns.length,
          patterns_found: patternsFound,
          summary: { patterns: sortedPatterns.slice(0, 10), totalCampaigns: campaigns.length },
          completed_at: new Date(),
        },
      });

      return { patternsFound, summary };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      await prisma.memoryConsolidation.update({
        where: { id: record.id },
        data: { status: 'failed', error_message: msg, completed_at: new Date() },
      });
      throw error;
    }
  }

  async storeConversation(params: {
    workspaceId: string;
    role: string;
    content: string;
    sessionId?: string;
    metadata?: any;
    tokenCount?: number;
  }) {
    return prisma.conversationMemory.create({
      data: {
        workspace_id: params.workspaceId,
        session_id: params.sessionId,
        role: params.role,
        content: params.content,
        metadata: params.metadata || undefined,
        token_count: params.tokenCount,
      },
    });
  }

  async setPreference(workspaceId: string, key: string, value: any, source = 'manual') {
    return prisma.agentMemory.upsert({
      where: { workspace_id_key: { workspace_id: workspaceId, key } },
      update: { value, source, confidence: 1.0 },
      create: { workspace_id: workspaceId, key, value, category: 'preference', source, confidence: 1.0 },
    });
  }

  async getPreferences(workspaceId: string) {
    const entries = await prisma.agentMemory.findMany({
      where: { workspace_id: workspaceId, category: 'preference' },
    });
    const map: Record<string, any> = {};
    for (const e of entries) map[e.key] = e.value;
    return map;
  }

  async getConsolidationHistory(workspaceId: string, limit = 10) {
    return prisma.memoryConsolidation.findMany({
      where: { workspace_id: workspaceId },
      orderBy: { started_at: 'desc' },
      take: limit,
    });
  }
}

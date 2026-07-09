import { prisma } from '../lib/prisma';
import { AiProviderFactory } from '../ai/providers/ai-provider.factory';

interface PromptScore {
  templateId: string;
  name: string;
  category: string;
  avgRating: number;
  useCount: number;
  feedbackCount: number;
}

interface RefinementSuggestion {
  templateId: string;
  name: string;
  currentContent: string;
  suggestedImprovement: string;
  reason: string;
  confidence: number;
}

export class PromptRefinerService {
  async scorePromptTemplates(workspaceId?: string): Promise<PromptScore[]> {
    const where: any = workspaceId
      ? { OR: [{ workspace_id: workspaceId }, { is_global: true }] }
      : { is_global: true };

    const templates = await prisma.promptTemplate.findMany({ where });
    if (templates.length === 0) return [];

    const scores: PromptScore[] = [];
    for (const t of templates) {
      const logs = await prisma.aiExecutionLog.findMany({
        where: {
          prompt: { contains: t.name },
          feedback: { isNot: null },
        },
        include: { feedback: true },
        take: 50,
      });

      const ratings = logs.filter((l) => l.feedback?.rating).map((l) => l.feedback!.rating);
      const avgRating =
        ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

      scores.push({
        templateId: t.id,
        name: t.name,
        category: t.category,
        avgRating: Math.round(avgRating * 10) / 10,
        useCount: logs.length,
        feedbackCount: ratings.length,
      });
    }

    return scores.sort((a, b) => a.avgRating - b.avgRating);
  }

  async suggestRefinements(workspaceId?: string): Promise<RefinementSuggestion[]> {
    const scores = await this.scorePromptTemplates(workspaceId);
    const lowPerforming = scores.filter((s) => s.avgRating < 4 && s.feedbackCount >= 3);

    const suggestions: RefinementSuggestion[] = [];
    for (const s of lowPerforming.slice(0, 5)) {
      const template = await prisma.promptTemplate.findUnique({ where: { id: s.templateId } });
      if (!template) continue;

      const feedbackEntries = await prisma.feedbackLog.findMany({
        where: {
          execution_log: { prompt: { contains: template.name } },
          comment: { not: null },
        },
        orderBy: { created_at: 'desc' },
        take: 10,
      });

      const comments = feedbackEntries.map((f) => f.comment).filter(Boolean) as string[];
      const improvement = await this.generateImprovement(
        template.content,
        comments,
        s.avgRating,
      );

      suggestions.push({
        templateId: template.id,
        name: template.name,
        currentContent: template.content,
        suggestedImprovement: improvement.suggestion,
        reason: improvement.reason,
        confidence: improvement.confidence,
      });
    }

    return suggestions;
  }

  private async generateImprovement(
    currentPrompt: string,
    feedbackComments: string[],
    avgRating: number,
  ): Promise<{ suggestion: string; reason: string; confidence: number }> {
    const feedbackText =
      feedbackComments.length > 0
        ? `\nOperator feedback:\n${feedbackComments.map((c) => `- ${c}`).join('\n')}`
        : '\nNo specific feedback comments.';

    const systemPrompt = `You are a prompt engineering expert. Given a current prompt template, its average rating (1-5), and operator feedback, suggest a specific improvement. Return JSON with keys: "suggestion" (the improved prompt text), "reason" (why this change helps), "confidence" (0-1).`;

    const userPrompt = `Current prompt:\n"""\n${currentPrompt}\n"""\n\nAverage rating: ${avgRating}/5${feedbackText}`;

    try {
      const result = await AiProviderFactory.chat('auto', {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        maxTokens: 1000,
      });

      const text = result?.content || '{}';
      const parsed = JSON.parse(typeof text === 'string' ? text : JSON.stringify(text));
      return {
        suggestion: parsed.suggestion || currentPrompt,
        reason: parsed.reason || 'Based on feedback analysis',
        confidence: parsed.confidence ?? 0.5,
      };
    } catch {
      return {
        suggestion: currentPrompt,
        reason: 'Could not generate improvement (AI unavailable)',
        confidence: 0,
      };
    }
  }

  async recordFeedback(params: {
    aiExecutionLogId: string;
    operatorId: string;
    rating: number;
    comment?: string;
    approved?: boolean;
    correctedOutput?: string;
  }) {
    return prisma.feedbackLog.create({
      data: {
        ai_execution_log_id: params.aiExecutionLogId,
        operator_id: params.operatorId,
        rating: params.rating,
        comment: params.comment,
        approved: params.approved ?? true,
        corrected_output: params.correctedOutput,
      },
    });
  }
}

import { prisma } from '../lib/prisma';
import { AiProviderFactory } from '../ai/providers/ai-provider.factory';

interface ExtractedPreference {
  key: string;
  value: any;
  confidence: number;
  source: string;
}

interface ExtractionResult {
  preferences: ExtractedPreference[];
  patterns: string[];
}

export class PreferenceExtractorService {
  async extractFromFeedback(workspaceId: string): Promise<ExtractionResult> {
    const operators = await prisma.operator.findMany({ where: { workspace_id: workspaceId } });
    const operatorIds = operators.map((o) => o.id);

    const feedbackLogs = await prisma.feedbackLog.findMany({
      where: { operator_id: { in: operatorIds } },
      include: { execution_log: true },
      orderBy: { created_at: 'desc' },
      take: 50,
    });

    const preferences: ExtractedPreference[] = [];
    const patterns: string[] = [];

    const toolRatings = new Map<string, { ratings: number[]; count: number }>();
    for (const log of feedbackLogs) {
      if (!log.execution_log) continue;
      const toolName = log.execution_log.model || 'unknown';
      if (!toolRatings.has(toolName)) toolRatings.set(toolName, { ratings: [], count: 0 });
      toolRatings.get(toolName)!.ratings.push(log.rating);
      toolRatings.get(toolName)!.count++;
    }

    for (const [tool, data] of toolRatings) {
      const avg = data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length;
      if (data.count >= 3) {
        if (avg >= 4) {
          preferences.push({
            key: `preferred_model`,
            value: tool,
            confidence: Math.min(data.count / 10, 0.95),
            source: 'feedback_analysis',
          });
          patterns.push(`High rating for ${tool} (${avg.toFixed(1)}/5 from ${data.count} feedbacks)`);
        } else if (avg < 2.5) {
          preferences.push({
            key: `disliked_model`,
            value: tool,
            confidence: Math.min(data.count / 10, 0.9),
            source: 'feedback_analysis',
          });
          patterns.push(`Low rating for ${tool} (${avg.toFixed(1)}/5 from ${data.count} feedbacks)`);
        }
      }
    }

    const correctedOutputs = feedbackLogs.filter((f) => f.corrected_output);
    if (correctedOutputs.length >= 3) {
      const tonePatterns = correctedOutputs.map((f) => f.corrected_output!.toLowerCase());

      const formalIndicators = tonePatterns.filter(
        (t) => t.includes('dear') || t.includes('sincerely') || t.includes('regards'),
      );
      const casualIndicators = tonePatterns.filter(
        (t) => t.includes('hey') || t.includes('hi there') || t.includes('cheers'),
      );

      if (formalIndicators.length > casualIndicators.length) {
        preferences.push({
          key: 'preferred_tone',
          value: 'formal',
          confidence: formalIndicators.length / correctedOutputs.length,
          source: 'output_correction_analysis',
        });
        patterns.push('User tends to correct outputs to formal tone');
      } else if (casualIndicators.length > formalIndicators.length) {
        preferences.push({
          key: 'preferred_tone',
          value: 'casual',
          confidence: casualIndicators.length / correctedOutputs.length,
          source: 'output_correction_analysis',
        });
        patterns.push('User tends to correct outputs to casual tone');
      }
    }

    const comments = feedbackLogs
      .filter((f) => f.comment)
      .map((f) => f.comment!.toLowerCase());

    const lengthPreferences = comments.filter(
      (c) => c.includes('too long') || c.includes('too short') || c.includes('concise') || c.includes('more detail'),
    );
    if (lengthPreferences.length >= 2) {
      const wantsConcise = lengthPreferences.filter(
        (c) => c.includes('too long') || c.includes('concise'),
      );
      const wantsDetail = lengthPreferences.filter((c) => c.includes('too short') || c.includes('more detail'));

      if (wantsConcise.length > wantsDetail.length) {
        preferences.push({
          key: 'preferred_length',
          value: 'concise',
          confidence: wantsConcise.length / lengthPreferences.length,
          source: 'comment_analysis',
        });
        patterns.push('User prefers concise outputs');
      } else if (wantsDetail.length > wantsConcise.length) {
        preferences.push({
          key: 'preferred_length',
          value: 'detailed',
          confidence: wantsDetail.length / lengthPreferences.length,
          source: 'comment_analysis',
        });
        patterns.push('User prefers detailed outputs');
      }
    }

    return { preferences, patterns };
  }

  async extractFromConversations(workspaceId: string): Promise<ExtractionResult> {
    const conversations = await prisma.conversationMemory.findMany({
      where: { workspace_id: workspaceId, role: 'user' },
      orderBy: { created_at: 'desc' },
      take: 30,
    });

    const preferences: ExtractedPreference[] = [];
    const patterns: string[] = [];

    if (conversations.length < 5) {
      return { preferences, patterns };
    }

    const allUserText = conversations.map((c) => c.content).join('\n');

    const toolMentions = new Map<string, number>();
    const toolKeywords = ['smartlead', 'instantly', 'heyreach', 'apollo', 'clay', 'calendly', 'hubspot', 'bettercontact'];
    for (const tool of toolKeywords) {
      const regex = new RegExp(tool, 'gi');
      const matches = allUserText.match(regex);
      if (matches && matches.length >= 2) {
        toolMentions.set(tool, matches.length);
        patterns.push(`User frequently mentions ${tool} (${matches.length} times)`);
      }
    }

    if (toolMentions.size > 0) {
      const sorted = [...toolMentions.entries()].sort((a, b) => b[1] - a[1]);
      preferences.push({
        key: 'frequently_mentioned_tools',
        value: sorted.map(([t]) => t),
        confidence: 0.8,
        source: 'conversation_analysis',
      });
    }

    const questionPatterns = allUserText.match(/(?:how|what|why|can|could|should|would)\s+[^?]*\?/gi) || [];
    if (questionPatterns.length >= 3) {
      patterns.push(`User asks ${questionPatterns.length} questions - prefers explanations`);
      preferences.push({
        key: 'communication_style',
        value: 'questioning',
        confidence: Math.min(questionPatterns.length / 10, 0.85),
        source: 'conversation_analysis',
      });
    }

    const urgentPatterns = allUserText.match(/(?:urgent|asap|immediately|now|hurry|quick)/gi) || [];
    if (urgentPatterns.length >= 2) {
      patterns.push('User uses urgent language frequently');
      preferences.push({
        key: 'urgency_tendency',
        value: 'high',
        confidence: Math.min(urgentPatterns.length / 10, 0.75),
        source: 'conversation_analysis',
      });
    }

    return { preferences, patterns };
  }

  async extractFromCampaigns(workspaceId: string): Promise<ExtractionResult> {
    const operators = await prisma.operator.findMany({ where: { workspace_id: workspaceId } });
    const operatorIds = operators.map((o) => o.id);

    const campaigns = await prisma.campaign.findMany({
      where: { created_by_operator_id: { in: operatorIds } },
      include: { steps: true },
      orderBy: { created_at: 'desc' },
      take: 50,
    });

    const preferences: ExtractedPreference[] = [];
    const patterns: string[] = [];

    if (campaigns.length < 3) {
      return { preferences, patterns };
    }

    const toolFrequency = new Map<string, number>();
    for (const c of campaigns) {
      for (const s of c.steps) {
        toolFrequency.set(s.tool_name, (toolFrequency.get(s.tool_name) || 0) + 1);
      }
    }

    if (toolFrequency.size > 0) {
      const sorted = [...toolFrequency.entries()].sort((a, b) => b[1] - a[1]);
      preferences.push({
        key: 'preferred_tool_chain',
        value: sorted.slice(0, 3).map(([t]) => t),
        confidence: 0.85,
        source: 'campaign_analysis',
      });
      patterns.push(`Most used tools: ${sorted.slice(0, 3).map(([t, c]) => `${t}(${c})`).join(', ')}`);
    }

    const statusCounts = new Map<string, number>();
    for (const c of campaigns) {
      statusCounts.set(c.status, (statusCounts.get(c.status) || 0) + 1);
    }

    const completedCount = statusCounts.get('completed') || 0;
    const failedCount = statusCounts.get('failed') || 0;
    const total = completedCount + failedCount;

    if (total >= 5) {
      const successRate = completedCount / total;
      preferences.push({
        key: 'campaign_success_rate',
        value: Math.round(successRate * 100),
        confidence: Math.min(total / 20, 0.9),
        source: 'campaign_analysis',
      });
      patterns.push(`Campaign success rate: ${Math.round(successRate * 100)}%`);
    }

    return { preferences, patterns };
  }

  async extractAllPreferences(workspaceId: string): Promise<{
    allPreferences: ExtractedPreference[];
    allPatterns: string[];
    saved: number;
  }> {
    const [feedbackResult, conversationResult, campaignResult] = await Promise.all([
      this.extractFromFeedback(workspaceId),
      this.extractFromConversations(workspaceId),
      this.extractFromCampaigns(workspaceId),
    ]);

    const allPreferences = [
      ...feedbackResult.preferences,
      ...conversationResult.preferences,
      ...campaignResult.preferences,
    ];

    const allPatterns = [
      ...feedbackResult.patterns,
      ...conversationResult.patterns,
      ...campaignResult.patterns,
    ];

    let saved = 0;
    for (const pref of allPreferences) {
      try {
        await prisma.agentMemory.upsert({
          where: { workspace_id_key: { workspace_id: workspaceId, key: pref.key } },
          update: {
            value: pref.value,
            confidence: pref.confidence,
            source: pref.source,
            category: 'preference',
          },
          create: {
            workspace_id: workspaceId,
            key: pref.key,
            value: pref.value,
            confidence: pref.confidence,
            source: pref.source,
            category: 'preference',
          },
        });
        saved++;
      } catch (err) {
        console.error(`Failed to save preference ${pref.key}:`, err);
      }
    }

    return { allPreferences, allPatterns, saved };
  }
}

export const preferenceExtractor = new PreferenceExtractorService();

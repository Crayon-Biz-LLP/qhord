import { prisma } from '../lib/prisma';
import { AiProviderFactory } from '../ai/providers/ai-provider.factory';

interface SummarizeResult {
  summary: string;
  originalCount: number;
  compressedInto: number;
  tokenSavings: number;
}

export class ConversationSummarizerService {
  private static readonly MAX_TOKENS_BEFORE_SUMMARIZE = 4000;
  private static readonly KEEP_RECENT = 10;

  async shouldSummarize(workspaceId: string, sessionId?: string): Promise<boolean> {
    const where: any = { workspace_id: workspaceId };
    if (sessionId) where.session_id = sessionId;

    const count = await prisma.conversationMemory.count({ where });
    return count > ConversationSummarizerService.KEEP_RECENT + 5;
  }

  async summarizeConversation(
    workspaceId: string,
    sessionId?: string,
  ): Promise<SummarizeResult> {
    const where: any = { workspace_id: workspaceId };
    if (sessionId) where.session_id = sessionId;

    const allMessages = await prisma.conversationMemory.findMany({
      where,
      orderBy: { created_at: 'asc' },
    });

    if (allMessages.length <= ConversationSummarizerService.KEEP_RECENT) {
      return {
        summary: '',
        originalCount: allMessages.length,
        compressedInto: 0,
        tokenSavings: 0,
      };
    }

    const messagesToSummarize = allMessages.slice(
      0,
      allMessages.length - ConversationSummarizerService.KEEP_RECENT,
    );
    const messagesToKeep = allMessages.slice(
      allMessages.length - ConversationSummarizerService.KEEP_RECENT,
    );

    const conversationText = messagesToSummarize
      .map((m) => `${m.role}: ${m.content}`)
      .join('\n');

    const totalTokens = messagesToSummarize.reduce((sum, m) => sum + (m.token_count || Math.ceil(m.content.length / 4)), 0);

    let summary: string;
    try {
      const response = await AiProviderFactory.chat(
        'auto',
        {
          system: `You are a conversation summarizer. Summarize the following conversation into a concise summary that captures:
1. Key decisions made
2. User preferences discovered
3. Important context for future interactions
4. Action items or tasks discussed

Keep the summary under 300 words. Be factual and concise.`,
          messages: [
            {
              role: 'user',
              content: `Summarize this conversation:\n\n${conversationText.substring(0, 6000)}`,
            },
          ],
          temperature: 0.3,
          maxTokens: 500,
        },
        undefined,
        { workspace_id: workspaceId },
      );
      summary = response.content;
    } catch (err) {
      console.error('AI summarization failed, using fallback:', err);
      summary = this.fallbackSummary(messagesToSummarize);
    }

    const summaryEntry = await prisma.conversationMemory.create({
      data: {
        workspace_id: workspaceId,
        session_id: sessionId || `summary-${Date.now()}`,
        role: 'system',
        content: `[CONVERSATION SUMMARY]\n${summary}`,
        metadata: {
          type: 'summary',
          messageCount: messagesToSummarize.length,
          createdAt: new Date().toISOString(),
        },
        token_count: Math.ceil(summary.length / 4),
      },
    });

    for (const msg of messagesToSummarize) {
      await prisma.conversationMemory.delete({ where: { id: msg.id } });
    }

    return {
      summary,
      originalCount: messagesToSummarize.length,
      compressedInto: 1,
      tokenSavings: totalTokens - Math.ceil(summary.length / 4),
    };
  }

  private fallbackSummary(messages: { role: string; content: string }[]): string {
    const userMessages = messages.filter((m) => m.role === 'user');
    const assistantMessages = messages.filter((m) => m.role === 'assistant');

    const topics = userMessages.map((m) => m.content.substring(0, 100));
    const decisions = assistantMessages
      .filter((m) => m.content.toLowerCase().includes('decided') || m.content.toLowerCase().includes('recommend'))
      .map((m) => m.content.substring(0, 150));

    return `Conversation between ${messages[0]?.role} and assistant. ${topics.length} user messages discussed topics including: ${topics.slice(0, 5).join('; ')}. ${decisions.length > 0 ? `Key decisions: ${decisions.slice(0, 3).join('; ')}` : 'No major decisions recorded.'}`;
  }

  async getConversationSummary(workspaceId: string, sessionId?: string): Promise<string | null> {
    const where: any = {
      workspace_id: workspaceId,
      role: 'system',
    };
    if (sessionId) where.session_id = sessionId;

    const summaryEntry = await prisma.conversationMemory.findFirst({
      where,
      orderBy: { created_at: 'desc' },
    });

    if (summaryEntry?.metadata && typeof summaryEntry.metadata === 'object' && 'type' in (summaryEntry.metadata as any)) {
      if ((summaryEntry.metadata as any).type === 'summary') {
        return summaryEntry.content.replace('[CONVERSATION SUMMARY]\n', '');
      }
    }

    return null;
  }
}

export const conversationSummarizer = new ConversationSummarizerService();

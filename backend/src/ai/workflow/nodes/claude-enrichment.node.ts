import { prisma } from '../../../lib/prisma';
import { AiProviderFactory } from '../../providers/ai-provider.factory';
import { AiChatRequest } from '../../providers/ai-provider.interface';

export interface ClaudeEnrichmentConfig {
  promptTemplate: string;
  targetOutputVariable: string;
  provider?: string;
  model?: string;
  maxTokens?: number;
}

export interface LeadData {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email: string;
  company_name?: string | null;
  title?: string | null;
  industry?: string | null;
  linkedin_url?: string | null;
  domain?: string | null;
  [key: string]: unknown;
}

export class ClaudeEnrichmentNode {
  async invoke(lead: LeadData, config: ClaudeEnrichmentConfig, clientId: string): Promise<string> {
    const providerName = config.provider || 'auto';

    const brandBrain = await prisma.brandBrain.findUnique({
      where: { client_id: clientId },
    });

    const compiledPrompt = this.compilePrompt(config.promptTemplate, lead);

    const systemPrompt = brandBrain?.data_text
      ? `You are an expert GTM copywriter. Use this Brand Knowledge Base to guide your tone and style:\n\n${brandBrain.data_text}`
      : 'You are an expert GTM copywriter generating personalized outreach content.';

    const aiRequest: AiChatRequest = {
      messages: [{ role: 'user', content: compiledPrompt }],
      system: systemPrompt,
      maxTokens: config.maxTokens || 300,
    };

    const response = await AiProviderFactory.chat(providerName, aiRequest, {
      model: config.model,
    });

    const aiOutput = response.content?.trim() || '';

    const existingVariables = (lead as any).custom_variables || {};
    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        custom_variables: {
          ...(typeof existingVariables === 'object' ? existingVariables : {}),
          [config.targetOutputVariable]: aiOutput,
        },
      },
    });

    return aiOutput;
  }

  private compilePrompt(template: string, lead: LeadData): string {
    return template
      .replace(/\{\{first_name\}\}/g, lead.first_name || 'there')
      .replace(/\{\{last_name\}\}/g, lead.last_name || '')
      .replace(/\{\{email\}\}/g, lead.email || '')
      .replace(/\{\{company_name\}\}/g, lead.company_name || 'the company')
      .replace(/\{\{title\}\}/g, lead.title || 'professional')
      .replace(/\{\{industry\}\}/g, lead.industry || '')
      .replace(/\{\{linkedin_url\}\}/g, lead.linkedin_url || '')
      .replace(/\{\{domain\}\}/g, lead.domain || '');
  }
}

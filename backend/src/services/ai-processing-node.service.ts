import { prisma } from '../lib/prisma';
import { AiProviderFactory } from '../ai/providers/ai-provider.factory';

interface ProcessingNodeConfig {
  promptTemplate: string;
  targetOutputVariable: string;
  systemContext?: string;
  model?: string;
  maxTokens?: number;
}

interface LeadRecord {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  title?: string | null;
  company_name?: string | null;
  domain?: string | null;
  linkedin_url?: string | null;
  industry?: string | null;
  custom_variables?: Record<string, any> | null;
  enrichment_data?: Record<string, any> | null;
  [key: string]: any;
}

export class AiProcessingNodeService {
  async execute(
    clientId: string,
    lead: LeadRecord,
    config: ProcessingNodeConfig,
    campaignId?: string,
    workspaceId?: string,
  ): Promise<{ output: string; variableName: string }> {
    const brandBrain = await prisma.brandBrain.findUnique({ where: { client_id: clientId } });

    const systemParts: string[] = [];
    if (config.systemContext) systemParts.push(config.systemContext);
    if (brandBrain?.data_text) {
      systemParts.push(`Brand Knowledge Base:\n${brandBrain.data_text}`);
    }
    systemParts.push(
      'You are a GTM copywriter. Generate concise, personalized output based on the lead data and prompt provided. Return ONLY the generated text, no explanation.',
    );

    const system = systemParts.join('\n\n');
    const variables: Record<string, string> = {};

    for (const key of Object.keys(lead)) {
      const val = lead[key];
      if (val !== null && val !== undefined && typeof val !== 'object') {
        variables[key] = String(val);
      }
    }

    const customVars = lead.custom_variables as Record<string, any> | null;
    if (customVars) {
      for (const [k, v] of Object.entries(customVars)) {
        variables[k] = String(v ?? '');
      }
    }

    const enrichmentData = lead.enrichment_data as Record<string, any> | null;
    if (enrichmentData) {
      for (const [k, v] of Object.entries(enrichmentData)) {
        if (typeof v !== 'object') variables[k] = String(v ?? '');
      }
    }

    let prompt = config.promptTemplate;
    for (const [key, val] of Object.entries(variables)) {
      prompt = prompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val);
    }

    const response = await AiProviderFactory.chat(
      'auto',
      {
        messages: [{ role: 'user', content: prompt }],
        system,
        maxTokens: config.maxTokens || 300,
      },
      { model: config.model || 'llama-3.3-70b-versatile' },
      { client_id: clientId, campaign_id: campaignId, workspace_id: workspaceId },
    );

    const output = response.content.trim();

    const existingVars = (lead.custom_variables as Record<string, any>) || {};
    existingVars[config.targetOutputVariable] = output;

    await prisma.lead.update({
      where: { id: lead.id },
      data: { custom_variables: existingVars as any },
    });

    return { output, variableName: config.targetOutputVariable };
  }

  async executeBatch(
    clientId: string,
    leads: LeadRecord[],
    config: ProcessingNodeConfig,
    campaignId?: string,
    workspaceId?: string,
    concurrency = 5,
  ): Promise<{ processed: number; outputs: string[] }> {
    const outputs: string[] = [];
    const chunks: LeadRecord[][] = [];
    for (let i = 0; i < leads.length; i += concurrency) {
      chunks.push(leads.slice(i, i + concurrency));
    }

    for (const chunk of chunks) {
      const results = await Promise.allSettled(
        chunk.map((lead) =>
          this.execute(clientId, lead, config, campaignId, workspaceId),
        ),
      );
      for (const r of results) {
        if (r.status === 'fulfilled') outputs.push(r.value.output);
      }
    }

    return { processed: outputs.length, outputs };
  }

  async getBrandContext(clientId: string): Promise<string> {
    const brand = await prisma.brandBrain.findUnique({ where: { client_id: clientId } });
    return brand?.data_text || '';
  }

  async upsertBrandProfile(clientId: string, name: string, dataText: string) {
    return prisma.brandBrain.upsert({
      where: { client_id: clientId },
      create: { client_id: clientId, name, data_text: dataText },
      update: { name, data_text: dataText },
    });
  }
}

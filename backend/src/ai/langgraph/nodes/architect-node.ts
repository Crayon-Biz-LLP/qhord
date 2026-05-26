import { getLLMClient } from '../../utils/llm-config';
import { ARCHITECT_PROMPT } from '../../prompts/architect-prompt';
import { CampaignIntent, CampaignManifest, ManifestBuilder } from '../../utils/manifest-builder';

export interface ArchitectState {
  userInput: string;
  intent?: CampaignIntent;
  activeTools: string[];
  manifest?: CampaignManifest;
  error?: string;
}

export class ArchitectNode {
  async invoke(state: ArchitectState): Promise<Partial<ArchitectState>> {
    try {
      if (!state.intent) {
        throw new Error('No parsed intent available from parser node');
      }

      const intent = state.intent;

      // First, try to build manifest using logic (faster, more reliable)
      const logicalManifest = this.buildLogicalManifest(intent, state.activeTools);

      if (logicalManifest) {
        return {
          ...state,
          manifest: logicalManifest,
          error: undefined
        };
      }

      // Fallback to LLM if logical build fails
      const llmManifest = await this.buildLLMManifest(intent, state.activeTools);

      return {
        ...state,
        manifest: llmManifest,
        error: undefined
      };

    } catch (error) {
      console.error('Architect node error:', error);
      return {
        ...state,
        manifest: undefined,
        error: `Failed to create campaign plan: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private buildLogicalManifest(intent: CampaignIntent, activeTools: string[]): CampaignManifest | null {
    try {
      // Check if we have the required tools for this intent
      const requiredTools = this.getRequiredToolsForIntent(intent);
      const availableTools = requiredTools.filter(tool => activeTools.includes(tool));

      console.log(`[Architect] Intent goal: ${intent.goal}, Required tools: ${requiredTools}, Available: ${availableTools}`);

      if (availableTools.length === 0) {
        console.warn(`[Architect] No active tools available. Using all active tools: ${activeTools}`);
        // Don't fail, just use what we have
      }

      // Use the ManifestBuilder to create the plan
      const manifest = ManifestBuilder.buildFromIntent(intent, activeTools);
      console.log(`[Architect] Logical manifest built successfully:`, manifest.name);
      return manifest;
    } catch (error) {
      console.warn('Logical manifest build failed, falling back to LLM:', error);
      return null;
    }
  }

  private async buildLLMManifest(intent: CampaignIntent, activeTools: string[]): Promise<CampaignManifest> {
    console.log(`[Architect] Using LLM to build manifest, activeTools:`, activeTools);
    const llm = getLLMClient();

    const prompt = ARCHITECT_PROMPT
      .replace('{activeTools}', JSON.stringify(activeTools))
      .replace('{intent}', JSON.stringify(intent));

    const response = await llm.invoke(prompt);
    const content = response.content as string;

    console.log(`[Architect] LLM response length: ${content.length}`);

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in LLM response');
    }

    const manifest = JSON.parse(jsonMatch[0]);

    // Check for error response
    if (manifest.error) {
      throw new Error(manifest.error);
    }

    // Validate the manifest structure
    this.validateManifest(manifest);

    return manifest;
  }

  private getRequiredToolsForIntent(intent: CampaignIntent): string[] {
    const toolMap: Record<string, string[]> = {
      'source_leads': ['Apollo', 'Hunter'],
      'enrich_data': ['Clay', 'BetterContacts', 'Clearbit'],
      'send_emails': ['Smartlead', 'Brevo', 'Instantly', 'Lemlist'],
      'schedule_meetings': ['Calendly'],
      'crm_sync': ['HubSpot', 'Salesforce', 'Pipedrive']
    };

    return toolMap[intent.goal] || [];
  }

  private validateManifest(manifest: any): void {
    if (!manifest.name || typeof manifest.name !== 'string') {
      throw new Error('Manifest must have a valid name');
    }

    if (!manifest.description || typeof manifest.description !== 'string') {
      throw new Error('Manifest must have a valid description');
    }

    if (typeof manifest.estimated_cost !== 'number' || manifest.estimated_cost < 0) {
      throw new Error('Manifest must have a valid estimated_cost');
    }

    if (typeof manifest.estimated_duration !== 'number' || manifest.estimated_duration < 0) {
      throw new Error('Manifest must have a valid estimated_duration');
    }

    if (!Array.isArray(manifest.steps) || manifest.steps.length === 0) {
      throw new Error('Manifest must have at least one step');
    }

    // Validate each step
    for (const step of manifest.steps) {
      if (!step.id || !step.tool || !step.action) {
        throw new Error(`Step ${step.id || 'unknown'} is missing required fields`);
      }

      if (typeof step.order !== 'number' || step.order < 1) {
        throw new Error(`Step ${step.id} has invalid order`);
      }

      if (!Array.isArray(step.dependencies)) {
        throw new Error(`Step ${step.id} dependencies must be an array`);
      }
    }
  }
}
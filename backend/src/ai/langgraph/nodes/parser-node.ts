import { getLLMClient } from '../../utils/llm-config';
import { PARSER_PROMPT } from '../../prompts/parser-prompt';
import { CampaignIntent } from '../../utils/manifest-builder';

export interface ParserState {
  userInput: string;
  intent?: CampaignIntent;
  error?: string;
}

export class ParserNode {
  async invoke(state: ParserState): Promise<Partial<ParserState>> {
    try {
      const llm = getLLMClient();

      const prompt = `${PARSER_PROMPT}\n\nUser request: "${state.userInput}"\n\nReturn only valid JSON:`;

      const response = await llm.invoke(prompt);

      // Extract JSON from the response
      const content = response.content as string;
      const jsonMatch = content.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error('No valid JSON found in LLM response');
      }

      const intent: CampaignIntent = this.normalizeIntent(JSON.parse(jsonMatch[0]));

      // Validate the intent structure
      this.validateIntent(intent);

      return {
        intent,
        error: undefined
      };

    } catch (error) {
      console.error('Parser node error:', error);
      return {
        intent: undefined,
        error: `Failed to parse request: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private validateIntent(intent: CampaignIntent): void {
    // Validate required fields
    if (!intent.goal) {
      throw new Error('Intent must have a goal');
    }

    if (!intent.target) {
      throw new Error('Intent must have a target');
    }

    if (typeof intent.volume !== "number") {
      throw new Error('Intent must have a valid volume (positive number)');
    }

    if (!Array.isArray(intent.tools) || intent.tools.length === 0) {
      throw new Error('Intent must specify at least one tool');
    }

    if (!Array.isArray(intent.sequence) || intent.sequence.length === 0) {
      throw new Error('Intent must have a sequence');
    }

    if (intent.campaign_name !== undefined && intent.campaign_name !== null && typeof intent.campaign_name !== 'string') {
      throw new Error('campaign_name must be a string or null');
    }

    // Validate goal values
    const validGoals = ['source_leads', 'enrich_data', 'send_emails', 'schedule_meetings', 'crm_sync'];
    if (!validGoals.includes(intent.goal)) {
      throw new Error(`Invalid goal: ${intent.goal}. Must be one of: ${validGoals.join(', ')}`);
    }

    // Validate target type
    if (!['B2B', 'B2C'].includes(intent.target.type)) {
      throw new Error(`Invalid target type: ${intent.target.type}. Must be B2B or B2C`);
    }

    // Validate timing
    if (intent.timing) {
      if (intent.timing.warmup_days && intent.timing.warmup_days < 0) {
        throw new Error('Warmup days cannot be negative');
      }
    }
  }

  private normalizeIntent(rawIntent: any): CampaignIntent {
    const normalized: CampaignIntent = {
      goal: rawIntent?.goal,
      campaign_name: rawIntent?.campaign_name ?? null,
      target: {
        type: rawIntent?.target?.type || 'B2B',
        industry: rawIntent?.target?.industry ?? null,
        job_titles: Array.isArray(rawIntent?.target?.job_titles) ? rawIntent.target.job_titles : [],
        company_size: rawIntent?.target?.company_size ?? null
      },
      volume: typeof rawIntent?.volume === 'number' && rawIntent.volume > 0 ? rawIntent.volume : 100,
      tools: Array.isArray(rawIntent?.tools) ? rawIntent.tools : [],
      sequence: Array.isArray(rawIntent?.sequence) ? rawIntent.sequence : [],
      timing: {
        warmup_days: rawIntent?.timing?.warmup_days,
        send_schedule: rawIntent?.timing?.send_schedule ?? null
      }
    };

    return normalized;
  }
}

import { WorkflowToolAdapter, ToolContext, ConnectionResult, ToolActionDefinition, InputSchema, ToolExecutionResult } from './WorkflowToolAdapter';
import { ApolloService } from '../apollo.service';
import { findToolAccount } from '../../ai/pipeline/ensure-tool-accounts';

export class ApolloAdapter implements WorkflowToolAdapter {
  private async getApolloService(clientId: string): Promise<ApolloService> {
    const account = await findToolAccount(clientId, 'apollo');
    if (!account || !account.api_key_encrypted) {
      throw new Error('Apollo not connected or missing API key.');
    }
    return new ApolloService(account.api_key_encrypted);
  }

  async validateConnection(context: ToolContext): Promise<ConnectionResult> {
    try {
      await this.getApolloService(context.clientAccountId);
      return { isValid: true };
    } catch (e: any) {
      return { isValid: false, error: e.message };
    }
  }

  listActions(): ToolActionDefinition[] {
    return [
      { id: 'search_people', label: 'Search People', description: 'Search for leads on Apollo' },
      { id: 'enrich_contact', label: 'Enrich Contact', description: 'Enrich an existing lead' }
    ];
  }

  getInputSchema(action: string): InputSchema {
    if (action === 'search_people') {
      return {
        fields: [
          { name: 'first_name', type: 'string', required: false },
          { name: 'last_name', type: 'string', required: false },
          { name: 'company', type: 'string', required: false },
          { name: 'location', type: 'string', required: false },
          { name: 'job_title', type: 'string', required: false },
        ]
      };
    }
    return { fields: [] };
  }

  async execute(action: string, input: Record<string, unknown>, context: ToolContext): Promise<ToolExecutionResult> {
    try {
      const apollo = await this.getApolloService(context.clientAccountId);

      if (action === 'search_people') {
        const filters: any = {};
        if (input.first_name) filters.first_name = input.first_name;
        if (input.last_name) filters.last_name = input.last_name;
        if (input.company) filters.q_organization_domains = input.company; // Simplify
        if (input.location) filters.person_locations = input.location;
        if (input.job_title) filters.person_titles = input.job_title;

        // Perform search
        const result = await apollo.searchLeads(filters);
        
        const contacts = result.contacts || result.people || [];
        return {
          success: true,
          output: { contacts_found: contacts.length, contacts }
        };
      }

      throw new Error(`Unsupported action: ${action}`);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

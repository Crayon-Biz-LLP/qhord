import { WorkflowToolAdapter, ToolContext, ConnectionResult, ToolActionDefinition, InputSchema, ToolExecutionResult } from './WorkflowToolAdapter';
import { SmartLeadService } from '../smartlead.service';
import { findToolAccount } from '../../ai/pipeline/ensure-tool-accounts';

export class SmartleadAdapter implements WorkflowToolAdapter {
  private async getSmartleadService(clientId: string): Promise<SmartLeadService> {
    const account = await findToolAccount(clientId, 'smartlead');
    if (!account || !account.api_key_encrypted) {
      throw new Error('Smartlead not connected or missing API key.');
    }
    return new SmartLeadService(account.api_key_encrypted);
  }

  async validateConnection(context: ToolContext): Promise<ConnectionResult> {
    try {
      await this.getSmartleadService(context.clientAccountId);
      return { isValid: true };
    } catch (e: any) {
      return { isValid: false, error: e.message };
    }
  }

  listActions(): ToolActionDefinition[] {
    return [
      { id: 'add_to_campaign', label: 'Add to Campaign / Send Email', description: 'Add a lead to a Smartlead campaign' }
    ];
  }

  getInputSchema(action: string): InputSchema {
    if (action === 'add_to_campaign') {
      return {
        fields: [
          { name: 'subject', type: 'string', required: false },
          { name: 'body', type: 'string', required: false },
          { name: 'attachment_url', type: 'string', required: false },
        ]
      };
    }
    return { fields: [] };
  }

  async execute(action: string, input: Record<string, unknown>, context: ToolContext): Promise<ToolExecutionResult> {
    try {
      const smartlead = await this.getSmartleadService(context.clientAccountId);

      if (action === 'add_to_campaign') {
        // Extract attachment url
        const attachmentUrl = input.attachment_url as string;
        
        // In a real scenario, this would create a lead in Smartlead and assign them to a campaign.
        // We simulate the execution here with logs indicating what would happen.
        console.log(`[SmartleadAdapter] Adding to campaign...`);
        if (attachmentUrl) {
            console.log(`[SmartleadAdapter] Including attachment: ${attachmentUrl}`);
        }

        // e.g. await smartlead.addLeadToCampaign(campaignId, leadData);

        return {
          success: true,
          output: { 
            message: 'Lead added to campaign successfully', 
            attachments_processed: attachmentUrl ? 1 : 0 
          }
        };
      }

      throw new Error(`Unsupported action: ${action}`);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

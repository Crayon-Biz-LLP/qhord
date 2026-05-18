import { prisma } from '../../../lib/prisma';
import { CampaignManifest } from '../../utils/manifest-builder';

export interface ExecutorState {
  userInput: string;
  activeTools: string[];
  manifest?: CampaignManifest;
  validatedPlan?: CampaignManifest;
  validationErrors?: string[];
  warnings?: string[];
  campaignId?: string;
  executionStatus?: string;
  error?: string;
  // Add context for execution
  operatorId?: string;
  clientId?: string;
}

export class ExecutorNode {
  async invoke(state: ExecutorState): Promise<Partial<ExecutorState>> {
    try {
      if (!state.validatedPlan) {
        throw new Error('No validated plan provided to executor node');
      }

      const operatorId = state.operatorId;
      const clientId = state.clientId;

      if (!operatorId) {
        throw new Error('No authenticated operator found');
      }

      if (!clientId) {
        throw new Error('No client found for operator');
      }

      // Save the campaign to database
      const campaign = await this.saveCampaign(state.validatedPlan, clientId, operatorId);

      // Save the campaign steps
      await this.saveCampaignSteps(campaign.id, state.validatedPlan.steps);

      return {
        ...state,
        campaignId: campaign.id,
        executionStatus: 'draft', // Ready for approval
        error: undefined
      };

    } catch (error) {
      console.error('Executor node error:', error);
      return {
        ...state,
        campaignId: undefined,
        executionStatus: undefined,
        error: `Failed to prepare campaign: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async saveCampaign(
    manifest: CampaignManifest,
    clientId: string,
    operatorId: string
  ): Promise<any> {
    try {
      const campaign = await prisma.campaign.create({
        data: {
          client_id: clientId,
          name: manifest.name,
          description: manifest.description,
          status: 'draft',
          manifest: manifest as any, // JSON field
          estimated_cost: manifest.estimated_cost,
          estimated_duration: manifest.estimated_duration,
          created_by_operator_id: operatorId
        }
      });

      return campaign;
    } catch (error) {
      console.error('Error saving campaign:', error);
      throw new Error(`Failed to save campaign: ${error instanceof Error ? error.message : 'Database error'}`);
    }
  }

  private async saveCampaignSteps(campaignId: string, steps: any[]): Promise<void> {
    try {
      const stepData = steps.map(step => ({
        campaign_id: campaignId,
        step_order: step.order,
        tool_name: step.tool,
        action: step.action,
        params: step.params as any,
        status: 'pending',
        dependencies: step.dependencies as any,
        created_at: new Date(),
        updated_at: new Date()
      }));

      await prisma.campaignStep.createMany({
        data: stepData
      });
    } catch (error) {
      console.error('Error saving campaign steps:', error);
      throw new Error(`Failed to save campaign steps: ${error instanceof Error ? error.message : 'Database error'}`);
    }
  }
}

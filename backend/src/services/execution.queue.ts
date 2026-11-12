import { prisma } from '../lib/prisma';
import { campaignQueue } from '../queue/bullmq-setup';
import { ExecutionEngine } from './execution.engine';

export class ExecutionQueue {
  private executionEngine: ExecutionEngine;

  constructor() {
    this.executionEngine = new ExecutionEngine();
  }

  /**
   * Queues approved campaigns for execution. Pass `campaignId` to queue just
   * the one campaign that was just approved (the normal path, from
   * routes/approvals.ts). Pass `operatorId` to scope to one operator's
   * approved campaigns (the manual "trigger" endpoints, admin-only). With
   * neither, queues every approved campaign platform-wide — callers of that
   * form must themselves be gated to admins.
   */
  async triggerApprovedCampaigns(scope?: { campaignId?: string; operatorId?: string }) {
    const where: any = { status: 'approved' };
    if (scope?.campaignId) {
      where.id = scope.campaignId;
    } else if (scope?.operatorId) {
      where.created_by_operator_id = scope.operatorId;
    }

    const approvedCampaigns = await prisma.campaign.findMany({ where });

    console.log(`🚀 Found ${approvedCampaigns.length} approved campaigns to queue`);

    for (const campaign of approvedCampaigns) {
      await this.queueCampaign(campaign);
    }
  }

  async queueCampaign(campaign: any) {
    try {
      // Add campaign to BullMQ queue
      const job = await campaignQueue.add(
        'execute-campaign',
        {
          campaignId: campaign.id,
          operatorId: campaign.created_by_operator_id,
          clientId: campaign.client_id
        },
        {
          priority: campaign.priority || 5,
          delay: 0, // Execute immediately
          removeOnComplete: 100,
          removeOnFail: 50
        }
      );

      // Update campaign status to queued
      await prisma.campaign.update({
        where: { id: campaign.id },
        data: { status: 'executing' }
      });

      await prisma.executionQueue.upsert({
        where: { campaign_id: campaign.id },
        create: {
          campaign_id: campaign.id,
          status: 'queued',
          priority: campaign.priority || 5,
          scheduled_at: new Date()
        },
        update: {
          status: 'queued',
          priority: campaign.priority || 5,
          scheduled_at: new Date(),
          started_at: null,
          completed_at: null,
          error_message: null
        }
      }).catch((err) => console.error('[ExecutionQueue] Failed to upsert queue record:', err));

      console.log(`✅ Campaign queued for execution: ${campaign.name} (Job ID: ${job.id})`);
      return job;

    } catch (error) {
      console.error(`❌ Failed to queue campaign: ${campaign.name}`, error);

      // Mark campaign as failed
      await prisma.campaign.update({
        where: { id: campaign.id },
        data: { status: 'failed' }
      });

      throw error;
    }
  }

  async getJobStatus(jobId: string) {
    try {
      const job = await campaignQueue.getJob(jobId);
      if (!job) {
        return null;
      }

      const state = await job.getState();
      const progress = job.progress;

      return {
        id: job.id,
        name: job.name,
        data: job.data,
        state,
        progress,
        processedOn: job.processedOn,
        finishedOn: job.finishedOn,
        failedReason: job.failedReason
      };
    } catch (error) {
      console.error('Error getting job status:', error);
      return null;
    }
  }

  async getQueueStatus() {
    try {
      const waiting = await campaignQueue.getWaiting();
      const active = await campaignQueue.getActive();
      const completed = await campaignQueue.getCompleted();
      const failed = await campaignQueue.getFailed();

      return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        total: waiting.length + active.length + completed.length + failed.length
      };
    } catch (error) {
      console.error('Error getting queue status:', error);
      return null;
    }
  }

  async pauseQueue() {
    await campaignQueue.pause();
    console.log('⏸️ Campaign queue paused');
  }

  async resumeQueue() {
    await campaignQueue.resume();
    console.log('▶️ Campaign queue resumed');
  }

  async clearQueue() {
    await campaignQueue.drain();
    console.log('🗑️ Campaign queue cleared');
  }

  // Legacy method for backward compatibility
  private async executeCampaign(campaign: any) {
    console.log(`🎯 Queueing campaign: ${campaign.name}`);
    return this.queueCampaign(campaign);
  }

  // Legacy method for backward compatibility
  private async executeStep(step: any, operatorId: string, campaignId: string) {
    console.log(`📋 Step will be executed by worker: ${step.tool_name} - ${step.action}`);
    return {
      success: true,
      stepId: step.id,
      tool: step.tool_name,
      action: step.action,
      message: 'Step queued for execution by worker'
    };
  }

  // Legacy method for backward compatibility
  private generateMockResults(step: any) {
    console.log('⚠️ Mock results generation disabled - using real execution');
    return {
      status: 'queued',
      message: 'Step queued for real execution'
    };
  }

  // Legacy method for backward compatibility
  private async storeExecutionResults(campaignId: string, stepId: string, tool: string, metrics: any) {
    console.log('📊 Execution results will be stored by worker');
    // Results are now stored by the worker in campaign-worker.ts
  }

  async getExecutionStatus(campaignId: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    });

    return campaign;
  }
}

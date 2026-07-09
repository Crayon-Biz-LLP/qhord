import { Worker, Job } from 'bullmq';
import { redisConnection } from '../queue/bullmq-setup';
import { workflowGenerator } from '../services/workflow-generator.service';
import { prisma } from '../lib/prisma';
import { trackWorkerError, recoverFailedJob } from '../services/worker-recovery.service';

interface GenerationJobData {
  prompt: string;
  clientId: string;
  operatorId: string;
  campaignId?: string;
}

export class WorkflowGenerationWorker {
  private worker: Worker<GenerationJobData, any, string>;

  constructor() {
    this.worker = new Worker(
      'workflow-generation',
      this.processJob.bind(this),
      {
        connection: redisConnection as any,
        concurrency: 5,
        limiter: { max: 10, duration: 60000 },
      }
    );

    this.worker.on('completed', (job) => {
      console.log(`[GenWorker] ✅ Job ${job.id} completed`);
    });

    this.worker.on('failed', async (job, err) => {
      if (job) {
        await trackWorkerError(job, err);
        const recovered = await recoverFailedJob(job, 3);
        if (!recovered) {
          console.error(`[GenWorker] ❌ Job ${job.id} failed permanently after retries:`, err.message);
        }
      }
    });
  }

  private async processJob(job: Job<GenerationJobData, any, string>) {
    const { prompt, clientId, operatorId, campaignId } = job.data;

    try {
      await job.updateProgress(10);

      const workflow = await workflowGenerator.generateFromPrompt(prompt, clientId);

      await job.updateProgress(60);

      const saved = await workflowGenerator.saveWorkflow(workflow, clientId, operatorId, campaignId);

      await job.updateProgress(80);

      const client = await prisma.client.findUnique({
        where: { id: clientId },
        select: { approval_mode: true },
      });

      const approvalMode = client?.approval_mode || 'Approval required';
      const pendingApprovals: any[] = [];

      if (approvalMode === 'Approval required' || approvalMode === 'Hybrid') {
        for (const node of workflow.nodes) {
          if (node.node_type === 'action' && ['smartlead', 'instantly', 'heyreach', 'apollo'].includes(node.tool.toLowerCase())) {
            const pending = await prisma.pendingAction.create({
              data: {
                workflow_id: saved.id,
                client_id: clientId,
                action_type: node.tool === 'heyreach' ? 'send_linkedin' : 'send_email',
                action_label: node.label,
                action_config: node.configuration as any,
                status: 'pending',
                requested_by: 'AI Generator',
              },
            });
            pendingApprovals.push(pending);
          }
        }
      }

      await job.updateProgress(100);

      return {
        workflow,
        savedWorkflow: { id: saved.id, name: saved.workflow_name },
        pendingApprovals: pendingApprovals.map(a => ({
          id: a.id, action_type: a.action_type, action_label: a.action_label, status: a.status,
        })),
        approvalMode,
      };
    } catch (error) {
      await trackWorkerError(job, error);
      throw error;
    }
  }

  async close() {
    await this.worker.close();
  }
}

export const workflowGenerationWorker = new WorkflowGenerationWorker();

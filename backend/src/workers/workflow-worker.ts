import { Worker, Job } from 'bullmq';
import { redisConnection } from '../queue/bullmq-setup';
import { workflowEngine } from '../services/workflow.engine';

interface WorkflowJobData {
  workflowId: string;
  payload: any;
  operatorId: string;
}

export class WorkflowWorker {
  private worker: Worker<WorkflowJobData, any, string>;

  constructor() {
    this.worker = new Worker(
      'workflow-execution',
      this.processWorkflowJob.bind(this),
      {
        connection: redisConnection as any,
        concurrency: 10,
        limiter: {
          max: 20,
          duration: 60000,
        },
      }
    );

    this.worker.on('completed', (job) => {
      console.log(`[WorkflowWorker] ✅ Job completed: ${job.id}`);
    });

    this.worker.on('failed', (job, err) => {
      console.error(`[WorkflowWorker] ❌ Job failed ${job?.id}:`, err);
    });

    this.worker.on('error', (err) => {
      console.error('[WorkflowWorker] General worker error:', err);
    });
  }

  private async processWorkflowJob(job: Job<WorkflowJobData, any, string>) {
    const { workflowId, payload, operatorId } = job.data;
    try {
      console.log(`[WorkflowWorker] Processing job for workflow: ${workflowId}`);
      await workflowEngine.executeWorkflow(workflowId, payload, operatorId);
    } catch (error) {
      console.error(`[WorkflowWorker] Job processing error for workflow ${workflowId}:`, error);
      throw error;
    }
  }

  async close() {
    await this.worker.close();
    console.log('[WorkflowWorker] Closed');
  }
}

export const workflowWorker = new WorkflowWorker();

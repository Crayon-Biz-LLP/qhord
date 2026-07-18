import { Worker, Job } from 'bullmq';
import { redisConnection } from '../queue/bullmq-setup';
import { automationEngine } from '../services/automation.engine';

export class WorkflowWorker {
  private worker: Worker<any, any, string>;

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

  private async processWorkflowJob(job: Job<any, any, string>) {
    try {
      if (job.name.startsWith('run-')) {
        await automationEngine.processStep(job.data);
      } else {
        console.warn(`[WorkflowWorker] Unknown job type: ${job.name}`);
      }
    } catch (error) {
      console.error(`[WorkflowWorker] Job processing error:`, error);
      throw error;
    }
  }

  async close() {
    await this.worker.close();
    console.log('[WorkflowWorker] Closed');
  }
}

export const workflowWorker = new WorkflowWorker();

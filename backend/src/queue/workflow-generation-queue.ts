import { Queue, QueueEvents } from 'bullmq';
import { redisConnection } from './bullmq-setup';

export const workflowGenerationQueue = new Queue('workflow-generation', {
  connection: redisConnection as any,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 2,
    backoff: { type: 'exponential', delay: 2000 },
  },
});

export const workflowGenerationQueueEvents = new QueueEvents('workflow-generation', {
  connection: redisConnection as any,
});

workflowGenerationQueueEvents.on('completed', ({ jobId, returnvalue }) => {
  console.log(`[GenQueue] ✅ Generation job ${jobId} completed`);
});

workflowGenerationQueueEvents.on('failed', ({ jobId, failedReason }) => {
  console.error(`[GenQueue] ❌ Generation job ${jobId} failed:`, failedReason);
});

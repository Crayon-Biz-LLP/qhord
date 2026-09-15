import { Queue, QueueEvents } from 'bullmq';
import { redisConnection } from './bullmq-setup';

export const workflowQueue = new Queue('workflow-execution', {
  connection: redisConnection as any,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    delay: 0,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

export const workflowQueueEvents = new QueueEvents('workflow-execution', {
  connection: redisConnection as any,
});

// Recurring job that wakes up parked Delay nodes whose resume time has passed.
// jobId keeps this idempotent across server restarts (BullMQ won't duplicate the repeat).
workflowQueue.add('check-delays', {}, {
  repeat: { every: 60_000 },
  jobId: 'check-delays-repeat',
  removeOnComplete: true,
  removeOnFail: true
}).catch((err) => console.error('[workflow-queue] Failed to schedule check-delays repeat job:', err));

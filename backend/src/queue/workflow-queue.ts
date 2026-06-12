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

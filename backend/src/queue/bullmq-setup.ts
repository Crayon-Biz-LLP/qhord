import { Queue, Worker, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL?.trim() || 'redis://localhost:6379';
const isTlsRedis = redisUrl.startsWith('rediss://');

// Redis connection configuration
const redisConnection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  tls: isTlsRedis ? {} : undefined
});

// Create queue for campaign execution
export const campaignQueue = new Queue('campaign-execution', {
  connection: redisConnection as any,
  defaultJobOptions: {
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 50,      // Keep last 50 failed jobs
    delay: 0,
    attempts: 3,           // Retry failed jobs 3 times
    backoff: {
      type: 'exponential',
      delay: 2000,        // Start with 2s delay
    },
  },
});

// Queue events for monitoring
export const campaignQueueEvents = new QueueEvents('campaign-execution', {
  connection: redisConnection as any,
});

// Handle queue events for logging
campaignQueueEvents.on('completed', ({ jobId, returnvalue }) => {
  console.log(`✅ Campaign job ${jobId} completed:`, returnvalue);
});

campaignQueueEvents.on('failed', ({ jobId, failedReason }) => {
  console.error(`❌ Campaign job ${jobId} failed:`, failedReason);
});

campaignQueueEvents.on('progress', ({ jobId, data }) => {
  console.log(`📊 Campaign job ${jobId} progress:`, data);
});

// Export connection for workers
export { redisConnection };

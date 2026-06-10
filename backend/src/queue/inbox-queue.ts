import { Queue } from 'bullmq';
import { redisConnection } from './bullmq-setup';

export const INBOX_SYNC_QUEUE = 'inbox-sync';

// Background inbox sync queue. A repeatable "scan" job fans out into per-client
// "client" sync jobs so one slow tool/client never blocks the others.
export const inboxSyncQueue = new Queue(INBOX_SYNC_QUEUE, {
  connection: redisConnection as any,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 2,
    backoff: { type: 'exponential', delay: 5000 },
  },
});

/** Register the repeatable scan job (every INBOX_SYNC_INTERVAL_MIN minutes). */
export async function scheduleInboxSync(): Promise<void> {
  const minutes = parseInt(process.env.INBOX_SYNC_INTERVAL_MIN || '5', 10);
  await inboxSyncQueue.add(
    'scan',
    {},
    {
      repeat: { every: minutes * 60 * 1000 },
      jobId: 'inbox-sync-scan', // stable id prevents duplicate schedules
    },
  );
  console.log(`🔁 Inbox background sync scheduled every ${minutes}m`);
}

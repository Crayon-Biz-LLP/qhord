import { Worker, Job } from 'bullmq';
import { redisConnection } from '../queue/bullmq-setup';
import { INBOX_SYNC_QUEUE, inboxSyncQueue } from '../queue/inbox-queue';
import {
  getClientsWithInboxIntegrations,
  syncClientInbox,
} from '../services/inbox-sync.service';

interface ClientJobData {
  clientId: string;
}

/**
 * Background worker for inbox sync.
 *  - "scan"   → find all clients with connected inbox tools, enqueue one "client" job each
 *  - "client" → sync a single client's inbox across its connected tools
 */
export class InboxSyncWorker {
  private worker: Worker;

  constructor() {
    this.worker = new Worker(
      INBOX_SYNC_QUEUE,
      async (job: Job) => {
        if (job.name === 'scan') {
          const clientIds = await getClientsWithInboxIntegrations();
          for (const clientId of clientIds) {
            await inboxSyncQueue.add('client', { clientId } as ClientJobData);
          }
          return { enqueuedClients: clientIds.length };
        }

        if (job.name === 'client') {
          const { clientId } = job.data as ClientJobData;
          return await syncClientInbox(clientId);
        }

        return { skipped: job.name };
      },
      { connection: redisConnection as any, concurrency: 3 },
    );

    this.worker.on('completed', (job) => {
      if (job.name === 'scan') {
        console.log(`✅ Inbox scan completed: ${JSON.stringify(job.returnvalue)}`);
      }
    });
    this.worker.on('failed', (job, err) => {
      console.error(`❌ Inbox sync job ${job?.id} (${job?.name}) failed:`, err);
    });
    this.worker.on('error', (err) => console.error('Inbox sync worker error:', err));
  }

  async close() {
    await this.worker.close();
  }
}

export const inboxSyncWorker = new InboxSyncWorker();

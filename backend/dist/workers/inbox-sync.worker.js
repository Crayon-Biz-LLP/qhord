"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inboxSyncWorker = exports.InboxSyncWorker = void 0;
const bullmq_1 = require("bullmq");
const bullmq_setup_1 = require("../queue/bullmq-setup");
const inbox_queue_1 = require("../queue/inbox-queue");
const inbox_sync_service_1 = require("../services/inbox-sync.service");
/**
 * Background worker for inbox sync.
 *  - "scan"   → find all clients with connected inbox tools, enqueue one "client" job each
 *  - "client" → sync a single client's inbox across its connected tools
 */
class InboxSyncWorker {
    constructor() {
        this.worker = new bullmq_1.Worker(inbox_queue_1.INBOX_SYNC_QUEUE, async (job) => {
            if (job.name === 'scan') {
                const clientIds = await (0, inbox_sync_service_1.getClientsWithInboxIntegrations)();
                for (const clientId of clientIds) {
                    await inbox_queue_1.inboxSyncQueue.add('client', { clientId });
                }
                return { enqueuedClients: clientIds.length };
            }
            if (job.name === 'client') {
                const { clientId } = job.data;
                return await (0, inbox_sync_service_1.syncClientInbox)(clientId);
            }
            return { skipped: job.name };
        }, { connection: bullmq_setup_1.redisConnection, concurrency: 3 });
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
exports.InboxSyncWorker = InboxSyncWorker;
exports.inboxSyncWorker = new InboxSyncWorker();

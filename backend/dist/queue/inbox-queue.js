"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inboxSyncQueue = exports.INBOX_SYNC_QUEUE = void 0;
exports.scheduleInboxSync = scheduleInboxSync;
const bullmq_1 = require("bullmq");
const bullmq_setup_1 = require("./bullmq-setup");
exports.INBOX_SYNC_QUEUE = 'inbox-sync';
// Background inbox sync queue. A repeatable "scan" job fans out into per-client
// "client" sync jobs so one slow tool/client never blocks the others.
exports.inboxSyncQueue = new bullmq_1.Queue(exports.INBOX_SYNC_QUEUE, {
    connection: bullmq_setup_1.redisConnection,
    defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 2,
        backoff: { type: 'exponential', delay: 5000 },
    },
});
/** Register the repeatable scan job (every INBOX_SYNC_INTERVAL_MIN minutes). */
async function scheduleInboxSync() {
    const minutes = parseInt(process.env.INBOX_SYNC_INTERVAL_MIN || '5', 10);
    await exports.inboxSyncQueue.add('scan', {}, {
        repeat: { every: minutes * 60 * 1000 },
        jobId: 'inbox-sync-scan', // stable id prevents duplicate schedules
    });
    console.log(`🔁 Inbox background sync scheduled every ${minutes}m`);
}

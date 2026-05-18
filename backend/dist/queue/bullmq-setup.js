"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisConnection = exports.campaignQueueEvents = exports.campaignQueue = void 0;
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const redisUrl = process.env.REDIS_URL?.trim() || 'redis://localhost:6379';
const isTlsRedis = redisUrl.startsWith('rediss://');
// Redis connection configuration
const redisConnection = new ioredis_1.default(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    tls: isTlsRedis ? {} : undefined
});
exports.redisConnection = redisConnection;
// Create queue for campaign execution
exports.campaignQueue = new bullmq_1.Queue('campaign-execution', {
    connection: redisConnection,
    defaultJobOptions: {
        removeOnComplete: 100, // Keep last 100 completed jobs
        removeOnFail: 50, // Keep last 50 failed jobs
        delay: 0,
        attempts: 3, // Retry failed jobs 3 times
        backoff: {
            type: 'exponential',
            delay: 2000, // Start with 2s delay
        },
    },
});
// Queue events for monitoring
exports.campaignQueueEvents = new bullmq_1.QueueEvents('campaign-execution', {
    connection: redisConnection,
});
// Handle queue events for logging
exports.campaignQueueEvents.on('completed', ({ jobId, returnvalue }) => {
    console.log(`✅ Campaign job ${jobId} completed:`, returnvalue);
});
exports.campaignQueueEvents.on('failed', ({ jobId, failedReason }) => {
    console.error(`❌ Campaign job ${jobId} failed:`, failedReason);
});
exports.campaignQueueEvents.on('progress', ({ jobId, data }) => {
    console.log(`📊 Campaign job ${jobId} progress:`, data);
});

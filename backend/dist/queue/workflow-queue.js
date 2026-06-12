"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workflowQueueEvents = exports.workflowQueue = void 0;
const bullmq_1 = require("bullmq");
const bullmq_setup_1 = require("./bullmq-setup");
exports.workflowQueue = new bullmq_1.Queue('workflow-execution', {
    connection: bullmq_setup_1.redisConnection,
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
exports.workflowQueueEvents = new bullmq_1.QueueEvents('workflow-execution', {
    connection: bullmq_setup_1.redisConnection,
});

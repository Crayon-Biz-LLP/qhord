"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workflowWorker = exports.WorkflowWorker = void 0;
const bullmq_1 = require("bullmq");
const bullmq_setup_1 = require("../queue/bullmq-setup");
const workflow_engine_1 = require("../services/workflow.engine");
class WorkflowWorker {
    constructor() {
        this.worker = new bullmq_1.Worker('workflow-execution', this.processWorkflowJob.bind(this), {
            connection: bullmq_setup_1.redisConnection,
            concurrency: 10,
            limiter: {
                max: 20,
                duration: 60000,
            },
        });
        this.worker.on('completed', (job) => {
            console.log(`[WorkflowWorker] ✅ Job completed: ${job.id}`);
        });
        this.worker.on('failed', (job, err) => {
            console.error(`[WorkflowWorker] ❌ Job failed ${job?.id}:`, err);
        });
        this.worker.on('error', (err) => {
            console.error('[WorkflowWorker] General worker error:', err);
        });
    }
    async processWorkflowJob(job) {
        const { workflowId, payload, operatorId } = job.data;
        try {
            console.log(`[WorkflowWorker] Processing job for workflow: ${workflowId}`);
            await workflow_engine_1.workflowEngine.executeWorkflow(workflowId, payload, operatorId);
        }
        catch (error) {
            console.error(`[WorkflowWorker] Job processing error for workflow ${workflowId}:`, error);
            throw error;
        }
    }
    async close() {
        await this.worker.close();
        console.log('[WorkflowWorker] Closed');
    }
}
exports.WorkflowWorker = WorkflowWorker;
exports.workflowWorker = new WorkflowWorker();

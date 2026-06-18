"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
        const { workflowId, payload, operatorId, runId, nextNodeId } = job.data;
        try {
            if (runId && nextNodeId) {
                console.log(`[WorkflowWorker] Resuming execution of campaign workflow run: ${runId} from node: ${nextNodeId}`);
                const { campaignWorkflowEngine } = await Promise.resolve().then(() => __importStar(require('../services/campaign-workflow.engine')));
                await campaignWorkflowEngine.executeNode(runId, nextNodeId);
            }
            else {
                console.log(`[WorkflowWorker] Processing job for legacy workflow: ${workflowId}`);
                await workflow_engine_1.workflowEngine.executeWorkflow(workflowId, payload, operatorId);
            }
        }
        catch (error) {
            console.error(`[WorkflowWorker] Job processing error:`, error);
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

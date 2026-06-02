"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionQueue = void 0;
const prisma_1 = require("../lib/prisma");
const bullmq_setup_1 = require("../queue/bullmq-setup");
const execution_engine_1 = require("./execution.engine");
class ExecutionQueue {
    constructor() {
        this.executionEngine = new execution_engine_1.ExecutionEngine();
    }
    async triggerApprovedCampaigns() {
        // Find all approved campaigns that haven't been executed yet
        const approvedCampaigns = await prisma_1.prisma.campaign.findMany({
            where: {
                status: 'approved'
            }
        });
        console.log(`🚀 Found ${approvedCampaigns.length} approved campaigns to queue`);
        // Add each approved campaign to the queue
        for (const campaign of approvedCampaigns) {
            await this.queueCampaign(campaign);
        }
    }
    async queueCampaign(campaign) {
        try {
            // Add campaign to BullMQ queue
            const job = await bullmq_setup_1.campaignQueue.add('execute-campaign', {
                campaignId: campaign.id,
                operatorId: campaign.created_by_operator_id,
                clientId: campaign.client_id
            }, {
                priority: campaign.priority || 5,
                delay: 0, // Execute immediately
                removeOnComplete: 100,
                removeOnFail: 50
            });
            // Update campaign status to queued
            await prisma_1.prisma.campaign.update({
                where: { id: campaign.id },
                data: { status: 'executing' }
            });
            console.log(`✅ Campaign queued for execution: ${campaign.name} (Job ID: ${job.id})`);
            return job;
        }
        catch (error) {
            console.error(`❌ Failed to queue campaign: ${campaign.name}`, error);
            // Mark campaign as failed
            await prisma_1.prisma.campaign.update({
                where: { id: campaign.id },
                data: { status: 'failed' }
            });
            throw error;
        }
    }
    async getJobStatus(jobId) {
        try {
            const job = await bullmq_setup_1.campaignQueue.getJob(jobId);
            if (!job) {
                return null;
            }
            const state = await job.getState();
            const progress = job.progress;
            return {
                id: job.id,
                name: job.name,
                data: job.data,
                state,
                progress,
                processedOn: job.processedOn,
                finishedOn: job.finishedOn,
                failedReason: job.failedReason
            };
        }
        catch (error) {
            console.error('Error getting job status:', error);
            return null;
        }
    }
    async getQueueStatus() {
        try {
            const waiting = await bullmq_setup_1.campaignQueue.getWaiting();
            const active = await bullmq_setup_1.campaignQueue.getActive();
            const completed = await bullmq_setup_1.campaignQueue.getCompleted();
            const failed = await bullmq_setup_1.campaignQueue.getFailed();
            return {
                waiting: waiting.length,
                active: active.length,
                completed: completed.length,
                failed: failed.length,
                total: waiting.length + active.length + completed.length + failed.length
            };
        }
        catch (error) {
            console.error('Error getting queue status:', error);
            return null;
        }
    }
    async pauseQueue() {
        await bullmq_setup_1.campaignQueue.pause();
        console.log('⏸️ Campaign queue paused');
    }
    async resumeQueue() {
        await bullmq_setup_1.campaignQueue.resume();
        console.log('▶️ Campaign queue resumed');
    }
    async clearQueue() {
        await bullmq_setup_1.campaignQueue.drain();
        console.log('🗑️ Campaign queue cleared');
    }
    // Legacy method for backward compatibility
    async executeCampaign(campaign) {
        console.log(`🎯 Queueing campaign: ${campaign.name}`);
        return this.queueCampaign(campaign);
    }
    // Legacy method for backward compatibility
    async executeStep(step, operatorId, campaignId) {
        console.log(`📋 Step will be executed by worker: ${step.tool_name} - ${step.action}`);
        return {
            success: true,
            stepId: step.id,
            tool: step.tool_name,
            action: step.action,
            message: 'Step queued for execution by worker'
        };
    }
    // Legacy method for backward compatibility
    generateMockResults(step) {
        console.log('⚠️ Mock results generation disabled - using real execution');
        return {
            status: 'queued',
            message: 'Step queued for real execution'
        };
    }
    // Legacy method for backward compatibility
    async storeExecutionResults(campaignId, stepId, tool, metrics) {
        console.log('📊 Execution results will be stored by worker');
        // Results are now stored by the worker in campaign-worker.ts
    }
    async getExecutionStatus(campaignId) {
        const campaign = await prisma_1.prisma.campaign.findUnique({
            where: { id: campaignId }
        });
        return campaign;
    }
}
exports.ExecutionQueue = ExecutionQueue;

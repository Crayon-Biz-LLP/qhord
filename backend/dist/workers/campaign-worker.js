"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.campaignWorker = exports.CampaignWorker = void 0;
const bullmq_1 = require("bullmq");
const prisma_1 = require("../lib/prisma");
const execution_engine_1 = require("../services/execution.engine");
const bullmq_setup_1 = require("../queue/bullmq-setup");
class CampaignWorker {
    constructor() {
        this.executionEngine = new execution_engine_1.ExecutionEngine();
        // Create worker for campaign execution
        this.worker = new bullmq_1.Worker('campaign-execution', this.processCampaign.bind(this), {
            connection: bullmq_setup_1.redisConnection,
            concurrency: 5, // Process 5 campaigns concurrently
            limiter: {
                max: 10,
                duration: 60000, // 10 jobs per minute max
            },
        });
        // Handle worker events
        this.worker.on('completed', (job) => {
            console.log(`✅ Campaign worker completed job ${job.id}`);
        });
        this.worker.on('failed', (job, err) => {
            console.error(`❌ Campaign worker failed job ${job?.id}:`, err);
        });
        this.worker.on('error', (err) => {
            console.error('Campaign worker error:', err);
        });
    }
    async processCampaign(job) {
        const { campaignId, operatorId, clientId } = job.data;
        try {
            console.log(`🚀 Starting campaign execution: ${campaignId}`);
            // Update campaign status to executing
            await prisma_1.prisma.campaign.update({
                where: { id: campaignId },
                data: { status: 'executing' }
            });
            // Get campaign steps from database
            const campaignSteps = await prisma_1.prisma.campaignStep.findMany({
                where: { campaign_id: campaignId },
                orderBy: { step_order: 'asc' }
            });
            console.log(`📋 Found ${campaignSteps.length} steps to execute`);
            // Execute each step in order
            const results = [];
            for (const step of campaignSteps) {
                try {
                    // Update step status to running
                    await prisma_1.prisma.campaignStep.update({
                        where: { id: step.id },
                        data: { status: 'running' }
                    });
                    // Report progress
                    job.updateProgress({
                        currentStep: step.step_order,
                        totalSteps: campaignSteps.length,
                        stepName: `${step.tool_name} - ${step.action}`
                    });
                    // Execute the step
                    const result = await this.executeStep(step, operatorId, clientId);
                    results.push(result);
                    // Update step status to completed
                    await prisma_1.prisma.campaignStep.update({
                        where: { id: step.id },
                        data: { status: 'completed' }
                    });
                    console.log(`✅ Step completed: ${step.tool_name} - ${step.action}`);
                }
                catch (stepError) {
                    console.error(`❌ Step failed: ${step.tool_name} - ${step.action}`, stepError);
                    // Update step status to failed
                    await prisma_1.prisma.campaignStep.update({
                        where: { id: step.id },
                        data: { status: 'failed' }
                    });
                    throw stepError; // Fail the entire campaign if a step fails
                }
            }
            // Mark campaign as completed
            await prisma_1.prisma.campaign.update({
                where: { id: campaignId },
                data: {
                    status: 'completed',
                    updated_at: new Date()
                }
            });
            console.log(`✅ Campaign completed successfully: ${campaignId}`);
            return {
                success: true,
                campaignId,
                stepsExecuted: results.length,
                message: 'Campaign executed successfully'
            };
        }
        catch (error) {
            console.error(`❌ Campaign execution failed: ${campaignId}`, error);
            // Mark campaign as failed
            await prisma_1.prisma.campaign.update({
                where: { id: campaignId },
                data: {
                    status: 'failed',
                    updated_at: new Date()
                }
            });
            throw error;
        }
    }
    async executeStep(step, operatorId, clientId) {
        console.log(`📋 Executing step: ${step.tool_name} - ${step.action}`);
        // Get tool account for this client
        const toolAccount = await prisma_1.prisma.clientToolAccount.findFirst({
            where: {
                client_id: clientId,
                tool_name: step.tool_name
            }
        });
        if (!toolAccount) {
            throw new Error(`No tool account found for ${step.tool_name} on client ${clientId}`);
        }
        // Execute using the execution engine
        const execution = await this.executionEngine.execute({
            clientId,
            tool: step.tool_name.toLowerCase(),
            toolAccountId: toolAccount.id,
            contextId: undefined,
            action: step.action,
            payload: step.params
        }, operatorId);
        return {
            success: execution.status === 'success',
            stepId: step.id,
            tool: step.tool_name,
            action: step.action,
            executionId: execution.id,
            response: execution.response_payload
        };
    }
    // Graceful shutdown
    async close() {
        await this.worker.close();
        console.log('Campaign worker closed');
    }
}
exports.CampaignWorker = CampaignWorker;
// Create and export singleton instance
exports.campaignWorker = new CampaignWorker();

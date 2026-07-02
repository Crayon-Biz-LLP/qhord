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
exports.campaignWorker = exports.CampaignWorker = void 0;
const bullmq_1 = require("bullmq");
const prisma_1 = require("../lib/prisma");
const execution_engine_1 = require("../services/execution.engine");
const bullmq_setup_1 = require("../queue/bullmq-setup");
const action_resolver_1 = require("../ai/pipeline/action-resolver");
const pipeline_types_1 = require("../ai/pipeline/pipeline-types");
const pipeline_leads_1 = require("../ai/pipeline/pipeline-leads");
const ensure_tool_accounts_1 = require("../ai/pipeline/ensure-tool-accounts");
const CREDIT_COST = {
    hunter: 2,
    bettercontacts: 1,
    brevo: 3,
    calendly: 1,
    smartlead: 2,
    heyreach: 2,
    instantly: 2,
    hubspot: 1,
    salesforce: 1,
};
class CampaignWorker {
    constructor() {
        this.executionEngine = new execution_engine_1.ExecutionEngine();
        this.worker = new bullmq_1.Worker('campaign-execution', this.processCampaign.bind(this), {
            connection: bullmq_setup_1.redisConnection,
            concurrency: 5,
            limiter: {
                max: 10,
                duration: 60000,
            },
        });
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
            await prisma_1.prisma.campaign.update({
                where: { id: campaignId },
                data: { status: 'executing' },
            });
            // Check if this campaign has a visual CampaignWorkflow configured
            const workflow = await prisma_1.prisma.campaignWorkflow.findFirst({
                where: { campaign_id: campaignId },
                include: { nodes: true },
            });
            if (workflow) {
                console.log(`📊 Found visual CampaignWorkflow: ${workflow.id}. Activating and initiating runs.`);
                await prisma_1.prisma.campaignWorkflow.update({
                    where: { id: workflow.id },
                    data: { status: 'active' },
                });
                // Ensure mock/auto accounts exist for this client so execution runs smoothly
                const { ensureToolAccountsForPipeline } = await Promise.resolve().then(() => __importStar(require('../ai/pipeline/ensure-tool-accounts')));
                const toolsUsed = workflow.nodes.map(n => n.tool);
                await ensureToolAccountsForPipeline(clientId, operatorId, toolsUsed);
                // Run trigger node ingestion
                const triggerNode = workflow.nodes.find(n => n.node_type === 'source');
                let people = [];
                if (triggerNode) {
                    console.log(`[CampaignWorker] Ingesting leads from source node: ${triggerNode.tool}`);
                    if (triggerNode.tool === 'apollo' || triggerNode.tool === 'hunter') {
                        const { findToolAccount } = await Promise.resolve().then(() => __importStar(require('../ai/pipeline/ensure-tool-accounts')));
                        const account = await findToolAccount(clientId, triggerNode.tool);
                        const apiKey = account?.api_key_encrypted || 'mock_api_key';
                        try {
                            if (triggerNode.tool === 'apollo') {
                                const { ApolloService } = await Promise.resolve().then(() => __importStar(require('../services/apollo.service')));
                                const service = new ApolloService(apiKey);
                                const apolloRes = await service.searchLeads({
                                    q_organization_domains: 'google.com\nstripe.com',
                                    page: 1,
                                    per_page: 5,
                                });
                                people = apolloRes.contacts || apolloRes.people || [];
                            }
                            else {
                                const { HunterService } = await Promise.resolve().then(() => __importStar(require('../services/hunter.service')));
                                const service = new HunterService(apiKey);
                                const hunterRes = await service.searchLeads({
                                    query: 'google.com',
                                    limit: 5,
                                });
                                people = hunterRes.emails || [];
                            }
                        }
                        catch (err) {
                            console.log('[CampaignWorker] Lead search failed, using mock prospects fallback...');
                        }
                    }
                }
                // Mock fallback if search failed or returned no leads
                if (people.length === 0) {
                    people = [
                        { email: 'prospect1@neondb.tech', first_name: 'Jane', last_name: 'Doe', organization: { name: 'Neon DB' } },
                        { email: 'prospect2@neon.tech', first_name: 'John', last_name: 'Smith', organization: { name: 'Neon Tech' } },
                    ];
                }
                const { campaignWorkflowEngine } = await Promise.resolve().then(() => __importStar(require('../services/campaign-workflow.engine')));
                const initiatedRuns = [];
                for (const person of people) {
                    let lead = await prisma_1.prisma.lead.findFirst({
                        where: { client_id: clientId, email: person.email },
                    });
                    if (!lead) {
                        lead = await prisma_1.prisma.lead.create({
                            data: {
                                client_id: clientId,
                                campaign_id: campaignId,
                                email: person.email,
                                first_name: person.first_name || '',
                                last_name: person.last_name || '',
                                company_name: person.organization?.name || 'SaaS Company',
                                status: 'new',
                            },
                        });
                    }
                    await campaignWorkflowEngine.startWorkflowRun(workflow.id, lead.id);
                    initiatedRuns.push(lead.id);
                }
                await prisma_1.prisma.campaign.update({
                    where: { id: campaignId },
                    data: {
                        status: 'completed',
                        updated_at: new Date(),
                    },
                });
                console.log(`✅ Campaign workflow runs initiated successfully for ${initiatedRuns.length} leads.`);
                return {
                    success: true,
                    campaignId,
                    workflowId: workflow.id,
                    leadsProcessed: initiatedRuns.length,
                    message: 'Campaign workflow runs executed successfully'
                };
            }
            const campaignSteps = await prisma_1.prisma.campaignStep.findMany({
                where: { campaign_id: campaignId },
                orderBy: { step_order: 'asc' },
            });
            const manifestSteps = campaignSteps.map((s) => ({
                id: s.id,
                order: s.step_order,
                tool: s.tool_name,
                action: s.action,
                params: s.params || {},
                dependencies: s.dependencies || [],
            }));
            const resolvedSteps = (0, action_resolver_1.resolveManifestSteps)(manifestSteps);
            console.log(`📋 Resolved ${resolvedSteps.length} execution actions from ${campaignSteps.length} manifest steps`);
            let pipelineContext = (0, pipeline_types_1.emptyPipelineContext)();
            const results = [];
            let stepIndex = 0;
            for (const resolved of resolvedSteps) {
                stepIndex += 1;
                const manifestStep = manifestSteps.find((m) => m.id === resolved.manifestStepId);
                const manifestParams = manifestStep?.params || {};
                try {
                    await job.updateProgress({
                        currentStep: stepIndex,
                        totalSteps: resolvedSteps.length,
                        stepName: resolved.label,
                    });
                    if (resolved.skipExecution) {
                        if (resolved.waitMs && resolved.waitMs > 0) {
                            await new Promise((r) => setTimeout(r, resolved.waitMs));
                        }
                        console.log(`⏭️ Skipped (system): ${resolved.label}`);
                        continue;
                    }
                    const payload = (0, action_resolver_1.applyPipelineToPayload)(resolved, pipelineContext, manifestParams);
                    const result = await this.executeResolvedStep(resolved, payload, operatorId, clientId, campaignId);
                    results.push(result);
                    pipelineContext = (0, pipeline_leads_1.mergePipelineContext)(pipelineContext, resolved.tool, resolved.action, result.response);
                    console.log(`✅ ${resolved.label} — ${pipelineContext.leads.length} leads in pipeline`);
                }
                catch (stepError) {
                    console.error(`❌ Failed: ${resolved.label}`, stepError);
                    results.push({
                        success: false,
                        tool: resolved.tool,
                        action: resolved.action,
                        status: 'error',
                        error: stepError instanceof Error ? stepError.message : String(stepError),
                        response: null,
                    });
                }
            }
            // Persist leads from pipeline to database
            if (pipelineContext.leads.length > 0) {
                const leadData = pipelineContext.leads.map((l) => ({
                    client_id: clientId,
                    campaign_id: campaignId,
                    email: l.email || '',
                    first_name: l.first_name || l.firstName || '',
                    last_name: l.last_name || l.lastName || '',
                    title: l.title || l.position || '',
                    company_name: l.company_name || l.company || '',
                    domain: l.domain || '',
                    linkedin_url: l.linkedin_url || '',
                    industry: l.industry || '',
                    source: l.source || 'hunter',
                    status: 'new',
                    enriched: false,
                }));
                await prisma_1.prisma.lead.createMany({ data: leadData, skipDuplicates: true });
                console.log(`📝 ${leadData.length} leads saved to DB`);
            }
            await prisma_1.prisma.campaign.update({
                where: { id: campaignId },
                data: {
                    status: 'completed',
                    updated_at: new Date(),
                },
            });
            const hasErrors = results.some((r) => r.status === 'error');
            console.log(`${hasErrors ? '⚠️' : '✅'} Campaign finished: ${campaignId}`);
            return {
                success: !hasErrors,
                campaignId,
                stepsExecuted: results.length,
                leadsProcessed: pipelineContext.leads.length,
                results,
                message: hasErrors ? 'Campaign completed with errors' : 'Campaign executed successfully',
            };
        }
        catch (error) {
            console.error(`❌ Campaign execution failed: ${campaignId}`, error);
            await prisma_1.prisma.campaign.update({
                where: { id: campaignId },
                data: {
                    status: 'failed',
                    updated_at: new Date(),
                },
            });
            throw error;
        }
    }
    async executeResolvedStep(resolved, payload, operatorId, clientId, campaignId) {
        const toolAccount = await (0, ensure_tool_accounts_1.findToolAccount)(clientId, resolved.tool);
        if (!toolAccount) {
            throw new Error(`No tool account for ${resolved.tool}. Connect ${resolved.tool} in settings or run with mock accounts.`);
        }
        const execution = await this.executionEngine.execute({
            clientId,
            tool: resolved.tool,
            toolAccountId: toolAccount.id,
            contextId: undefined,
            action: resolved.action,
            payload,
        }, operatorId);
        if (execution.status !== 'success') {
            throw new Error(execution.error_message || `Step failed: ${resolved.label}`);
        }
        // Consume credits after successful step
        try {
            const cost = CREDIT_COST[resolved.tool] || 1;
            const credit = await prisma_1.prisma.clientCredit.findUnique({ where: { client_id: clientId } });
            if (credit && credit.balance >= cost) {
                await prisma_1.prisma.clientCredit.update({
                    where: { id: credit.id },
                    data: { balance: { decrement: cost }, total_used: { increment: cost } },
                });
                await prisma_1.prisma.creditTransaction.create({
                    data: {
                        credit_id: credit.id,
                        amount: cost,
                        type: 'debit',
                        description: `${resolved.tool}:${resolved.action}`,
                        tool_name: resolved.tool,
                        action: resolved.action,
                        campaign_id: campaignId,
                        execution_id: execution.id,
                    },
                });
                console.log(`💰 Consumed ${cost} credits for ${resolved.tool}:${resolved.action}`);
            }
        }
        catch (creditErr) {
            console.error(`⚠️ Credit consumption failed (non-blocking):`, creditErr);
        }
        return {
            success: true,
            status: 'success',
            tool: resolved.tool,
            action: resolved.action,
            executionId: execution.id,
            response: execution.response_payload,
        };
    }
    /** Run campaign steps in-process (no Redis queue). Used when QHORD_SYNC_PIPELINE=true. */
    async runCampaignNow(campaignId, operatorId, clientId) {
        const job = {
            id: `sync-${campaignId}`,
            data: { campaignId, operatorId, clientId },
            updateProgress: async () => { },
        };
        return this.processCampaign(job);
    }
    async close() {
        await this.worker.close();
        console.log('Campaign worker closed');
    }
}
exports.CampaignWorker = CampaignWorker;
exports.campaignWorker = new CampaignWorker();

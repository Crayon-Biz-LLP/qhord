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
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const prisma_1 = require("../lib/prisma");
const parser_node_1 = require("../ai/langgraph/nodes/parser-node");
const architect_node_1 = require("../ai/langgraph/nodes/architect-node");
const validator_node_1 = require("../ai/langgraph/nodes/validator-node");
const action_resolver_1 = require("../ai/pipeline/action-resolver");
const execution_queue_1 = require("../services/execution.queue");
const ensure_tool_accounts_1 = require("../ai/pipeline/ensure-tool-accounts");
const campaign_worker_1 = require("../workers/campaign-worker");
const demo_stack_1 = require("../config/demo-stack");
const workflow_engine_1 = require("../services/workflow.engine");
const router = (0, express_1.Router)();
const executionQueue = new execution_queue_1.ExecutionQueue();
const parserNode = new parser_node_1.ParserNode();
const architectNode = new architect_node_1.ArchitectNode();
const validatorNode = new validator_node_1.ValidatorNode();
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
async function getClientCredit(clientId) {
    let credit = await prisma_1.prisma.clientCredit.findUnique({ where: { client_id: clientId } });
    if (!credit) {
        credit = await prisma_1.prisma.clientCredit.create({
            data: { client_id: clientId, balance: 2000 },
        });
    }
    return credit;
}
router.use(auth_1.requireAuth);
// ── GET /api/workflows ───────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const clientId = req.query.clientId;
        if (!clientId) {
            return res.status(400).json({ success: false, error: 'clientId query parameter is required' });
        }
        const workflows = await prisma_1.prisma.workflow.findMany({
            where: {
                client_id: clientId
            },
            orderBy: { created_at: 'desc' },
            take: 100
        });
        res.json({
            success: true,
            workflows: workflows.map((w) => ({
                id: w.id,
                name: w.name,
                description: w.name + ' workflow',
                status: w.status,
                createdAt: w.created_at,
                updatedAt: w.updated_at,
                manifest: {
                    trigger: w.trigger_type,
                    target: w.target_type,
                    path: w.path_actions,
                    builderType: w.mode,
                    enrollment: w.enrollment_filters,
                    guardrails: w.guardrails,
                    mode: w.execution_mode
                }
            }))
        });
    }
    catch (error) {
        console.error('List workflows error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch workflows' });
    }
});
// ── POST /api/workflows ──────────────────────────────────────────
router.post('/', async (req, res) => {
    try {
        const { name, mode, executionMode, trigger, target, enrollment, guardrails, path, status, clientId } = req.body;
        const operatorId = req.user.id;
        if (!clientId) {
            return res.status(400).json({ success: false, error: 'clientId is required' });
        }
        const wf = await prisma_1.prisma.workflow.create({
            data: {
                name: name || 'Untitled workflow',
                mode: mode || 'standard',
                execution_mode: executionMode || 'auto_with_guardrails',
                trigger_type: trigger || 'Manual run',
                target_type: target || 'people',
                enrollment_filters: enrollment || [],
                guardrails: guardrails || [],
                path_actions: path || [],
                status: status || 'draft',
                created_by_operator_id: operatorId,
                client_id: clientId
            }
        });
        res.status(201).json({ success: true, workflow: wf });
    }
    catch (error) {
        console.error('Create workflow error:', error);
        res.status(500).json({ success: false, error: 'Failed to create workflow' });
    }
});
// ── GET /api/workflows/:id ───────────────────────────────────────
router.get('/:id', async (req, res) => {
    try {
        const wf = await prisma_1.prisma.workflow.findUnique({
            where: { id: req.params.id }
        });
        if (!wf) {
            return res.status(404).json({ success: false, error: 'Workflow not found' });
        }
        res.json({ success: true, workflow: wf });
    }
    catch (error) {
        console.error('Get workflow error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch workflow' });
    }
});
// ── PUT /api/workflows/:id ───────────────────────────────────────
router.put('/:id', async (req, res) => {
    try {
        const { name, mode, executionMode, trigger, target, enrollment, guardrails, path, status } = req.body;
        const wf = await prisma_1.prisma.workflow.update({
            where: { id: req.params.id },
            data: {
                name,
                mode,
                execution_mode: executionMode,
                trigger_type: trigger,
                target_type: target,
                enrollment_filters: enrollment,
                guardrails,
                path_actions: path,
                status
            }
        });
        res.json({ success: true, workflow: wf });
    }
    catch (error) {
        console.error('Update workflow error:', error);
        res.status(500).json({ success: false, error: 'Failed to update workflow' });
    }
});
// ── DELETE /api/workflows/:id ────────────────────────────────────
router.delete('/:id', async (req, res) => {
    try {
        await prisma_1.prisma.workflow.delete({
            where: { id: req.params.id }
        });
        res.json({ success: true, message: 'Workflow deleted successfully' });
    }
    catch (error) {
        console.error('Delete workflow error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete workflow' });
    }
});
// ── POST /api/workflows/:id/save-draft ───────────────────────────
router.post('/:id/save-draft', async (req, res) => {
    try {
        const wf = await prisma_1.prisma.workflow.update({
            where: { id: req.params.id },
            data: {
                status: 'draft',
                ...req.body
            }
        });
        res.json({ success: true, workflow: wf });
    }
    catch (error) {
        console.error('Save draft error:', error);
        res.status(500).json({ success: false, error: 'Failed to save draft' });
    }
});
// ── POST /api/workflows/:id/launch ───────────────────────────────
router.post('/:id/launch', async (req, res) => {
    try {
        const { id } = req.params;
        const wf = await prisma_1.prisma.workflow.findUnique({ where: { id } });
        if (!wf)
            return res.status(404).json({ success: false, error: 'Workflow not found' });
        // Validate tools
        const pathPreset = wf.path_actions;
        const accounts = await prisma_1.prisma.clientToolAccount.findMany({
            where: { client_id: wf.client_id }
        });
        // Validate trigger tool connection
        const triggerStr = wf.trigger_type || '';
        const triggerParts = triggerStr.split(': ');
        if (triggerParts.length === 2) {
            const toolName = triggerParts[0].toLowerCase();
            const mappedToolName = toolName === 'bettercontact' ? 'bettercontacts' : toolName;
            const hasAccount = accounts.some(a => a.tool_name.toLowerCase() === mappedToolName);
            if (!hasAccount) {
                return res.status(400).json({
                    success: false,
                    error: `Tool "${triggerParts[0]}" is not connected. Please connect it first.`
                });
            }
        }
        if (pathPreset === 'Email-first cadence') {
            const smartleadAcc = accounts.find(a => a.tool_name === 'smartlead');
            const apolloAcc = accounts.find(a => a.tool_name === 'apollo');
            const instantlyAcc = accounts.find(a => a.tool_name === 'instantly');
            if (!smartleadAcc && !apolloAcc && !instantlyAcc) {
                return res.status(400).json({ success: false, error: 'Apollo not connected / Smartlead/Instantly campaign missing' });
            }
        }
        else if (pathPreset === 'LinkedIn-first') {
            const heyreachAcc = accounts.find(a => a.tool_name === 'heyreach');
            if (!heyreachAcc) {
                return res.status(400).json({ success: false, error: 'HeyReach workspace not selected' });
            }
        }
        else if (pathPreset === 'Route by channel readiness') {
            const emailAcc = accounts.some(a => ['smartlead', 'apollo', 'instantly'].includes(a.tool_name));
            const linkedinAcc = accounts.some(a => a.tool_name === 'heyreach');
            const enrichAcc = accounts.some(a => ['clay', 'bettercontacts'].includes(a.tool_name));
            if (!emailAcc && !linkedinAcc && !enrichAcc) {
                return res.status(400).json({ success: false, error: 'Clay API key missing / BetterContact credits missing' });
            }
        }
        const updated = await prisma_1.prisma.workflow.update({
            where: { id },
            data: { status: 'active' }
        });
        res.json({ success: true, workflow: updated });
    }
    catch (error) {
        console.error('Launch workflow error:', error);
        res.status(500).json({ success: false, error: 'Failed to launch workflow' });
    }
});
// ── POST /api/workflows/:id/pause ────────────────────────────────
router.post('/:id/pause', async (req, res) => {
    try {
        const wf = await prisma_1.prisma.workflow.update({
            where: { id: req.params.id },
            data: { status: 'paused' }
        });
        res.json({ success: true, workflow: wf });
    }
    catch (error) {
        console.error('Pause workflow error:', error);
        res.status(500).json({ success: false, error: 'Failed to pause workflow' });
    }
});
// ── POST /api/workflows/:id/resume ───────────────────────────────
router.post('/:id/resume', async (req, res) => {
    try {
        const wf = await prisma_1.prisma.workflow.update({
            where: { id: req.params.id },
            data: { status: 'active' }
        });
        res.json({ success: true, workflow: wf });
    }
    catch (error) {
        console.error('Resume workflow error:', error);
        res.status(500).json({ success: false, error: 'Failed to resume workflow' });
    }
});
// ── POST /api/workflows/:id/test-run ─────────────────────────────
router.post('/:id/test-run', async (req, res) => {
    try {
        const { id } = req.params;
        const wf = await prisma_1.prisma.workflow.findUnique({ where: { id } });
        if (!wf)
            return res.status(404).json({ success: false, error: 'Workflow not found' });
        const payload = {
            email: 'test_prospect@example.com',
            first_name: 'Test',
            last_name: 'Prospect',
            company: 'Test Company',
            linkedin_url: 'https://linkedin.com/in/testprospect',
            score: 85,
            region: 'US',
            record_id: `test_rec_${Date.now()}`
        };
        // Execute synchronous test run
        await workflow_engine_1.workflowEngine.executeWorkflow(id, payload, req.user.id);
        res.json({ success: true, message: 'Test run executed successfully. Check run history.' });
    }
    catch (error) {
        console.error('Test run workflow error:', error);
        res.status(500).json({ success: false, error: 'Failed to trigger test run' });
    }
});
// ── GET /api/workflows/:id/runs ──────────────────────────────────
router.get('/:id/runs', async (req, res) => {
    try {
        const runs = await prisma_1.prisma.workflowRun.findMany({
            where: { workflow_id: req.params.id },
            orderBy: { timestamp: 'desc' }
        });
        res.json({ success: true, runs });
    }
    catch (error) {
        console.error('Get workflow runs error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch runs' });
    }
});
// ── POST /api/webhooks/tools/:tool/:event ──────────────────────
router.post('/webhooks/tools/:tool/:event', async (req, res) => {
    try {
        const { tool, event } = req.params;
        const payload = req.body;
        const clientId = req.query.clientId || payload.clientId || payload.client_id;
        if (!clientId) {
            return res.status(400).json({ success: false, error: 'clientId parameter is required' });
        }
        let formattedTool = tool.charAt(0).toUpperCase() + tool.slice(1);
        if (tool.toLowerCase() === 'bettercontacts' || tool.toLowerCase() === 'bettercontact') {
            formattedTool = 'BetterContact';
        }
        else if (tool.toLowerCase() === 'smartlead') {
            formattedTool = 'Smartlead';
        }
        else if (tool.toLowerCase() === 'heyreach') {
            formattedTool = 'HeyReach';
        }
        let cleanEvent = event;
        const lowerEvent = event.toLowerCase();
        if (lowerEvent.includes('reply') || lowerEvent.includes('replied')) {
            cleanEvent = formattedTool === 'HeyReach' ? 'LinkedIn replied' : 'Email replied';
        }
        else if (lowerEvent.includes('sequence_step') || lowerEvent.includes('step_completed')) {
            cleanEvent = 'Sequence step completed';
        }
        else if (lowerEvent.includes('sequence_added') || lowerEvent.includes('added_to_sequence')) {
            cleanEvent = 'Contact added to sequence';
        }
        else if (lowerEvent.includes('meeting_booked') || lowerEvent.includes('booked')) {
            if (formattedTool === 'Apollo') {
                cleanEvent = 'Meeting booked, if Apollo calendar data is available';
            }
            else {
                cleanEvent = 'Meeting booked';
            }
        }
        else if (lowerEvent.includes('meeting_cancelled') || lowerEvent.includes('cancelled')) {
            cleanEvent = 'Meeting cancelled';
        }
        else if (lowerEvent.includes('meeting_rescheduled') || lowerEvent.includes('rescheduled')) {
            cleanEvent = 'Meeting rescheduled';
        }
        else if (lowerEvent.includes('enrich') || lowerEvent.includes('enriched')) {
            if (lowerEvent.includes('company')) {
                cleanEvent = 'Company enriched';
            }
            else {
                cleanEvent = 'Lead enriched';
            }
        }
        else if (lowerEvent.includes('enrich_failed') || lowerEvent.includes('failed')) {
            cleanEvent = 'Enrichment failed';
        }
        else if (lowerEvent.includes('data_updated') || lowerEvent.includes('updated')) {
            cleanEvent = 'Data updated';
        }
        else if (lowerEvent.includes('bounced') || lowerEvent.includes('bounce')) {
            cleanEvent = 'Email bounced';
        }
        else if (lowerEvent.includes('unsubscribe') || lowerEvent.includes('unsubscribed')) {
            cleanEvent = 'Unsubscribed';
        }
        else if (lowerEvent.includes('campaign_step') || lowerEvent.includes('step')) {
            cleanEvent = 'Campaign step completed';
        }
        else if (lowerEvent.includes('added_to_campaign') || lowerEvent.includes('lead_added')) {
            cleanEvent = 'Lead added to campaign';
        }
        else if (lowerEvent.includes('email_verified') || lowerEvent.includes('verified_email')) {
            cleanEvent = 'Email verified';
        }
        else if (lowerEvent.includes('phone_verified') || lowerEvent.includes('verified_phone')) {
            cleanEvent = 'Phone verified';
        }
        else if (lowerEvent.includes('invalid') || lowerEvent.includes('invalid_contact')) {
            cleanEvent = 'Invalid contact detected';
        }
        else if (lowerEvent.includes('connection_accepted') || lowerEvent.includes('accepted')) {
            cleanEvent = 'Connection request accepted';
        }
        else if (lowerEvent.includes('message_sent') || lowerEvent.includes('sent')) {
            cleanEvent = 'Message sent';
        }
        else if (lowerEvent.includes('campaign_completed') || lowerEvent.includes('completed')) {
            cleanEvent = 'Campaign completed';
        }
        const triggerEvent = `${formattedTool}: ${cleanEvent}`;
        await workflow_engine_1.workflowEngine.triggerWorkflow(triggerEvent, clientId, payload);
        res.json({ success: true, message: `Webhook processed. Triggered event: ${triggerEvent}` });
    }
    catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).json({ success: false, error: 'Failed to process webhook' });
    }
});
// ── Legacy support endpoints ─────────────────────────────────────
router.post('/manual', async (req, res) => {
    try {
        const { name, trigger, target, enrollment, guardrails, path, mode, status, clientId } = req.body;
        const operatorId = req.user.id;
        if (!clientId) {
            return res.status(400).json({ success: false, error: 'Please select a client to save workflow.' });
        }
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({ success: false, error: 'Workflow name is required.' });
        }
        const workflow = await prisma_1.prisma.workflow.create({
            data: {
                client_id: clientId,
                name: name.trim(),
                mode: req.body.builderType || 'standard',
                execution_mode: mode || 'auto_with_guardrails',
                trigger_type: trigger || 'Manual run',
                target_type: target || 'people',
                enrollment_filters: enrollment || [],
                guardrails: guardrails || [],
                path_actions: path || [],
                status: status || 'draft',
                created_by_operator_id: operatorId
            }
        });
        res.status(201).json({
            success: true,
            workflow: {
                id: workflow.id,
                name: workflow.name,
                description: workflow.name + ' workflow'
            }
        });
    }
    catch (error) {
        console.error('Create manual workflow error:', error);
        res.status(500).json({ success: false, error: 'Failed to save workflow template.' });
    }
});
router.post('/:id/create-campaign', async (req, res) => {
    try {
        const operatorId = req.user.id;
        const { id } = req.params;
        const workflow = await prisma_1.prisma.workflow.findUnique({
            where: { id }
        });
        if (!workflow) {
            return res.status(404).json({ success: false, error: 'Workflow not found' });
        }
        // Launch a workflow run immediately
        await workflow_engine_1.workflowEngine.executeWorkflow(workflow.id, { email: 'manual_trigger@example.com' }, operatorId);
        res.status(201).json({
            success: true,
            campaignId: workflow.id
        });
    }
    catch (error) {
        console.error('Create run error:', error);
        res.status(500).json({ success: false, error: 'Failed to launch workflow run.' });
    }
});
// Kept for AI NL workflows
router.post('/compile', async (req, res) => {
    try {
        const { prompt } = req.body;
        const operatorId = req.user.id;
        if (!prompt?.trim()) {
            return res.status(400).json({ success: false, error: 'Prompt is required' });
        }
        const activeTools = await getActiveToolsForClient(operatorId);
        const planResult = await compileWorkflowPlan(prompt, activeTools);
        if (planResult.error || !planResult.validatedPlan) {
            return res.status(400).json({
                success: false,
                error: planResult.error || 'Failed to compile workflow',
            });
        }
        const resolvedSteps = (0, action_resolver_1.resolveManifestSteps)(planResult.validatedPlan.steps);
        res.json({
            success: true,
            intent: planResult.intent,
            manifest: planResult.validatedPlan,
            resolvedSteps: resolvedSteps.map((s) => ({
                tool: s.tool,
                action: s.action,
                label: s.label,
                skipExecution: s.skipExecution || false,
            })),
            warnings: planResult.warnings || [],
        });
    }
    catch (error) {
        console.error('Compile workflow error:', error);
        res.status(500).json({ success: false, error: 'Failed to compile workflow' });
    }
});
router.post('/run-prompt', async (req, res) => {
    try {
        const { prompt, name } = req.body;
        const operatorId = req.user.id;
        if (!prompt?.trim()) {
            return res.status(400).json({ success: false, error: 'Prompt is required' });
        }
        const clientId = await getClientIdForOperator(operatorId);
        if (!clientId) {
            return res.status(400).json({ success: false, error: 'No client found' });
        }
        const activeTools = await getActiveToolsForClient(operatorId);
        const planResult = await compileWorkflowPlan(prompt, activeTools);
        if (planResult.error || !planResult.validatedPlan) {
            return res.status(400).json({
                success: false,
                error: planResult.error || 'Failed to compile workflow',
            });
        }
        const toolsUsed = [...new Set(planResult.validatedPlan.steps.map((s) => s.tool))];
        await (0, ensure_tool_accounts_1.ensureToolAccountsForPipeline)(clientId, operatorId, toolsUsed);
        const campaign = await prisma_1.prisma.campaign.create({
            data: {
                client_id: clientId,
                name: name?.trim() || planResult.validatedPlan.name,
                description: planResult.validatedPlan.description,
                status: 'approved',
                approval_status: 'approved',
                manifest: {
                    ...planResult.validatedPlan,
                    source_prompt: prompt,
                },
                estimated_cost: planResult.validatedPlan.estimated_cost,
                estimated_duration: planResult.validatedPlan.estimated_duration,
                created_by_operator_id: operatorId,
            },
        });
        if (planResult.validatedPlan.steps.length > 0) {
            await prisma_1.prisma.campaignStep.createMany({
                data: planResult.validatedPlan.steps.map((step) => ({
                    campaign_id: campaign.id,
                    step_order: step.order,
                    tool_name: step.tool,
                    action: step.action,
                    params: step.params,
                    status: 'pending',
                    dependencies: step.dependencies,
                    created_at: new Date(),
                    updated_at: new Date(),
                })),
            });
        }
        const resolvedSteps = (0, action_resolver_1.resolveManifestSteps)(planResult.validatedPlan.steps);
        const syncPipeline = process.env.QHORD_SYNC_PIPELINE === 'true' ||
            (process.env.QHORD_SYNC_PIPELINE !== 'false' && (0, demo_stack_1.useFreeDemoStack)());
        const totalCreditCost = planResult.validatedPlan.steps.reduce((sum, s) => sum + (CREDIT_COST[s.tool] || 1), 0);
        if (syncPipeline) {
            const creditRecord = await getClientCredit(clientId);
            if (creditRecord.balance < totalCreditCost) {
                await prisma_1.prisma.campaign.update({
                    where: { id: campaign.id },
                    data: { status: 'failed' },
                });
                return res.status(400).json({
                    success: false,
                    error: `Insufficient credits. top up at /dashboard/settings.`,
                });
            }
        }
        let jobId;
        let pipelineResult;
        if (syncPipeline) {
            const runResult = await campaign_worker_1.campaignWorker.runCampaignNow(campaign.id, operatorId, clientId);
            pipelineResult = runResult?.results || [];
        }
        else {
            const job = await executionQueue.queueCampaign(campaign);
            jobId = job?.id;
        }
        res.status(201).json({
            success: true,
            campaignId: campaign.id,
            jobId,
            sync: syncPipeline,
            pipelineResult,
            name: campaign.name,
            resolvedSteps: resolvedSteps.map((s) => ({
                tool: s.tool,
                action: s.action,
                label: s.label,
            })),
        });
    }
    catch (error) {
        console.error('Run prompt workflow error:', error);
        res.status(500).json({ success: false, error: 'Failed to run workflow from prompt' });
    }
});
async function getActiveToolsForClient(operatorId) {
    const { getEnvToolsForDemoStack, useFreeDemoStack } = await Promise.resolve().then(() => __importStar(require('../config/demo-stack')));
    const toolAccounts = await prisma_1.prisma.clientToolAccount.findMany({
        where: { created_by_operator_id: operatorId },
        select: { tool_name: true },
        distinct: ['tool_name']
    });
    const tools = new Set(toolAccounts.length > 0
        ? toolAccounts.map((a) => a.tool_name)
        : ['Apollo', 'Clay', 'Smartlead']);
    for (const t of getEnvToolsForDemoStack()) {
        tools.add(t);
    }
    if (useFreeDemoStack()) {
        tools.add('Hunter');
        tools.add('Brevo');
        tools.add('Apollo');
        tools.add('Clay');
        tools.add('Smartlead');
    }
    return [...tools];
}
async function compileWorkflowPlan(prompt, activeTools) {
    const parsed = await parserNode.invoke({
        userInput: prompt
    });
    if (parsed.error || !parsed.intent) {
        return {
            error: parsed.error || 'Failed to parse workflow prompt'
        };
    }
    const architected = await architectNode.invoke({
        userInput: prompt,
        intent: parsed.intent,
        activeTools
    });
    if (architected.error || !architected.manifest) {
        return {
            error: architected.error || 'Failed to create workflow manifest'
        };
    }
    const validated = await validatorNode.invoke({
        userInput: prompt,
        intent: parsed.intent,
        activeTools,
        manifest: architected.manifest
    });
    if (validated.error || !validated.validatedPlan) {
        return {
            error: validated.error || 'Failed to validate workflow plan'
        };
    }
    return {
        intent: parsed.intent,
        validatedPlan: validated.validatedPlan,
        warnings: validated.warnings || [],
        error: undefined
    };
}
async function getClientIdForOperator(operatorId) {
    let client = await prisma_1.prisma.client.findFirst({
        where: { created_by_operator_id: operatorId },
        select: { id: true }
    });
    if (!client) {
        const created = await prisma_1.prisma.client.create({
            data: {
                name: 'Default Client',
                description: 'Auto-created client for workflow templates',
                created_by_operator_id: operatorId
            },
            select: { id: true }
        });
        client = created;
    }
    return client.id;
}
exports.default = router;

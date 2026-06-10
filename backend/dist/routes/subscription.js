"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
const DEFAULT_CREDITS = 2000;
async function getOrCreateCredit(clientId) {
    let credit = await prisma_1.prisma.clientCredit.findUnique({ where: { client_id: clientId } });
    if (!credit) {
        credit = await prisma_1.prisma.clientCredit.create({
            data: { client_id: clientId, balance: DEFAULT_CREDITS },
        });
    }
    return credit;
}
router.get('/status', async (req, res) => {
    try {
        const client = await prisma_1.prisma.client.findFirst({
            where: { created_by_operator_id: req.user.id },
            select: { id: true },
        });
        const credits = client ? await getOrCreateCredit(client.id) : null;
        res.json({
            success: true,
            subscription: {
                plan: { name: 'Growth', level: 'pro', credits_per_month: DEFAULT_CREDITS, tools_available: ['Hunter', 'BetterContacts', 'Brevo', 'Calendly', 'Smartlead', 'HeyReach', 'Instantly', 'HubSpot', 'Salesforce'], features: ['Full pipeline', 'Lead generation', 'Enrichment', 'Email campaigns', 'CRM (HubSpot + Salesforce)', 'LinkedIn outreach'], price: 0 },
                credits: credits ? { total_credits: DEFAULT_CREDITS, used_credits: credits.total_used, remaining_credits: credits.balance, balance: credits.balance } : null,
                tools_available: ['Hunter', 'BetterContacts', 'Brevo', 'Calendly', 'Smartlead', 'HeyReach', 'Instantly', 'HubSpot', 'Salesforce'],
                can_perform_action: credits ? credits.balance > 0 : false,
            },
        });
    }
    catch (error) {
        console.error('Status error:', error);
        res.status(500).json({ error: 'Failed to get subscription status' });
    }
});
router.get('/credits', async (req, res) => {
    try {
        const client = await prisma_1.prisma.client.findFirst({
            where: { created_by_operator_id: req.user.id },
            select: { id: true },
        });
        if (!client)
            return res.json({ success: true, balance: DEFAULT_CREDITS, credits: null });
        const credit = await getOrCreateCredit(client.id);
        res.json({ success: true, balance: credit.balance, credits: credit });
    }
    catch (error) {
        console.error('Credits error:', error);
        res.status(500).json({ error: 'Failed to get credits' });
    }
});
router.post('/top-up', async (req, res) => {
    try {
        const amount = parseInt(String(req.body?.amount || 0), 10);
        if (!amount || amount < 1) {
            res.status(400).json({ success: false, error: 'Valid amount is required' });
            return;
        }
        const client = await prisma_1.prisma.client.findFirst({
            where: { created_by_operator_id: req.user.id },
            select: { id: true },
        });
        if (!client) {
            res.status(400).json({ success: false, error: 'No client found' });
            return;
        }
        const credit = await getOrCreateCredit(client.id);
        const updated = await prisma_1.prisma.clientCredit.update({
            where: { id: credit.id },
            data: { balance: { increment: amount } },
        });
        await prisma_1.prisma.creditTransaction.create({
            data: { credit_id: credit.id, amount, type: 'credit', description: 'Top-up' },
        });
        res.json({ success: true, addedCredits: amount, newTotal: updated.balance, balance: updated.balance });
    }
    catch (error) {
        console.error('Top-up error:', error);
        res.status(500).json({ error: 'Failed to top up credits' });
    }
});
router.get('/tools', async (req, res) => {
    res.json({
        success: true,
        tools: [
            { name: 'Hunter', description: 'Find professional email addresses', category: 'Lead Generation', credit_cost: 2 },
            { name: 'BetterContacts', description: 'Enrich contact data', category: 'Enrichment', credit_cost: 1 },
            { name: 'Brevo', description: 'Send email campaigns', category: 'Email Marketing', credit_cost: 3 },
            { name: 'Calendly', description: 'Schedule meetings', category: 'Scheduling', credit_cost: 1 },
            { name: 'Smartlead', description: 'Email campaign automation', category: 'Email Marketing', credit_cost: 2 },
            { name: 'HeyReach', description: 'LinkedIn outreach automation', category: 'LinkedIn Outreach', credit_cost: 2 },
            { name: 'Instantly', description: 'Cold email platform', category: 'Email Marketing', credit_cost: 2 },
            { name: 'HubSpot', description: 'CRM platform', category: 'CRM', credit_cost: 1 },
            { name: 'Salesforce', description: 'Enterprise CRM platform', category: 'CRM', credit_cost: 1 },
        ],
    });
});
router.post('/check-tool-access', async (req, res) => {
    try {
        const { toolName } = req.body;
        const client = await prisma_1.prisma.client.findFirst({
            where: { created_by_operator_id: req.user.id },
            select: { id: true },
        });
        const credit = client ? await getOrCreateCredit(client.id) : null;
        res.json({ success: true, access: { allowed: credit ? credit.balance > 0 : false, toolName, remaining_credits: credit?.balance ?? 0 } });
    }
    catch (error) {
        console.error('Tool access error:', error);
        res.status(500).json({ error: 'Failed to check tool access' });
    }
});
router.get('/usage-history', async (req, res) => {
    try {
        const client = await prisma_1.prisma.client.findFirst({
            where: { created_by_operator_id: req.user.id },
            select: { id: true },
        });
        if (!client)
            return res.json({ success: true, history: [] });
        const credit = await prisma_1.prisma.clientCredit.findUnique({ where: { client_id: client.id } });
        const history = credit ? await prisma_1.prisma.creditTransaction.findMany({
            where: { credit_id: credit.id },
            orderBy: { created_at: 'desc' },
            take: 100,
        }) : [];
        res.json({ success: true, history });
    }
    catch (error) {
        console.error('Usage history error:', error);
        res.status(500).json({ error: 'Failed to get usage history' });
    }
});
router.get('/usage-stats', async (req, res) => {
    try {
        const client = await prisma_1.prisma.client.findFirst({
            where: { created_by_operator_id: req.user.id },
            select: { id: true },
        });
        if (!client)
            return res.json({ success: true, stats: { total_credits_used: 0, campaigns_run: 0 } });
        const credit = await prisma_1.prisma.clientCredit.findUnique({ where: { client_id: client.id } });
        const campaigns = await prisma_1.prisma.campaign.count({ where: { client_id: client.id, status: { not: 'workflow_template' } } });
        res.json({ success: true, stats: { total_credits_used: credit?.total_used ?? 0, campaigns_run: campaigns } });
    }
    catch (error) {
        console.error('Usage stats error:', error);
        res.status(500).json({ error: 'Failed to get usage stats' });
    }
});
router.get('/plans', async (_req, res) => {
    res.json({
        success: true,
        plans: [
            { name: 'Free Trial', level: 'free', credits_per_month: 1000, tools_available: ['Hunter'], features: ['Basic lead generation'], price: 0 },
            { name: 'Starter', level: 'starter', credits_per_month: 5000, tools_available: ['Hunter', 'BetterContacts', 'Brevo', 'Instantly', 'HubSpot'], features: ['Lead gen', 'Enrichment', 'Email campaigns', 'CRM'], price: 99 },
            { name: 'Pro', level: 'pro', credits_per_month: 20000, tools_available: ['Hunter', 'BetterContacts', 'Brevo', 'Calendly', 'Smartlead', 'HeyReach', 'Instantly', 'HubSpot', 'Salesforce'], features: ['All tools', 'Full pipeline', 'CRM (HubSpot + Salesforce)', 'LinkedIn outreach', 'Analytics', 'Priority support'], price: 299 },
        ],
    });
});
router.post('/upgrade', async (req, res) => {
    try {
        const { plan } = req.body;
        if (!plan || !['starter', 'pro'].includes(plan)) {
            return res.status(400).json({ error: 'Valid plan is required' });
        }
        res.json({ success: true, message: `Upgraded to ${plan} plan`, transaction_id: 'txn_' + Date.now() });
    }
    catch (error) {
        console.error('Upgrade error:', error);
        res.status(500).json({ error: 'Failed to upgrade' });
    }
});
router.post('/consume-credits', async (req, res) => {
    try {
        const { action, credits: cost, tool, campaign_id, execution_id } = req.body;
        if (!action || !cost || !tool) {
            return res.status(400).json({ error: 'Action, credits, and tool are required' });
        }
        const client = await prisma_1.prisma.client.findFirst({
            where: { created_by_operator_id: req.user.id },
            select: { id: true },
        });
        if (!client)
            return res.status(400).json({ error: 'No client found' });
        const credit = await getOrCreateCredit(client.id);
        if (credit.balance < cost) {
            res.status(400).json({ success: false, error: 'Insufficient credits', balance: credit.balance, required: cost });
            return;
        }
        await prisma_1.prisma.clientCredit.update({
            where: { id: credit.id },
            data: { balance: { decrement: cost }, total_used: { increment: cost } },
        });
        await prisma_1.prisma.creditTransaction.create({
            data: { credit_id: credit.id, amount: cost, type: 'debit', description: action, tool_name: tool, action, campaign_id, execution_id },
        });
        const updated = await prisma_1.prisma.clientCredit.findUnique({ where: { id: credit.id } });
        res.json({ success: true, message: `Consumed ${cost} credits for ${action}`, remaining_credits: updated.balance });
    }
    catch (error) {
        console.error('Consume credits error:', error);
        res.status(500).json({ error: 'Failed to consume credits' });
    }
});
exports.default = router;

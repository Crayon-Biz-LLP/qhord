"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get('/', async (req, res) => {
    try {
        const clients = await prisma_1.prisma.client.findMany({
            where: { created_by_operator_id: req.user.id },
            orderBy: { created_at: 'desc' }
        });
        res.json({ clients });
    }
    catch (err) {
        console.error('List clients error', err);
        res.status(500).json({ message: 'Failed to fetch clients' });
    }
});
router.post('/', async (req, res) => {
    const { name, description, region, account_owner, industry, status, website, priority, icp_summary, strategy_notes, channels, connected_tools, approval_mode, max_daily_sends, require_crm_approval } = req.body;
    if (!name) {
        res.status(400).json({ message: 'name is required' });
        return;
    }
    try {
        const client = await prisma_1.prisma.client.create({
            data: {
                name,
                description: description ?? null,
                region: region ?? null,
                account_owner: account_owner ?? null,
                industry: industry ?? null,
                status: status ?? 'Active',
                website: website ?? null,
                priority: priority ?? 'Medium',
                icp_summary: icp_summary ?? null,
                strategy_notes: strategy_notes ?? null,
                channels: channels ?? ["Email"],
                connected_tools: connected_tools ?? [],
                approval_mode: approval_mode ?? 'Approval required',
                max_daily_sends: max_daily_sends !== undefined ? Number(max_daily_sends) : 150,
                require_crm_approval: require_crm_approval !== undefined ? Boolean(require_crm_approval) : true,
                created_by_operator_id: req.user.id
            }
        });
        res.status(201).json({ client });
    }
    catch (err) {
        console.error('Create client error', err);
        res.status(500).json({ message: 'Failed to create client' });
    }
});
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const client = await prisma_1.prisma.client.findFirst({
            where: {
                id,
                created_by_operator_id: req.user.id
            }
        });
        if (!client) {
            res.status(404).json({ message: 'Client not found' });
            return;
        }
        res.json({ client });
    }
    catch (err) {
        console.error('Get client error', err);
        res.status(500).json({ message: 'Failed to fetch client' });
    }
});
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, region, account_owner, industry, status, website, priority, icp_summary, strategy_notes, channels, connected_tools, approval_mode, max_daily_sends, require_crm_approval } = req.body;
    try {
        const existing = await prisma_1.prisma.client.findFirst({
            where: {
                id,
                created_by_operator_id: req.user.id
            }
        });
        if (!existing) {
            res.status(404).json({ message: 'Client not found' });
            return;
        }
        const client = await prisma_1.prisma.client.update({
            where: { id },
            data: {
                name: name !== undefined ? name : undefined,
                description: description !== undefined ? description : undefined,
                region: region !== undefined ? region : undefined,
                account_owner: account_owner !== undefined ? account_owner : undefined,
                industry: industry !== undefined ? industry : undefined,
                status: status !== undefined ? status : undefined,
                website: website !== undefined ? website : undefined,
                priority: priority !== undefined ? priority : undefined,
                icp_summary: icp_summary !== undefined ? icp_summary : undefined,
                strategy_notes: strategy_notes !== undefined ? strategy_notes : undefined,
                channels: channels !== undefined ? channels : undefined,
                connected_tools: connected_tools !== undefined ? connected_tools : undefined,
                approval_mode: approval_mode !== undefined ? approval_mode : undefined,
                max_daily_sends: max_daily_sends !== undefined ? Number(max_daily_sends) : undefined,
                require_crm_approval: require_crm_approval !== undefined ? Boolean(require_crm_approval) : existing.require_crm_approval
            }
        });
        res.json({ client });
    }
    catch (err) {
        console.error('Update client error', err);
        res.status(500).json({ message: 'Failed to update client' });
    }
});
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const existing = await prisma_1.prisma.client.findFirst({
            where: {
                id,
                created_by_operator_id: req.user.id
            }
        });
        if (!existing) {
            res.status(404).json({ message: 'Client not found' });
            return;
        }
        await prisma_1.prisma.client.delete({
            where: { id }
        });
        res.status(204).send();
    }
    catch (err) {
        console.error('Delete client error', err);
        res.status(500).json({ message: 'Failed to delete client' });
    }
});
exports.default = router;

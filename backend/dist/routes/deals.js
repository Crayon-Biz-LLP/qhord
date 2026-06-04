"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get('/', async (req, res) => {
    try {
        const operatorId = req.user.id;
        let { clientId } = req.query;
        if (!clientId) {
            const client = await prisma_1.prisma.client.findFirst({
                where: { created_by_operator_id: operatorId },
                select: { id: true },
            });
            if (!client) {
                return res.json({ success: true, deals: [] });
            }
            clientId = client.id;
        }
        const deals = await prisma_1.prisma.deal.findMany({
            where: { client_id: clientId },
            orderBy: { created_at: 'desc' }
        });
        res.json({ success: true, deals });
    }
    catch (error) {
        console.error('Fetch deals error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch deals' });
    }
});
router.post('/', async (req, res) => {
    try {
        const operatorId = req.user.id;
        const { name, contact, amount, health, stage, auto, avatar, clientId } = req.body;
        if (!name || !contact || !amount || !stage) {
            return res.status(400).json({ success: false, error: 'Missing required fields: name, contact, amount, stage' });
        }
        let targetClientId = clientId;
        if (!targetClientId) {
            const client = await prisma_1.prisma.client.findFirst({
                where: { created_by_operator_id: operatorId },
                select: { id: true },
            });
            if (!client) {
                return res.status(400).json({ success: false, error: 'No client node established for this operator.' });
            }
            targetClientId = client.id;
        }
        const deal = await prisma_1.prisma.deal.create({
            data: {
                name,
                contact,
                amount,
                health: health ? parseInt(health, 10) : 80,
                stage,
                auto: auto !== undefined ? Boolean(auto) : true,
                avatar: avatar || (contact ? contact.charAt(0) : 'D'),
                client_id: targetClientId,
            }
        });
        res.status(201).json({ success: true, deal });
    }
    catch (error) {
        console.error('Create deal error:', error);
        res.status(500).json({ success: false, error: 'Failed to create deal' });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { stage, health, auto, name, contact, amount } = req.body;
        const deal = await prisma_1.prisma.deal.update({
            where: { id },
            data: {
                stage: stage || undefined,
                health: health !== undefined ? parseInt(health, 10) : undefined,
                auto: auto !== undefined ? Boolean(auto) : undefined,
                name: name || undefined,
                contact: contact || undefined,
                amount: amount || undefined,
            }
        });
        res.json({ success: true, deal });
    }
    catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, error: 'Deal not found' });
        }
        console.error('Update deal error:', error);
        res.status(500).json({ success: false, error: 'Failed to update deal' });
    }
});
exports.default = router;

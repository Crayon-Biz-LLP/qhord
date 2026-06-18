"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const encryption_1 = require("../config/encryption");
const apollo_service_1 = require("../services/apollo.service");
const router = (0, express_1.Router)();
router.get('/', async (_req, res) => {
    try {
        const dbTools = await prisma_1.prisma.tool.findMany({
            orderBy: { name: 'asc' }
        });
        // Map tool_id to id for frontend compatibility
        const tools = dbTools.map((t) => ({
            ...t,
            id: t.tool_id
        }));
        res.json({ tools });
    }
    catch (err) {
        console.error('Fetch tools error', err);
        res.status(500).json({ message: 'Failed to fetch tools from database' });
    }
});
router.use(auth_1.requireAuth);
router.get('/apollo/status', async (req, res) => {
    const clientAccountId = req.query.clientAccountId;
    if (!clientAccountId) {
        res.status(400).json({ success: false, error: 'clientAccountId is required' });
        return;
    }
    try {
        const apolloService = new apollo_service_1.ApolloService();
        const result = await apolloService.validateConnection(clientAccountId);
        res.json(result);
    }
    catch (error) {
        res.json({ success: false, error: error.message || 'Failed to validate Apollo connection' });
    }
});
router.get('/accounts/:clientId', async (req, res) => {
    const { clientId } = req.params;
    try {
        const accounts = await prisma_1.prisma.clientToolAccount.findMany({
            where: { client_id: clientId },
            orderBy: { created_at: 'desc' },
            select: {
                id: true,
                client_id: true,
                tool_name: true,
                account_label: true,
                created_by_operator_id: true,
                created_at: true
            }
        });
        res.json({ accounts });
    }
    catch (err) {
        console.error('List tool accounts error', err);
        res.status(500).json({ message: 'Failed to fetch tool accounts' });
    }
});
router.post('/accounts', async (req, res) => {
    const { clientId, toolName, accountLabel, apiKey } = req.body;
    if (!clientId || !toolName || !accountLabel || !apiKey) {
        res.status(400).json({ message: 'clientId, toolName, accountLabel and apiKey are required' });
        return;
    }
    try {
        const encryptedKey = (0, encryption_1.encrypt)(apiKey);
        const account = await prisma_1.prisma.clientToolAccount.create({
            data: {
                client_id: clientId,
                tool_name: toolName,
                account_label: accountLabel,
                api_key_encrypted: encryptedKey,
                created_by_operator_id: req.user.id
            },
            select: {
                id: true,
                client_id: true,
                tool_name: true,
                account_label: true,
                created_by_operator_id: true,
                created_at: true
            }
        });
        res.status(201).json({ account });
    }
    catch (err) {
        console.error('Create tool account error', err);
        res.status(500).json({ message: 'Failed to create tool account' });
    }
});
router.delete('/accounts/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma_1.prisma.clientToolAccount.delete({
            where: { id }
        });
        res.status(204).send();
    }
    catch (err) {
        if (err.code === 'P2025') {
            res.status(404).json({ message: 'Tool account not found' });
            return;
        }
        console.error('Delete tool account error', err);
        res.status(500).json({ message: 'Failed to delete tool account' });
    }
});
exports.default = router;

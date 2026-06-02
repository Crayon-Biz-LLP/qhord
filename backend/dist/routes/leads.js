"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const operatorId = req.user.id;
        const client = await prisma_1.prisma.client.findFirst({
            where: { created_by_operator_id: operatorId },
            select: { id: true },
        });
        if (!client)
            return res.json({ leads: [] });
        const leads = await prisma_1.prisma.lead.findMany({
            where: { client_id: client.id },
            orderBy: { created_at: 'desc' },
            take: 100,
        });
        res.json({ leads });
    }
    catch (error) {
        console.error('Get leads error:', error);
        res.status(500).json({ error: 'Failed to fetch leads' });
    }
});
exports.default = router;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get('/summary', async (req, res) => {
    try {
        const operatorId = req.user.id;
        const client = await prisma_1.prisma.client.findFirst({
            where: { created_by_operator_id: operatorId },
            select: { id: true },
        });
        if (!client) {
            return res.json({ success: true, data: { executions: [], leadCount: 0, campaignCount: 0, toolUsage: {}, executionsByDay: [] } });
        }
        const [executions, leads, campaigns] = await Promise.all([
            prisma_1.prisma.execution.findMany({
                where: { client_id: client.id },
                orderBy: { created_at: 'desc' },
                take: 1000,
            }),
            prisma_1.prisma.lead.count({ where: { client_id: client.id } }),
            prisma_1.prisma.campaign.count({ where: { client_id: client.id, status: { not: 'workflow_template' } } }),
        ]);
        const totalExecs = executions.length;
        const successExecs = executions.filter(e => e.status === 'success').length;
        const failedExecs = executions.filter(e => e.status === 'error').length;
        const toolUsage = {};
        for (const e of executions) {
            if (!toolUsage[e.tool_name])
                toolUsage[e.tool_name] = { total: 0, success: 0, failed: 0 };
            toolUsage[e.tool_name].total++;
            if (e.status === 'success')
                toolUsage[e.tool_name].success++;
            if (e.status === 'error')
                toolUsage[e.tool_name].failed++;
        }
        // Executions by day (last 30 days)
        const dayMap = {};
        const now = new Date();
        for (let i = 29; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            dayMap[key] = 0;
        }
        for (const e of executions) {
            const key = new Date(e.created_at).toISOString().slice(0, 10);
            if (dayMap[key] !== undefined)
                dayMap[key]++;
        }
        const executionsByDay = Object.entries(dayMap).map(([date, count]) => ({ date, count }));
        res.json({
            success: true,
            data: {
                totalExecutions: totalExecs,
                successRate: totalExecs ? Math.round((successExecs / totalExecs) * 100) : 0,
                leadCount: leads,
                campaignCount: campaigns,
                successCount: successExecs,
                failedCount: failedExecs,
                toolUsage,
                executionsByDay,
            },
        });
    }
    catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch analytics' });
    }
});
exports.default = router;

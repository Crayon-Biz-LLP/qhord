"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const prisma_1 = require("../lib/prisma");
const planner_memory_service_1 = require("../services/planner-memory.service");
const router = (0, express_1.Router)();
const plannerMemoryService = new planner_memory_service_1.PlannerMemoryService();
router.use(auth_1.requireAuth);
router.get('/insights', async (req, res) => {
    try {
        const operatorId = req.user.id;
        const prompt = typeof req.query.prompt === 'string' ? req.query.prompt : '';
        const toolAccounts = await prisma_1.prisma.clientToolAccount.findMany({
            where: { created_by_operator_id: operatorId },
            select: { tool_name: true },
            distinct: ['tool_name']
        });
        const activeTools = toolAccounts.length > 0 ? toolAccounts.map((t) => t.tool_name) : ['Apollo', 'Smartlead'];
        const insights = await plannerMemoryService.getInsights(operatorId, prompt, activeTools);
        res.json({ success: true, insights });
    }
    catch (error) {
        console.error('Memory insights error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch memory insights' });
    }
});
exports.default = router;

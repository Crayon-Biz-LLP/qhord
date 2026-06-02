"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const execution_engine_1 = require("../services/execution.engine");
const router = (0, express_1.Router)();
const engine = new execution_engine_1.ExecutionEngine();
router.use(auth_1.requireAuth);
router.get('/', async (req, res) => {
    const { clientId } = req.query;
    try {
        const executions = await prisma_1.prisma.execution.findMany({
            where: {
                triggered_by_operator_id: req.user.id,
                client_id: clientId ? clientId : undefined
            },
            orderBy: { created_at: 'desc' },
            take: 200
        });
        res.json({ executions });
    }
    catch (err) {
        console.error('List executions error', err);
        res.status(500).json({ message: 'Failed to fetch executions' });
    }
});
router.post('/', async (req, res) => {
    const body = req.body;
    const { clientId, tool, toolAccountId, action, payload } = body;
    if (!clientId || !tool || !toolAccountId || !action) {
        res
            .status(400)
            .json({ message: 'clientId, tool, toolAccountId and action are required', payload: body.payload ?? null });
        return;
    }
    try {
        const execution = await engine.execute(body, req.user.id);
        res.status(201).json({ execution });
    }
    catch (err) {
        console.error('Execution error', err);
        res.status(400).json({ message: err?.message || 'Failed to execute action' });
    }
});
exports.default = router;

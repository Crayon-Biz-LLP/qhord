"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const db_1 = require("../config/db");
const execution_engine_1 = require("../services/execution.engine");
const router = (0, express_1.Router)();
const engine = new execution_engine_1.ExecutionEngine();
router.use(auth_1.requireAuth);
router.get('/', async (req, res) => {
    const { clientId } = req.query;
    try {
        let sql = 'SELECT * FROM executions WHERE triggered_by_operator_id = $1 ORDER BY created_at DESC LIMIT 200';
        const params = [req.user.id];
        if (clientId) {
            sql =
                'SELECT * FROM executions WHERE triggered_by_operator_id = $1 AND client_id = $2 ORDER BY created_at DESC LIMIT 200';
            params.push(clientId);
        }
        const result = await (0, db_1.query)(sql, params);
        res.json({ executions: result.rows });
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

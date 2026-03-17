"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../config/db");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get('/', async (req, res) => {
    try {
        const result = await (0, db_1.query)('SELECT * FROM clients WHERE created_by_operator_id = $1 ORDER BY created_at DESC', [req.user.id]);
        res.json({ clients: result.rows });
    }
    catch (err) {
        console.error('List clients error', err);
        res.status(500).json({ message: 'Failed to fetch clients' });
    }
});
router.post('/', async (req, res) => {
    const { name, description } = req.body;
    if (!name) {
        res.status(400).json({ message: 'name is required' });
        return;
    }
    try {
        const result = await (0, db_1.query)('INSERT INTO clients (name, description, created_by_operator_id) VALUES ($1, $2, $3) RETURNING *', [name, description ?? null, req.user.id]);
        res.status(201).json({ client: result.rows[0] });
    }
    catch (err) {
        console.error('Create client error', err);
        res.status(500).json({ message: 'Failed to create client' });
    }
});
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await (0, db_1.query)('SELECT * FROM clients WHERE id = $1 AND created_by_operator_id = $2', [id, req.user.id]);
        const client = result.rows[0];
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
    const { name, description } = req.body;
    try {
        const existing = await (0, db_1.query)('SELECT * FROM clients WHERE id = $1 AND created_by_operator_id = $2', [id, req.user.id]);
        if (existing.rows.length === 0) {
            res.status(404).json({ message: 'Client not found' });
            return;
        }
        const updated = await (0, db_1.query)('UPDATE clients SET name = COALESCE($1, name), description = COALESCE($2, description) WHERE id = $3 RETURNING *', [name ?? null, description ?? null, id]);
        res.json({ client: updated.rows[0] });
    }
    catch (err) {
        console.error('Update client error', err);
        res.status(500).json({ message: 'Failed to update client' });
    }
});
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await (0, db_1.query)('DELETE FROM clients WHERE id = $1 AND created_by_operator_id = $2 RETURNING id', [id, req.user.id]);
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'Client not found' });
            return;
        }
        res.status(204).send();
    }
    catch (err) {
        console.error('Delete client error', err);
        res.status(500).json({ message: 'Failed to delete client' });
    }
});
exports.default = router;

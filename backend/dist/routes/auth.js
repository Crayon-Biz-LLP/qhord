"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../config/db");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/register', async (req, res) => {
    const { email, password, name, role } = req.body;
    if (!email || !password || !name) {
        res.status(400).json({ message: 'email, password and name are required' });
        return;
    }
    try {
        const existing = await (0, db_1.query)('SELECT * FROM operators WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            res.status(409).json({ message: 'Operator with this email already exists' });
            return;
        }
        const passwordHash = await (0, auth_1.hashPassword)(password);
        const userRole = role === 'admin' ? 'admin' : 'operator';
        const inserted = await (0, db_1.query)('INSERT INTO operators (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING *', [email, passwordHash, name, userRole]);
        const operator = inserted.rows[0];
        const payload = {
            id: operator.id,
            email: operator.email,
            role: operator.role
        };
        const token = (0, auth_1.generateToken)(payload);
        res.status(201).json({ token, operator: payload });
    }
    catch (err) {
        console.error('Register error', err);
        res.status(500).json({ message: 'Failed to register operator' });
    }
});
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ message: 'email and password are required' });
        return;
    }
    try {
        const result = await (0, db_1.query)('SELECT * FROM operators WHERE email = $1', [email]);
        const operator = result.rows[0];
        if (!operator) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        const valid = await (0, auth_1.verifyPassword)(password, operator.password_hash);
        if (!valid) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        const payload = {
            id: operator.id,
            email: operator.email,
            role: operator.role
        };
        const token = (0, auth_1.generateToken)(payload);
        res.json({ token, operator: payload });
    }
    catch (err) {
        console.error('Login error', err);
        res.status(500).json({ message: 'Failed to login' });
    }
});
router.get('/me', auth_1.requireAuth, async (req, res) => {
    if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
    }
    try {
        const result = await (0, db_1.query)('SELECT id, email, name, role, created_at FROM operators WHERE id = $1', [
            req.user.id
        ]);
        const operator = result.rows[0];
        if (!operator) {
            res.status(404).json({ message: 'Operator not found' });
            return;
        }
        res.json({ operator });
    }
    catch (err) {
        console.error('Me error', err);
        res.status(500).json({ message: 'Failed to fetch operator' });
    }
});
exports.default = router;

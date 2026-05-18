"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/register', async (req, res) => {
    const { email, password, name, role } = req.body;
    if (!email || !password || !name) {
        res.status(400).json({ message: 'email, password and name are required' });
        return;
    }
    try {
        const existing = await prisma_1.prisma.operator.findUnique({
            where: { email }
        });
        if (existing) {
            res.status(409).json({ message: 'Operator with this email already exists' });
            return;
        }
        const passwordHash = await (0, auth_1.hashPassword)(password);
        const userRole = role === 'admin' ? 'admin' : 'operator';
        const operator = await prisma_1.prisma.operator.create({
            data: {
                email,
                password_hash: passwordHash,
                name,
                role: userRole
            }
        });
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
        const operator = await prisma_1.prisma.operator.findUnique({
            where: { email }
        });
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
        const operator = await prisma_1.prisma.operator.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                created_at: true
            }
        });
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
router.put('/profile', auth_1.requireAuth, async (req, res) => {
    if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
    }
    const { name, email } = req.body;
    try {
        const data = {};
        if (name !== undefined)
            data.name = name;
        if (email !== undefined)
            data.email = email;
        const operator = await prisma_1.prisma.operator.update({
            where: { id: req.user.id },
            data,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                created_at: true
            }
        });
        res.json({ message: 'Profile updated successfully', operator });
    }
    catch (err) {
        console.error('Update profile error', err);
        res.status(500).json({ message: 'Failed to update operator profile' });
    }
});
exports.default = router;

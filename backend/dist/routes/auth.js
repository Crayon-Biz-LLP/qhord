"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const speakeasy_1 = __importDefault(require("speakeasy"));
const qrcode_1 = __importDefault(require("qrcode"));
const router = (0, express_1.Router)();
const defaultNotifications = [
    { id: 'replies', label: 'New replies', email: true, slack: true, inapp: true },
    { id: 'meeting', label: 'Meeting booked', email: true, slack: true, inapp: true },
    { id: 'errors', label: 'Campaign errors', email: true, slack: true, inapp: true },
];
router.post('/register', async (req, res) => {
    const { email, password, name, role } = req.body;
    if (!email || !password || !name) {
        res.status(400).json({ message: 'email, password and name are required' });
        return;
    }
    try {
        const existing = await prisma_1.prisma.operator.findUnique({
            where: { email },
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
                role: userRole,
                settings: {
                    create: {
                        notifications: defaultNotifications,
                    },
                },
                workspace: {
                    create: {
                        name: `${name}'s Workspace`,
                        domain: 'company.com',
                    },
                },
            },
        });
        const payload = {
            id: operator.id,
            email: operator.email,
            role: operator.role,
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
            where: { email },
            include: { settings: true },
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
        if (operator.settings?.two_factor_enabled) {
            res.json({ mfaRequired: true, userId: operator.id });
            return;
        }
        const payload = {
            id: operator.id,
            email: operator.email,
            role: operator.role,
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
                created_at: true,
            },
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
        const trimmedName = name !== undefined ? String(name).trim() : undefined;
        if (trimmedName !== undefined && !trimmedName) {
            res.status(400).json({ message: 'Name cannot be empty' });
            return;
        }
        const updateData = {};
        if (trimmedName !== undefined)
            updateData.name = trimmedName;
        if (email !== undefined)
            updateData.email = String(email).trim();
        const operator = await prisma_1.prisma.operator.update({
            where: { id: req.user.id },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                created_at: true,
            },
        });
        res.json({ message: 'Profile updated successfully', operator });
    }
    catch (err) {
        console.error('Update profile error', err);
        res.status(500).json({ message: 'Failed to update operator profile' });
    }
});
router.put('/change-password', auth_1.requireAuth, async (req, res) => {
    if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
    }
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        res.status(400).json({ message: 'currentPassword and newPassword are required' });
        return;
    }
    try {
        const operator = await prisma_1.prisma.operator.findUnique({
            where: { id: req.user.id },
        });
        if (!operator) {
            res.status(404).json({ message: 'Operator not found' });
            return;
        }
        const valid = await (0, auth_1.verifyPassword)(currentPassword, operator.password_hash);
        if (!valid) {
            res.status(401).json({ message: 'Current password is incorrect' });
            return;
        }
        const passwordHash = await (0, auth_1.hashPassword)(newPassword);
        await prisma_1.prisma.operator.update({
            where: { id: req.user.id },
            data: { password_hash: passwordHash },
        });
        res.json({ message: 'Password changed successfully' });
    }
    catch (err) {
        console.error('Change password error', err);
        res.status(500).json({ message: 'Failed to change password' });
    }
});
router.post('/2fa/setup', auth_1.requireAuth, async (req, res) => {
    if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
    }
    try {
        const secret = speakeasy_1.default.generateSecret({
            name: req.user.email,
            issuer: 'Qhord',
            length: 20,
        });
        await prisma_1.prisma.operator.update({
            where: { id: req.user.id },
            data: { two_factor_secret: secret.base32 },
        });
        const otpauthUrl = secret.otpauth_url ||
            speakeasy_1.default.otpauthURL({
                secret: secret.base32,
                label: req.user.email,
                issuer: 'Qhord',
                encoding: 'base32',
            });
        const qrCodeUrl = await qrcode_1.default.toDataURL(otpauthUrl);
        res.json({
            qrCodeUrl,
            secret: secret.base32,
        });
    }
    catch (err) {
        console.error('2FA setup error', err);
        res.status(500).json({ message: 'Failed to setup 2FA' });
    }
});
router.post('/2fa/verify', auth_1.requireAuth, async (req, res) => {
    if (!req.user) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
    }
    const rawToken = req.body?.token;
    const token = String(rawToken || '').replace(/\s/g, '').trim();
    if (!token || token.length !== 6) {
        res.status(400).json({ message: 'Enter the 6-digit code from your authenticator app' });
        return;
    }
    try {
        const operator = await prisma_1.prisma.operator.findUnique({
            where: { id: req.user.id },
        });
        if (!operator?.two_factor_secret) {
            res.status(400).json({ message: '2FA not set up — toggle 2FA on again to get a new QR code' });
            return;
        }
        const verified = speakeasy_1.default.totp.verify({
            secret: operator.two_factor_secret,
            encoding: 'base32',
            token,
            window: 2,
        });
        if (verified) {
            await prisma_1.prisma.operatorSettings.upsert({
                where: { operator_id: req.user.id },
                create: {
                    operator_id: req.user.id,
                    two_factor_enabled: true,
                },
                update: { two_factor_enabled: true },
            });
            res.json({ message: '2FA verified and enabled successfully' });
        }
        else {
            res.status(400).json({ message: 'Invalid 2FA token' });
        }
    }
    catch (err) {
        console.error('2FA verify error', err);
        res.status(500).json({ message: 'Failed to verify 2FA' });
    }
});
router.post('/2fa/login-verify', async (req, res) => {
    const { userId } = req.body;
    const token = String(req.body?.token || '').replace(/\s/g, '').trim();
    if (!userId || !token) {
        res.status(400).json({ message: 'userId and token are required' });
        return;
    }
    try {
        const operator = await prisma_1.prisma.operator.findUnique({
            where: { id: userId },
        });
        if (!operator?.two_factor_secret) {
            res.status(400).json({ message: '2FA not set up' });
            return;
        }
        const verified = speakeasy_1.default.totp.verify({
            secret: operator.two_factor_secret,
            encoding: 'base32',
            token,
            window: 2,
        });
        if (verified) {
            const payload = {
                id: operator.id,
                email: operator.email,
                role: operator.role,
            };
            const authToken = (0, auth_1.generateToken)(payload);
            res.json({ token: authToken, operator: payload });
        }
        else {
            res.status(401).json({ message: 'Invalid 2FA token' });
        }
    }
    catch (err) {
        console.error('2FA login verify error', err);
        res.status(500).json({ message: 'Failed to verify 2FA' });
    }
});
exports.default = router;

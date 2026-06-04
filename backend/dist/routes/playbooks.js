"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get('/', async (req, res) => {
    try {
        const playbooks = await prisma_1.prisma.playbook.findMany({
            orderBy: { created_at: 'asc' }
        });
        res.json({ success: true, playbooks });
    }
    catch (error) {
        console.error('Fetch playbooks error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch playbooks' });
    }
});
router.post('/', async (req, res) => {
    try {
        const { name, difficulty, description, rating, imports, confidence, deploy_time, credits, category, reply_rate } = req.body;
        if (!name || !difficulty || !description || !category) {
            return res.status(400).json({ success: false, error: 'Missing required fields: name, difficulty, description, category' });
        }
        const playbook = await prisma_1.prisma.playbook.create({
            data: {
                name,
                difficulty,
                description,
                category,
                rating: rating ? parseFloat(rating) : 4.5,
                imports: imports || "0",
                confidence: confidence ? parseInt(confidence, 10) : 80,
                deploy_time: deploy_time || "15 minutes",
                credits: credits ? parseInt(credits, 10) : 20,
                reply_rate: reply_rate || "8-12%",
            }
        });
        res.status(201).json({ success: true, playbook });
    }
    catch (error) {
        console.error('Create playbook error:', error);
        res.status(500).json({ success: false, error: 'Failed to create playbook' });
    }
});
exports.default = router;

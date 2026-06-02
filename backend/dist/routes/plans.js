"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const plans = await prisma_1.prisma.plan.findMany({
            orderBy: { price: 'asc' } // basic sort or we could do created_at
        });
        // For sorting, price is a string because of "Custom", so let's just sort by created_at which matches our insertion order.
        const sortedPlans = await prisma_1.prisma.plan.findMany({
            orderBy: { created_at: 'asc' }
        });
        res.json(sortedPlans);
    }
    catch (error) {
        console.error('Error fetching plans:', error);
        res.status(500).json({ error: 'Failed to fetch plans' });
    }
});
exports.default = router;

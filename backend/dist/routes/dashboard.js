"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const router = (0, express_1.Router)();
router.get('/metrics', async (req, res) => {
    try {
        const operatorId = req.user.id;
        const client = await prisma_1.prisma.client.findFirst({
            where: { created_by_operator_id: operatorId },
            select: { id: true },
        });
        if (!client) {
            return res.json({ success: true, metrics: { activeCampaigns: '0', totalMeetings: '0', totalEmails: '0', totalCampaigns: '0', totalLeads: '0' } });
        }
        const [campaigns, executions, leads] = await Promise.all([
            prisma_1.prisma.campaign.findMany({ where: { client_id: client.id, status: { not: 'workflow_template' } }, select: { status: true } }),
            prisma_1.prisma.execution.findMany({ where: { client_id: client.id }, select: { action: true } }),
            prisma_1.prisma.lead.count({ where: { client_id: client.id } }),
        ]);
        const activeCampaigns = campaigns.filter(c => c.status === 'approved' || c.status === 'executing').length;
        const totalCampaigns = campaigns.length;
        const totalEmails = executions.filter(e => e.action === 'send_campaign_now' || e.action === 'send_transactional').length;
        res.json({
            success: true,
            metrics: {
                activeCampaigns: String(activeCampaigns),
                totalMeetings: '0',
                totalEmails: String(totalEmails),
                totalCampaigns: String(totalCampaigns),
                totalLeads: String(leads),
            },
        });
    }
    catch (error) {
        console.error('Dashboard metrics error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch metrics' });
    }
});
exports.default = router;

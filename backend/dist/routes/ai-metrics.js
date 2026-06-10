"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Apply authentication to all routes
router.use(auth_1.requireAuth);
// AI SDR Metrics
router.get('/ai-sdr/metrics', async (req, res) => {
    try {
        const operatorId = req.user.id;
        const executionRows = await prisma_1.prisma.execution.findMany({
            where: {
                triggered_by_operator_id: operatorId,
                tool_name: 'smartlead'
            },
            select: {
                action: true,
                status: true,
                response_payload: true
            }
        });
        const campaignsCount = await prisma_1.prisma.campaign.count({
            where: {
                created_by_operator_id: operatorId,
                status: { not: 'workflow_template' }
            }
        });
        let totalEmails = 0;
        let totalReplies = 0;
        let totalMeetings = 0;
        let totalUnsubscribes = 0;
        let bounced = 0;
        for (const row of executionRows) {
            if (row.action === 'send_campaign' || row.action === 'add_leads_to_campaign') {
                totalEmails += 1;
            }
            const payload = row.response_payload || {};
            if (typeof payload.replies === 'number')
                totalReplies += payload.replies;
            if (typeof payload.meetings === 'number')
                totalMeetings += payload.meetings;
            if (typeof payload.unsubscribes === 'number')
                totalUnsubscribes += payload.unsubscribes;
            if (row.status === 'error')
                bounced += 1;
        }
        const avgBounceRate = totalEmails > 0 ? (bounced / totalEmails) * 100 : 0;
        const avgOpenRate = totalEmails > 0 ? Math.min(100, 30 + totalReplies * 2) : 0;
        const avgClickRate = totalEmails > 0 ? Math.min(100, totalReplies * 1.2) : 0;
        // Calculate performance metrics
        const replyRate = totalEmails > 0 ? (totalReplies / totalEmails * 100) : 0;
        const meetingRate = totalEmails > 0 ? (totalMeetings / totalEmails * 100) : 0;
        const unsubscribeRate = totalEmails > 0 ? (totalUnsubscribes / totalEmails * 100) : 0;
        res.json({
            success: true,
            metrics: {
                emailsSent: totalEmails,
                replies: totalReplies,
                meetingsBooked: totalMeetings,
                replyRate: parseFloat(replyRate.toFixed(2)),
                meetingRate: parseFloat(meetingRate.toFixed(2)),
                bounceRate: parseFloat(avgBounceRate.toFixed(2)),
                openRate: parseFloat(avgOpenRate.toFixed(2)),
                clickRate: parseFloat(avgClickRate.toFixed(2)),
                unsubscribeRate: parseFloat(unsubscribeRate.toFixed(2)),
                activeCampaigns: campaignsCount,
                health: avgBounceRate < 5 ? 'Healthy' : avgBounceRate < 10 ? 'Warning' : 'Critical'
            }
        });
    }
    catch (error) {
        console.error('AI SDR metrics error:', error);
        res.status(500).json({ error: 'Failed to fetch AI SDR metrics' });
    }
});
// AI Operator Metrics
router.get('/ai-operator/metrics', async (req, res) => {
    try {
        const operatorId = req.user.id;
        const campaigns = await prisma_1.prisma.campaign.findMany({
            where: {
                created_by_operator_id: operatorId,
                status: { not: 'workflow_template' }
            },
            select: { status: true }
        });
        const executions = await prisma_1.prisma.execution.findMany({
            where: { triggered_by_operator_id: operatorId },
            select: { status: true, created_at: true }
        });
        const totalCampaigns = campaigns.length;
        const draftCampaigns = campaigns.filter(c => c.status === 'draft').length;
        const pendingApproval = campaigns.filter(c => c.status === 'pending_approval').length;
        const activeCampaigns = campaigns.filter(c => c.status === 'executing').length;
        const completedCampaigns = campaigns.filter(c => c.status === 'completed').length;
        const failedCampaigns = campaigns.filter(c => c.status === 'failed').length;
        const recentIssues = executions.filter(e => e.status === 'error').length;
        const avgBounceRate = executions.length > 0 ? (recentIssues / executions.length) * 100 : 0;
        res.json({
            success: true,
            metrics: {
                totalCampaigns,
                draftCampaigns,
                pendingApproval,
                activeCampaigns,
                completedCampaigns,
                failedCampaigns,
                bounceRate: parseFloat(avgBounceRate.toFixed(2)),
                deliverability: avgBounceRate < 3 ? 'Excellent' : avgBounceRate < 5 ? 'Good' : 'Poor',
                recentIssues,
                health: avgBounceRate < 3 ? 'Optimal' : avgBounceRate < 5 ? 'Good' : 'Needs Attention'
            }
        });
    }
    catch (error) {
        console.error('AI Operator metrics error:', error);
        res.status(500).json({ error: 'Failed to fetch AI Operator metrics' });
    }
});
// AI Engine Metrics
router.get('/ai-engine/metrics', async (req, res) => {
    try {
        const operatorId = req.user.id;
        const campaigns = await prisma_1.prisma.campaign.findMany({
            where: {
                created_by_operator_id: operatorId,
                status: { not: 'workflow_template' }
            },
            select: { created_at: true, updated_at: true }
        });
        const executions = await prisma_1.prisma.execution.findMany({
            where: { triggered_by_operator_id: operatorId },
            select: { status: true }
        });
        const totalCampaigns = campaigns.length;
        const totalExecutions = executions.length;
        const successCount = executions.filter(e => e.status === 'success').length;
        const successRate = totalExecutions > 0 ? (successCount / totalExecutions) * 100 : 0;
        const avgProcessingTime = campaigns.length > 0
            ? campaigns.reduce((sum, c) => sum + (new Date(c.updated_at).getTime() - new Date(c.created_at).getTime()), 0) / campaigns.length / 1000
            : 0;
        const nodePerformance = [
            { node: 'Parser', avgTime: 1.1, successRate: parseFloat(successRate.toFixed(2)), totalExecutions: totalCampaigns },
            { node: 'Architect', avgTime: 1.8, successRate: parseFloat(successRate.toFixed(2)), totalExecutions: totalCampaigns },
            { node: 'Validator', avgTime: 0.9, successRate: parseFloat(successRate.toFixed(2)), totalExecutions: totalCampaigns },
            { node: 'Executor', avgTime: 1.6, successRate: parseFloat(successRate.toFixed(2)), totalExecutions: totalCampaigns }
        ];
        res.json({
            success: true,
            metrics: {
                totalCampaigns,
                avgProcessingTime: parseFloat(avgProcessingTime.toFixed(2)),
                totalExecutions,
                successRate: parseFloat(successRate.toFixed(2)),
                nodePerformance,
                status: successRate > 95 ? 'Optimal' : successRate > 90 ? 'Good' : 'Needs Optimization',
                uptime: 99.8 // Mock uptime
            }
        });
    }
    catch (error) {
        console.error('AI Engine metrics error:', error);
        res.status(500).json({ error: 'Failed to fetch AI Engine metrics' });
    }
});
// Dashboard Metrics
router.get('/dashboard/metrics', async (req, res) => {
    try {
        const operatorId = req.user.id;
        const campaigns = await prisma_1.prisma.campaign.findMany({
            where: {
                created_by_operator_id: operatorId,
                status: { not: 'workflow_template' }
            },
            select: { status: true }
        });
        const executions = await prisma_1.prisma.execution.findMany({
            where: { triggered_by_operator_id: operatorId },
            select: { action: true, response_payload: true }
        });
        const totalCampaigns = campaigns.length;
        const activeCampaigns = campaigns.filter(c => c.status === 'executing').length;
        const completedCampaigns = campaigns.filter(c => c.status === 'completed').length;
        let totalEmails = 0;
        let totalReplies = 0;
        let totalMeetings = 0;
        for (const row of executions) {
            if (row.action === 'send_campaign' || row.action === 'add_leads_to_campaign')
                totalEmails += 1;
            const payload = row.response_payload || {};
            if (typeof payload.replies === 'number')
                totalReplies += payload.replies;
            if (typeof payload.meetings === 'number')
                totalMeetings += payload.meetings;
        }
        res.json({
            success: true,
            metrics: {
                totalCampaigns,
                activeCampaigns,
                completedCampaigns,
                totalEmails,
                totalReplies,
                totalMeetings,
                health: activeCampaigns > 0 ? 'Running' : 'Idle'
            }
        });
    }
    catch (error) {
        console.error('Dashboard metrics error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
    }
});
exports.default = router;

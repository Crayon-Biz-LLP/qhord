"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Apply authentication to all routes
router.use(auth_1.requireAuth);
// AI SDR Metrics
router.get('/ai-sdr/metrics', async (req, res) => {
    try {
        const operatorId = req.user.id;
        // For now, return mock data since table doesn't exist yet
        const mockData = {
            totalEmails: Math.floor(Math.random() * 1000) + 500,
            totalReplies: Math.floor(Math.random() * 50) + 10,
            totalMeetings: Math.floor(Math.random() * 20) + 5,
            avgBounceRate: Math.random() * 3 + 1,
            avgOpenRate: Math.random() * 20 + 35,
            avgClickRate: Math.random() * 5 + 2,
            totalUnsubscribes: Math.floor(Math.random() * 10) + 1,
            totalCampaigns: Math.floor(Math.random() * 20) + 5
        };
        const metrics = mockData;
        // Calculate performance metrics
        const replyRate = metrics.totalEmails > 0 ? (metrics.totalReplies / metrics.totalEmails * 100) : 0;
        const meetingRate = metrics.totalEmails > 0 ? (metrics.totalMeetings / metrics.totalEmails * 100) : 0;
        const unsubscribeRate = metrics.totalEmails > 0 ? (metrics.totalUnsubscribes / metrics.totalEmails * 100) : 0;
        res.json({
            success: true,
            metrics: {
                emailsSent: metrics.totalEmails || 0,
                replies: metrics.totalReplies || 0,
                meetingsBooked: metrics.totalMeetings || 0,
                replyRate: parseFloat(replyRate.toFixed(2)),
                meetingRate: parseFloat(meetingRate.toFixed(2)),
                bounceRate: parseFloat((metrics.avgBounceRate || 0).toString()),
                openRate: parseFloat((metrics.avgOpenRate || 0).toString()),
                clickRate: parseFloat((metrics.avgClickRate || 0).toString()),
                unsubscribeRate: parseFloat(unsubscribeRate.toFixed(2)),
                activeCampaigns: metrics.totalCampaigns || 0,
                health: metrics.avgBounceRate < 5 ? 'Healthy' : metrics.avgBounceRate < 10 ? 'Warning' : 'Critical'
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
        // Mock data for now
        const mockStats = {
            totalCampaigns: Math.floor(Math.random() * 50) + 20,
            draftCampaigns: Math.floor(Math.random() * 5) + 1,
            pendingApproval: Math.floor(Math.random() * 3) + 0,
            activeCampaigns: Math.floor(Math.random() * 10) + 2,
            completedCampaigns: Math.floor(Math.random() * 30) + 10,
            failedCampaigns: Math.floor(Math.random() * 2) + 0,
            avgBounceRate: Math.random() * 3 + 1,
            recentIssues: Math.floor(Math.random() * 3) + 0
        };
        res.json({
            success: true,
            metrics: {
                totalCampaigns: mockStats.totalCampaigns,
                draftCampaigns: mockStats.draftCampaigns,
                pendingApproval: mockStats.pendingApproval,
                activeCampaigns: mockStats.activeCampaigns,
                completedCampaigns: mockStats.completedCampaigns,
                failedCampaigns: mockStats.failedCampaigns,
                bounceRate: parseFloat(mockStats.avgBounceRate.toFixed(2)),
                deliverability: mockStats.avgBounceRate < 3 ? 'Excellent' : mockStats.avgBounceRate < 5 ? 'Good' : 'Poor',
                recentIssues: mockStats.recentIssues,
                health: mockStats.avgBounceRate < 3 ? 'Optimal' : mockStats.avgBounceRate < 5 ? 'Good' : 'Needs Attention'
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
        // Mock data for now
        const mockCreationStats = {
            totalCampaigns: Math.floor(Math.random() * 100) + 50,
            avgProcessingTime: Math.random() * 2 + 1
        };
        const mockExecutionStats = {
            totalExecutions: Math.floor(Math.random() * 200) + 100,
            successRate: Math.random() * 10 + 90 // 90-100%
        };
        const nodePerformance = [
            { node: 'Parser', avgTime: 1.2, successRate: 98.5, totalExecutions: 150 },
            { node: 'Architect', avgTime: 2.8, successRate: 96.2, totalExecutions: 150 },
            { node: 'Validator', avgTime: 0.8, successRate: 99.1, totalExecutions: 150 },
            { node: 'Executor', avgTime: 3.5, successRate: 94.3, totalExecutions: 120 }
        ];
        res.json({
            success: true,
            metrics: {
                totalCampaigns: mockCreationStats.totalCampaigns,
                avgProcessingTime: parseFloat(mockCreationStats.avgProcessingTime.toFixed(2)),
                totalExecutions: mockExecutionStats.totalExecutions,
                successRate: parseFloat(mockExecutionStats.successRate.toFixed(2)),
                nodePerformance,
                status: mockExecutionStats.successRate > 95 ? 'Optimal' : mockExecutionStats.successRate > 90 ? 'Good' : 'Needs Optimization',
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
        // Mock data for now
        const mockCampaignStats = {
            totalCampaigns: Math.floor(Math.random() * 50) + 20,
            activeCampaigns: Math.floor(Math.random() * 10) + 2,
            completedCampaigns: Math.floor(Math.random() * 30) + 10
        };
        const mockExecutionMetrics = {
            totalEmails: Math.floor(Math.random() * 2000) + 500,
            totalReplies: Math.floor(Math.random() * 100) + 20,
            totalMeetings: Math.floor(Math.random() * 50) + 10
        };
        res.json({
            success: true,
            metrics: {
                totalCampaigns: mockCampaignStats.totalCampaigns,
                activeCampaigns: mockCampaignStats.activeCampaigns,
                completedCampaigns: mockCampaignStats.completedCampaigns,
                totalEmails: mockExecutionMetrics.totalEmails,
                totalReplies: mockExecutionMetrics.totalReplies,
                totalMeetings: mockExecutionMetrics.totalMeetings,
                health: mockCampaignStats.activeCampaigns > 0 ? 'Running' : 'Idle'
            }
        });
    }
    catch (error) {
        console.error('Dashboard metrics error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
    }
});
exports.default = router;

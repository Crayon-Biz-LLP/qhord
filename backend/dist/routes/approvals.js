"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Apply authentication to all routes
router.use(auth_1.requireAuth);
/**
 * POST /api/approvals/submit
 * Submit a campaign for approval
 */
router.post('/submit', async (req, res) => {
    try {
        const { campaignId } = req.body;
        // Get the campaign (demo mode - skip user check)
        const campaign = await prisma_1.prisma.campaign.findFirst({
            where: {
                id: campaignId,
                status: { not: 'workflow_template' }
            }
        });
        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }
        if (campaign.status !== 'draft') {
            return res.status(400).json({ error: 'Campaign can only be submitted from draft status' });
        }
        // Update campaign status
        const updatedCampaign = await prisma_1.prisma.campaign.update({
            where: { id: campaignId },
            data: {
                status: 'pending_approval'
            }
        });
        // Create approval record
        const approval = await prisma_1.prisma.campaignApproval.create({
            data: {
                campaign_id: campaignId,
                requested_by_operator_id: campaign.created_by_operator_id,
                status: 'pending'
            }
        });
        // Create notification for managers (in a real app, you'd get all managers)
        // await prisma.notification.create({
        //   data: {
        //     operator_id: operatorId, // In real app, this would be manager IDs
        //     type: 'campaign_pending',
        //     title: 'Campaign Pending Approval',
        //     message: `Campaign "${campaign.name}" is pending your approval`,
        //     entity_id: campaignId,
        //     entity_type: 'campaign'
        //   }
        // } as any);
        res.json({
            success: true,
            campaign: updatedCampaign,
            approval
        });
    }
    catch (error) {
        console.error('Submit campaign error:', error);
        res.status(500).json({ error: 'Failed to submit campaign for approval' });
    }
});
/**
 * POST /api/approvals/review
 * Approve or reject a campaign
 */
router.post('/review', async (req, res) => {
    try {
        const { campaignId, action, comments } = req.body;
        const operatorId = req.user.id;
        // Get the campaign
        const campaign = await prisma_1.prisma.campaign.findFirst({
            where: {
                id: campaignId,
                status: { not: 'workflow_template' }
            }
        });
        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }
        if (campaign.status !== 'pending_approval') {
            return res.status(400).json({ error: 'Campaign is not pending approval' });
        }
        // Get the existing approval record
        console.log('🔍 Looking for approval record for campaign:', campaignId);
        const approval = await prisma_1.prisma.campaignApproval.findFirst({
            where: {
                campaign_id: campaignId,
                status: 'pending'
            }
        });
        if (!approval) {
            console.log('❌ No approval record found');
            return res.status(404).json({ error: 'Approval request not found' });
        }
        console.log('✅ Approval record found:', approval.id);
        let updatedCampaign;
        const updateData = {};
        if (action === 'approve') {
            // Approve the campaign
            updateData.status = 'approved';
            updatedCampaign = await prisma_1.prisma.campaign.update({
                where: { id: campaignId },
                data: updateData
            });
            // Update approval record
            await prisma_1.prisma.campaignApproval.update({
                where: { id: approval.id },
                data: {
                    status: 'approved',
                    comments
                }
            });
            // Trigger immediate execution (demo mode - no real API calls)
            console.log(`🚀 Campaign approved, triggering execution: ${campaignId}`);
            // Import execution queue
            const { ExecutionQueue } = await Promise.resolve().then(() => __importStar(require('../services/execution.queue')));
            const executionQueue = new ExecutionQueue();
            // Trigger execution in background (demo mode - no real API calls)
            setTimeout(async () => {
                try {
                    console.log('🎯 Triggering execution queue (demo mode - no real API calls)');
                    await executionQueue.triggerApprovedCampaigns();
                }
                catch (error) {
                    console.error('❌ Failed to trigger campaign execution:', error);
                }
            }, 1000);
            console.log('✅ Execution triggered in background');
        }
        else if (action === 'reject') {
            // Reject the campaign
            updateData.status = 'rejected';
            updateData.rejection_reason = comments;
            updatedCampaign = await prisma_1.prisma.campaign.update({
                where: { id: campaignId },
                data: updateData
            });
            // Update approval record
            await prisma_1.prisma.campaignApproval.update({
                where: { id: approval.id },
                data: {
                    status: 'rejected',
                    comments
                }
            });
        }
        res.json({
            success: true,
            campaign: updatedCampaign,
            approval
        });
    }
    catch (error) {
        console.error('Review campaign error:', error);
        console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
        res.status(500).json({ error: `Failed to review campaign: ${error instanceof Error ? error.message : 'Unknown error'}` });
    }
});
/**
 * GET /api/approvals/pending
 * Get all campaigns pending approval
 */
router.get('/pending', async (req, res) => {
    try {
        const operatorId = req.user.id;
        const pendingCampaigns = await prisma_1.prisma.campaign.findMany({
            where: {
                status: 'pending_approval'
            },
            include: {
                client: true,
                created_by_operator: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                approvals: {
                    where: {
                        status: 'pending'
                    },
                    include: {
                        requested_by_operator: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        steps: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });
        res.json({
            success: true,
            campaigns: pendingCampaigns.map(campaign => ({
                id: campaign.id,
                name: campaign.name,
                description: campaign.description,
                client: campaign.client,
                estimated_cost: campaign.estimated_cost,
                estimated_duration: campaign.estimated_duration,
                step_count: 0, // campaign._count.steps,
                created_by: campaign.created_by_operator,
                submitted_by: null, // campaign.approvals[0]?.requested_by_operator,
                submitted_at: campaign.submitted_at || campaign.created_at,
                manifest: campaign.manifest
            }))
        });
    }
    catch (error) {
        console.error('Get pending campaigns error:', error);
        res.status(500).json({ error: 'Failed to get pending campaigns' });
    }
});
/**
 * GET /api/approvals/history
 * Get approval history for a campaign
 */
router.get('/history/:campaignId', async (req, res) => {
    try {
        const { campaignId } = req.params;
        const approvals = await prisma_1.prisma.campaignApproval.findMany({
            where: {
                campaign_id: campaignId
            },
            include: {
                requested_by_operator: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                approved_by_operator: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });
        res.json({
            success: true,
            approvals
        });
    }
    catch (error) {
        console.error('Get approval history error:', error);
        res.status(500).json({ error: 'Failed to get approval history' });
    }
});
exports.default = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const execution_queue_1 = require("../services/execution.queue");
const router = express_1.default.Router();
// Apply authentication to all routes
router.use(auth_1.requireAuth);
/**
 * POST /api/execution/trigger
 * Manually trigger execution of approved campaigns
 */
router.post('/trigger', async (req, res) => {
    try {
        const operatorId = req.user.id;
        console.log('🚀 Manual execution trigger requested by operator:', operatorId);
        // Import execution queue
        const executionQueue = new execution_queue_1.ExecutionQueue();
        // Trigger execution of approved campaigns
        await executionQueue.triggerApprovedCampaigns();
        res.json({
            success: true,
            message: 'Execution triggered for approved campaigns'
        });
    }
    catch (error) {
        console.error('❌ Failed to trigger execution:', error);
        res.status(500).json({
            error: error.message || 'Failed to trigger execution'
        });
    }
});
/**
 * GET /api/execution/status/:campaignId
 * Get execution status of a specific campaign
 */
router.get('/status/:campaignId', async (req, res) => {
    try {
        const { campaignId } = req.params;
        const operatorId = req.user.id;
        // Get campaign with execution status
        const campaign = await prisma_1.prisma.campaign.findFirst({
            where: {
                id: campaignId,
                created_by_operator_id: operatorId,
                status: { not: 'workflow_template' }
            }
        });
        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }
        res.json({
            success: true,
            campaign: {
                id: campaign.id,
                name: campaign.name,
                status: campaign.status,
                created_at: campaign.created_at,
                updated_at: campaign.updated_at
            }
        });
    }
    catch (error) {
        console.error('❌ Failed to get execution status:', error);
        res.status(500).json({
            error: error.message || 'Failed to get execution status'
        });
    }
});
exports.default = router;

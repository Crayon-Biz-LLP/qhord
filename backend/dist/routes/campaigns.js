"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const state_machine_1 = require("../ai/langgraph/state-machine");
const auth_1 = require("../middleware/auth");
const prisma_1 = require("../lib/prisma");
const router = (0, express_1.Router)();
// Apply authentication to all routes except /plan and GET /campaigns for testing
router.use((req, res, next) => {
    if (req.path === '/plan' || (req.method === 'GET' && req.path === '/')) {
        // Skip authentication for /plan endpoint and GET campaigns for testing
        return next();
    }
    return (0, auth_1.requireAuth)(req, res, next);
});
/**
 * POST /api/campaigns/plan
 * Create a campaign plan from natural language prompt
 */
router.post('/plan', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Prompt is required and must be a non-empty string'
            });
        }
        // For testing without auth, create or get test user and client
        let operatorId = req.user?.id;
        let clientId;
        if (!operatorId) {
            // Create test user for demo
            let testOperator = await prisma_1.prisma.operator.findFirst({
                where: { email: 'demo@example.com' }
            });
            if (!testOperator) {
                testOperator = await prisma_1.prisma.operator.create({
                    data: {
                        email: 'demo@example.com',
                        password_hash: 'demo123',
                        name: 'Demo User',
                        role: 'operator'
                    }
                });
            }
            operatorId = testOperator.id;
            // Create test client
            let testClient = await prisma_1.prisma.client.findFirst({
                where: { created_by_operator_id: operatorId }
            });
            if (!testClient) {
                testClient = await prisma_1.prisma.client.create({
                    data: {
                        name: 'Demo Client',
                        description: 'Demo client for testing',
                        created_by_operator_id: operatorId
                    }
                });
            }
            clientId = testClient.id;
        }
        else {
            // Get active tools for this client
            const activeTools = await getActiveToolsForClient(req.user.id);
            // Get client ID for this operator (for now, get the first client)
            clientId = await getClientIdForOperator(req.user.id);
            if (!clientId) {
                return res.status(400).json({
                    success: false,
                    error: 'No client found for this operator'
                });
            }
        }
        // Get active tools
        const activeTools = await getActiveToolsForClient(operatorId);
        // Run the campaign compiler
        const result = await (0, state_machine_1.runCampaignCompiler)(prompt, activeTools, operatorId, clientId);
        if (result.error) {
            return res.status(400).json({
                success: false,
                error: result.error
            });
        }
        if (!result.campaignId) {
            return res.status(500).json({
                success: false,
                error: 'Campaign was not created successfully'
            });
        }
        // Return success response
        const response = {
            success: true,
            campaignId: result.campaignId,
            plan: result.validatedPlan,
            estimatedCost: result.validatedPlan?.estimated_cost,
            estimatedDuration: result.validatedPlan?.estimated_duration,
            warnings: result.warnings
        };
        res.status(201).json(response);
    }
    catch (error) {
        console.error('Campaign plan error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error while creating campaign plan'
        });
    }
});
/**
 * GET /api/campaigns
 * List campaigns for the authenticated user
 */
router.get('/', async (req, res) => {
    try {
        // For testing without auth, get all campaigns or use test user
        let operatorId = req.user?.id;
        if (!operatorId) {
            // Get test user for demo
            let testOperator = await prisma_1.prisma.operator.findFirst({
                where: { email: 'demo@example.com' }
            });
            if (testOperator) {
                operatorId = testOperator.id;
            }
        }
        const campaigns = await prisma_1.prisma.campaign.findMany({
            where: operatorId ? {
                created_by_operator_id: operatorId
            } : {},
            include: {
                _count: {
                    select: {
                        steps: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            },
            take: 50
        });
        res.json({
            campaigns: campaigns.map(campaign => ({
                id: campaign.id,
                name: campaign.name,
                description: campaign.description,
                status: campaign.status,
                estimatedCost: campaign.estimated_cost,
                estimatedDuration: campaign.estimated_duration,
                stepCount: 0, // TODO: Add step count when needed
                createdAt: campaign.created_at
            }))
        });
    }
    catch (error) {
        console.error('List campaigns error:', error);
        res.status(500).json({ error: 'Failed to fetch campaigns' });
    }
});
/**
 * GET /api/campaigns/:id
 * Get detailed campaign information
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const campaign = await prisma_1.prisma.campaign.findFirst({
            where: {
                id,
                created_by_operator_id: req.user.id
            },
            include: {
                steps: {
                    orderBy: {
                        step_order: 'asc'
                    }
                }
            }
        });
        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }
        res.json({
            campaign: {
                id: campaign.id,
                name: campaign.name,
                description: campaign.description,
                status: campaign.status,
                manifest: campaign.manifest,
                estimatedCost: campaign.estimated_cost,
                estimatedDuration: campaign.estimated_duration,
                steps: campaign.steps.map(step => ({
                    id: step.id,
                    order: step.step_order,
                    tool: step.tool_name,
                    action: step.action,
                    params: step.params,
                    status: step.status,
                    dependencies: step.dependencies
                })),
                createdAt: campaign.created_at,
                updatedAt: campaign.updated_at
            }
        });
    }
    catch (error) {
        console.error('Get campaign error:', error);
        res.status(500).json({ error: 'Failed to fetch campaign' });
    }
});
/**
 * Helper function to get active tools for a client
 */
async function getActiveToolsForClient(operatorId) {
    try {
        // Get the client's active tool accounts
        const toolAccounts = await prisma_1.prisma.clientToolAccount.findMany({
            where: {
                created_by_operator_id: operatorId,
                // In a real app, you'd filter by a specific client
                // For now, get all tools for this operator's clients
            },
            select: {
                tool_name: true
            },
            distinct: ['tool_name']
        });
        // Return unique tool names
        const activeTools = toolAccounts.map(account => account.tool_name);
        // If no tools are configured, return a default set for testing
        if (activeTools.length === 0) {
            return ['Apollo', 'Smartlead']; // Default tools for testing
        }
        return activeTools;
    }
    catch (error) {
        console.error('Error getting active tools:', error);
        // Return default tools if there's an error
        return ['Apollo', 'Smartlead'];
    }
}
/**
 * Helper function to get client ID for an operator
 */
async function getClientIdForOperator(operatorId) {
    try {
        // For now, get the first client associated with this operator
        // In a real app, this would be more sophisticated (maybe from request context)
        const client = await prisma_1.prisma.client.findFirst({
            where: {
                created_by_operator_id: operatorId
            },
            select: {
                id: true
            }
        });
        return client?.id || null;
    }
    catch (error) {
        console.error('Error getting client ID:', error);
        return null;
    }
}
exports.default = router;

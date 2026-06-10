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
const state_machine_1 = require("../ai/langgraph/state-machine");
const auth_1 = require("../middleware/auth");
const prisma_1 = require("../lib/prisma");
const planner_memory_service_1 = require("../services/planner-memory.service");
const router = (0, express_1.Router)();
const plannerMemoryService = new planner_memory_service_1.PlannerMemoryService();
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
        const memoryInsights = await plannerMemoryService.getInsights(operatorId, prompt, activeTools);
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
            warnings: result.warnings,
            memoryInsights
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
            where: {
                ...(operatorId ? { created_by_operator_id: operatorId } : {}),
                status: {
                    not: 'workflow_template'
                }
            },
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
                created_by_operator_id: req.user.id,
                status: {
                    not: 'workflow_template'
                }
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
        const { getEnvToolsForDemoStack, useFreeDemoStack } = await Promise.resolve().then(() => __importStar(require('../config/demo-stack')));
        const tools = new Set(toolAccounts.length > 0
            ? toolAccounts.map((account) => account.tool_name)
            : ['Apollo', 'Clay', 'Smartlead']);
        for (const t of getEnvToolsForDemoStack()) {
            tools.add(t);
        }
        if (useFreeDemoStack()) {
            tools.add('Hunter');
            tools.add('Brevo');
            tools.add('Apollo');
            tools.add('Clay');
            tools.add('Smartlead');
        }
        return [...tools];
    }
    catch (error) {
        console.error('Error getting active tools:', error);
        return ['Apollo', 'Clay', 'Smartlead', 'Hunter', 'Brevo'];
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

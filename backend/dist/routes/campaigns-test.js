"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const state_machine_1 = require("../ai/langgraph/state-machine");
const prisma_1 = require("../lib/prisma");
const router = (0, express_1.Router)();
/**
 * POST /api/campaigns-test/plan
 * TEST ROUTE: Create a campaign plan from natural language prompt (no auth required)
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
        console.log('🧪 TEST: Creating campaign with prompt:', prompt);
        // For testing, use default active tools
        const activeTools = ['Apollo', 'Smartlead'];
        // For testing, create a test operator and client
        let testOperator = await prisma_1.prisma.operator.findFirst({
            where: { email: 'test@example.com' }
        });
        if (!testOperator) {
            testOperator = await prisma_1.prisma.operator.create({
                data: {
                    email: 'test@example.com',
                    password_hash: 'testhash',
                    name: 'Test Operator',
                    role: 'operator'
                }
            });
        }
        let testClient = await prisma_1.prisma.client.findFirst({
            where: { created_by_operator_id: testOperator.id }
        });
        if (!testClient) {
            testClient = await prisma_1.prisma.client.create({
                data: {
                    name: 'Test Client',
                    description: 'Test client for Phase 1',
                    created_by_operator_id: testOperator.id
                }
            });
        }
        console.log('🧪 TEST: Using operator:', testOperator.id, 'client:', testClient.id);
        // Run the campaign compiler
        const result = await (0, state_machine_1.runCampaignCompiler)(prompt, activeTools, testOperator.id, testClient.id);
        console.log('🧪 TEST: Compiler result:', {
            campaignId: result.campaignId,
            error: result.error,
            hasPlan: !!result.validatedPlan
        });
        if (result.error || !result.validatedPlan) {
            return res.status(400).json({
                success: false,
                error: result.error || 'Failed to generate campaign plan'
            });
        }
        return res.json({
            success: true,
            campaignId: result.campaignId,
            plan: result.validatedPlan,
            estimatedCost: result.validatedPlan.estimated_cost,
            estimatedDuration: result.validatedPlan.estimated_duration,
            warnings: result.warnings
        });
    }
    catch (error) {
        console.error('🧪 TEST: Campaign planning error:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});
exports.default = router;

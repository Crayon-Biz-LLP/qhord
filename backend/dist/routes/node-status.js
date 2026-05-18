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
const router = (0, express_1.Router)();
// Test individual LangGraph nodes
router.post('/test-nodes', async (req, res) => {
    try {
        const { prompt, testNodes = ['parser', 'architect', 'validator', 'executor'] } = req.body;
        console.log('🧪 Testing LangGraph Nodes...');
        console.log('📝 Prompt:', prompt);
        console.log('🔧 Nodes to test:', testNodes);
        // Create test user and client
        let testOperator = await prisma_1.prisma.operator.findFirst({
            where: { email: 'node-test@example.com' }
        });
        if (!testOperator) {
            testOperator = await prisma_1.prisma.operator.create({
                data: {
                    email: 'node-test@example.com',
                    password_hash: 'test123',
                    name: 'Node Test User',
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
                    name: 'Node Test Client',
                    description: 'Client for node testing',
                    created_by_operator_id: testOperator.id
                }
            });
        }
        const activeTools = ['Apollo', 'Smartlead'];
        const nodeResults = {};
        // Test Parser Node
        if (testNodes.includes('parser')) {
            console.log('🔵 Testing Parser Node...');
            try {
                const { ParserNode } = await Promise.resolve().then(() => __importStar(require('../ai/langgraph/nodes/parser-node')));
                const parserNode = new ParserNode();
                const parserResult = await parserNode.invoke({
                    userInput: prompt,
                    activeTools,
                    operatorId: testOperator.id,
                    clientId: testClient.id
                });
                nodeResults.parser = {
                    success: !!parserResult.intent,
                    intent: parserResult.intent,
                    error: parserResult.error
                };
                console.log('✅ Parser Node Result:', parserResult.intent?.goal);
            }
            catch (error) {
                nodeResults.parser = {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                };
                console.log('❌ Parser Node Error:', error);
            }
        }
        // Test Architect Node
        if (testNodes.includes('architect') && nodeResults.parser?.success) {
            console.log('🟡 Testing Architect Node...');
            try {
                const { ArchitectNode } = await Promise.resolve().then(() => __importStar(require('../ai/langgraph/nodes/architect-node')));
                const architectNode = new ArchitectNode();
                const architectResult = await architectNode.invoke({
                    userInput: prompt,
                    activeTools,
                    operatorId: testOperator.id,
                    clientId: testClient.id,
                    intent: nodeResults.parser.intent
                });
                nodeResults.architect = {
                    success: !!architectResult.manifest,
                    manifest: architectResult.manifest,
                    error: architectResult.error
                };
                console.log('✅ Architect Node Result:', architectResult.manifest?.name);
            }
            catch (error) {
                nodeResults.architect = {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                };
                console.log('❌ Architect Node Error:', error);
            }
        }
        // Test Validator Node
        if (testNodes.includes('validator') && nodeResults.architect?.success) {
            console.log('🟢 Testing Validator Node...');
            try {
                const { ValidatorNode } = await Promise.resolve().then(() => __importStar(require('../ai/langgraph/nodes/validator-node')));
                const validatorNode = new ValidatorNode();
                const validatorResult = await validatorNode.invoke({
                    userInput: prompt,
                    activeTools,
                    operatorId: testOperator.id,
                    clientId: testClient.id,
                    intent: nodeResults.parser.intent,
                    manifest: nodeResults.architect.manifest
                });
                nodeResults.validator = {
                    success: !!validatorResult.validatedPlan,
                    validatedPlan: validatorResult.validatedPlan,
                    warnings: validatorResult.warnings,
                    error: validatorResult.error
                };
                console.log('✅ Validator Node Result:', 'Validation passed');
            }
            catch (error) {
                nodeResults.validator = {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                };
                console.log('❌ Validator Node Error:', error);
            }
        }
        // Test Executor Node
        if (testNodes.includes('executor') && nodeResults.validator?.success) {
            console.log('🔴 Testing Executor Node...');
            try {
                const { ExecutorNode } = await Promise.resolve().then(() => __importStar(require('../ai/langgraph/nodes/executor-node')));
                const executorNode = new ExecutorNode();
                const executorResult = await executorNode.invoke({
                    userInput: prompt,
                    activeTools,
                    operatorId: testOperator.id,
                    clientId: testClient.id,
                    intent: nodeResults.parser.intent,
                    manifest: nodeResults.architect.manifest,
                    validatedPlan: nodeResults.validator.validatedPlan
                });
                nodeResults.executor = {
                    success: !!executorResult.campaignId,
                    campaignId: executorResult.campaignId,
                    executionStatus: executorResult.executionStatus,
                    error: executorResult.error
                };
                console.log('✅ Executor Node Result:', 'Campaign saved with ID:', executorResult.campaignId);
            }
            catch (error) {
                nodeResults.executor = {
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                };
                console.log('❌ Executor Node Error:', error);
            }
        }
        // Calculate overall success
        const allNodesSuccess = testNodes.every(node => nodeResults[node]?.success);
        res.json({
            success: allNodesSuccess,
            prompt,
            nodeResults,
            summary: {
                totalNodes: testNodes.length,
                successfulNodes: testNodes.filter(node => nodeResults[node]?.success).length,
                failedNodes: testNodes.filter(node => !nodeResults[node]?.success)
            }
        });
    }
    catch (error) {
        console.error('Node test error:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;

import { Router, Request, Response } from 'express';
import { runCampaignCompiler } from '../ai/langgraph/state-machine';
import { prisma } from '../lib/prisma';

const router = Router();

interface NodeTestRequest {
  prompt: string;
  testNodes?: string[];
}

// Test individual LangGraph nodes
router.post('/test-nodes', async (req: Request, res: Response) => {
  try {
    const { prompt, testNodes = ['parser', 'architect', 'validator', 'executor'] } = req.body as NodeTestRequest;

    console.log('🧪 Testing LangGraph Nodes...');
    console.log('📝 Prompt:', prompt);
    console.log('🔧 Nodes to test:', testNodes);

    // Create test user and client
    let testOperator = await prisma.operator.findFirst({
      where: { email: 'node-test@example.com' }
    });

    if (!testOperator) {
      testOperator = await prisma.operator.create({
        data: {
          email: 'node-test@example.com',
          password_hash: 'test123',
          name: 'Node Test User',
          role: 'operator'
        }
      });
    }

    let testClient = await prisma.client.findFirst({
      where: { created_by_operator_id: testOperator.id }
    });

    if (!testClient) {
      testClient = await prisma.client.create({
        data: {
          name: 'Node Test Client',
          description: 'Client for node testing',
          created_by_operator_id: testOperator.id
        }
      });
    }

    const activeTools = ['Apollo', 'Smartlead'];
    const nodeResults: any = {};

    // Test Parser Node
    if (testNodes.includes('parser')) {
      console.log('🔵 Testing Parser Node...');
      try {
        const { ParserNode } = await import('../ai/langgraph/nodes/parser-node');
        const parserNode = new ParserNode();
        
        const parserResult = await parserNode.invoke({
          userInput: prompt,
          activeTools,
          operatorId: testOperator.id,
          clientId: testClient.id
        } as any);

        nodeResults.parser = {
          success: !!parserResult.intent,
          intent: parserResult.intent,
          error: parserResult.error
        };
        console.log('✅ Parser Node Result:', parserResult.intent?.goal);
      } catch (error) {
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
        const { ArchitectNode } = await import('../ai/langgraph/nodes/architect-node');
        const architectNode = new ArchitectNode();
        
        const architectResult = await architectNode.invoke({
          userInput: prompt,
          activeTools,
          operatorId: testOperator.id,
          clientId: testClient.id,
          intent: nodeResults.parser.intent
        } as any);

        nodeResults.architect = {
          success: !!architectResult.manifest,
          manifest: architectResult.manifest,
          error: architectResult.error
        };
        console.log('✅ Architect Node Result:', architectResult.manifest?.name);
      } catch (error) {
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
        const { ValidatorNode } = await import('../ai/langgraph/nodes/validator-node');
        const validatorNode = new ValidatorNode();
        
        const validatorResult = await validatorNode.invoke({
          userInput: prompt,
          activeTools,
          operatorId: testOperator.id,
          clientId: testClient.id,
          intent: nodeResults.parser.intent,
          manifest: nodeResults.architect.manifest
        } as any);

        nodeResults.validator = {
          success: !!validatorResult.validatedPlan,
          validatedPlan: validatorResult.validatedPlan,
          warnings: validatorResult.warnings,
          error: validatorResult.error
        };
        console.log('✅ Validator Node Result:', 'Validation passed');
      } catch (error) {
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
        const { ExecutorNode } = await import('../ai/langgraph/nodes/executor-node');
        const executorNode = new ExecutorNode();
        
        const executorResult = await executorNode.invoke({
          userInput: prompt,
          activeTools,
          operatorId: testOperator.id,
          clientId: testClient.id,
          intent: nodeResults.parser.intent,
          manifest: nodeResults.architect.manifest,
          validatedPlan: nodeResults.validator.validatedPlan
        } as any);

        nodeResults.executor = {
          success: !!executorResult.campaignId,
          campaignId: executorResult.campaignId,
          executionStatus: executorResult.executionStatus,
          error: executorResult.error
        };
        console.log('✅ Executor Node Result:', 'Campaign saved with ID:', executorResult.campaignId);
      } catch (error) {
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

  } catch (error) {
    console.error('Node test error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

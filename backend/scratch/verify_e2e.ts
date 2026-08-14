import { workflowEngine } from '../src/services/workflowEngine';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  console.log('--- Starting End-to-End Verification ---');

  const client = await prisma.client.findFirst({
    where: {
      tool_accounts: {
        some: { account_label: 'Auto (mock-ready)' }
      }
    }
  });

  if (!client) {
    console.log('No client found to test with.');
    process.exit(0);
  }

  const toolAccount = await prisma.clientToolAccount.findFirst({
    where: { client_id: client.id }
  });
  const operatorId = toolAccount ? toolAccount.created_by_operator_id : '00000000-0000-0000-0000-000000000000';

  const { v4: uuidv4 } = require('uuid');
  const triggerId = uuidv4();
  const nodeAId = uuidv4();
  const nodeBId = uuidv4();
  const nodeCId = uuidv4();

  // Create a Workflow in the DB
  const workflow = await prisma.workflow.create({
    data: {
      name: 'E2E Test Workflow A',
      client_id: client.id,
      created_by_operator_id: operatorId,
      status: 'draft',
      nodes: {
        create: [
          {
            id: triggerId,
            node_type: 'trigger',
            tool: 'webhook',
            action: 'receive',
            configuration_json: {},
            position: { x: 0, y: 0 }
          },
          {
            id: nodeAId,
            node_type: 'action',
            tool: 'Apollo',
            action: 'search_people',
            configuration_json: { keywords: 'Software Engineer', company_names: 'GitHub' },
            position: { x: 0, y: 0 }
          },
          {
            id: nodeBId,
            node_type: 'action',
            tool: 'Clay',
            action: 'email_enrichment',
            configuration_json: { email: `{{${nodeAId}.output.contacts.0.email}}` },
            position: { x: 0, y: 0 }
          },
          {
            id: nodeCId,
            node_type: 'action',
            tool: 'Smartlead',
            action: 'add_lead',
            configuration_json: { 
              campaign_id: 'cmp_123', 
              email: `{{${nodeBId}.output.email}}`,
              first_name: `{{${nodeAId}.output.contacts.0.first_name}}`
            },
            position: { x: 0, y: 0 }
          }
        ]
      },
      edges: {
        create: [
          { source_node_id: triggerId, target_node_id: nodeAId },
          { source_node_id: nodeAId, target_node_id: nodeBId },
          { source_node_id: nodeBId, target_node_id: nodeCId }
        ]
      }
    }
  });

  // Create a run
  const runRecord = await prisma.workflowRun.create({
    data: {
      workflow_id: workflow.id,
      status: 'pending'
    }
  });

  console.log(`Testing Workflow A: Apollo -> Clay -> Smartlead (Test Mode) using client ${client.id}`);
  
  try {
    const result = await workflowEngine.executeRun(runRecord.id, true);
    console.log('\nExecution Trace:');
    if (result.trace) {
      result.trace.forEach((t: string) => console.log(t));
    }
  } catch (err: any) {
    console.error('Execution failed:', err.message);
  }

  // Cleanup
  await prisma.workflowEdge.deleteMany({ where: { workflow_id: workflow.id } });
  await prisma.workflowNode.deleteMany({ where: { workflow_id: workflow.id } });
  await prisma.workflowRunStep.deleteMany({ where: { run_id: runRecord.id } });
  await prisma.workflowRun.delete({ where: { id: runRecord.id } });
  await prisma.workflow.delete({ where: { id: workflow.id } });

  console.log('\n--- End-to-End Verification Complete ---');
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});

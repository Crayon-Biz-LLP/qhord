import { prisma } from './lib/prisma';
import { campaignWorkflowEngine } from './services/campaign-workflow.engine';

async function testWorkflow() {
  console.log('--- Campaign Workflow Engine Verification Test ---');

  // 1. Create a dummy operator and client if needed
  let operator = await prisma.operator.findFirst();
  if (!operator) {
    operator = await prisma.operator.create({
      data: {
        email: 'test_operator@example.com',
        password_hash: 'hash',
        name: 'Test Operator',
        role: 'operator',
      },
    });
  }

  let client = await prisma.client.findFirst({
    where: { created_by_operator_id: operator.id },
  });
  if (!client) {
    client = await prisma.client.create({
      data: {
        name: 'Test Client',
        description: 'Test Client for verification',
        created_by_operator_id: operator.id,
      },
    });
  }

  // 2. Create a test Campaign
  const campaign = await prisma.campaign.create({
    data: {
      client_id: client.id,
      name: 'Verification Campaign',
      description: 'Campaign to verify sequential execution pipeline',
      status: 'draft',
      created_by_operator_id: operator.id,
    },
  });

  console.log(`Created Campaign: ${campaign.name} (${campaign.id})`);

  // 3. Create CampaignWorkflow, nodes, and edges
  const workflow = await prisma.campaignWorkflow.create({
    data: {
      campaign_id: campaign.id,
      workflow_name: 'Verification Pipeline',
      status: 'active',
      created_by: operator.id,
    },
  });

  console.log(`Created Campaign Workflow: ${workflow.workflow_name} (${workflow.id})`);

  // Nodes: Apollo Search (source) -> BetterContact (enrichment) -> Smartlead (action)
  const apolloNode = await prisma.workflowNode.create({
    data: {
      workflow_id: workflow.id,
      node_type: 'source',
      tool: 'apollo',
      configuration_json: {},
    },
  });

  const betterContactNode = await prisma.workflowNode.create({
    data: {
      workflow_id: workflow.id,
      node_type: 'enrichment',
      tool: 'bettercontact',
      configuration_json: {},
    },
  });

  const smartleadNode = await prisma.workflowNode.create({
    data: {
      workflow_id: workflow.id,
      node_type: 'action',
      tool: 'smartlead',
      configuration_json: { campaign_id: 'verification_seq_1' },
    },
  });

  console.log('Created workflow nodes (source, enrichment, action)');

  // Edges: Apollo -> BetterContact -> Smartlead
  await prisma.workflowEdge.create({
    data: {
      workflow_id: workflow.id,
      source_node_id: apolloNode.id,
      target_node_id: betterContactNode.id,
      condition_type: 'default',
    },
  });

  await prisma.workflowEdge.create({
    data: {
      workflow_id: workflow.id,
      source_node_id: betterContactNode.id,
      target_node_id: smartleadNode.id,
      condition_type: 'default',
    },
  });

  console.log('Created workflow edges');

  // 4. Create a test lead
  const lead = await prisma.lead.create({
    data: {
      client_id: client.id,
      campaign_id: campaign.id,
      email: 'verification_lead@neondb.tech',
      first_name: 'Test',
      last_name: 'Lead',
      company_name: 'Test SaaS Co',
      status: 'new',
    },
  });

  console.log(`Created test lead: ${lead.email} (${lead.id})`);

  // 5. Execute the workflow run
  console.log('Triggering workflow run...');
  await campaignWorkflowEngine.startWorkflowRun(workflow.id, lead.id);

  // 6. Verify run step results in the database
  const run = await prisma.campaignWorkflowRun.findFirst({
    where: { campaign_workflow_id: workflow.id, lead_id: lead.id },
    include: {
      steps: {
        include: { node: true },
        orderBy: { started_at: 'asc' },
      },
    },
  });

  if (!run) {
    console.error('❌ Failed: WorkflowRun was not created.');
    return;
  }

  console.log(`\nWorkflow Run Status: ${run.status}`);
  console.log(`Steps Logged: ${run.steps.length}`);
  run.steps.forEach((step: any, idx: number) => {
    console.log(`  Step ${idx + 1}: Node ${step.node.node_type}:${step.node.tool} - Status: ${step.status}`);
    if (step.error_message) {
      console.log(`    Error: ${step.error_message}`);
    }
  });

  if (run.status === 'completed' && run.steps.length === 3) {
    console.log('\n✅ Success: Workflow executed all 3 nodes sequentially and logged execution stages.');
  } else {
    console.error(`\n❌ Failed: Expected completed run with 3 steps. Found status: ${run.status}, steps: ${run.steps.length}`);
  }

  // Cleanup test records
  await prisma.campaignWorkflowRun.deleteMany({ where: { campaign_workflow_id: workflow.id } });
  await prisma.workflowEdge.deleteMany({ where: { workflow_id: workflow.id } });
  await prisma.workflowNode.deleteMany({ where: { workflow_id: workflow.id } });
  await prisma.campaignWorkflow.delete({ where: { id: workflow.id } });
  await prisma.lead.delete({ where: { id: lead.id } });
  await prisma.campaign.delete({ where: { id: campaign.id } });
  console.log('\nCleanup completed.');
}

testWorkflow().catch(console.error);

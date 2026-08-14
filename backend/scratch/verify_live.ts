import { PrismaClient } from '@prisma/client';
import { nodeProcessorFactory } from '../src/services/nodes';

const prisma = new PrismaClient();

async function run() {
  console.log('--- Starting Live API Verification ---');
  
  // Find a client that has tool accounts
  const client = await prisma.client.findFirst({
    where: {
      tool_accounts: {
        some: { status: 'connected' }
      }
    },
    include: {
      tool_accounts: true
    }
  });

  if (!client) {
    console.log('No client with connected tool accounts found. Cannot run live verification.');
    process.exit(0);
  }

  console.log(`Using Client: ${client.name} (ID: ${client.id})`);

  const apolloAccount = client.tool_accounts.find(a => a.tool_name.toLowerCase() === 'apollo' && a.status === 'connected' && a.account_label !== 'Auto (mock-ready)');
  const betterContactAccount = client.tool_accounts.find(a => a.tool_name.toLowerCase() === 'bettercontacts' && a.status === 'connected' && a.account_label !== 'Auto (mock-ready)');
  
  const context = {
    prisma,
    runId: 'verify-live-' + Date.now(),
    workflowId: 'dummy-workflow-id',
    clientId: client.id,
    previousOutputs: {},
    isTestMode: false,
    testTrace: []
  };

  // Test Apollo
  if (apolloAccount) {
    console.log(`\n[Apollo] Found account: ${apolloAccount.account_label}. Testing search_people...`);
    const processor = nodeProcessorFactory.getProcessor('Apollo');
    const result = await processor.execute({
      id: 'node-1',
      workflow_id: 'dummy-workflow-id',
      type: 'action',
      tool: 'Apollo',
      action: 'search_people',
      configuration_json: {
        accountId: apolloAccount.id,
        keywords: 'CEO',
        company_names: 'Google'
      },
      position_x: 0,
      position_y: 0,
      created_at: new Date(),
      updated_at: new Date()
    } as any, {}, context);
    
    console.log(`[Apollo] Status: ${result.status}`);
    if (result.status === 'completed') {
      console.log(`[Apollo] Success! Returned ${result.output?.contacts?.length || 0} contacts.`);
    } else {
      console.error(`[Apollo] Error: ${result.error}`);
    }
  } else {
    console.log(`\n[Apollo] No live connected account found. Skipping.`);
  }

  // Test BetterContact
  if (betterContactAccount) {
    console.log(`\n[BetterContact] Found account: ${betterContactAccount.account_label}. Testing enrich_contact...`);
    const processor = nodeProcessorFactory.getProcessor('BetterContact');
    const result = await processor.execute({
      id: 'node-2',
      workflow_id: 'dummy-workflow-id',
      type: 'action',
      tool: 'BetterContact',
      action: 'enrich_contact',
      configuration_json: {
        accountId: betterContactAccount.id,
        email: 'test@example.com'
      },
      position_x: 0,
      position_y: 0,
      created_at: new Date(),
      updated_at: new Date()
    } as any, {}, context);
    
    console.log(`[BetterContact] Status: ${result.status}`);
    if (result.status === 'completed') {
      console.log(`[BetterContact] Success! Enrich output keys: ${Object.keys(result.output || {}).join(', ')}`);
    } else {
      console.error(`[BetterContact] Error: ${result.error}`);
    }
  } else {
    console.log(`\n[BetterContact] No live connected account found. Skipping.`);
  }

  console.log('\n--- Live API Verification Complete ---');
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});

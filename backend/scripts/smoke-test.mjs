/**
 * E2E Smoke Test — run with: node scripts/smoke-test.mjs
 * Tests core API flows: health, auth, campaigns, approvals, credits, ai-providers.
 */
const BASE = process.env.API_URL || 'http://localhost:4000/api';
const TEST_EMAIL = 'test@test.com';
const TEST_PASS = 'Test123!';

let token = '';
let clientId = '';
let campaignId = '';
let approvalId = '';
let failures = 0;

async function t(name, fn) {
  try {
    await fn();
    console.log(`  ✅ ${name}`);
  } catch (err) {
    failures++;
    console.log(`  ❌ ${name}: ${err.message}`);
  }
}

async function req(method, path, body, overrideToken) {
  const headers = { 'Content-Type': 'application/json' };
  if (overrideToken || token) headers['Authorization'] = `Bearer ${overrideToken || token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${text.substring(0, 200)}`);
  }
  return res.json();
}

// --- Tests ---
async function run() {
  console.log('\n🔍 Qhord E2E Smoke Test');
  console.log(`   Base URL: ${BASE}\n`);

  // 1. Health
  await t('Health endpoint', async () => {
    const data = await req('GET', '/health');
    if (data.status !== 'ok') throw new Error(`status=${data.status}`);
    if (!data.db) throw new Error('db missing');
    console.log(`      mode=${data.mode}, db=${data.db}, campaigns=${data.counts?.campaigns}`);
  });

  // 3. Login
  await t('Auth login', async () => {
    const data = await req('POST', '/auth/login', { email: TEST_EMAIL, password: TEST_PASS });
    if (!data.token) throw new Error('no token');
    token = data.token;
    console.log(`      token=${data.token.substring(0, 20)}...`);
  });

  // Get clientId for subsequent tests
  await t('Get client ID', async () => {
    const data = await req('GET', '/clients');
    const clients = Array.isArray(data) ? data : data.clients || [];
    if (clients.length === 0) throw new Error('no clients');
    clientId = clients[0].id;
    console.log(`      id=${clientId}`);
  });

  // 4. Get campaigns
  await t('List campaigns', async () => {
    const data = await req('GET', '/campaigns');
    if (!Array.isArray(data.campaigns)) throw new Error('campaigns not array');
    console.log(`      count=${data.campaigns.length}`);
    if (data.campaigns.length > 0) campaignId = data.campaigns[0].id;
  });

  // 5. Credit balance
  await t('Credit balance', async () => {
    if (!clientId) throw new Error('no clientId from campaigns');
    const data = await req('GET', `/credits?clientId=${clientId}`);
    if (data.balance === undefined) throw new Error('no balance');
    console.log(`      balance=${data.balance}, transactions=${data.transactions?.length || 0}`);
  });

  // 6. Pending approvals
  await t('Pending approvals', async () => {
    const data = await req('GET', '/pending-approvals');
    if (!Array.isArray(data.actions)) throw new Error('actions not array');
    console.log(`      pending=${data.actions.filter(a => a.status === 'pending').length}`);
    const firstPending = data.actions.find((a) => a.status === 'pending');
    if (firstPending) approvalId = firstPending.id;
  });

  // 7. Approve a pending action (if any)
  if (approvalId) {
    await t('Approve pending action', async () => {
      const data = await req('POST', `/pending-approvals/${approvalId}/approve`);
      if (!data.success) throw new Error(`success=${data.success}, message=${data.message}`);
    });
  } else {
    console.log(`  ⏭️  Approve action (no pending actions)`);
  }

  // 8. AI providers list
  await t('List AI providers', async () => {
    const data = await req('GET', '/ai-providers');
    if (!Array.isArray(data.providers)) throw new Error('providers not array');
    console.log(`      count=${data.providers.length}`);
  });

  // 9. AI execution logs
  await t('AI execution logs', async () => {
    const data = await req('GET', '/ai-execution-logs');
    if (!Array.isArray(data.logs)) throw new Error('logs not array');
    console.log(`      count=${data.logs.length}, total=${data.total}`);
  });

  // 10. AI execution stats
  await t('AI execution stats', async () => {
    const data = await req('GET', '/ai-execution-logs/stats');
    if (!data.success) throw new Error('not successful');
    if (!data.stats) throw new Error('no stats');
    console.log(`      total=${data.stats.totalCalls}, rate=${data.stats.successRate}%`);
  });

  // 11. Campaign detail (if we have one)
  if (campaignId) {
    await t('Campaign detail', async () => {
      const data = await req('GET', `/campaigns/${campaignId}`);
      if (!data.campaign) throw new Error('no campaign');
      console.log(`      name=${data.campaign.name}, status=${data.campaign.status}`);
    });
  } else {
    console.log(`  ⏭️  Campaign detail (no campaigns)`);
  }

  // 12. Memory context
  await t('Memory context', async () => {
    const data = await req('GET', '/memory/context');
    if (!data.context?.campaignStats) throw new Error('no campaignStats');
    console.log(`      campaigns=${data.context.campaignStats.total}, feedback=${data.context.feedbackSummary.total}, preferences=${Object.keys(data.context.preferences).length}`);
  });

  // 13. Memory patterns
  await t('Memory patterns', async () => {
    const data = await req('GET', '/memory/patterns');
    if (!data.analysis?.toolPatterns) throw new Error('no toolPatterns');
    console.log(`      campaigns=${data.analysis.totalCampaigns}, tools=${data.analysis.toolPatterns.length}, recommendations=${data.analysis.recommendations.length}`);
  });

  // 14. Memory preferences
  await t('Memory preferences', async () => {
    const data = await req('GET', '/memory/preferences');
    if (data.preferences === undefined) throw new Error('no preferences');
    console.log(`      count=${Object.keys(data.preferences).length}`);
  });

  // 15. Memory consolidation
  await t('Memory consolidation', async () => {
    const data = await req('POST', '/memory/consolidate', {});
    if (!data.success) throw new Error('consolidation failed');
    console.log(`      patterns=${data.patternsFound}, summary=${data.summary?.substring(0, 80)}`);
  });

  // 16. Consolidation history
  await t('Consolidation history', async () => {
    const data = await req('GET', '/memory/consolidations');
    if (!Array.isArray(data.consolidations)) throw new Error('not array');
    console.log(`      count=${data.consolidations.length}`);
  });

  // 17. Conversation history
  await t('Conversation history', async () => {
    const data = await req('GET', '/memory/conversation');
    if (!Array.isArray(data.conversations)) throw new Error('not array');
    console.log(`      count=${data.conversations.length}`);
  });

  // 18. Store conversation
  await t('Store conversation', async () => {
    const data = await req('POST', '/memory/conversation', { role: 'user', content: 'Test memory entry', sessionId: 'smoke-test' });
    if (!data.success) throw new Error('store failed');
  });

  // 19. Prompt template scores
  await t('Prompt template scores', async () => {
    const data = await req('GET', '/memory/prompts/scores');
    if (!Array.isArray(data.scores)) throw new Error('not array');
    console.log(`      count=${data.scores.length}`);
  });

  // 20. Generate-from-prompt (sync, no save)
  await t('Generate from prompt (sync)', async () => {
    const data = await req('POST', '/workflows/generate-from-prompt', {
      prompt: 'Email outreach campaign using SmartLead for a B2B SaaS product',
      save: false,
    });
    if (!data.workflow) throw new Error('no workflow');
    const nodeCount = data.workflow.nodes?.length || 0;
    const edgeCount = data.workflow.edges?.length || 0;
    console.log(`      nodes=${nodeCount}, edges=${edgeCount}, approvalMode=${data.approvalMode || 'N/A'}`);
  });

  // Summary
  console.log(`\n${'-'.repeat(40)}`);
  if (failures === 0) {
    console.log(`✅ All smoke tests passed!\n`);
  } else {
    console.log(`❌ ${failures} test(s) failed\n`);
    process.exit(1);
  }
}

run().catch((err) => {
  console.error(`\n💥 Smoke test crashed:`, err.message);
  process.exit(1);
});

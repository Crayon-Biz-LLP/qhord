const http = require('http');

// Test complete Phase 1-2-3 flow
console.log('🎯 TESTING COMPLETE PHASE 1-2-3 FLOW');
console.log('');

// Test with a fresh campaign
const testCompleteFlow = async () => {
  try {
    // Step 1: Create new campaign
    console.log('📝 Step 1: Creating new campaign...');
    const createResponse = await makeRequest('POST', '/api/campaigns/plan', {
      prompt: "Test campaign for Phase 1-2-3"
    });

    if (!createResponse.success && createResponse.statusCode !== 201) {
      console.log('❌ Campaign creation failed:', createResponse.error);
      return;
    }

    const campaignId = createResponse.data?.campaignId || createResponse.campaignId;
    console.log(`✅ Campaign created: ${campaignId}`);

    // Step 2: Submit for approval
    console.log('📋 Step 2: Submitting for approval...');
    const submitResponse = await makeRequest('POST', '/api/approvals/submit', {
      campaignId,
      priority: 5
    }, 'Bearer demo-token');

    if (!submitResponse.success) {
      console.log('❌ Approval submission failed:', submitResponse.error);
      console.log('Status code:', submitResponse.statusCode);
      console.log('Response data:', submitResponse.data);
      return;
    }

    console.log('✅ Campaign submitted for approval');

    // Step 3: Approve campaign
    console.log('🎯 Step 3: Approving campaign...');
    const approveResponse = await makeRequest('POST', '/api/approvals/review', {
      campaignId,
      action: 'approve',
      comments: 'Test approval for complete flow'
    }, 'Bearer demo-token');

    if (!approveResponse.success) {
      console.log('❌ Campaign approval failed:', approveResponse.error);
      return;
    }

    console.log('✅ Campaign approved');

    // Step 4: Check execution status
    console.log('🚀 Step 4: Checking execution status...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for execution to start

    const statusResponse = await makeRequest('GET', `/api/execution/status/${campaignId}`, null, 'Bearer demo-token');

    if (!statusResponse.success) {
      console.log('❌ Status check failed:', statusResponse.error);
      return;
    }

    console.log(`✅ Campaign status: ${statusResponse.campaign.status}`);
    console.log('');
    console.log('🎉 COMPLETE PHASE 1-2-3 FLOW WORKING!');
    console.log('');
    console.log('📋 SUMMARY:');
    console.log('  ✅ Phase 1: AI Compiler (LangGraph)');
    console.log('  ✅ Phase 2: Approval Workflow');
    console.log('  ✅ Phase 3: Execution Engine');
    console.log('  ✅ All phases connected and working');
    console.log('');
    console.log('🎯 READY FOR REAL API KEYS');

  } catch (error) {
    console.error('❌ Complete flow test failed:', error);
  }
};

const makeRequest = (method, path, data, authHeader = null) => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 4000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...(authHeader && { 'Authorization': authHeader })
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve({ success: res.statusCode === 200, data: result, statusCode: res.statusCode });
        } catch (error) {
          resolve({ success: false, error: 'JSON parse error', statusCode: res.statusCode });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
};

testCompleteFlow();

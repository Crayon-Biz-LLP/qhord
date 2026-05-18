const http = require('http');

// Test complete Phase 2-3 integration
console.log('🎯 TESTING COMPLETE PHASE 2-3 INTEGRATION');
console.log('');

// Step 1: Create a campaign (Phase 1)
const createCampaign = () => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      prompt: "Send 50 leads from Apollo to Smartlead"
    });

    const options = {
      hostname: 'localhost',
      port: 4000,
      path: '/api/campaigns/plan',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const result = JSON.parse(data);
        if (result.success) {
          console.log('✅ Phase 1: Campaign created');
          console.log(`🆔 Campaign ID: ${result.campaignId}`);
          resolve(result.campaignId);
        } else {
          console.log('❌ Phase 1 failed:', result.error);
          reject(result.error);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
};

// Step 2: Submit for approval (Phase 2)
const submitForApproval = (campaignId) => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      campaignId,
      priority: 5
    });

    const options = {
      hostname: 'localhost',
      port: 4000,
      path: '/api/approvals/submit',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const result = JSON.parse(data);
        if (result.success) {
          console.log('✅ Phase 2: Campaign submitted for approval');
          resolve(campaignId);
        } else {
          console.log('❌ Phase 2 failed:', result.error);
          reject(result.error);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
};

// Step 3: Approve campaign (Phase 2 continued)
const approveCampaign = (campaignId) => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      campaignId,
      action: 'approve',
      comments: 'Demo approval for testing'
    });

    const options = {
      hostname: 'localhost',
      port: 4000,
      path: '/api/approvals/review',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const result = JSON.parse(data);
        if (result.success) {
          console.log('✅ Phase 2: Campaign approved');
          console.log('🚀 Phase 3: Execution should trigger automatically...');
          resolve(campaignId);
        } else {
          console.log('❌ Approval failed:', result.error);
          reject(result.error);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
};

// Step 4: Check execution status (Phase 3)
const checkExecutionStatus = (campaignId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const options = {
        hostname: 'localhost',
        port: 4000,
        path: `/api/execution/status/${campaignId}`,
        method: 'GET'
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          const result = JSON.parse(data);
          if (result.success) {
            console.log('✅ Phase 3: Execution status checked');
            console.log(`📊 Campaign Status: ${result.campaign.status}`);
            resolve(result.campaign);
          } else {
            console.log('❌ Status check failed:', result.error);
            reject(result.error);
          }
        });
      });

      req.on('error', reject);
      req.end();
    }, 3000); // Wait 3 seconds for execution to start
  });
};

// Run complete test
const runCompleteTest = async () => {
  try {
    console.log('🚀 STARTING COMPLETE PHASE 1-2-3 TEST');
    console.log('');
    
    // Phase 1: Create campaign
    const campaignId = await createCampaign();
    console.log('');
    
    // Phase 2: Submit for approval
    await submitForApproval(campaignId);
    console.log('');
    
    // Phase 2: Approve campaign
    await approveCampaign(campaignId);
    console.log('');
    
    // Phase 3: Check execution status
    await checkExecutionStatus(campaignId);
    console.log('');
    
    console.log('🎉 COMPLETE PHASE 1-2-3 TEST FINISHED');
    console.log('');
    console.log('📋 SUMMARY:');
    console.log('  ✅ Phase 1: AI Compiler (LangGraph) working');
    console.log('  ✅ Phase 2: Approval workflow working');
    console.log('  ✅ Phase 3: Execution engine connected');
    console.log('');
    console.log('🎯 NEXT: Add real API keys for actual execution');
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error);
  }
};

runCompleteTest();

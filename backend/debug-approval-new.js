const http = require('http');

// Create a new campaign and test approval submission
console.log('🎯 TESTING APPROVAL WITH NEW CAMPAIGN');
console.log('');

// Step 1: Create new campaign
const createCampaign = async () => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      prompt: "Test campaign for approval testing"
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
        try {
          const result = JSON.parse(data);
          if (res.statusCode === 201 || res.statusCode === 200) {
            console.log('✅ Campaign created successfully');
            console.log(`🆔 Campaign ID: ${result.campaignId}`);
            resolve(result.campaignId);
          } else {
            console.log('❌ Campaign creation failed');
            console.log('Status:', res.statusCode);
            console.log('Error:', result.error);
            reject(result.error);
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
};

// Step 2: Submit for approval
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
        'Authorization': 'Bearer demo-token',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (res.statusCode === 200) {
            console.log('✅ Approval submission successful');
            resolve(result);
          } else {
            console.log('❌ Approval submission failed');
            console.log('Status:', res.statusCode);
            console.log('Error:', result.error);
            reject(result.error);
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
};

// Run the test
const runTest = async () => {
  try {
    console.log('📝 Step 1: Creating new campaign...');
    const campaignId = await createCampaign();
    console.log('');
    
    console.log('📋 Step 2: Submitting for approval...');
    await submitForApproval(campaignId);
    console.log('');
    
    console.log('🎉 APPROVAL SUBMISSION WORKING!');
    console.log('');
    console.log('📋 SUMMARY:');
    console.log('  ✅ Phase 1: Campaign creation working');
    console.log('  ✅ Phase 2: Approval submission working');
    console.log('  ✅ Phase 2-3 connection ready');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

runTest();

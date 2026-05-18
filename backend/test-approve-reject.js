const http = require('http');

// Test approving a campaign
const campaignId = '72697cf0-2679-4f01-93a6-cb996ee7db4a'; // The campaign we submitted for approval

const postData = JSON.stringify({
  campaignId,
  action: "approve",
  comments: "Approved for testing",
  priority: 5
});

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/approvals/review',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer test-token', // This will fail without real auth
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🧪 TESTING: Approve campaign...');
console.log(`🆔 Campaign ID: ${campaignId}`);
console.log('🔐 Note: This will fail without proper authentication');
console.log('');

const req = http.request(options, (res) => {
  console.log(`📊 Status Code: ${res.statusCode}`);
  console.log('');

  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('📦 Raw Response:', data);
    console.log('');

    try {
      const result = JSON.parse(data);
      
      if (res.statusCode === 401) {
        console.log('🔐 EXPECTED: Authentication required');
        console.log('✅ This is correct - the endpoint is properly secured');
        console.log('');
        console.log('🎯 NEXT STEPS:');
        console.log('  1. Implement proper authentication in frontend');
        console.log('  2. Add login functionality');
        console.log('  3. Pass auth tokens in API calls');
      } else if (result.success) {
        console.log('✅ SUCCESS: Campaign approved!');
        console.log(`🆔 Campaign ID: ${result.campaign.id}`);
        console.log(`📊 Status: ${result.campaign.status}`);
      } else {
        console.log('❌ FAILED: Campaign approval failed');
        console.log('Error:', result.error);
      }
      
    } catch (error) {
      console.log('❌ JSON Parse Error:', error.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request Error:', error.message);
});

req.write(postData);
req.end();

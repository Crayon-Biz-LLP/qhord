const http = require('http');

// Test submitting a campaign for approval
const campaignId = '72697cf0-2679-4f01-93a6-cb996ee7db4a'; // Use the first campaign from our debug
const priority = 5;

const postData = JSON.stringify({ campaignId, priority });

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

console.log('🧪 TESTING: Submit campaign for approval...');
console.log(`🆔 Campaign ID: ${campaignId}`);
console.log(`🎯 Priority: ${priority}`);
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
      
      if (result.success) {
        console.log('✅ SUCCESS: Campaign submitted for approval!');
        console.log(`🆔 Campaign ID: ${result.campaign.id}`);
        console.log(`📊 Status: ${result.campaign.status}`);
        console.log(`🎯 Priority: ${result.campaign.priority}`);
        console.log(`📅 Submitted At: ${result.campaign.submitted_at}`);
        console.log('');
        console.log('🎉 NOW CHECK THE APPROVAL DASHBOARD:');
        console.log('  1. Go to: http://localhost:3000/dashboard/workflows');
        console.log('  2. Click "Approvals" tab');
        console.log('  3. You should see this campaign pending approval!');
      } else {
        console.log('❌ FAILED: Campaign submission failed');
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
  console.log('');
  console.log('💡 MAKE SURE BACKEND IS RUNNING:');
  console.log('  cd backend');
  console.log('  npm run dev');
  console.log('');
  console.log('Should see: "Backend listening on port 4000"');
});

req.write(postData);
req.end();

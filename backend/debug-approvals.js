const http = require('http');

// Test pending approvals endpoint
const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/approvals/pending',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

console.log('🔍 DEBUGGING: Check pending approvals...');

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
      
      if (result.success && result.campaigns && result.campaigns.length > 0) {
        console.log(`✅ Found ${result.campaigns.length} pending campaigns:`);
        result.campaigns.forEach((campaign, i) => {
          console.log(`\n${i+1}. Pending Campaign:`);
          console.log(`   🆔 ID: ${campaign.id}`);
          console.log(`   📝 Name: ${campaign.name}`);
          console.log(`   💰 Cost: $${campaign.estimated_cost}`);
          console.log(`   ⏱️ Duration: ${campaign.estimated_duration} min`);
          console.log(`   🎯 Priority: ${campaign.priority}`);
          console.log(`   📅 Submitted: ${campaign.submitted_at}`);
        });
      } else {
        console.log('❌ NO PENDING CAMPAIGNS FOUND');
        console.log('This means:');
        console.log('  1. No campaigns have been submitted for approval');
        console.log('  2. OR the approval submission is not working');
        console.log('  3. OR the backend route has issues');
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

req.end();

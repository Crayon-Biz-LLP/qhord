const http = require('http');

// Test what campaigns exist in database
const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/campaigns',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

console.log('🔍 DEBUGGING: Check what campaigns exist in database...');

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
      
      if (result.campaigns && result.campaigns.length > 0) {
        console.log(`✅ Found ${result.campaigns.length} campaigns in database:`);
        result.campaigns.forEach((campaign, i) => {
          console.log(`\n${i+1}. Campaign:`);
          console.log(`   🆔 ID: ${campaign.id}`);
          console.log(`   📝 Name: ${campaign.name}`);
          console.log(`   📊 Status: ${campaign.status}`);
          console.log(`   💰 Cost: $${campaign.estimatedCost}`);
          console.log(`   ⏱️ Duration: ${campaign.estimatedDuration} min`);
          console.log(`   📅 Created: ${campaign.createdAt}`);
        });
      } else {
        console.log('❌ NO CAMPAIGNS FOUND IN DATABASE');
        console.log('This means Phase 1 campaign creation is not working.');
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

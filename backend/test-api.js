const http = require('http');

// Test the API endpoint
const testData = {
  prompt: "Send 100 B2B leads from Apollo to Smartlead with 2-day warmup"
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/campaigns-test/plan',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🧪 Testing Phase 1 API endpoint...');

const req = http.request(options, (res) => {
  console.log(`📊 Status Code: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);

  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('📦 Response Body:', data);
    
    try {
      const result = JSON.parse(data);
      
      if (result.success) {
        console.log('✅ SUCCESS! Phase 1 is working!');
        console.log(`🎯 Campaign ID: ${result.campaignId}`);
        console.log(`📝 Plan Name: ${result.plan?.name}`);
        console.log(`🔧 Steps: ${result.plan?.steps?.length}`);
        console.log(`💰 Cost: $${result.estimatedCost}`);
      } else {
        console.log('❌ FAILED:', result.error);
      }
    } catch (error) {
      console.log('❌ JSON Parse Error:', error.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request Error:', error.message);
  console.log('💡 Make sure backend is running with: npm run dev');
});

req.write(postData);
req.end();

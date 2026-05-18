const http = require('http');

// Debug campaign creation
console.log('🔍 DEBUGGING CAMPAIGN CREATION');
console.log('');

const postData = JSON.stringify({
  prompt: "Test campaign for Phase 1-2-3"
});

console.log('📤 Request body:', postData);

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
  console.log(`📊 Status Code: ${res.statusCode}`);
  console.log('📦 Raw Response:');
  
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log(data);
    console.log('');
    
    try {
      const result = JSON.parse(data);
      
      if (res.statusCode === 200 && result.success) {
        console.log('✅ Campaign creation successful');
        console.log(`🆔 Campaign ID: ${result.campaignId}`);
      } else {
        console.log('❌ Campaign creation failed');
        console.log('Status:', res.statusCode);
        console.log('Error:', result.error || 'Unknown error');
      }
      
    } catch (error) {
      console.log('❌ JSON Parse Error:', error.message);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request Error:', error.message);
});

req.write(postData);
req.end();

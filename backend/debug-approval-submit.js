const http = require('http');

// Debug approval submission
const campaignId = '651fb1c5-1c4f-4f8e-9bfb-fbcbee810667'; // From previous test

console.log('🔍 DEBUGGING APPROVAL SUBMISSION');
console.log(`🆔 Campaign ID: ${campaignId}`);
console.log('');

const postData = JSON.stringify({
  campaignId,
  priority: 5
});

console.log('📤 Request body:', postData);
console.log('');

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/approvals/submit',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer demo-token', // Demo token for testing
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`📊 Status Code: ${res.statusCode}`);
  console.log('📦 Raw Response:');
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(data);
    console.log('');
    
    try {
      const result = JSON.parse(data);
      
      if (res.statusCode === 200 && result.success) {
        console.log('✅ Approval submission successful');
      } else {
        console.log('❌ Approval submission failed');
        console.log('Status:', res.statusCode);
        console.log('Error:', result.error || 'Unknown error');
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

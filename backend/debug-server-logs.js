// Check server logs for approval submission errors
const http = require('http');

console.log('🔍 CHECKING SERVER LOGS...');
console.log('');

// Test the approval submission endpoint directly
const postData = JSON.stringify({
  campaignId: '651fb1c5-1c4f-4f8e-9bfb-fbcbee810667',
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

console.log('📤 Sending request to approval endpoint...');
console.log(`🆔 Campaign ID: 651fb1c5-1c4f-4f8e-9bfb-fbcbee810667`);

const req = http.request(options, (res) => {
  console.log(`📊 Response Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('📦 Raw Response:', data);
    
    try {
      const result = JSON.parse(data);
      
      if (res.statusCode === 200 && result.success) {
        console.log('✅ SUCCESS: Approval submission worked');
      } else {
        console.log('❌ FAILED: Approval submission error');
        console.log('Status Code:', res.statusCode);
        console.log('Error:', result.error || 'Unknown error');
        
        if (res.statusCode === 500) {
          console.log('');
          console.log('🔍 DEBUGGING 500 ERROR:');
          console.log('This is likely a server-side error in the approval route');
          console.log('Check the backend server logs for detailed error information');
          console.log('');
          console.log('🎯 NEXT STEPS:');
          console.log('1. Check backend server console output');
          console.log('2. Look for Prisma/database errors');
          console.log('3. Check campaign approval creation logic');
        }
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

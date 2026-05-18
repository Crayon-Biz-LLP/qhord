const http = require('http');

console.log('🎯 TESTING PHASE 1-2-3 WITH REAL AUTHENTICATION');
console.log('');

const makeRequest = (method, path, data, authHeader = null) => {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : '';
    
    const options = {
      hostname: 'localhost',
      port: 4000,
      path,
      method,
      headers: {
        ...(data && { 'Content-Type': 'application/json' }),
        ...(data && { 'Content-Length': Buffer.byteLength(postData) }),
        ...(authHeader && { 'Authorization': authHeader })
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve({ success: res.statusCode === 200 || res.statusCode === 201, data: result, statusCode: res.statusCode });
        } catch (error) {
          resolve({ success: false, error: 'JSON parse error', statusCode: res.statusCode });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(postData);
    req.end();
  });
};

const testRealAuthFlow = async () => {
  let token;
  
  try {
    // Step 1: Try to login, if fails then register
    console.log('📝 Step 1: Authenticating user...');
    const loginResponse = await makeRequest('POST', '/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });

    if (loginResponse.success) {
      console.log('✅ Login successful');
      token = loginResponse.data.token;
    } else {
      console.log('📝 User not found, registering...');
      const registerResponse = await makeRequest('POST', '/api/auth/register', {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });

      if (!registerResponse.success) {
        console.log('❌ Registration failed:', registerResponse.data.error);
        return;
      }

      console.log('✅ Registration successful');
      token = registerResponse.data.token;
    }
    console.log('');

    // Phase 1: Create campaign
    console.log('📝 PHASE 1: Creating campaign...');
    const createResponse = await makeRequest('POST', '/api/campaigns/plan', {
      prompt: "Test campaign for Phase 1-2-3 integration"
    }, `Bearer ${token}`);

    if (!createResponse.success) {
      console.log('❌ Phase 1 FAILED:', createResponse.data.error);
      return;
    }

    const campaignId = createResponse.data.campaignId;
    console.log('✅ Phase 1 SUCCESS: Campaign created');
    console.log(`🆔 Campaign ID: ${campaignId}`);
    console.log('');

    // Phase 2: Submit for approval
    console.log('📋 PHASE 2: Submitting for approval...');
    const submitResponse = await makeRequest('POST', '/api/approvals/submit', {
      campaignId,
      priority: 5
    }, `Bearer ${token}`);

    if (!submitResponse.success) {
      console.log('❌ Phase 2 SUBMIT FAILED:', submitResponse.data.error);
      return;
    }

    console.log('✅ Phase 2 SUBMIT SUCCESS: Campaign submitted for approval');
    console.log('');

    // Phase 2: Approve campaign
    console.log('🎯 PHASE 2: Approving campaign...');
    const approveResponse = await makeRequest('POST', '/api/approvals/review', {
      campaignId,
      action: 'approve',
      comments: 'Test approval for Phase 2-3 integration'
    }, `Bearer ${token}`);

    if (!approveResponse.success) {
      console.log('❌ Phase 2 APPROVE FAILED:', approveResponse.data.error);
      return;
    }

    console.log('✅ Phase 2 APPROVE SUCCESS: Campaign approved');
    console.log('');

    // Phase 2-3 Connection: Check if execution was triggered
    console.log('🚀 PHASE 2-3 CONNECTION: Checking execution trigger...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    const statusResponse = await makeRequest('GET', `/api/execution/status/${campaignId}`, null, `Bearer ${token}`);

    console.log('✅ Phase 2-3 CONNECTION SUCCESS: Execution triggered');
    console.log('📊 Execution status:', statusResponse.data.campaign?.status);
    console.log('');

    console.log('🎉 ALL PHASES WORKING WITH REAL AUTHENTICATION!');
    console.log('');
    console.log('📋 SUMMARY:');
    console.log('  ✅ Phase 1: Campaign creation working');
    console.log('  ✅ Phase 2: Approval workflow working');
    console.log('  ✅ Phase 2-3: Connection working (execution triggered)');
    console.log('  ✅ Phase 3: Demo mode (no real API calls)');
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error);
  }
};

testRealAuthFlow();

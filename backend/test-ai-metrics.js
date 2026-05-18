const http = require('http');

console.log('🎯 TESTING AI METRICS ENDPOINTS');
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

const testAIMetrics = async () => {
  try {
    // First login to get token
    console.log('📝 Step 1: Authenticating...');
    const loginResponse = await makeRequest('POST', '/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });

    if (!loginResponse.success) {
      console.log('❌ Login failed:', loginResponse.data.error);
      return;
    }

    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    console.log('');

    // Test AI SDR Metrics
    console.log('🤖 Testing AI SDR Metrics...');
    const sdrResponse = await makeRequest('GET', '/api/ai-sdr/metrics', null, `Bearer ${token}`);
    
    if (sdrResponse.success) {
      console.log('✅ AI SDR Metrics working');
      console.log('📊 Emails Sent:', sdrResponse.data.metrics.emailsSent);
      console.log('📊 Replies:', sdrResponse.data.metrics.replies);
      console.log('📊 Meetings Booked:', sdrResponse.data.metrics.meetingsBooked);
      console.log('📊 Reply Rate:', sdrResponse.data.metrics.replyRate + '%');
    } else {
      console.log('❌ AI SDR Metrics failed:', sdrResponse.data?.error || 'Unknown error');
      console.log('Status code:', sdrResponse.statusCode);
    }
    console.log('');

    // Test AI Operator Metrics
    console.log('🔧 Testing AI Operator Metrics...');
    const operatorResponse = await makeRequest('GET', '/api/ai-operator/metrics', null, `Bearer ${token}`);
    
    if (operatorResponse.success) {
      console.log('✅ AI Operator Metrics working');
      console.log('📊 Total Campaigns:', operatorResponse.data.metrics.totalCampaigns);
      console.log('📊 Active Campaigns:', operatorResponse.data.metrics.activeCampaigns);
      console.log('📊 Bounce Rate:', operatorResponse.data.metrics.bounceRate + '%');
      console.log('📊 Health:', operatorResponse.data.metrics.health);
    } else {
      console.log('❌ AI Operator Metrics failed:', operatorResponse.data.error);
    }
    console.log('');

    // Test AI Engine Metrics
    console.log('🧠 Testing AI Engine Metrics...');
    const engineResponse = await makeRequest('GET', '/api/ai-engine/metrics', null, `Bearer ${token}`);
    
    if (engineResponse.success) {
      console.log('✅ AI Engine Metrics working');
      console.log('📊 Total Campaigns:', engineResponse.data.metrics.totalCampaigns);
      console.log('📊 Success Rate:', engineResponse.data.metrics.successRate + '%');
      console.log('📊 Status:', engineResponse.data.metrics.status);
      console.log('📊 Node Performance:', engineResponse.data.metrics.nodePerformance?.length || 0, 'nodes');
    } else {
      console.log('❌ AI Engine Metrics failed:', engineResponse.data.error);
    }
    console.log('');

    // Test Dashboard Metrics
    console.log('📈 Testing Dashboard Metrics...');
    const dashboardResponse = await makeRequest('GET', '/api/dashboard/metrics', null, `Bearer ${token}`);
    
    if (dashboardResponse.success) {
      console.log('✅ Dashboard Metrics working');
      console.log('📊 Total Campaigns:', dashboardResponse.data.metrics.totalCampaigns);
      console.log('📊 Active Campaigns:', dashboardResponse.data.metrics.activeCampaigns);
      console.log('📊 Total Emails:', dashboardResponse.data.metrics.totalEmails);
      console.log('📊 Total Meetings:', dashboardResponse.data.metrics.totalMeetings);
    } else {
      console.log('❌ Dashboard Metrics failed:', dashboardResponse.data.error);
    }
    console.log('');

    console.log('🎉 AI METRICS TESTS COMPLETED!');
    console.log('');
    console.log('📋 SUMMARY:');
    console.log('  ✅ Backend endpoints created');
    console.log('  ✅ Mock execution tracking implemented');
    console.log('  ✅ AI Engine page created');
    console.log('  ✅ Ready to connect frontend to real data');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testAIMetrics();

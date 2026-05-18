const http = require('http');

// Test individual LangGraph nodes
const testData = {
  prompt: "Send 50 B2B leads from Apollo to Smartlead with 2-day warmup",
  testNodes: ['parser', 'architect', 'validator', 'executor']
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/nodes/test-nodes',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🧪 TESTING LANGGRAPH NODES INDIVIDUALLY...');
console.log('📝 Prompt:', testData.prompt);
console.log('🔧 Testing nodes:', testData.testNodes.join(', '));
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
      
      console.log('🎯 LANGGRAPH NODE TEST RESULTS:');
      console.log('=====================================');
      console.log('');
      
      if (result.success) {
        console.log('✅ OVERALL: ALL LANGGRAPH NODES WORKING!');
        console.log('');
        console.log('📊 Summary:');
        console.log(`  📈 Total nodes tested: ${result.summary.totalNodes}`);
        console.log(`  ✅ Successful nodes: ${result.summary.successfulNodes}`);
        console.log(`  ❌ Failed nodes: ${result.summary.failedNodes}`);
        console.log('');
        
        console.log('🔍 DETAILED NODE RESULTS:');
        console.log('');
        
        // Parser Node
        if (result.nodeResults.parser) {
          const parser = result.nodeResults.parser;
          console.log('🔵 PARSER NODE:');
          console.log(`  Status: ${parser.success ? '✅ WORKING' : '❌ FAILED'}`);
          if (parser.success) {
            console.log(`  ✅ Understood: "${parser.intent.goal}"`);
            console.log(`  🎯 Target: ${parser.intent.target_audience}`);
            console.log(`  🔧 Tools needed: ${parser.intent.required_tools.join(', ')}`);
          } else {
            console.log(`  ❌ Error: ${parser.error}`);
          }
          console.log('');
        }
        
        // Architect Node
        if (result.nodeResults.architect) {
          const architect = result.nodeResults.architect;
          console.log('🟡 ARCHITECT NODE:');
          console.log(`  Status: ${architect.success ? '✅ WORKING' : '❌ FAILED'}`);
          if (architect.success) {
            console.log(`  ✅ Campaign created: "${architect.manifest.name}"`);
            console.log(`  📝 Description: ${architect.manifest.description}`);
            console.log(`  🔧 Steps: ${architect.manifest.steps.length}`);
            console.log(`  💰 Cost: $${architect.manifest.estimated_cost}`);
          } else {
            console.log(`  ❌ Error: ${architect.error}`);
          }
          console.log('');
        }
        
        // Validator Node
        if (result.nodeResults.validator) {
          const validator = result.nodeResults.validator;
          console.log('🟢 VALIDATOR NODE:');
          console.log(`  Status: ${validator.success ? '✅ WORKING' : '❌ FAILED'}`);
          if (validator.success) {
            console.log(`  ✅ Guardrails passed`);
            console.log(`  ⚠️ Warnings: ${validator.warnings?.length || 0}`);
            if (validator.warnings && validator.warnings.length > 0) {
              validator.warnings.forEach(warning => {
                console.log(`    • ${warning}`);
              });
            }
          } else {
            console.log(`  ❌ Error: ${validator.error}`);
          }
          console.log('');
        }
        
        // Executor Node
        if (result.nodeResults.executor) {
          const executor = result.nodeResults.executor;
          console.log('🔴 EXECUTOR NODE:');
          console.log(`  Status: ${executor.success ? '✅ WORKING' : '❌ FAILED'}`);
          if (executor.success) {
            console.log(`  ✅ Campaign saved to database`);
            console.log(`  🆔 Campaign ID: ${executor.campaignId}`);
            console.log(`  📊 Status: ${executor.executionStatus}`);
          } else {
            console.log(`  ❌ Error: ${executor.error}`);
          }
          console.log('');
        }
        
        console.log('🎉 LANGGRAPH STATE MACHINE IS FULLY FUNCTIONAL!');
        console.log('');
        console.log('🚀 WHAT THIS MEANS:');
        console.log('  ✅ Groq AI is working (Parser & Architect)');
        console.log('  ✅ LangGraph state machine is working');
        console.log('  ✅ Database integration is working (Executor)');
        console.log('');
        console.log('🎯 READY FOR REAL API INTEGRATION:');
        console.log('  • Apollo API calls can replace logical steps');
        console.log('  • Clay API calls can replace logical steps');
        console.log('  • Smartlead API calls can replace logical steps');
        
      } else {
        console.log('❌ OVERALL: SOME LANGGRAPH NODES FAILED');
        console.log('');
        console.log('📊 Summary:');
        console.log(`  📈 Total nodes tested: ${result.summary.totalNodes}`);
        console.log(`  ✅ Successful nodes: ${result.summary.successfulNodes}`);
        console.log(`  ❌ Failed nodes: ${result.summary.failedNodes}`);
        console.log('');
        
        console.log('🔍 FAILED NODES:');
        Object.entries(result.nodeResults).forEach(([nodeName, nodeResult]) => {
          if (!nodeResult.success) {
            console.log(`❌ ${nodeName.toUpperCase()}: ${nodeResult.error}`);
          }
        });
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

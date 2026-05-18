const { campaignQueue } = require('./dist/queue/bullmq-setup');
const { ExecutionQueue } = require('./dist/services/execution.queue');

async function testQueueSystem() {
  console.log('🧪 Testing BullMQ Queue System with Upstash Redis...\n');

  try {
    // Test 1: Check queue connection
    console.log('1️⃣ Testing BullMQ connection...');
    const queueStatus = await campaignQueue.getJobCounts();
    console.log('✅ BullMQ connected! Queue status:', queueStatus);

    // Test 2: Add a test campaign job
    console.log('\n2️⃣ Adding test campaign job to queue...');
    const testJob = await campaignQueue.add(
      'execute-campaign',
      { 
        campaignId: 'test-campaign-123',
        operatorId: 'test-operator-456', 
        clientId: 'test-client-789'
      },
      {
        priority: 5,
        delay: 1000,
        attempts: 3
      }
    );
    console.log(`✅ Test campaign job added: ${testJob.id}`);

    // Test 3: Check job status
    console.log('\n3️⃣ Checking job status...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    const job = await campaignQueue.getJob(testJob.id);
    const jobState = await job.getState();
    console.log(`✅ Job state: ${jobState}`);

    // Test 4: Test ExecutionQueue class
    console.log('\n4️⃣ Testing ExecutionQueue class...');
    const executionQueue = new ExecutionQueue();
    const queueInfo = await executionQueue.getQueueStatus();
    console.log('✅ ExecutionQueue status:', queueInfo);

    // Test 5: Test queue operations
    console.log('\n5️⃣ Testing queue operations...');
    const waitingJobs = await campaignQueue.getWaiting();
    const activeJobs = await campaignQueue.getActive();
    console.log(`✅ Waiting jobs: ${waitingJobs.length}, Active jobs: ${activeJobs.length}`);

    console.log('\n🎉 All queue tests passed! BullMQ system is working correctly.');
    console.log('\n📋 Queue system ready for campaign execution!');
    
    // Cleanup
    await testJob.remove();
    console.log('✅ Test job cleaned up');

  } catch (error) {
    console.error('❌ Queue test failed:', error);
    process.exit(1);
  }
}

// Run test
testQueueSystem()
  .then(() => {
    console.log('\n🏁 Queue system test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Queue test crashed:', error);
    process.exit(1);
  });

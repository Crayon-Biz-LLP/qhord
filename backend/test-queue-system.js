const { campaignQueue } = require('./dist/queue/bullmq-setup');
const { ExecutionQueue } = require('./dist/services/execution.queue');

async function testQueueSystem() {
  console.log('🧪 Testing BullMQ Queue System...\n');

  try {
    // Test 1: Check queue connection
    console.log('1️⃣ Testing Redis connection...');
    const queueStatus = await campaignQueue.getJobCounts();
    console.log('✅ Redis connected! Queue status:', queueStatus);

    // Test 2: Add a test job
    console.log('\n2️⃣ Adding test job to queue...');
    const testJob = await campaignQueue.add(
      'test-job',
      { message: 'Hello from test job!' },
      {
        priority: 5,
        delay: 1000
      }
    );
    console.log(`✅ Test job added: ${testJob.id}`);

    // Test 3: Check job status
    console.log('\n3️⃣ Checking job status...');
    const job = await campaignQueue.getJob(testJob.id);
    const jobState = await job.getState();
    console.log(`✅ Job state: ${jobState}`);

    // Test 4: Test ExecutionQueue class
    console.log('\n4️⃣ Testing ExecutionQueue class...');
    const executionQueue = new ExecutionQueue();
    const queueInfo = await executionQueue.getQueueStatus();
    console.log('✅ ExecutionQueue status:', queueInfo);

    console.log('\n🎉 All tests passed! Queue system is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testQueueSystem()
  .then(() => {
    console.log('\n🏁 Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test crashed:', error);
    process.exit(1);
  });

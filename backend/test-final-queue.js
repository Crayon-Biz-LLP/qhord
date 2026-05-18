// Set the Redis URL to your Upstash instance
process.env.REDIS_URL = 'rediss://default:gQAAAAAAAc9BAAIgcDE5OTI4MWE2NGNlNzk0NWUyOGMyNmNjZjA0NTk4NTQ2MQ@enhanced-oriole-118593.upstash.io:6379';

const { campaignQueue } = require('./dist/queue/bullmq-setup');

async function testFinalQueue() {
  console.log('🧪 Testing BullMQ with Upstash Redis URL...\n');

  try {
    console.log('🔗 Using Redis URL:', process.env.REDIS_URL);

    // Test BullMQ connection
    console.log('1️⃣ Testing BullMQ connection...');
    const queueStatus = await campaignQueue.getJobCounts();
    console.log('✅ BullMQ connected! Queue status:', queueStatus);

    // Test adding a job
    console.log('\n2️⃣ Adding test job...');
    const testJob = await campaignQueue.add('test-job', { message: 'Hello from Qhord!' });
    console.log(`✅ Job added: ${testJob.id}`);

    // Test job retrieval
    console.log('\n3️⃣ Testing job retrieval...');
    const retrievedJob = await campaignQueue.getJob(testJob.id);
    const jobState = await retrievedJob.getState();
    console.log(`✅ Job state: ${jobState}`);

    // Test queue operations
    console.log('\n4️⃣ Testing queue operations...');
    const waitingJobs = await campaignQueue.getWaiting();
    console.log(`✅ Waiting jobs: ${waitingJobs.length}`);

    console.log('\n🎉 BullMQ Queue System is working perfectly!');
    console.log('📋 Ready for campaign execution with your Upstash Redis!');

    // Cleanup
    await testJob.remove();
    console.log('✅ Test job cleaned up');

    process.exit(0);

  } catch (error) {
    console.error('❌ Queue test failed:', error);
    process.exit(1);
  }
}

testFinalQueue();

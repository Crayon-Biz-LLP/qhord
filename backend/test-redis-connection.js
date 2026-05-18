const IORedis = require('ioredis');

async function testRedisConnection() {
  console.log('🧪 Testing Redis connection to Upstash...\n');

  try {
    // Your Upstash Redis URL
    const redisUrl = 'rediss://default:gQAAAAAAAc9BAAIgcDE5OTI4MWE2NGNlNzk0NWUyOGMyNmNjZjA0NTk4NTQ2MQ@enhanced-oriole-118593.upstash.io:6379';
    
    console.log('1️⃣ Connecting to Redis...');
    const redis = new IORedis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });

    // Test connection
    redis.on('connect', () => {
      console.log('✅ Redis connected successfully!');
    });

    redis.on('error', (err) => {
      console.error('❌ Redis connection error:', err);
    });

    // Test basic operations
    console.log('2️⃣ Testing basic operations...');
    await redis.set('test-key', 'Hello from Qhord!');
    const value = await redis.get('test-key');
    console.log(`✅ SET/GET test: ${value}`);

    // Test queue operations
    console.log('3️⃣ Testing queue operations...');
    await redis.lpush('test-queue', 'job1', 'job2', 'job3');
    const queueLength = await redis.llen('test-queue');
    console.log(`✅ Queue length: ${queueLength}`);

    // Cleanup
    await redis.del('test-key');
    await redis.del('test-queue');
    console.log('✅ Cleanup completed');

    console.log('\n🎉 All Redis tests passed! Queue system is ready.');
    
    redis.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Redis test failed:', error);
    process.exit(1);
  }
}

testRedisConnection();

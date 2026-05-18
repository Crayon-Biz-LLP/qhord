// Set the Redis URL to your Upstash instance before starting backend
process.env.REDIS_URL = 'rediss://default:gQAAAAAAAc9BAAIgcDE5OTI4MWE2NGNlNzk0NWUyOGMyNmNjZjA0NTk4NTQ2MQ@enhanced-oriole-118593.upstash.io:6379';

console.log('🔗 Setting Redis URL to your Upstash instance');
console.log('📋 Redis URL:', process.env.REDIS_URL);

// Start the backend
const { spawn } = require('child_process');

const backend = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  env: { ...process.env, REDIS_URL: process.env.REDIS_URL }
});

backend.on('error', (error) => {
  console.error('❌ Backend failed to start:', error);
  process.exit(1);
});

backend.on('close', (code) => {
  console.log(`🏁 Backend process exited with code: ${code}`);
  process.exit(code);
});

console.log('🚀 Starting backend with your Upstash Redis...');

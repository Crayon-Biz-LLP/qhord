const IORedis = require('ioredis');
const url = process.env.REDIS_URL || 'rediss://default:gQAAAAAAAc9BAAIgcDE5OTI4MWE2NGNlNzk0NWUyOGMyNmNjZjA0NTk4NTQ2MQ@enhanced-oriole-118593.upstash.io:6379';
const r = new IORedis(url, { maxRetriesPerRequest: 1, enableReadyCheck: false, tls: url.startsWith('rediss://') ? {} : undefined, connectTimeout: 5000 });
r.ping().then(p => { console.log('REDIS:', p === 'PONG' ? 'OK' : 'UNEXPECTED:', p); process.exit(0); }).catch(e => { console.log('REDIS FAIL:', e.message?.substring(0, 300)); process.exit(1); });

import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import IORedis from 'ioredis';

function getRedisStore() {
  const redisUrl = process.env.REDIS_URL?.trim();
  if (!redisUrl) return undefined;
  try {
    const client = new IORedis(redisUrl, {
      maxRetriesPerRequest: 1,
      enableReadyCheck: false,
      tls: redisUrl.startsWith('rediss://') ? {} : undefined,
      lazyConnect: true,
    });
    return new RedisStore({
      sendCommand: (...args: string[]) => client.call(args[0]!, ...args.slice(1)) as any,
    });
  } catch {
    return undefined;
  }
}

export const generalLimiter = rateLimit({
  store: getRedisStore(),
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

export const authLimiter = rateLimit({
  store: getRedisStore(),
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts, please try again later' },
});

import Redis from 'ioredis';
import { env } from './env.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RedisClient = (Redis as any).default || Redis;
type RedisInstance = InstanceType<typeof RedisClient>;
let redis: RedisInstance | null = null;

export function getRedis(): RedisInstance {
    if (!redis) {
        const options: any = {
            maxRetriesPerRequest: 3,
            lazyConnect: true,
        };

        if (env.redisUrl.startsWith('rediss://')) {
            options.tls = {
                rejectUnauthorized: false
            };
        }

        redis = new RedisClient(env.redisUrl, options);

        redis.on('connect', () => {
            console.log('✅ Redis connected successfully');
        });

        redis.on('error', (err: Error) => {
            console.error('❌ Redis connection error:', err);
        });
    }
    return redis;
}

export async function connectRedis(): Promise<void> {
    try {
        const client = getRedis();
        await client.ping();
        console.log('✅ Redis ready');
    } catch (error) {
        console.warn('⚠️ Redis not available, continuing without cache:', error);
    }
}

export async function disconnectRedis(): Promise<void> {
    if (redis) {
        await redis.quit();
        redis = null;
        console.log('Redis disconnected');
    }
}

// Cache helpers
export async function cacheGet<T>(key: string): Promise<T | null> {
    try {
        const client = getRedis();
        const data = await client.get(key);
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number = 3600): Promise<void> {
    try {
        const client = getRedis();
        await client.setex(key, ttlSeconds, JSON.stringify(value));
    } catch {
        // Silently fail cache operations
    }
}

export async function cacheDelete(key: string): Promise<void> {
    try {
        const client = getRedis();
        await client.del(key);
    } catch {
        // Silently fail
    }
}

export async function cacheDeletePattern(pattern: string): Promise<void> {
    try {
        const client = getRedis();
        const keys = await client.keys(pattern);
        if (keys.length > 0) {
            await client.del(...keys);
        }
    } catch {
        // Silently fail
    }
}

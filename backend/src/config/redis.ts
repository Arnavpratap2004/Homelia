import Redis from 'ioredis';
import { env } from './env.js';

let redis: Redis | null = null;

export function getRedis(): Redis {
    if (!redis) {
        redis = new Redis(env.redisUrl, {
            maxRetriesPerRequest: 3,
            retryDelayOnFailover: 100,
            lazyConnect: true,
        });

        redis.on('connect', () => {
            console.log('✅ Redis connected successfully');
        });

        redis.on('error', (err) => {
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

/**
 * Rate Limiting - Production ready with Redis fallback
 *
 * In production with Redis (Upstash):
 * - Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars
 * - Distributed rate limiting across multiple instances
 *
 * In development/fallback:
 * - Uses in-memory store (note: resets on server restart)
 */

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

interface RedisClient {
  incr: (key: string) => Promise<number>;
  expire: (key: string, seconds: number) => Promise<number>;
  ttl: (key: string) => Promise<number>;
  del: (key: string) => Promise<number>;
  get: (key: string) => Promise<number | null>;
}

// In-memory store for rate limiting (development/fallback)
const rateLimitStore = new Map<string, Array<number>>();

let redisAvailable = false;
let redisClient: RedisClient | null = null;

// Initialize Redis client if available
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    // Dynamic import to avoid requiring redis package if not using
    import('@upstash/redis').then(({ Redis }) => {
      redisClient = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      });
      redisAvailable = true;
      console.log('[Rate Limit] Redis initialized for distributed rate limiting');
    }).catch(() => {
      console.warn('[Rate Limit] Failed to initialize Redis, falling back to in-memory store');
      redisAvailable = false;
    });
  } catch {
    console.warn('[Rate Limit] Redis package not available, using in-memory store');
  }
}

/**
 * Check rate limit for identifier:action combination
 * Uses Redis if available, falls back to in-memory store
 */
export async function checkRateLimit(
  identifier: string,
  action: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const key = `${identifier}:${action}`;

  // Try Redis first
  if (redisAvailable && redisClient) {
    try {
      const count = await redisClient.incr(key);

      if (count === 1) {
        // Set expiration only on first request
        await redisClient.expire(key, windowSeconds);
      }

      const ttl = await redisClient.ttl(key);
      const resetTime = ttl > 0 ? Date.now() + ttl * 1000 : 0;

      return {
        allowed: count <= limit,
        remaining: Math.max(0, limit - count),
        resetTime,
      };
    } catch (error) {
      console.error('[Rate Limit] Redis error, falling back to in-memory:', error);
      // Fall through to in-memory implementation
    }
  }

  // In-memory fallback
  return inMemoryRateLimit(key, limit, windowSeconds);
}

/**
 * In-memory rate limiter (development/fallback)
 */
function inMemoryRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;

  // Get or initialize timestamps for this key
  let timestamps = rateLimitStore.get(key) || [];

  // Remove old timestamps outside the window
  timestamps = timestamps.filter(ts => ts > windowStart);

  if (timestamps.length >= limit) {
    // Limit exceeded
    const oldestTimestamp = Math.min(...timestamps);
    const resetTime = oldestTimestamp + windowSeconds * 1000;

    return {
      allowed: false,
      remaining: 0,
      resetTime,
    };
  }

  // Add current timestamp
  timestamps.push(now);
  rateLimitStore.set(key, timestamps);

  // Clean up old entries periodically (every hour)
  if (Math.random() < 0.01) {
    cleanupOldEntries();
  }

  return {
    allowed: true,
    remaining: limit - timestamps.length,
    resetTime: 0,
  };
}

/**
 * Clean up old rate limit entries to prevent memory leak
 */
function cleanupOldEntries(): void {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours

  for (const [key, timestamps] of rateLimitStore.entries()) {
    const filtered = timestamps.filter(ts => now - ts < maxAge);
    if (filtered.length === 0) {
      rateLimitStore.delete(key);
    } else {
      rateLimitStore.set(key, filtered);
    }
  }
}

/**
 * Reset rate limit for a specific identifier and action
 * Useful for testing and admin operations
 */
export async function resetRateLimit(identifier: string, action: string): Promise<void> {
  const key = `${identifier}:${action}`;

  if (redisAvailable && redisClient) {
    try {
      await redisClient.del(key);
      return;
    } catch (error) {
      console.error('[Rate Limit] Redis error resetting limit:', error);
    }
  }

  rateLimitStore.delete(key);
}

/**
 * Get current rate limit status
 */
export async function getRateLimitStatus(
  identifier: string,
  action: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const key = `${identifier}:${action}`;

  if (redisAvailable && redisClient) {
    try {
      const count = await redisClient.get(key);
      const ttl = count ? await redisClient.ttl(key) : 0;

      return {
        allowed: (count || 0) < limit,
        remaining: Math.max(0, limit - (count || 0)),
        resetTime: ttl > 0 ? Date.now() + ttl * 1000 : 0,
      };
    } catch (error) {
      console.error('[Rate Limit] Redis error getting status:', error);
    }
  }

  // In-memory fallback
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;
  const timestamps = (rateLimitStore.get(key) || []).filter(ts => ts > windowStart);

  return {
    allowed: timestamps.length < limit,
    remaining: Math.max(0, limit - timestamps.length),
    resetTime: timestamps.length > 0 ? Math.min(...timestamps) + windowSeconds * 1000 : 0,
  };
}

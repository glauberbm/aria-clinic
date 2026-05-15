interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

// In-memory store for rate limiting (for development)
// In production, use Redis or Supabase for distributed rate limiting
const rateLimitStore = new Map<string, Array<number>>();

/**
 * Simple in-memory rate limiter
 * In production, migrate to Redis for distributed systems
 */
export async function rateLimit(
  identifier: string,
  action: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const key = `${identifier}:${action}`;
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
export function resetRateLimit(identifier: string, action: string): void {
  const key = `${identifier}:${action}`;
  rateLimitStore.delete(key);
}

/**
 * Get current rate limit status
 */
export function getRateLimitStatus(
  identifier: string,
  action: string,
  limit: number,
  windowSeconds: number
): RateLimitResult {
  const key = `${identifier}:${action}`;
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;

  const timestamps = (rateLimitStore.get(key) || []).filter(ts => ts > windowStart);

  return {
    allowed: timestamps.length < limit,
    remaining: Math.max(0, limit - timestamps.length),
    resetTime: timestamps.length > 0 ? Math.min(...timestamps) + windowSeconds * 1000 : 0,
  };
}

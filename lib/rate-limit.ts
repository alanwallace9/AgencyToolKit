// Simple in-memory rate limiting
// For production with multiple instances, consider Redis

const rateLimitStore = new Map<string, number>();

/**
 * Check if a key is rate limited
 * @param key - Unique identifier (e.g., "upload:agency_id:location_id")
 * @param windowSeconds - Time window in seconds
 * @returns true if rate limited, false if allowed
 */
export function isRateLimited(key: string, windowSeconds: number): boolean {
  const now = Date.now();
  const lastRequest = rateLimitStore.get(key);

  if (lastRequest && now - lastRequest < windowSeconds * 1000) {
    return true;
  }

  return false;
}

/**
 * Set rate limit for a key
 * @param key - Unique identifier
 */
export function setRateLimit(key: string): void {
  rateLimitStore.set(key, Date.now());

  // Cleanup old entries periodically to prevent memory leaks
  if (rateLimitStore.size > 10000) {
    const cutoff = Date.now() - 120000; // 2 minutes
    for (const [k, v] of rateLimitStore) {
      if (v < cutoff) rateLimitStore.delete(k);
    }
  }
}

/**
 * Get remaining time until rate limit expires
 * @param key - Unique identifier
 * @param windowSeconds - Time window in seconds
 * @returns Seconds remaining, or 0 if not rate limited
 */
export function getRateLimitRemaining(key: string, windowSeconds: number): number {
  const now = Date.now();
  const lastRequest = rateLimitStore.get(key);

  if (!lastRequest) return 0;

  const elapsed = (now - lastRequest) / 1000;
  const remaining = windowSeconds - elapsed;

  return remaining > 0 ? Math.ceil(remaining) : 0;
}

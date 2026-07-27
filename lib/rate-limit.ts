/**
 * In-memory rate limiting utility for API routes.
 * Note: This is a simple implementation suitable for single-instance deployments.
 * For serverless/multi-instance, consider using Redis or Supabase.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const stores: Map<string, Map<string, RateLimitEntry>> = new Map();

export interface RateLimitConfig {
  /** Maximum requests per window (default: 10) */
  limit?: number;
  /** Window duration in milliseconds (default: 1 hour) */
  windowMs?: number;
  /** Custom key prefix (default: 'default') */
  prefix?: string;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check and update rate limit for an IP address.
 * Returns { success: true } if request is allowed, { success: false } if rate limited.
 */
export function checkRateLimit(ip: string, config: RateLimitConfig = {}): RateLimitResult {
  const { limit = 10, windowMs = 60 * 60 * 1000, prefix = 'default' } = config;
  
  // Get or create store for this prefix
  if (!stores.has(prefix)) {
    stores.set(prefix, new Map());
  }
  const store = stores.get(prefix)!;
  
  const now = Date.now();
  const entry = store.get(ip);
  
  // Reset if window expired
  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, resetAt: now + windowMs };
  }
  
  // Check if limit exceeded
  if (entry.count >= limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }
  
  // Increment counter
  entry.count++;
  return { success: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

/**
 * Helper to extract client IP from request headers.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  return 'unknown';
}

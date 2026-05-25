export interface IRateLimiterStore {
  /**
   * Increments the request count for a given client identifier and returns current count and TTL.
   * @param key The tracking key (e.g. rate_limit:127.0.0.1)
   * @param windowMs The window duration in milliseconds
   * @returns The current count and remaining time in milliseconds until reset
   */
  increment(key: string, windowMs: number): Promise<{ count: number; ttlMs: number }>;
}

/**
 * Standard In-Memory Rate Limiting Store.
 * Highly responsive, ideal for single-node setups with zero external dependencies.
 */
export class InMemoryStore implements IRateLimiterStore {
  private records = new Map<string, { count: number; expiresAt: number }>();

  async increment(key: string, windowMs: number): Promise<{ count: number; ttlMs: number }> {
    const now = Date.now();
    const record = this.records.get(key);

    // If key does not exist or has expired, start a new window
    if (!record || now >= record.expiresAt) {
      const expiresAt = now + windowMs;
      this.records.set(key, { count: 1, expiresAt });
      return { count: 1, ttlMs: windowMs };
    }

    // Increment request count within the active window
    record.count += 1;
    const ttlMs = Math.max(0, record.expiresAt - now);
    return { count: record.count, ttlMs };
  }

  clear(): void {
    this.records.clear();
  }
}

/**
 * Redis-based Rate Limiting Store.
 * Uses atomic Lua scripting to prevent race conditions in highly distributed, multi-instance API environments.
 */
export class RedisStore implements IRateLimiterStore {
  private redis: any;

  constructor(redisClient: any) {
    this.redis = redisClient;
    
    const luaScript = `
      local current = redis.call('incr', KEYS[1])
      if current == 1 then
        redis.call('pexpire', KEYS[1], ARGV[1])
      end
      local ttl = redis.call('pttl', KEYS[1])
      return {current, ttl}
    `;

    try {
      this.redis.defineCommand("rateLimitIncr", {
        numberOfKeys: 1,
        lua: luaScript,
      });
    } catch (e) {
      console.warn("Redis defineCommand failed. Falling back to multi execution.", e);
    }
  }

  async increment(key: string, windowMs: number): Promise<{ count: number; ttlMs: number }> {
    try {
      if (typeof this.redis.rateLimitIncr === "function") {
        const res = await this.redis.rateLimitIncr(key, windowMs);
        const count = parseInt(res[0], 10);
        const ttlMs = parseInt(res[1], 10);
        return { count, ttlMs: ttlMs > 0 ? ttlMs : windowMs };
      }
    } catch (e) {
      console.error("Lua scripting error. Using fallback multi transaction:", e);
    }

    const pipeline = this.redis.multi();
    pipeline.incr(key);
    pipeline.pttl(key);
    
    const results = await pipeline.exec();
    if (!results) {
      throw new Error("Redis pipeline execution returned null");
    }

    const incrResult = results[0];
    const pttlResult = results[1];

    const count = typeof incrResult === "object" && incrResult !== null ? (incrResult as any)[1] : incrResult;
    let ttlMs = typeof pttlResult === "object" && pttlResult !== null ? (pttlResult as any)[1] : pttlResult;

    if (count === 1) {
      await this.redis.pexpire(key, windowMs);
      ttlMs = windowMs;
    }

    return { 
      count: parseInt(count, 10), 
      ttlMs: ttlMs > 0 ? parseInt(ttlMs, 10) : windowMs 
    };
  }
}

export interface RateLimiterOptions {
  /**
   * The storage mechanism (InMemoryStore or RedisStore)
   */
  store: IRateLimiterStore;

  /**
   * Global rate limit: Maximum requests allowed per window. Defaults to 60.
   */
  rateLimit?: number;

  /**
   * Window duration in milliseconds. Defaults to 60000 (1 minute).
   */
  windowMs?: number;

  /**
   * Optional custom client identifier resolver (e.g. key-based).
   * Defaults to extracting the client's IP address.
   */
  getIdentifier?: (req: any) => string;
}

/**
 * Creates an Express rate limiting middleware based on visitor IP address.
 * Perfect for public, free websites protecting endpoints against spammers.
 */
export function createRateLimiter(options: RateLimiterOptions) {
  const limit = options.rateLimit ?? 60;
  const window = options.windowMs ?? 60000;
  const resolveIdentifier = options.getIdentifier ?? ((req) => {
    // Get visitor's IP address (supporting reverse proxies)
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || req.ip || "anonymous";
    return typeof ip === "string" ? ip.split(",")[0].trim() : "anonymous";
  });

  return async (req: any, res: any, next: any) => {
    try {
      // 1. Identify client (IP address)
      const clientId = resolveIdentifier(req);
      const trackingKey = `rate_limit:${clientId}`;

      // 2. Track usage count
      const { count, ttlMs } = await options.store.increment(trackingKey, window);

      // Set standard headers
      res.setHeader("X-RateLimit-Limit", limit);
      res.setHeader("X-RateLimit-Remaining", Math.max(0, limit - count));
      res.setHeader("X-RateLimit-Reset", new Date(Date.now() + ttlMs).toISOString());

      // 3. Block request if limit is exceeded
      if (count > limit) {
        const retryAfterSeconds = Math.ceil(ttlMs / 1000);
        
        // 4. Return HTTP 429 with correct Retry-After header (seconds)
        res.setHeader("Retry-After", retryAfterSeconds);
        res.status(429).json({
          status: "fail",
          error: "Too Many Requests",
          message: `API rate limit of ${limit} requests per window exceeded. Please try again in ${retryAfterSeconds} seconds.`,
          limit,
          remaining: 0,
          retryAfterSeconds,
        });
        return;
      }

      // Request allowed! Proceed to next handler
      next();
    } catch (error) {
      console.error("Rate Limiter Middleware internal error:", error);
      next(); // Don't block requests if the limiter crashes internally
    }
  };
}

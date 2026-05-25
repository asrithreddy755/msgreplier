import express from "express";
import { createRateLimiter, InMemoryStore, RedisStore } from "./lib/rate-limiter";

const app = express();
app.use(express.json());

const PORT = process.env.DEMO_PORT ? parseInt(process.env.DEMO_PORT, 10) : 9009;

// 1. Select and initialize the storage backend
let store;
const redisUrl = process.env.REDIS_URL;

if (redisUrl) {
  try {
    console.log("[Store] REDIS_URL detected, initializing RedisStore client...");
    const Redis = require("ioredis");
    const redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3
    });
    redisClient.on("error", (err: any) => {
      console.error("[Store] Redis connection failed, rate limiter falling back.", err);
    });
    store = new RedisStore(redisClient);
    console.log("[Store] RedisStore successfully mounted.");
  } catch (err) {
    console.error("[Store] Redis setup crashed. Falling back to InMemoryStore.", err);
    store = new InMemoryStore();
  }
} else {
  console.log("[Store] No REDIS_URL provided. Initializing In-Memory Rate Limiting Store.");
  store = new InMemoryStore();
}

// 2. Instantiate IP-based rate limiter middleware
// Tracks and limits each visitor to 10 requests per 10 seconds for testing
const apiRateLimiter = createRateLimiter({
  store,
  rateLimit: 10,
  windowMs: 10000
});

// --- API Router and Routes ---

// Unprotected Endpoint (Public access)
app.get("/", (req: any, res: any) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to the public msgreplier Node.js/Express API gateway! Rate limiter is active on /api routes.",
    endpoints: {
      public: "GET /",
      protected: "GET /api/data (Protected by IP-based Rate Limiter)"
    }
  });
});

// Protected Endpoint (Uses visitor IP address to enforce limits)
app.get("/api/data", apiRateLimiter, (req: any, res: any) => {
  res.status(200).json({
    status: "success",
    message: "Request authorized. API data retrieved successfully.",
    timestamp: new Date().toISOString(),
    payload: {
      serverTime: Date.now(),
      statusMessage: "Success within IP rate limit allocations."
    }
  });
});

// Catch-all route handler
app.use((req: any, res: any) => {
  res.status(404).json({
    status: "fail",
    error: "Not Found",
    message: `Requested route ${req.method} ${req.url} does not exist.`
  });
});

// Start the express server
const server = app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Express IP-Based API Gateway is listening on port ${PORT}`);
  console.log(`👉 Unprotected endpoint: http://localhost:${PORT}/`);
  console.log(`👉 Rate-Limited endpoint: http://localhost:${PORT}/api/data`);
  console.log(`======================================================\n`);
});

export { app, server };

import { server } from "./express-server";

const BASE_URL = "http://localhost:9009";

// Helper function to make requests with options
async function makeRequest(path: string, headers: Record<string, string> = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: "GET",
    headers
  });
  
  let body: any = null;
  try {
    body = await response.json();
  } catch (e) {
    // Fallback
  }

  return {
    status: response.status,
    headers: {
      limit: response.headers.get("X-RateLimit-Limit"),
      remaining: response.headers.get("X-RateLimit-Remaining"),
      reset: response.headers.get("X-RateLimit-Reset"),
      retryAfter: response.headers.get("Retry-After")
    },
    body
  };
}

// Visual logger formatting helpers
const color = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
  bold: "\x1b[1m"
};

function logHeader(title: string) {
  console.log(`\n${color.bold}${color.magenta}=== ${title} ===${color.reset}`);
}

function logSuccess(message: string) {
  console.log(`${color.green}✔ PASS: ${message}${color.reset}`);
}

function logFailure(message: string, detail?: any) {
  console.log(`${color.red}✘ FAIL: ${message}${color.reset}`);
  if (detail) console.log(detail);
}

// Main test execution loop
async function runTests() {
  logHeader("Starting IP-Based Rate Limiter Automated Test Suite");
  let passCount = 0;
  let failCount = 0;

  const assert = (condition: boolean, msg: string, detail?: any) => {
    if (condition) {
      logSuccess(msg);
      passCount++;
    } else {
      logFailure(msg, detail);
      failCount++;
    }
  };

  try {
    // -------------------------------------------------------------
    // Test Case 1: Unprotected Homepage
    // -------------------------------------------------------------
    logHeader("Test 1: Unprotected Homepage Endpoint");
    const t1 = await makeRequest("/");
    assert(t1.status === 200, "Should return 200 OK for unprotected public root");
    assert(t1.body?.status === "success", "Should return success payload");

    // -------------------------------------------------------------
    // Test Case 2: Standard IP Rate Limiting (Limit = 10 requests per 10s)
    // -------------------------------------------------------------
    logHeader("Test 2: IP-Based Rate Limit Exhaustion (Limit = 10 requests per 10s)");
    
    // Fire 10 valid requests (should all succeed)
    for (let i = 1; i <= 10; i++) {
      const res = await makeRequest("/api/data", {
        "x-forwarded-for": "192.168.1.50" // Simulate same client IP
      });
      const expectedRemaining = 10 - i;
      
      assert(
        res.status === 200, 
        `Request #${i} should succeed (200 OK)`
      );
      assert(
        parseInt(res.headers.limit || "0", 10) === 10,
        `Request #${i} X-RateLimit-Limit header should be 10`
      );
      assert(
        parseInt(res.headers.remaining || "0", 10) === expectedRemaining,
        `Request #${i} X-RateLimit-Remaining should be ${expectedRemaining}`
      );
    }

    // Fire 11th request (should block the IP address!)
    console.log("\n[Client] Sending 11th request from client IP (expecting 429 rate limit block)...");
    const res11 = await makeRequest("/api/data", {
      "x-forwarded-for": "192.168.1.50"
    });
    
    assert(
      res11.status === 429,
      "11th request should return 429 Too Many Requests"
    );
    assert(
      res11.headers.retryAfter !== null && parseInt(res11.headers.retryAfter, 10) > 0,
      `Should contain a valid 'Retry-After' header (got: ${res11.headers.retryAfter}s)`
    );
    assert(
      res11.body?.error === "Too Many Requests",
      "Should return structured error body indicating 'Too Many Requests'"
    );

    // -------------------------------------------------------------
    // Test Case 3: Decoupled client isolation (Request from different client IP)
    // -------------------------------------------------------------
    logHeader("Test 3: Different client IP isolation");
    
    const resDifferentClient = await makeRequest("/api/data", {
      "x-forwarded-for": "192.168.1.99" // Different visitor IP
    });
    assert(
      resDifferentClient.status === 200,
      "Request from different visitor IP should succeed immediately (isolation verified)"
    );
    assert(
      parseInt(resDifferentClient.headers.remaining || "0", 10) === 9,
      "Different visitor IP should have its own remaining limit of 9"
    );

    // Print execution statistics
    logHeader("Test Execution Summary");
    console.log(`Passed: ${color.green}${passCount}${color.reset}`);
    console.log(`Failed: ${color.red}${failCount}${color.reset}`);
    
    if (failCount === 0) {
      console.log(`\n${color.bold}${color.green}🎉 ALL IP-BASED RATE LIMITER TESTS PASSED SUCCESSFULLY!${color.reset}\n`);
    } else {
      console.log(`\n${color.bold}${color.red}⚠ SOME TEST FAILURES DETECTED.${color.reset}\n`);
    }

  } catch (error) {
    console.error("Test runner encountered critical exception:", error);
  } finally {
    // Graceful cleanup and server shutdown
    console.log("[Test] Terminating mock Express server...");
    server.close(() => {
      console.log("[Test] Server stopped. Verification run finished.");
      process.exit(failCount === 0 ? 0 : 1);
    });
  }
}

// Start automated tests
runTests();

// Test Redis connection
// Run with: npx tsx scripts/test-redis.ts

// IMPORTANT: Load environment variables BEFORE importing redis
import { config } from "dotenv"
import { resolve } from "path"
config({ path: resolve(process.cwd(), ".env") })

// Now import Redis - env vars should be loaded
import { redis, isRedisConfigured } from "../lib/redis"
import { Cache } from "../lib/cache"

async function testRedis() {
  console.log("🔍 Testing Redis connection...\n")

  if (!isRedisConfigured()) {
    console.log("❌ Redis is not configured!")
    console.log("Please add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to your .env file")
    process.exit(1)
  }

  try {
    // Test 1: Basic set/get
    console.log("Test 1: Basic set/get")
    await redis.set("test:key", "Hello Redis!")
    const value = await redis.get("test:key")
    console.log(`✅ Set value: "Hello Redis!"`)
    console.log(`✅ Got value: "${value}"`)
    console.log("")

    // Test 2: Cache helper
    console.log("Test 2: Cache helper")
    await Cache.set("test:cache", { message: "Cached data", timestamp: Date.now() }, 60)
    const cached = await Cache.get<{ message: string; timestamp: number }>("test:cache")
    console.log(`✅ Cached data:`, cached)
    console.log("")

    // Test 3: Expiration
    console.log("Test 3: Expiration (setting key with 5 second expiration)")
    await Cache.set("test:expire", "This will expire", 5)
    const beforeExpire = await Cache.get("test:expire")
    console.log(`✅ Before expire: "${beforeExpire}"`)
    console.log("Waiting 6 seconds...")
    await new Promise((resolve) => setTimeout(resolve, 6000))
    const afterExpire = await Cache.get("test:expire")
    console.log(`✅ After expire: ${afterExpire ? `"${afterExpire}"` : "null (expired)"}`)
    console.log("")

    // Test 4: Rate limiter
    console.log("Test 4: Rate limiter")
    const { Ratelimit } = await import("@upstash/ratelimit")
    const testLimiter = new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(3, "10 s"),
    })
    const result = await testLimiter.limit("test:user")
    console.log(`✅ Rate limit result:`, {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
    })
    console.log("")

    // Cleanup
    await redis.del("test:key")
    await redis.del("test:cache")
    await redis.del("test:expire")

    console.log("✅ All tests passed! Redis is working correctly.")
  } catch (error) {
    console.error("❌ Redis test failed:", error)
    process.exit(1)
  }
}

testRedis()


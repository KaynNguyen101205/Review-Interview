import { Redis } from "@upstash/redis"

// Lazy initialization of Redis client
let redisInstance: Redis | null = null

function getRedis(): Redis {
  if (!redisInstance) {
    const url = process.env.UPSTASH_REDIS_REST_URL
    const token = process.env.UPSTASH_REDIS_REST_TOKEN

    if (!url || !token) {
      throw new Error(
        "Redis not configured. Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in your .env file"
      )
    }

    redisInstance = new Redis({
      url,
      token,
    })
  }
  return redisInstance
}

// Export redis with lazy initialization
export const redis = new Proxy({} as Redis, {
  get(_target, prop) {
    return getRedis()[prop as keyof Redis]
  },
})

// Helper function to check if Redis is configured
export function isRedisConfigured(): boolean {
  return !!(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  )
}


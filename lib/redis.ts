import { Redis } from "@upstash/redis"

// Initialize Redis client
// Uses environment variables: UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
})

// Helper function to check if Redis is configured
export function isRedisConfigured(): boolean {
  return !!(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  )
}


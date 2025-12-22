import { redis, isRedisConfigured } from "./redis"

// Cache helper functions
export class Cache {
  // Get cached value
  static async get<T>(key: string): Promise<T | null> {
    if (!isRedisConfigured()) {
      return null
    }

    try {
      const value = await redis.get<T>(key)
      return value
    } catch (error) {
      console.error("Cache get error:", error)
      return null
    }
  }

  // Set cached value with optional expiration (in seconds)
  static async set<T>(
    key: string,
    value: T,
    expirationSeconds?: number
  ): Promise<boolean> {
    if (!isRedisConfigured()) {
      return false
    }

    try {
      if (expirationSeconds) {
        await redis.set(key, value, { ex: expirationSeconds })
      } else {
        await redis.set(key, value)
      }
      return true
    } catch (error) {
      console.error("Cache set error:", error)
      return false
    }
  }

  // Delete cached value
  static async delete(key: string): Promise<boolean> {
    if (!isRedisConfigured()) {
      return false
    }

    try {
      await redis.del(key)
      return true
    } catch (error) {
      console.error("Cache delete error:", error)
      return false
    }
  }

  // Delete multiple keys by pattern
  static async deletePattern(pattern: string): Promise<number> {
    if (!isRedisConfigured()) {
      return 0
    }

    try {
      // Note: Upstash Redis REST API doesn't support SCAN directly
      // For pattern deletion, you'd need to track keys or use a different approach
      // This is a simplified version
      return 0
    } catch (error) {
      console.error("Cache delete pattern error:", error)
      return 0
    }
  }
}


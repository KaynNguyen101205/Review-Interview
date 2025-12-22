import { NextRequest, NextResponse } from "next/server"
import { Ratelimit } from "@upstash/ratelimit"
import { redis, isRedisConfigured } from "./redis"

// Helper to get client identifier (IP address or user ID)
function getIdentifier(request: NextRequest, userId?: string): string {
  // Use user ID if available, otherwise use IP address
  if (userId) {
    return `user:${userId}`
  }
  
  // Get IP address from request
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "unknown"
  return `ip:${ip}`
}

// Create rate limiter middleware
export async function rateLimitMiddleware(
  request: NextRequest,
  limiter: Ratelimit,
  userId?: string
): Promise<NextResponse | null> {
  // Skip rate limiting if Redis is not configured
  if (!isRedisConfigured()) {
    return null
  }

  const identifier = getIdentifier(request, userId)
  
  try {
    const { success, limit, reset, remaining } = await limiter.limit(identifier)

    if (!success) {
      return NextResponse.json(
        {
          error: "Too many requests. Please try again later.",
          retryAfter: Math.round((reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
            "Retry-After": Math.round((reset - Date.now()) / 1000).toString(),
          },
        }
      )
    }

    // Add rate limit headers to successful requests
    return null // Continue with request
  } catch (error) {
    console.error("Rate limit error:", error)
    // If Redis fails, allow the request (fail open)
    return null
  }
}


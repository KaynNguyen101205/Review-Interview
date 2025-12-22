import { Ratelimit } from "@upstash/ratelimit"
import { redis } from "./redis"

// Rate limiter for API routes
// Limits requests per time window
export const apiRateLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 requests per 10 seconds
  analytics: true,
  prefix: "@upstash/ratelimit",
})

// Stricter rate limiter for review submission
export const reviewSubmissionRateLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, "1 m"), // 3 reviews per minute
  analytics: true,
  prefix: "@upstash/ratelimit/reviews",
})

// Rate limiter for report submission
export const reportRateLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"), // 5 reports per hour
  analytics: true,
  prefix: "@upstash/ratelimit/reports",
})

// Rate limiter for company requests
export const companyRequestRateLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(2, "1 h"), // 2 requests per hour
  analytics: true,
  prefix: "@upstash/ratelimit/company-requests",
})


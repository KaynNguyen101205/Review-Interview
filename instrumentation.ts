import * as Sentry from "@sentry/nextjs"

export async function register() {
  // Initialize Sentry for server runtime
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
      debug: false,
    })
  }

  // Initialize Sentry for edge runtime
  if (process.env.NEXT_RUNTIME === "edge" && process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
      debug: false,
    })
  }
  
  // Client-side initialization is handled by instrumentation-client.ts
  // which is automatically loaded by Next.js
}

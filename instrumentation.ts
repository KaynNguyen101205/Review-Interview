export async function register() {
  // Only initialize Sentry in production or if explicitly enabled
  const shouldInitSentry = 
    process.env.SENTRY_DSN && 
    (process.env.NODE_ENV === "production" || process.env.ENABLE_SENTRY_IN_DEV === "true")

  if (shouldInitSentry) {
    if (process.env.NEXT_RUNTIME === "nodejs") {
      // Server-side Sentry initialization
      const Sentry = await import("@sentry/nextjs")
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
        debug: false, // Disable debug in dev to reduce noise
        enabled: process.env.NODE_ENV === "production" || process.env.ENABLE_SENTRY_IN_DEV === "true",
        beforeSend(event) {
          // In development, don't send events to reduce connection errors
          if (process.env.NODE_ENV === "development") {
            return null // Don't send events in development
          }
          return event
        },
      })
    }

    if (process.env.NEXT_RUNTIME === "edge") {
      // Edge runtime Sentry initialization
      const Sentry = await import("@sentry/nextjs")
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
        enabled: process.env.NODE_ENV === "production" || process.env.ENABLE_SENTRY_IN_DEV === "true",
        beforeSend(event) {
          // In development, don't send events to reduce connection errors
          if (process.env.NODE_ENV === "development") {
            return null // Don't send events in development
          }
          return event
        },
      })
    }
  }
  
  // Client-side initialization is handled by instrumentation-client.ts
  // which is automatically loaded by Next.js
}


export async function register() {
  // Only initialize Sentry if DSN is configured
  if (process.env.SENTRY_DSN) {
    if (process.env.NEXT_RUNTIME === "nodejs") {
      // Server-side Sentry initialization
      const Sentry = await import("@sentry/nextjs")
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
        debug: process.env.NODE_ENV === "development",
      })
    }

    if (process.env.NEXT_RUNTIME === "edge") {
      // Edge runtime Sentry initialization
      const Sentry = await import("@sentry/nextjs")
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
      })
    }
  }
  
  // Client-side initialization is handled by instrumentation-client.ts
  // which is automatically loaded by Next.js
}


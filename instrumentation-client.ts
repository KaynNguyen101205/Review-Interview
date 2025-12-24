import * as Sentry from "@sentry/nextjs"

// Only initialize Sentry in production or if explicitly enabled
const shouldInitSentry = 
  process.env.NEXT_PUBLIC_SENTRY_DSN && 
  (process.env.NODE_ENV === "production" || process.env.ENABLE_SENTRY_IN_DEV === "true")

if (shouldInitSentry) {
  try {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
      debug: false, // Disable debug in dev to reduce noise
      enabled: process.env.NODE_ENV === "production" || process.env.ENABLE_SENTRY_IN_DEV === "true",
      replaysOnErrorSampleRate: 1.0,
      replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
      integrations: [
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      beforeSend(event, hint) {
        // In development, don't send events to reduce connection errors
        if (process.env.NODE_ENV === "development") {
          return null // Don't send events in development
        }
        return event
      },
      beforeSendTransaction(event) {
        // In development, don't send transactions to reduce connection errors
        if (process.env.NODE_ENV === "development") {
          return null // Don't send transactions in development
        }
        return event
      },
    })
  } catch (error) {
    // Silently fail in development to avoid cluttering logs
    if (process.env.NODE_ENV === "production") {
    console.error("❌ Sentry init failed:", error)
    }
  }
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart


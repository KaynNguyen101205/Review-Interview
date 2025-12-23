import * as Sentry from "@sentry/nextjs"

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  try {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
      debug: process.env.NODE_ENV === "development",
      replaysOnErrorSampleRate: 1.0,
      replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
      integrations: [
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      beforeSend(event, hint) {
        if (process.env.NODE_ENV === "development") {
          console.log("📤 Sentry event:", event.type, event.message || event.exception?.values?.[0]?.value)
        }
        return event
      },
    })
    if (process.env.NODE_ENV === "development") {
      console.log("✅ Sentry initialized")
    }
  } catch (error) {
    console.error("❌ Sentry init failed:", error)
  }
} else {
  console.warn("⚠️ NEXT_PUBLIC_SENTRY_DSN not set")
}

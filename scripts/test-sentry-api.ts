// Test script to send a test error directly to Sentry API
// Run with: npx tsx scripts/test-sentry-api.ts

import * as Sentry from "@sentry/nextjs"
import * as dotenv from "dotenv"

dotenv.config()

if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
  console.error("❌ NEXT_PUBLIC_SENTRY_DSN not set")
  process.exit(1)
}

console.log("🔧 Initializing Sentry...")
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  debug: true,
  tracesSampleRate: 1.0,
  beforeSend(event) {
    console.log("📤 Event being sent:", {
      eventId: event.event_id,
      message: event.message || event.exception?.values?.[0]?.value,
      level: event.level,
      environment: event.environment,
    })
    return event
  },
})

console.log("✅ Sentry initialized")
console.log("📤 Sending test error...")

const testError = new Error(`Test error from API script - ${new Date().toISOString()}`)
const eventId = Sentry.captureException(testError, {
  tags: {
    test: "true",
    source: "test-script",
    environment: "development",
  },
  level: "error",
})

console.log("✅ Error sent! Event ID:", eventId)
console.log("🌐 Check your dashboard at:")
console.log(`   https://sentry.io/organizations/${process.env.SENTRY_ORG}/projects/${process.env.SENTRY_PROJECT}/issues/`)

// Give Sentry time to send
setTimeout(() => {
  console.log("\n⏳ Events may take 10-30 seconds to appear in dashboard")
  process.exit(0)
}, 2000)


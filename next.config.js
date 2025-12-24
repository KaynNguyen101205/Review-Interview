const { withSentryConfig } = require("@sentry/nextjs")

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
    remotePatterns: [],
  },
  // Enable instrumentation hook for Sentry
  experimental: {
    instrumentationHook: true,
  },
}

// Only wrap with Sentry if org and project are configured AND we're in production
// This prevents webpack from hanging when Sentry env vars are missing
// Also prevents proxy errors in development
const shouldUseSentry = 
  process.env.SENTRY_ORG && 
  process.env.SENTRY_PROJECT && 
  (process.env.NODE_ENV === "production" || process.env.ENABLE_SENTRY_IN_DEV === "true")

if (shouldUseSentry) {
  module.exports = withSentryConfig(nextConfig, {
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    silent: !process.env.CI,
    widenClientFileUpload: true,
    tunnelRoute: "/monitoring",
    hideSourceMaps: true,
    webpack: {
      treeshake: {
        removeDebugLogging: true,
      },
      automaticVercelMonitors: true,
    },
  })
} else {
  // Export without Sentry wrapper in development or if env vars are not set
  if (process.env.NODE_ENV === "development") {
    // Silently skip Sentry in development to avoid proxy errors
  } else if (!process.env.SENTRY_ORG || !process.env.SENTRY_PROJECT) {
    console.warn("⚠️ Sentry not configured: SENTRY_ORG and SENTRY_PROJECT must be set")
  }
  module.exports = nextConfig
}


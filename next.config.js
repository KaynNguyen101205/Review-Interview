const { withSentryConfig } = require("@sentry/nextjs")

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
    remotePatterns: [],
  },
  // Enable instrumentation hook
  experimental: {
    instrumentationHook: true,
  },
}

// Only wrap with Sentry if org and project are configured
// This prevents webpack from hanging when Sentry env vars are missing
if (process.env.SENTRY_ORG && process.env.SENTRY_PROJECT) {
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
  // Export without Sentry wrapper if env vars are not set
  console.warn("⚠️ Sentry not configured: SENTRY_ORG and SENTRY_PROJECT must be set")
  module.exports = nextConfig
}


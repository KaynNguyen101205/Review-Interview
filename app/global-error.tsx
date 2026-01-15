"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to Sentry only if configured and in production
    if (
      process.env.NEXT_PUBLIC_SENTRY_DSN &&
      (process.env.NODE_ENV === "production" || process.env.ENABLE_SENTRY_IN_DEV === "true")
    ) {
      // Dynamically import Sentry to avoid critical dependency warnings
      import("@sentry/nextjs").then((Sentry) => {
        Sentry.captureException(error)
      })
    }
  }, [error])

  return (
    <html>
      <body>
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <h1>Something went wrong!</h1>
          <p>An unexpected error occurred.</p>
          <button onClick={() => reset()}>Try again</button>
        </div>
      </body>
    </html>
  )
}


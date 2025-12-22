"use client"

import * as Sentry from "@sentry/nextjs"
import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        <div style={{ padding: "2rem", fontFamily: "system-ui" }}>
          <h1>Something went wrong!</h1>
          <p>We&apos;ve been notified and are working on fixing this issue.</p>
          <button onClick={reset}>Try again</button>
        </div>
      </body>
    </html>
  )
}


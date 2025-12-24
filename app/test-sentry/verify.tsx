"use client"

import { useEffect, useState } from "react"
import * as Sentry from "@sentry/nextjs"

export default function SentryVerify() {
  const [status, setStatus] = useState<string>("Checking...")
  const [eventId, setEventId] = useState<string | null>(null)

  useEffect(() => {
    // Extract project info from DSN
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
    if (!dsn) {
      setStatus("❌ NEXT_PUBLIC_SENTRY_DSN not set")
      return
    }

    // Parse DSN: https://[key]@[host]/[projectId]
    const match = dsn.match(/https:\/\/(.+)@(.+)\/(.+)/)
    if (!match) {
      setStatus("❌ Invalid DSN format")
      return
    }

    const [, key, host, projectId] = match
    const orgId = host.match(/o(\d+)/)?.[1]

    setStatus(
      `✅ DSN configured\n` +
      `   Project ID: ${projectId}\n` +
      `   Org ID: ${orgId}\n` +
      `   Host: ${host}\n\n` +
      `📊 Dashboard URL:\n` +
      `   https://sentry.io/organizations/nam-khanh/projects/javascript-nextjs/issues/\n\n` +
      `🔍 Search for event ID: ${eventId || "Click button below"}`
    )

    // Send a test event
    const testError = new Error(`Verification test - ${new Date().toISOString()}`)
    const id = Sentry.captureException(testError, {
      tags: { verification: "true", source: "verify-page" },
      level: "error",
    })
    setEventId(id || null)
  }, [])

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sentry Verification</h1>
      <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap font-mono text-sm">
        {status}
      </pre>
      {eventId && (
        <div className="mt-4 p-4 bg-blue-50 rounded">
          <p className="font-semibold">Last Event ID: {eventId}</p>
          <p className="text-sm mt-2">
            Go to your Sentry dashboard and search for this event ID to verify it was received.
          </p>
        </div>
      )}
    </div>
  )
}


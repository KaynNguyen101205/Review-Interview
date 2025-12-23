"use client"

import * as Sentry from "@sentry/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"

export default function TestSentryPage() {
  const [sentryStatus, setSentryStatus] = useState<string>("Checking...")
  const [lastEventId, setLastEventId] = useState<string | null>(null)

  useEffect(() => {
    // Check if Sentry is initialized
    const checkSentry = async () => {
      try {
        const result = await Sentry.diagnoseSdkConnectivity()
        if (result === "sentry-unreachable") {
          setSentryStatus("❌ Sentry is unreachable (check network/ad-blocker)")
        } else {
          setSentryStatus("✅ Sentry is connected and ready")
        }
      } catch (error) {
        setSentryStatus("⚠️ Could not check Sentry connectivity")
      }
    }
    checkSentry()
  }, [])
  const testError = () => {
    try {
      const errorMessage = `Test error from Sentry setup - ${new Date().toISOString()}`
      throw new Error(errorMessage)
    } catch (error) {
      const eventId = Sentry.captureException(error, {
        tags: {
          test: "true",
          source: "test-sentry-page",
        },
        extra: {
          timestamp: new Date().toISOString(),
        },
      })
      setLastEventId(eventId || null)
      console.log("Error captured, event ID:", eventId)
      console.log("Error details:", error)
      alert(`Error sent to Sentry! Event ID: ${eventId || "unknown"}\n\nCheck:\n1. Browser console (F12)\n2. Network tab for Sentry requests\n3. Your Sentry dashboard`)
    }
  }

  const testMessage = () => {
    const message = `Test message from Sentry setup - ${new Date().toISOString()}`
    const eventId = Sentry.captureMessage(message, {
      level: "info",
      tags: {
        test: "true",
        source: "test-sentry-page",
      },
      extra: {
        timestamp: new Date().toISOString(),
      },
    })
    setLastEventId(eventId || null)
    console.log("Message captured, event ID:", eventId)
    console.log("Message:", message)
    alert(`Message sent to Sentry! Event ID: ${eventId || "unknown"}\n\nCheck:\n1. Browser console (F12)\n2. Network tab for Sentry requests\n3. Your Sentry dashboard`)
  }

  const testBreadcrumb = () => {
    Sentry.addBreadcrumb({
      category: "test",
      message: "User clicked test button",
      level: "info",
    })
    alert("Breadcrumb added! Trigger an error to see it in Sentry.")
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Sentry Test Page</CardTitle>
          <CardDescription>
            Use these buttons to test your Sentry integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Click the buttons below to test different Sentry features:
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={testError} variant="destructive">
              Test Error Capture
            </Button>
            <p className="text-xs text-muted-foreground">
              This will send a test error to Sentry
            </p>

            <Button onClick={testMessage} variant="outline">
              Test Message Capture
            </Button>
            <p className="text-xs text-muted-foreground">
              This will send a test message to Sentry
            </p>

            <Button onClick={testBreadcrumb} variant="outline">
              Test Breadcrumb
            </Button>
            <p className="text-xs text-muted-foreground">
              This will add a breadcrumb (visible when an error occurs)
            </p>
          </div>

          <div className="mt-8 p-4 bg-muted rounded-md space-y-3">
            <div>
              <p className="text-sm font-semibold mb-1">Sentry Status:</p>
              <p className="text-xs">{sentryStatus}</p>
            </div>
            
            {lastEventId && (
              <div>
                <p className="text-sm font-semibold mb-1">Last Event ID:</p>
                <code className="text-xs bg-background px-2 py-1 rounded block break-all">
                  {lastEventId}
                </code>
              </div>
            )}

            <div>
              <p className="text-sm font-semibold mb-1">Troubleshooting:</p>
              <ul className="text-xs text-muted-foreground list-disc list-inside ml-2 space-y-1">
                <li>Open browser console (F12) and look for Sentry messages</li>
                <li>Check Network tab for requests to <code>sentry.io</code></li>
                <li>Verify you&apos;re looking at project: <code>javascript-nextjs</code> in Sentry</li>
                <li>Check if ad-blocker is blocking Sentry requests</li>
                <li>Make sure DSN is set: <code>NEXT_PUBLIC_SENTRY_DSN</code> in .env</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


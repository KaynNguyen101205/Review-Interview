"use client"

import * as Sentry from "@sentry/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestSentryPage() {
  const testError = () => {
    try {
      throw new Error("Test error from Sentry setup")
    } catch (error) {
      Sentry.captureException(error)
      alert("Error sent to Sentry! Check your Sentry dashboard.")
    }
  }

  const testMessage = () => {
    Sentry.captureMessage("Test message from Sentry setup", "info")
    alert("Message sent to Sentry! Check your Sentry dashboard.")
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

          <div className="mt-8 p-4 bg-muted rounded-md">
            <p className="text-sm">
              <strong>Note:</strong> Make sure you&apos;ve added your Sentry DSN to your{" "}
              <code className="text-xs bg-background px-1 py-0.5 rounded">.env</code> file
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface ReportButtonProps {
  reviewId: string
}

export default function ReportButton({ reviewId }: ReportButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reason, setReason] = useState("")
  const [details, setDetails] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session) {
      router.push("/login")
      return
    }

    if (!reason.trim()) {
      alert("Please provide a reason")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/reviews/${reviewId}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason, details }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit report")
      }

      alert("Report submitted successfully")
      setShowForm(false)
      setReason("")
      setDetails("")
      router.refresh()
    } catch (error: any) {
      alert(error.message || "Failed to submit report")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!showForm) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          if (!session) {
            router.push("/login")
          } else {
            setShowForm(true)
          }
        }}
      >
        Report
      </Button>
    )
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Report Review</CardTitle>
        <CardDescription>
          Help us maintain quality by reporting inappropriate content
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <select
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            >
              <option value="">Select a reason</option>
              <option value="Inappropriate content">Inappropriate content</option>
              <option value="False information">False information</option>
              <option value="Spam">Spam</option>
              <option value="Harassment">Harassment</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Additional Details</Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              placeholder="Provide more information about the issue..."
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowForm(false)
                setReason("")
                setDetails("")
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}


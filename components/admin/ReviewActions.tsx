"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface ReviewActionsProps {
  reviewId: string
}

export default function ReviewActions({ reviewId }: ReviewActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectForm, setShowRejectForm] = useState(false)

  const handleApprove = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}/approve`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to approve review")
      }

      router.refresh()
    } catch (error) {
      console.error("Error approving review:", error)
      alert("Failed to approve review")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: rejectionReason }),
      })

      if (!response.ok) {
        throw new Error("Failed to reject review")
      }

      router.refresh()
    } catch (error) {
      console.error("Error rejecting review:", error)
      alert("Failed to reject review")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={handleApprove} disabled={isLoading}>
          Approve
        </Button>
        <Button
          variant="destructive"
          onClick={() => setShowRejectForm(!showRejectForm)}
          disabled={isLoading}
        >
          Reject
        </Button>
      </div>

      {showRejectForm && (
        <div className="space-y-2 p-4 border rounded-md">
          <Label htmlFor="rejectionReason">Rejection Reason *</Label>
          <Textarea
            id="rejectionReason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Explain why this review is being rejected..."
            rows={3}
          />
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isLoading || !rejectionReason.trim()}
            >
              Confirm Reject
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectForm(false)
                setRejectionReason("")
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}


"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface CompanyRequestActionsProps {
  requestId: string
}

export default function CompanyRequestActions({
  requestId,
}: CompanyRequestActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectForm, setShowRejectForm] = useState(false)

  const handleApprove = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/company-requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "APPROVED" }),
      })

      if (!response.ok) {
        throw new Error("Failed to approve request")
      }

      router.refresh()
    } catch (error) {
      console.error("Error approving request:", error)
      alert("Failed to approve request")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/company-requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "REJECTED",
          rejectionReason: rejectionReason || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to reject request")
      }

      router.refresh()
    } catch (error) {
      console.error("Error rejecting request:", error)
      alert("Failed to reject request")
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
          <Label htmlFor="rejectionReason">Rejection Reason (Optional)</Label>
          <Textarea
            id="rejectionReason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Explain why this request is being rejected..."
            rows={3}
          />
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isLoading}
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


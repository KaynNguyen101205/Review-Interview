"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface ReportActionsProps {
  reportId: string
}

export default function ReportActions({ reportId }: ReportActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleDismiss = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/reports/${reportId}/dismiss`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to dismiss report")
      }

      router.refresh()
    } catch (error) {
      console.error("Error dismissing report:", error)
      alert("Failed to dismiss report")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAction = async (actionType: "FLAG_NEEDS_EDIT" | "REMOVE" | "DISMISS") => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/reports/${reportId}/action`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ actionType }),
      })

      if (!response.ok) {
        throw new Error("Failed to process action")
      }

      router.refresh()
    } catch (error) {
      console.error("Error processing action:", error)
      alert("Failed to process action")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2 flex-wrap">
        <Button
          variant="outline"
          onClick={() => handleAction("FLAG_NEEDS_EDIT")}
          disabled={isLoading}
        >
          Flag for Edit
        </Button>
        <Button
          variant="destructive"
          onClick={() => handleAction("REMOVE")}
          disabled={isLoading}
        >
          Remove Review
        </Button>
        <Button
          variant="ghost"
          onClick={handleDismiss}
          disabled={isLoading}
        >
          Dismiss
        </Button>
      </div>
    </div>
  )
}


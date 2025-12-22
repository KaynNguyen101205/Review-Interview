"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface VoteButtonProps {
  reviewId: string
  initialVote?: { value: string } | null
  initialHelpfulCount: number
}

export default function VoteButton({
  reviewId,
  initialVote,
  initialHelpfulCount,
}: VoteButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [vote, setVote] = useState<{ value: string } | null>(initialVote || null)
  const [helpfulCount, setHelpfulCount] = useState(initialHelpfulCount)
  const [isLoading, setIsLoading] = useState(false)

  const handleVote = async (value: "UP" | "DOWN") => {
    if (!session) {
      router.push("/login")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/reviews/${reviewId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ value }),
      })

      if (!response.ok) {
        throw new Error("Failed to vote")
      }

      setVote({ value })
      if (value === "UP") {
        setHelpfulCount((prev) => (vote?.value === "UP" ? prev : prev + 1))
      } else {
        setHelpfulCount((prev) => (vote?.value === "UP" ? prev - 1 : prev))
      }

      router.refresh()
    } catch (error) {
      console.error("Error voting:", error)
      alert("Failed to vote")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveVote = async () => {
    if (!session) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/reviews/${reviewId}/vote`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to remove vote")
      }

      if (vote?.value === "UP") {
        setHelpfulCount((prev) => prev - 1)
      }
      setVote(null)

      router.refresh()
    } catch (error) {
      console.error("Error removing vote:", error)
      alert("Failed to remove vote")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={vote?.value === "UP" ? "default" : "outline"}
        size="sm"
        onClick={() => {
          if (vote?.value === "UP") {
            handleRemoveVote()
          } else {
            handleVote("UP")
          }
        }}
        disabled={isLoading}
      >
        Helpful ({helpfulCount})
      </Button>
      {vote && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemoveVote}
          disabled={isLoading}
        >
          Remove vote
        </Button>
      )}
    </div>
  )
}


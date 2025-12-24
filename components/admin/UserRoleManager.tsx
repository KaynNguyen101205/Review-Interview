"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface UserRoleManagerProps {
  userId: string
  currentRole: string
  currentUserId?: string // Current logged-in user's ID to prevent self-deletion
}

export default function UserRoleManager({
  userId,
  currentRole,
  currentUserId,
}: UserRoleManagerProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [role, setRole] = useState(currentRole)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleRoleChange = async (newRole: string) => {
    if (newRole === role) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update user role")
      }

      setRole(newRole)
      router.refresh()
    } catch (error: any) {
      console.error("Error updating user role:", error)
      alert(error.message || "Failed to update user role")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete user")
      }

      router.refresh()
    } catch (error: any) {
      console.error("Error deleting user:", error)
      alert(error.message || "Failed to delete user")
    } finally {
      setIsLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  const canDelete = currentUserId && userId !== currentUserId

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 items-center">
        <span className="text-sm font-medium">Change Role:</span>
        <select
          value={role}
          onChange={(e) => handleRoleChange(e.target.value)}
          disabled={isLoading}
          className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
        >
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </div>
      {canDelete && (
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isLoading}
          className="w-fit"
        >
          {isLoading ? "Deleting..." : "Delete User"}
        </Button>
      )}
    </div>
  )
}


"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface UserRoleManagerProps {
  userId: string
  currentRole: string
}

export default function UserRoleManager({
  userId,
  currentRole,
}: UserRoleManagerProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [role, setRole] = useState(currentRole)

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
        throw new Error("Failed to update user role")
      }

      setRole(newRole)
      router.refresh()
    } catch (error) {
      console.error("Error updating user role:", error)
      alert("Failed to update user role")
    } finally {
      setIsLoading(false)
    }
  }

  return (
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
  )
}


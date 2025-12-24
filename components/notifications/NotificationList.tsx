"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  link?: string | null
  createdAt: string
}

interface NotificationListProps {
  initialNotifications: Notification[]
}

export default function NotificationList({
  initialNotifications,
}: NotificationListProps) {
  const router = useRouter()
  const [notifications, setNotifications] = useState(initialNotifications)
  const [isLoading, setIsLoading] = useState(false)

  const markAsRead = async (notificationIds: string[]) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notificationIds,
          read: true,
        }),
      })

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            notificationIds.includes(n.id) ? { ...n, read: true } : n
          )
        )
        router.refresh()
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const markAllAsRead = async () => {
    const unreadIds = notifications
      .filter((n) => !n.read)
      .map((n) => n.id)
    if (unreadIds.length > 0) {
      await markAsRead(unreadIds)
    }
  }

  const unreadNotifications = notifications.filter((n) => !n.read)

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No notifications yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {unreadNotifications.length > 0 && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={markAllAsRead}
            disabled={isLoading}
          >
            Mark all as read
          </Button>
        </div>
      )}

      <div className="space-y-2">
        {notifications.map((notification) => (
          <Card
            key={notification.id}
            className={`cursor-pointer hover:shadow-md transition-shadow ${
              !notification.read
                ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                : ""
            }`}
            onClick={() => {
              if (!notification.read) {
                markAsRead([notification.id])
              }
              if (notification.link) {
                window.location.href = notification.link
              }
            }}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{notification.title}</h3>
                    {!notification.read && (
                      <span className="h-2 w-2 bg-blue-500 rounded-full" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                {notification.link && (
                  <Link
                    href={notification.link}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}


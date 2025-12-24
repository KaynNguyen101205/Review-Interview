import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/middleware-helpers"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    if (user instanceof NextResponse) return user

    const searchParams = request.nextUrl.searchParams
    const read = searchParams.get("read")
    const limit = parseInt(searchParams.get("limit") || "50", 10)

    const where: any = {
      userId: (user as any).id,
    }

    if (read !== null) {
      where.read = read === "true"
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    // Convert Date objects to ISO strings for JSON serialization
    const serializedNotifications = notifications.map((notification) => ({
      ...notification,
      createdAt: notification.createdAt.toISOString(),
    }))

    return NextResponse.json({ notifications: serializedNotifications })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    if (user instanceof NextResponse) return user

    const body = await request.json()
    const { notificationIds, read } = body

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return NextResponse.json(
        { error: "notificationIds array is required" },
        { status: 400 }
      )
    }

    if (typeof read !== "boolean") {
      return NextResponse.json(
        { error: "read must be a boolean" },
        { status: 400 }
      )
    }

    // Update notifications (only user's own notifications)
    await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId: (user as any).id,
      },
      data: { read },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating notifications:", error)
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    )
  }
}


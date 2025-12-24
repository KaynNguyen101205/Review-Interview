import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/middleware-helpers"
import { createAuditLog } from "@/lib/audit"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdmin(request)
    if (user instanceof NextResponse) return user

    const body = await request.json()
    const { role } = body

    if (!role || !["USER", "ADMIN"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be USER or ADMIN" },
        { status: 400 }
      )
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Prevent admin from removing their own admin role
    if (
      params.id === (user as any).id &&
      targetUser.role === "ADMIN" &&
      role === "USER"
    ) {
      return NextResponse.json(
        { error: "Cannot remove your own admin role" },
        { status: 400 }
      )
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    // Create audit log
    await createAuditLog({
      userId: (user as any).id,
      action: "USER_ROLE_UPDATED",
      entityType: "User",
      entityId: params.id,
      details: `Changed user role from ${targetUser.role} to ${role}`,
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating user role:", error)
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/middleware-helpers"
import { sanitizeText } from "@/lib/validation"
import { createAuditLog } from "@/lib/audit"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdmin(request)
    if (user instanceof NextResponse) return user

    const body = await request.json()
    const { reason } = body

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { error: "Rejection reason is required" },
        { status: 400 }
      )
    }

    const review = await prisma.review.findUnique({
      where: { id: params.id },
    })

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    // Update review to REJECTED with reason
    const updatedReview = await prisma.review.update({
      where: { id: params.id },
      data: {
        status: "REJECTED",
        rejectionReason: sanitizeText(reason),
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Create audit log
    await createAuditLog({
      userId: (user as any).id,
      action: "REVIEW_REJECTED",
      entityType: "Review",
      entityId: params.id,
      details: `Rejected review. Reason: ${sanitizeText(reason)}`,
    })

    return NextResponse.json({
      success: true,
      review: updatedReview,
    })
  } catch (error) {
    console.error("Error rejecting review:", error)
    return NextResponse.json(
      { error: "Failed to reject review" },
      { status: 500 }
    )
  }
}


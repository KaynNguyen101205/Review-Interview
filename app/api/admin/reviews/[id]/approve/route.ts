import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/middleware-helpers"
import { updateCompanyStats } from "@/lib/company-stats"
import { createAuditLog } from "@/lib/audit"
import { notifyReviewApproved } from "@/lib/notifications"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdmin(request)
    if (user instanceof NextResponse) return user

    const review = await prisma.review.findUnique({
      where: { id: params.id },
    })

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    // Update review to APPROVED and set publishedAt
    const updatedReview = await prisma.review.update({
      where: { id: params.id },
      data: {
        status: "APPROVED",
        publishedAt: new Date(),
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

    // Update company stats
    await updateCompanyStats(review.companyId)

    // Create audit log
    await createAuditLog({
      userId: (user as any).id,
      action: "REVIEW_APPROVED",
      entityType: "Review",
      entityId: params.id,
      details: `Approved review for company: ${updatedReview.company.name}`,
    })

    // Notify user
    await notifyReviewApproved(params.id, review.userId)

    return NextResponse.json({
      success: true,
      review: updatedReview,
    })
  } catch (error) {
    console.error("Error approving review:", error)
    return NextResponse.json(
      { error: "Failed to approve review" },
      { status: 500 }
    )
  }
}


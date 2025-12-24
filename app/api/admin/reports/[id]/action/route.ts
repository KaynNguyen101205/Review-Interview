import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/middleware-helpers"
import { updateCompanyStats } from "@/lib/company-stats"
import { createAuditLog } from "@/lib/audit"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdmin(request)
    if (user instanceof NextResponse) return user

    const body = await request.json()
    const { actionType } = body

    if (!actionType || !["FLAG_NEEDS_EDIT", "REMOVE"].includes(actionType)) {
      return NextResponse.json(
        { error: "Invalid actionType. Must be FLAG_NEEDS_EDIT or REMOVE" },
        { status: 400 }
      )
    }

    const report = await prisma.reviewReport.findUnique({
      where: { id: params.id },
      include: {
        review: true,
      },
    })

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    // Update report status to RESOLVED
    await prisma.reviewReport.update({
      where: { id: params.id },
      data: {
        status: "RESOLVED",
      },
    })

    // Update review status based on action
    if (actionType === "FLAG_NEEDS_EDIT") {
      await prisma.review.update({
        where: { id: report.reviewId },
        data: {
          status: "NEEDS_EDIT",
        },
      })
    } else if (actionType === "REMOVE") {
      const review = await prisma.review.findUnique({
        where: { id: report.reviewId },
      })

      await prisma.review.update({
        where: { id: report.reviewId },
        data: {
          status: "REMOVED",
        },
      })

      // If review was approved, update company stats
      if (review?.status === "APPROVED") {
        await updateCompanyStats(review.companyId)
      }
    }

    // Create audit log
    await createAuditLog({
      userId: (user as any).id,
      action: actionType === "FLAG_NEEDS_EDIT" ? "REVIEW_FLAGGED" : "REVIEW_REMOVED",
      entityType: "Review",
      entityId: report.reviewId,
      details: `Action taken on report: ${actionType}`,
    })

    return NextResponse.json({
      success: true,
      message: `Review ${actionType === "FLAG_NEEDS_EDIT" ? "flagged for edit" : "removed"}`,
    })
  } catch (error) {
    console.error("Error processing report action:", error)
    return NextResponse.json(
      { error: "Failed to process report action" },
      { status: 500 }
    )
  }
}


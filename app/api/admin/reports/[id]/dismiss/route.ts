import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/middleware-helpers"
import { createAuditLog } from "@/lib/audit"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdmin(request)
    if (user instanceof NextResponse) return user

    const report = await prisma.reviewReport.findUnique({
      where: { id: params.id },
    })

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    // Update report status to DISMISSED
    const updatedReport = await prisma.reviewReport.update({
      where: { id: params.id },
      data: {
        status: "DISMISSED",
      },
      include: {
        review: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
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
      action: "REPORT_DISMISSED",
      entityType: "Report",
      entityId: params.id,
      details: `Dismissed report for review: ${updatedReport.review.id}`,
    })

    return NextResponse.json({
      success: true,
      report: updatedReport,
    })
  } catch (error) {
    console.error("Error dismissing report:", error)
    return NextResponse.json(
      { error: "Failed to dismiss report" },
      { status: 500 }
    )
  }
}


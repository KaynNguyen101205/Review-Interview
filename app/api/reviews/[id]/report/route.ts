import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/middleware-helpers"
import { checkRateLimit } from "@/lib/validation"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    if (user instanceof NextResponse) return user

    // Rate limiting
    const rateLimitKey = `report:${(user as any).id}`
    if (!checkRateLimit(rateLimitKey, 5, 60000)) {
      // 5 reports per minute
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { reason, details } = body

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { error: "Reason is required" },
        { status: 400 }
      )
    }

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: params.id },
    })

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    // Check if user already reported this review
    const existingReport = await prisma.reviewReport.findFirst({
      where: {
        reviewId: params.id,
        userId: (user as any).id,
        status: "OPEN",
      },
    })

    if (existingReport) {
      return NextResponse.json(
        { error: "You have already reported this review" },
        { status: 409 }
      )
    }

    // Create report
    const report = await prisma.reviewReport.create({
      data: {
        reviewId: params.id,
        userId: (user as any).id,
        reason: reason.trim(),
        details: details?.trim() || null,
        status: "OPEN",
      },
    })

    return NextResponse.json({
      success: true,
      report,
    })
  } catch (error) {
    console.error("Error creating report:", error)
    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    )
  }
}


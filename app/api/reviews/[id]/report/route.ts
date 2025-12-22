import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Force dynamic rendering since we use headers (via getCurrentUser)
export const dynamic = "force-dynamic"

const reportSchema = z.object({
  reason: z.string().min(1, "Reason is required"),
  details: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const review = await prisma.review.findUnique({
      where: { id: params.id },
    })

    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const data = reportSchema.parse(body)

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
        { status: 400 }
      )
    }

    const report = await prisma.reviewReport.create({
      data: {
        reviewId: params.id,
        userId: (user as any).id,
        reason: data.reason,
        details: data.details || null,
        status: "OPEN",
      },
    })

    return NextResponse.json(report, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating report:", error)
    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    )
  }
}


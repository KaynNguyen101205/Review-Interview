import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Force dynamic rendering since we use headers (via getCurrentUser)
export const dynamic = "force-dynamic"

const rejectSchema = z.object({
  reason: z.string().min(1, "Rejection reason is required"),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user || (user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { reason } = rejectSchema.parse(body)

    const review = await prisma.review.findUnique({
      where: { id: params.id },
    })

    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      )
    }

    await prisma.review.update({
      where: { id: params.id },
      data: {
        status: "REJECTED",
        rejectionReason: reason,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error rejecting review:", error)
    return NextResponse.json(
      { error: "Failed to reject review" },
      { status: 500 }
    )
  }
}


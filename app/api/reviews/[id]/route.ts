import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const reviewUpdateSchema = z.object({
  roleTitle: z.string().min(1).optional(),
  level: z.string().optional(),
  location: z.string().optional(),
  season: z.string().optional(),
  year: z.number().optional(),
  stagesCount: z.number().optional(),
  interviewType: z.string().optional(),
  difficulty: z.number().min(1).max(5).optional(),
  outcome: z.string().optional(),
  currency: z.string().optional(),
  payHourly: z.number().optional(),
  payMonthly: z.number().optional(),
  payYearly: z.number().optional(),
  applicationProcess: z.string().optional(),
  interviewExperience: z.string().optional(),
  culture: z.string().optional(),
  tips: z.string().optional(),
  overall: z.string().optional(),
})

export async function PATCH(
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

    const isAdmin = (user as any).role === "ADMIN"
    const isOwner = review.userId === (user as any).id

    // Only owner can edit if pending/needs_edit, admin can edit anytime
    if (!isAdmin) {
      if (!isOwner) {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        )
      }

      if (review.status !== "PENDING" && review.status !== "NEEDS_EDIT") {
        return NextResponse.json(
          { error: "Review cannot be edited" },
          { status: 403 }
        )
      }
    }

    const body = await request.json()
    const data = reviewUpdateSchema.parse(body)

    const updatedReview = await prisma.review.update({
      where: { id: params.id },
      data,
    })

    return NextResponse.json(updatedReview)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating review:", error)
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    const isAdmin = (user as any).role === "ADMIN"
    const isOwner = review.userId === (user as any).id

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    if (isAdmin) {
      // Admin can hard delete
      await prisma.review.delete({
        where: { id: params.id },
      })
    } else {
      // Owner can soft delete
      await prisma.review.update({
        where: { id: params.id },
        data: { status: "REMOVED" },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting review:", error)
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    )
  }
}

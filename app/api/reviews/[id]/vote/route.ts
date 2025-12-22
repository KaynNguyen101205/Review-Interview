import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const voteSchema = z.object({
  value: z.enum(["UP", "DOWN"]),
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
    const { value } = voteSchema.parse(body)

    // Check if vote already exists
    const existingVote = await prisma.reviewVote.findUnique({
      where: {
        reviewId_userId: {
          reviewId: params.id,
          userId: (user as any).id,
        },
      },
    })

    if (existingVote) {
      // Update existing vote
      await prisma.reviewVote.update({
        where: { id: existingVote.id },
        data: { value },
      })
    } else {
      // Create new vote
      await prisma.reviewVote.create({
        data: {
          reviewId: params.id,
          userId: (user as any).id,
          value,
        },
      })
    }

    // Recalculate helpfulScore
    const upVotes = await prisma.reviewVote.count({
      where: {
        reviewId: params.id,
        value: "UP",
      },
    })

    await prisma.review.update({
      where: { id: params.id },
      data: { helpfulScore: upVotes },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating/updating vote:", error)
    return NextResponse.json(
      { error: "Failed to vote" },
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

    const vote = await prisma.reviewVote.findUnique({
      where: {
        reviewId_userId: {
          reviewId: params.id,
          userId: (user as any).id,
        },
      },
    })

    if (vote) {
      await prisma.reviewVote.delete({
        where: { id: vote.id },
      })

      // Recalculate helpfulScore
      const upVotes = await prisma.reviewVote.count({
        where: {
          reviewId: params.id,
          value: "UP",
        },
      })

      await prisma.review.update({
        where: { id: params.id },
        data: { helpfulScore: upVotes },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting vote:", error)
    return NextResponse.json(
      { error: "Failed to remove vote" },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/middleware-helpers"

// Helper function to update helpfulScore for a review
async function updateHelpfulScore(reviewId: string) {
  const upVotes = await prisma.reviewVote.count({
    where: {
      reviewId,
      value: "UP",
    },
  })

  await prisma.review.update({
    where: { id: reviewId },
    data: { helpfulScore: upVotes },
  })

  return upVotes
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    if (user instanceof NextResponse) return user

    const body = await request.json()
    const { value } = body

    if (!value || (value !== "UP" && value !== "DOWN")) {
      return NextResponse.json(
        { error: "Invalid vote value. Must be UP or DOWN" },
        { status: 400 }
      )
    }

    // Check if review exists and is approved
    const review = await prisma.review.findUnique({
      where: { id: params.id },
    })

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    if (review.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Can only vote on approved reviews" },
        { status: 400 }
      )
    }

    // Check if user already voted
    const existingVote = await prisma.reviewVote.findFirst({
      where: {
        reviewId: params.id,
        userId: (user as any).id,
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

    // Update helpfulScore
    const helpfulScore = await updateHelpfulScore(params.id)

    return NextResponse.json({
      success: true,
      helpfulScore,
    })
  } catch (error: any) {
    console.error("Error voting on review:", error)
    if (error.code === "P2002") {
      // Unique constraint violation
      return NextResponse.json(
        { error: "You have already voted on this review" },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: "Failed to vote on review" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    if (user instanceof NextResponse) return user

    // Find and delete the vote
    const vote = await prisma.reviewVote.findFirst({
      where: {
        reviewId: params.id,
        userId: (user as any).id,
      },
    })

    if (!vote) {
      return NextResponse.json({ error: "Vote not found" }, { status: 404 })
    }

    await prisma.reviewVote.delete({
      where: { id: vote.id },
    })

    // Update helpfulScore
    const helpfulScore = await updateHelpfulScore(params.id)

    return NextResponse.json({
      success: true,
      helpfulScore,
    })
  } catch (error) {
    console.error("Error removing vote:", error)
    return NextResponse.json(
      { error: "Failed to remove vote" },
      { status: 500 }
    )
  }
}


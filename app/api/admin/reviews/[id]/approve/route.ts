import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"

// Force dynamic rendering since we use headers (via getCurrentUser)
export const dynamic = "force-dynamic"

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

    const review = await prisma.review.findUnique({
      where: { id: params.id },
      include: { company: true },
    })

    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      )
    }

    // Update review status
    await prisma.review.update({
      where: { id: params.id },
      data: {
        status: "APPROVED",
        publishedAt: new Date(),
      },
    })

    // Recalculate company stats
    const companyReviews = await prisma.review.findMany({
      where: {
        companyId: review.companyId,
        status: "APPROVED",
      },
    })

    const reviewCount = companyReviews.length
    const avgDifficulty =
      companyReviews
        .filter((r) => r.difficulty !== null)
        .reduce((sum, r) => sum + (r.difficulty || 0), 0) /
      companyReviews.filter((r) => r.difficulty !== null).length || null

    const lastReview = companyReviews
      .filter((r) => r.publishedAt)
      .sort(
        (a, b) =>
          new Date(b.publishedAt!).getTime() -
          new Date(a.publishedAt!).getTime()
      )[0]

    await prisma.company.update({
      where: { id: review.companyId },
      data: {
        reviewCount,
        avgDifficulty: avgDifficulty || null,
        lastReviewAt: lastReview?.publishedAt || null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error approving review:", error)
    return NextResponse.json(
      { error: "Failed to approve review" },
      { status: 500 }
    )
  }
}


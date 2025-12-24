import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, requireAdmin } from "@/lib/middleware-helpers"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const review = await prisma.review.findUnique({
      where: { id: params.id },
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
            school: true,
            major: true,
            gradYear: true,
          },
        },
        votes: {
          select: {
            id: true,
            userId: true,
            value: true,
          },
        },
        reports: {
          where: {
            status: "OPEN",
          },
          select: {
            id: true,
            reason: true,
          },
        },
      },
    })

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    return NextResponse.json(review)
  } catch (error) {
    console.error("Error fetching review:", error)
    return NextResponse.json(
      { error: "Failed to fetch review" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    if (user instanceof NextResponse) return user

    const body = await request.json()

    // Get the review
    const existingReview = await prisma.review.findUnique({
      where: { id: params.id },
    })

    if (!existingReview) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    const isAdmin = (user as any).role === "ADMIN"
    const isOwner = existingReview.userId === (user as any).id

    // Check permissions
    if (!isAdmin) {
      if (!isOwner) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }
      // Owner can only edit if pending or needs_edit
      if (
        existingReview.status !== "PENDING" &&
        existingReview.status !== "NEEDS_EDIT"
      ) {
        return NextResponse.json(
          { error: "Can only edit pending or needs_edit reviews" },
          { status: 403 }
        )
      }
    }

    // Update review
    const updatedReview = await prisma.review.update({
      where: { id: params.id },
      data: {
        ...body,
        // If admin changes status to APPROVED, set publishedAt
        ...(isAdmin &&
          body.status === "APPROVED" &&
          !existingReview.publishedAt && {
            publishedAt: new Date(),
          }),
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

    // If status changed to APPROVED, update company stats
    if (
      isAdmin &&
      body.status === "APPROVED" &&
      existingReview.status !== "APPROVED"
    ) {
      const { updateCompanyStats } = await import("@/lib/company-stats")
      await updateCompanyStats(existingReview.companyId)
    }

    return NextResponse.json(updatedReview)
  } catch (error) {
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
    const user = await requireAuth(request)
    if (user instanceof NextResponse) return user

    const review = await prisma.review.findUnique({
      where: { id: params.id },
    })

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    const isAdmin = (user as any).role === "ADMIN"
    const isOwner = review.userId === (user as any).id

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    if (isAdmin) {
      // Admin can hard delete
      await prisma.review.delete({
        where: { id: params.id },
      })
    } else {
      // Owner soft delete - set status to REMOVED
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


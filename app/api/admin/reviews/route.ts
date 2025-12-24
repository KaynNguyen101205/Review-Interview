import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/middleware-helpers"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin(request)
    if (user instanceof NextResponse) return user

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status") || "PENDING"

    const reviews = await prisma.review.findMany({
      where: {
        status: status as string,
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
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error("Error fetching admin reviews:", error)
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/middleware-helpers"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin(request)
    if (user instanceof NextResponse) return user

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status") || "OPEN"

    const reports = await prisma.reviewReport.findMany({
      where: {
        status: status as string,
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
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ reports })
  } catch (error) {
    console.error("Error fetching admin reports:", error)
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    )
  }
}


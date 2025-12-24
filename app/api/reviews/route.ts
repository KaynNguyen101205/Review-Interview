import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Force dynamic rendering due to searchParams usage
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const companySlug = searchParams.get("companySlug") || ""
    const role = searchParams.get("role") || ""
    const season = searchParams.get("season") || ""
    const year = searchParams.get("year") || ""
    const location = searchParams.get("location") || ""
    const sort = searchParams.get("sort") || "newest"
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = 10
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      status: "APPROVED",
    }

    if (companySlug) {
      const company = await prisma.company.findUnique({
        where: { slug: companySlug },
        select: { id: true },
      })
      if (company) {
        where.companyId = company.id
      } else {
        // Company not found, return empty results
        return NextResponse.json({
          reviews: [],
          pagination: {
            page: 1,
            limit,
            total: 0,
            totalPages: 0,
          },
        })
      }
    }

    if (role) {
      where.roleTitle = { contains: role, mode: "insensitive" }
    }

    if (season) {
      where.season = season
    }

    if (year) {
      where.year = parseInt(year, 10)
    }

    if (location) {
      where.location = { contains: location, mode: "insensitive" }
    }

    // Build orderBy clause
    let orderBy: any = {}
    if (sort === "newest") {
      orderBy = { publishedAt: "desc" }
    } else if (sort === "helpful") {
      orderBy = { helpfulScore: "desc" }
    } else {
      orderBy = { publishedAt: "desc" }
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
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
            },
          },
          votes: {
            select: {
              id: true,
              value: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
    ])

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    )
  }
}


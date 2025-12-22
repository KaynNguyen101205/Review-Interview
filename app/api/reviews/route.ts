import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { reviewSubmissionRateLimiter } from "@/lib/ratelimit"
import { rateLimitMiddleware } from "@/lib/rate-limit-middleware"

// Force dynamic rendering since we use headers (via getCurrentUser) and searchParams
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
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    const where: any = {
      status: "APPROVED", // Only show approved reviews
    }

    // Filter by company slug
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
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        })
      }
    }

    // Filter by role title
    if (role) {
      where.roleTitle = { contains: role, mode: "insensitive" }
    }

    // Filter by season
    if (season) {
      where.season = season
    }

    // Filter by year
    if (year) {
      where.year = parseInt(year)
    }

    // Filter by location
    if (location) {
      where.location = { contains: location, mode: "insensitive" }
    }

    // Determine sort order
    const orderBy: any =
      sort === "helpful"
        ? { helpfulScore: "desc" }
        : { publishedAt: "desc" }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy,
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
              school: true,
            },
          },
          votes: {
            where: { value: "UP" },
            select: {
              id: true,
              value: true,
            },
          },
        },
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

const reviewSchema = z.object({
  companyId: z.string().min(1),
  roleTitle: z.string().min(1),
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

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Apply rate limiting for review submissions
    const rateLimitResponse = await rateLimitMiddleware(
      request,
      reviewSubmissionRateLimiter,
      (user as any).id
    )
    if (rateLimitResponse) {
      return rateLimitResponse
    }

    const body = await request.json()
    const data = reviewSchema.parse(body)

    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id: data.companyId },
    })

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      )
    }

    const review = await prisma.review.create({
      data: {
        ...data,
        userId: (user as any).id,
        status: "PENDING",
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating review:", error)
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    )
  }
}

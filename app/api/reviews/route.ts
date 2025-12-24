import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/middleware-helpers"
import { sanitizeText } from "@/lib/validation"
import { checkRateLimit } from "@/lib/validation"

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
    const difficulty = searchParams.get("difficulty") || ""
    const outcome = searchParams.get("outcome") || ""
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

    if (difficulty) {
      const difficultyNum = parseInt(difficulty, 10)
      if (!isNaN(difficultyNum) && difficultyNum >= 1 && difficultyNum <= 5) {
        where.difficulty = difficultyNum
      }
    }

    if (outcome) {
      where.outcome = outcome
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

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    if (user instanceof NextResponse) return user

    // Rate limiting
    const rateLimitKey = `review:${(user as any).id}`
    if (!checkRateLimit(rateLimitKey, 5, 60000)) {
      // 5 reviews per minute
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      )
    }

    const body = await request.json()
    const {
      companyId,
      level,
      roleTitle,
      location,
      season,
      year,
      stagesCount,
      interviewType,
      difficulty,
      outcome,
      currency,
      payHourly,
      payMonthly,
      payYearly,
      applicationProcess,
      interviewExperience,
      culture,
      tips,
      overall,
    } = body

    // Validation
    if (!companyId) {
      return NextResponse.json(
        { error: "Company ID is required" },
        { status: 400 }
      )
    }

    // Check if company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    })

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      )
    }

    // Create review with PENDING status
    const review = await prisma.review.create({
      data: {
        companyId,
        userId: (user as any).id,
        status: "PENDING",
        level: level || null,
        roleTitle: sanitizeText(roleTitle) || null,
        location: sanitizeText(location) || null,
        season: season || null,
        year: year ? parseInt(year, 10) : null,
        stagesCount: stagesCount ? parseInt(stagesCount, 10) : null,
        interviewType: interviewType || null,
        difficulty: difficulty ? parseInt(difficulty, 10) : null,
        outcome: outcome || null,
        currency: currency || null,
        payHourly: payHourly ? parseFloat(payHourly) : null,
        payMonthly: payMonthly ? parseFloat(payMonthly) : null,
        payYearly: payYearly ? parseFloat(payYearly) : null,
        applicationProcess: sanitizeText(applicationProcess) || null,
        interviewExperience: sanitizeText(interviewExperience) || null,
        culture: sanitizeText(culture) || null,
        tips: sanitizeText(tips) || null,
        overall: sanitizeText(overall) || null,
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

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    )
  }
}


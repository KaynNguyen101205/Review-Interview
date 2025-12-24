import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Force dynamic rendering due to searchParams usage
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("query") || ""
    const industry = searchParams.get("industry") || ""
    const location = searchParams.get("location") || ""
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = 12
    const skip = (page - 1) * limit

    // Build where clause for filtering
    const where: any = {}

    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ]
    }

    if (industry) {
      where.industry = { contains: industry, mode: "insensitive" }
    }

    if (location) {
      where.hqLocation = { contains: location, mode: "insensitive" }
    }

    // Fetch companies with review count
    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        include: {
          _count: {
            select: {
              reviews: {
                where: { status: "APPROVED" },
              },
            },
          },
        },
        orderBy: { name: "asc" },
        skip,
        take: limit,
      }),
      prisma.company.count({ where }),
    ])

    // Map companies to include reviewCount
    const companiesWithCount = companies.map((company) => ({
      ...company,
      reviewCount: company._count.reviews,
    }))

    return NextResponse.json({
      companies: companiesWithCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching companies:", error)
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 }
    )
  }
}


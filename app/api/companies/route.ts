import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("query") || ""
    const industry = searchParams.get("industry") || ""
    const location = searchParams.get("location") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    const where: any = {}

    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { slug: { contains: query, mode: "insensitive" } },
      ]
    }

    if (industry) {
      where.industry = { contains: industry, mode: "insensitive" }
    }

    if (location) {
      where.hqLocation = { contains: location, mode: "insensitive" }
    }

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" },
      }),
      prisma.company.count({ where }),
    ])

    return NextResponse.json({
      companies,
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


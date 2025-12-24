import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/middleware-helpers"
import { createAuditLog } from "@/lib/audit"

// Force dynamic rendering due to searchParams usage
export const dynamic = "force-dynamic"

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

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

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin(request)
    if (user instanceof NextResponse) return user

    const body = await request.json()
    const { name, website, logoUri, industry, hqLocation, description } = body

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Company name is required" },
        { status: 400 }
      )
    }

    // Generate slug
    let slug = generateSlug(name)
    let slugExists = await prisma.company.findUnique({ where: { slug } })

    // If slug exists, append number
    let counter = 1
    while (slugExists) {
      slug = `${generateSlug(name)}-${counter}`
      slugExists = await prisma.company.findUnique({ where: { slug } })
      counter++
    }

    const company = await prisma.company.create({
      data: {
        name: name.trim(),
        slug,
        website: website?.trim() || null,
        logoUri: logoUri?.trim() || null,
        industry: industry?.trim() || null,
        hqLocation: hqLocation?.trim() || null,
        description: description?.trim() || null,
        reviewCount: 0,
      },
    })

    // Create audit log
    await createAuditLog({
      userId: (user as any).id,
      action: "COMPANY_CREATED",
      entityType: "Company",
      entityId: company.id,
      details: `Created company: ${company.name}`,
    })

    return NextResponse.json(company, { status: 201 })
  } catch (error: any) {
    console.error("Error creating company:", error)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Company with this name or slug already exists" },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: "Failed to create company" },
      { status: 500 }
    )
  }
}


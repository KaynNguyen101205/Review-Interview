import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, requireAdmin } from "@/lib/middleware-helpers"
import { checkRateLimit } from "@/lib/validation"

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    if (user instanceof NextResponse) return user

    // Rate limiting
    const rateLimitKey = `company-request:${(user as any).id}`
    if (!checkRateLimit(rateLimitKey, 3, 60000)) {
      // 3 requests per minute
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { requestedName, website, note, contactEmail } = body

    if (!requestedName || !requestedName.trim()) {
      return NextResponse.json(
        { error: "Company name is required" },
        { status: 400 }
      )
    }

    // Check if company with this name already exists
    const existingCompany = await prisma.company.findFirst({
      where: {
        name: {
          equals: requestedName.trim(),
          mode: "insensitive",
        },
      },
    })

    if (existingCompany) {
      return NextResponse.json(
        { error: "Company with this name already exists" },
        { status: 409 }
      )
    }

    // Create company request
    const companyRequest = await prisma.companyRequest.create({
      data: {
        userId: (user as any).id,
        requestedName: requestedName.trim(),
        website: website?.trim() || null,
        note: note?.trim() || null,
        contactEmail: contactEmail?.trim() || null,
        status: "PENDING",
      },
    })

    return NextResponse.json({
      success: true,
      companyRequest,
    })
  } catch (error) {
    console.error("Error creating company request:", error)
    return NextResponse.json(
      { error: "Failed to create company request" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin(request)
    if (user instanceof NextResponse) return user

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status") || "PENDING"

    const requests = await prisma.companyRequest.findMany({
      where: {
        status: status as string,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ requests })
  } catch (error) {
    console.error("Error fetching company requests:", error)
    return NextResponse.json(
      { error: "Failed to fetch company requests" },
      { status: 500 }
    )
  }
}


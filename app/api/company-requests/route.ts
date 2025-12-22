import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Force dynamic rendering since we use headers and searchParams
export const dynamic = "force-dynamic"

const companyRequestSchema = z.object({
  requestedName: z.string().min(1, "Company name is required"),
  website: z.string().url().optional().or(z.literal("")),
  note: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
})

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    // Allow anonymous requests, but link to user if logged in

    const body = await request.json()
    const data = companyRequestSchema.parse(body)

    const companyRequest = await prisma.companyRequest.create({
      data: {
        ...data,
        userId: user ? (user as any).id : null,
        status: "PENDING",
      },
    })

    return NextResponse.json(companyRequest, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating company request:", error)
    return NextResponse.json(
      { error: "Failed to create company request" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user || (user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status") || "PENDING"

    const requests = await prisma.companyRequest.findMany({
      where: { status },
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

    return NextResponse.json(requests)
  } catch (error) {
    console.error("Error fetching company requests:", error)
    return NextResponse.json(
      { error: "Failed to fetch company requests" },
      { status: 500 }
    )
  }
}


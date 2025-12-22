import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

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

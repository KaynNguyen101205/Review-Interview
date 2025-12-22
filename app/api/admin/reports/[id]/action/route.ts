import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const actionSchema = z.object({
  actionType: z.enum(["FLAG_NEEDS_EDIT", "REMOVE", "DISMISS"]),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user || (user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const report = await prisma.reviewReport.findUnique({
      where: { id: params.id },
      include: { review: true },
    })

    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { actionType } = actionSchema.parse(body)

    if (actionType === "FLAG_NEEDS_EDIT") {
      await prisma.review.update({
        where: { id: report.reviewId },
        data: { status: "NEEDS_EDIT" },
      })
      await prisma.reviewReport.update({
        where: { id: params.id },
        data: { status: "RESOLVED" },
      })
    } else if (actionType === "REMOVE") {
      await prisma.review.update({
        where: { id: report.reviewId },
        data: { status: "REMOVED" },
      })
      await prisma.reviewReport.update({
        where: { id: params.id },
        data: { status: "RESOLVED" },
      })
    } else if (actionType === "DISMISS") {
      await prisma.reviewReport.update({
        where: { id: params.id },
        data: { status: "DISMISSED" },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error acting on report:", error)
    return NextResponse.json(
      { error: "Failed to process report action" },
      { status: 500 }
    )
  }
}


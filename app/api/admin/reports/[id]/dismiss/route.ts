import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"

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

    await prisma.reviewReport.update({
      where: { id: params.id },
      data: { status: "DISMISSED" },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error dismissing report:", error)
    return NextResponse.json(
      { error: "Failed to dismiss report" },
      { status: 500 }
    )
  }
}


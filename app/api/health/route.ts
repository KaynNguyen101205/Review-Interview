import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Simple health check - try to query database
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}


import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const company = await prisma.company.findUnique({
      where: { slug: params.slug },
      include: {
        reviews: {
          where: { status: "APPROVED" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                school: true,
              },
            },
            votes: true,
          },
          orderBy: { publishedAt: "desc" },
          take: 10,
        },
      },
    })

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(company)
  } catch (error) {
    console.error("Error fetching company:", error)
    return NextResponse.json(
      { error: "Failed to fetch company" },
      { status: 500 }
    )
  }
}


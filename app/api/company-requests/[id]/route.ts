import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateRequestSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  rejectionReason: z.string().optional(),
})

export async function PATCH(
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

    const body = await request.json()
    const data = updateRequestSchema.parse(body)

    const companyRequest = await prisma.companyRequest.findUnique({
      where: { id: params.id },
    })

    if (!companyRequest) {
      return NextResponse.json(
        { error: "Company request not found" },
        { status: 404 }
      )
    }

    if (data.status === "APPROVED") {
      // Create company from request
      const slug = companyRequest.requestedName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

      // Check if slug already exists
      const existingCompany = await prisma.company.findUnique({
        where: { slug },
      })

      let finalSlug = slug
      if (existingCompany) {
        finalSlug = `${slug}-${Date.now()}`
      }

      const company = await prisma.company.create({
        data: {
          name: companyRequest.requestedName,
          slug: finalSlug,
          website: companyRequest.website || null,
          description: companyRequest.note || null,
        },
      })

      // Update request
      await prisma.companyRequest.update({
        where: { id: params.id },
        data: {
          status: "APPROVED",
          companyId: company.id,
        },
      })

      return NextResponse.json({ success: true, company })
    } else {
      // Reject request
      await prisma.companyRequest.update({
        where: { id: params.id },
        data: {
          status: "REJECTED",
          rejectionReason: data.rejectionReason || null,
        },
      })

      return NextResponse.json({ success: true })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating company request:", error)
    return NextResponse.json(
      { error: "Failed to update company request" },
      { status: 500 }
    )
  }
}


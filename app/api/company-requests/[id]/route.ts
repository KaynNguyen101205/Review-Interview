import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/middleware-helpers"
import { createAuditLog } from "@/lib/audit"
import {
  notifyCompanyRequestApproved,
  notifyCompanyRequestRejected,
} from "@/lib/notifications"

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdmin(request)
    if (user instanceof NextResponse) return user

    const body = await request.json()
    const { status, rejectionReason } = body

    if (!status || !["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be APPROVED or REJECTED" },
        { status: 400 }
      )
    }

    // Get the company request
    const companyRequest = await prisma.companyRequest.findUnique({
      where: { id: params.id },
    })

    if (!companyRequest) {
      return NextResponse.json(
        { error: "Company request not found" },
        { status: 404 }
      )
    }

    if (status === "APPROVED") {
      // Check if company already exists
      const existingCompany = await prisma.company.findFirst({
        where: {
          name: {
            equals: companyRequest.requestedName,
            mode: "insensitive",
          },
        },
      })

      if (existingCompany) {
        // Link to existing company
        await prisma.companyRequest.update({
          where: { id: params.id },
          data: {
            status: "APPROVED",
            companyId: existingCompany.id,
          },
        })

        return NextResponse.json({
          success: true,
          company: existingCompany,
          message: "Linked to existing company",
        })
      }

      // Create new company
      let slug = generateSlug(companyRequest.requestedName)
      let slugExists = await prisma.company.findUnique({ where: { slug } })

      // If slug exists, append number
      let counter = 1
      while (slugExists) {
        slug = `${generateSlug(companyRequest.requestedName)}-${counter}`
        slugExists = await prisma.company.findUnique({ where: { slug } })
        counter++
      }

      const company = await prisma.company.create({
        data: {
          name: companyRequest.requestedName,
          slug,
          website: companyRequest.website || null,
          reviewCount: 0,
        },
      })

      // Update request with company ID
      await prisma.companyRequest.update({
        where: { id: params.id },
        data: {
          status: "APPROVED",
          companyId: company.id,
        },
      })

      // Create audit log
      await createAuditLog({
        userId: (user as any).id,
        action: "COMPANY_REQUEST_APPROVED",
        entityType: "CompanyRequest",
        entityId: params.id,
        details: `Approved company request and created company: ${company.name}`,
      })

      // Notify requester if userId exists
      if (companyRequest.userId) {
        await notifyCompanyRequestApproved(
          company.slug,
          companyRequest.userId,
          company.name
        )
      }

      return NextResponse.json({
        success: true,
        company,
      })
    } else {
      // REJECTED
      await prisma.companyRequest.update({
        where: { id: params.id },
        data: {
          status: "REJECTED",
          rejectionReason: rejectionReason?.trim() || null,
        },
      })

      // Create audit log
      await createAuditLog({
        userId: (user as any).id,
        action: "COMPANY_REQUEST_REJECTED",
        entityType: "CompanyRequest",
        entityId: params.id,
        details: `Rejected company request: ${companyRequest.requestedName}`,
      })

      // Notify requester if userId exists
      if (companyRequest.userId) {
        await notifyCompanyRequestRejected(
          companyRequest.userId,
          companyRequest.requestedName,
          rejectionReason?.trim() || undefined
        )
      }

      return NextResponse.json({
        success: true,
        message: "Company request rejected",
      })
    }
  } catch (error) {
    console.error("Error updating company request:", error)
    return NextResponse.json(
      { error: "Failed to update company request" },
      { status: 500 }
    )
  }
}


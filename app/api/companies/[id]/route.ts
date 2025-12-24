import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/middleware-helpers"
import { createAuditLog } from "@/lib/audit"

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
    const { name, website, logoUri, industry, hqLocation, description } = body

    const company = await prisma.company.findUnique({
      where: { id: params.id },
    })

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      )
    }

    // If name changed, update slug
    let slug = company.slug
    if (name && name.trim() !== company.name) {
      slug = generateSlug(name)
      // Check if new slug exists (and is not the current company)
      const slugExists = await prisma.company.findFirst({
        where: {
          slug,
          NOT: { id: params.id },
        },
      })

      if (slugExists) {
        // Append number if slug exists
        let counter = 1
        let newSlug = `${slug}-${counter}`
        while (
          await prisma.company.findFirst({
            where: {
              slug: newSlug,
              NOT: { id: params.id },
            },
          })
        ) {
          counter++
          newSlug = `${slug}-${counter}`
        }
        slug = newSlug
      }
    }

    const updatedCompany = await prisma.company.update({
      where: { id: params.id },
      data: {
        ...(name && { name: name.trim() }),
        ...(slug !== company.slug && { slug }),
        ...(website !== undefined && { website: website?.trim() || null }),
        ...(logoUri !== undefined && { logoUri: logoUri?.trim() || null }),
        ...(industry !== undefined && { industry: industry?.trim() || null }),
        ...(hqLocation !== undefined && {
          hqLocation: hqLocation?.trim() || null,
        }),
        ...(description !== undefined && {
          description: description?.trim() || null,
        }),
      },
    })

    // Create audit log
    await createAuditLog({
      userId: (user as any).id,
      action: "COMPANY_UPDATED",
      entityType: "Company",
      entityId: params.id,
      details: `Updated company: ${updatedCompany.name}`,
    })

    return NextResponse.json(updatedCompany)
  } catch (error: any) {
    console.error("Error updating company:", error)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Company with this slug already exists" },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: "Failed to update company" },
      { status: 500 }
    )
  }
}


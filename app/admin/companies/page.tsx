import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import CompanyForm from "@/components/admin/CompanyForm"

async function getCompanies() {
  return await prisma.company.findMany({
    include: {
      _count: {
        select: {
          reviews: {
            where: { status: "APPROVED" },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  })
}

export default async function AdminCompaniesPage() {
  const user = await getCurrentUser()

  if (!user || (user as any).role !== "ADMIN") {
    redirect("/")
  }

  const companies = await getCompanies()

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Manage Companies</h1>
        <Link href="/admin">
          <button className="text-primary hover:underline">
            ← Back to Dashboard
          </button>
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold mb-4">Create New Company</h2>
          <CompanyForm />
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Existing Companies</h2>
          {companies.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No companies yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {companies.map((company) => (
                <Card key={company.id}>
                  <CardHeader>
                    <CardTitle>{company.name}</CardTitle>
                    <CardDescription>
                      Slug: {company.slug}
                      {company.industry && ` • ${company.industry}`}
                      {company.hqLocation && ` • ${company.hqLocation}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <strong>Reviews:</strong> {company._count.reviews}
                      </p>
                      {company.description && (
                        <p className="text-sm line-clamp-2">
                          {company.description}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Link href={`/companies/${company.slug}`}>
                          <button className="text-primary hover:underline text-sm">
                            View
                          </button>
                        </Link>
                        <CompanyForm company={company} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


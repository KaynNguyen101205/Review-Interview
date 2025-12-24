import { Suspense } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

async function CompaniesList({ searchParams }: { searchParams: any }) {
  // Use direct database query instead of API call for better performance
  const { prisma } = await import("@/lib/prisma")
  
  const query = searchParams.query || ""
  const industry = searchParams.industry || ""
  const location = searchParams.location || ""
  const page = parseInt(searchParams.page || "1", 10)
  const limit = 12
  const skip = (page - 1) * limit

  const where: any = {}
  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
    ]
  }
  if (industry) {
    where.industry = { contains: industry, mode: "insensitive" }
  }
  if (location) {
    where.hqLocation = { contains: location, mode: "insensitive" }
  }

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
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
      skip,
      take: limit,
    }),
    prisma.company.count({ where }),
  ])

  const data = {
    companies: companies.map((company) => ({
      ...company,
      reviewCount: company._count.reviews,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }

  return (
    <div>
      {data.companies?.length === 0 ? (
        <p className="text-muted-foreground">No companies found.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.companies?.map((company: any) => (
            <Link key={company.id} href={`/companies/${company.slug}`}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{company.name}</CardTitle>
                  <CardDescription>
                    {company.industry && `${company.industry}`}
                    {company.hqLocation && ` • ${company.hqLocation}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {company.description}
                  </p>
                  {company.reviewCount > 0 && (
                    <p className="text-sm mt-2">
                      {company.reviewCount} review{company.reviewCount !== 1 ? "s" : ""}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
      {data.pagination && data.pagination.totalPages > 1 && (
        <div className="flex gap-2 mt-8 justify-center">
          {data.pagination.page > 1 && (
            <Link href={`/companies?${new URLSearchParams({ ...searchParams, page: String(data.pagination.page - 1) })}`}>
              <Button variant="outline">Previous</Button>
            </Link>
          )}
          {data.pagination.page < data.pagination.totalPages && (
            <Link href={`/companies?${new URLSearchParams({ ...searchParams, page: String(data.pagination.page + 1) })}`}>
              <Button variant="outline">Next</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

// Enable partial prerendering for better performance
export const dynamic = "auto"
export const revalidate = 60

export default function CompaniesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">Browse Companies</h1>

      <form method="get" className="mb-8 space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Input
            name="query"
            placeholder="Search companies..."
            defaultValue={searchParams.query || ""}
          />
          <Input
            name="industry"
            placeholder="Industry..."
            defaultValue={searchParams.industry || ""}
          />
          <Input
            name="location"
            placeholder="Location..."
            defaultValue={searchParams.location || ""}
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      <Suspense fallback={<p>Loading companies...</p>}>
        <CompaniesList searchParams={searchParams} />
      </Suspense>
    </div>
  )
}


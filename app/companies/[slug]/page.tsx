import { notFound } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Enable ISR for company pages - revalidate every 5 minutes
export const revalidate = 300

async function getCompany(slug: string) {
  const { prisma } = await import("@/lib/prisma")
  
  const company = await prisma.company.findUnique({
    where: { slug },
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

  if (!company) return null

  const withPay = company.reviews.filter((r) => r.payHourly != null)
  const avgSalaryUsdPerHour =
    withPay.length > 0
      ? withPay.reduce((s, r) => s + Number(r.payHourly), 0) / withPay.length
      : null

  return { ...company, avgSalaryUsdPerHour }
}

export default async function CompanyPage({
  params,
}: {
  params: { slug: string }
}) {
  const company = await getCompany(params.slug)

  if (!company) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{company.name}</h1>
        <div className="flex gap-4 text-muted-foreground">
          {company.industry && <span>Industry: {company.industry}</span>}
          {company.hqLocation && <span>Location: {company.hqLocation}</span>}
          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Website
            </a>
          )}
        </div>
        {company.description && (
          <p className="mt-4 text-lg">{company.description}</p>
        )}
        <div className="mt-4 flex flex-wrap gap-4">
          <span>{company.reviewCount || 0} review{(company.reviewCount || 0) !== 1 ? "s" : ""}</span>
          {company.avgDifficulty && (
            <span>Avg Difficulty: {company.avgDifficulty.toFixed(1)}/5</span>
          )}
          {company.avgSalaryUsdPerHour != null && (
            <span>Avg salary: {company.avgSalaryUsdPerHour.toFixed(0)} USD/hr</span>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Reviews</h2>
        {company.reviews?.length === 0 ? (
          <p className="text-muted-foreground">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {company.reviews?.map((review: any) => (
              <Link key={review.id} href={`/reviews/${review.id}`}>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>
                      {review.roleTitle || "Review"} - {review.season} {review.year}
                    </CardTitle>
                    <CardDescription>
                      {review.workOption && `${review.workOption === "ONSITE" ? "Onsite" : review.workOption === "REMOTE" ? "Remote" : "Hybrid"} • `}
                      {review.location && `${review.location} • `}
                      Difficulty: {review.difficulty}/5
                      {review.outcome && ` • ${review.outcome}`}
                    </CardDescription>
                    {review.payHourly != null && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {Number(review.payHourly).toFixed(0)} USD/hr
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    {review.overall && (
                      <p className="text-sm line-clamp-3">{review.overall}</p>
                    )}
                    <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
                      <span>
                        {review.votes?.filter((v: any) => v.value === "UP").length || 0} helpful
                      </span>
                      <span>By {review.user?.name || "Anonymous"}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


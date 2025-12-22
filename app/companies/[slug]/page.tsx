import { notFound } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

async function getCompany(slug: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/companies/${slug}`,
    { cache: "no-store" }
  )

  if (!response.ok) {
    return null
  }

  return response.json()
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
        <div className="mt-4 flex gap-4">
          <span>Reviews: {company.reviewCount || 0}</span>
          {company.avgDifficulty && (
            <span>Avg Difficulty: {company.avgDifficulty.toFixed(1)}/5</span>
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
                      {review.location && `${review.location} • `}
                      Difficulty: {review.difficulty}/5
                      {review.outcome && ` • ${review.outcome}`}
                    </CardDescription>
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


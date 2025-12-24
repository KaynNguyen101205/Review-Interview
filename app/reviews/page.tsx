import { Suspense } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

async function ReviewsList({ searchParams }: { searchParams: any }) {
  const companySlug = searchParams.companySlug || ""
  const role = searchParams.role || ""
  const season = searchParams.season || ""
  const year = searchParams.year || ""
  const location = searchParams.location || ""
  const sort = searchParams.sort || "newest"
  const page = searchParams.page || "1"

  const params = new URLSearchParams({
    ...(companySlug && { companySlug }),
    ...(role && { role }),
    ...(season && { season }),
    ...(year && { year }),
    ...(location && { location }),
    sort,
    page,
  })

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/reviews?${params}`,
    { cache: "no-store" }
  )

  if (!response.ok) {
    return <p className="text-muted-foreground">Failed to load reviews.</p>
  }

  const data = await response.json()

  return (
    <div>
      {data.reviews?.length === 0 ? (
        <p className="text-muted-foreground">No reviews found.</p>
      ) : (
        <div className="space-y-4">
          {data.reviews?.map((review: any) => (
            <Link key={review.id} href={`/reviews/${review.id}`}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>
                        {review.roleTitle || "Review"} at {review.company.name}
                      </CardTitle>
                      <CardDescription>
                        {review.user.name || review.user.email}
                        {review.user.school && ` • ${review.user.school}`}
                        {review.season && review.year && ` • ${review.season} ${review.year}`}
                      </CardDescription>
                    </div>
                    {review.difficulty && (
                      <div className="text-sm">
                        Difficulty: {review.difficulty}/5
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {review.overall && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {review.overall}
                    </p>
                  )}
                  <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
                    {review.helpfulScore > 0 && (
                      <span>{review.helpfulScore} helpful</span>
                    )}
                    {review.location && <span>{review.location}</span>}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
      {data.pagination && data.pagination.totalPages > 1 && (
        <div className="flex gap-2 mt-8 justify-center">
          {data.pagination.page > 1 && (
            <Link
              href={`/reviews?${new URLSearchParams({
                ...searchParams,
                page: String(data.pagination.page - 1),
              })}`}
            >
              <Button variant="outline">Previous</Button>
            </Link>
          )}
          {data.pagination.page < data.pagination.totalPages && (
            <Link
              href={`/reviews?${new URLSearchParams({
                ...searchParams,
                page: String(data.pagination.page + 1),
              })}`}
            >
              <Button variant="outline">Next</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

export default function ReviewsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">Browse Reviews</h1>

      <form method="get" className="mb-8 space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Input
            name="companySlug"
            placeholder="Company slug..."
            defaultValue={searchParams.companySlug || ""}
          />
          <Input
            name="role"
            placeholder="Role title..."
            defaultValue={searchParams.role || ""}
          />
          <Input
            name="location"
            placeholder="Location..."
            defaultValue={searchParams.location || ""}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Input
            name="season"
            placeholder="Season (Summer, Fall, etc.)..."
            defaultValue={searchParams.season || ""}
          />
          <Input
            name="year"
            type="number"
            placeholder="Year..."
            defaultValue={searchParams.year || ""}
          />
          <select
            name="difficulty"
            defaultValue={searchParams.difficulty || ""}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All Difficulties</option>
            <option value="1">Difficulty: 1</option>
            <option value="2">Difficulty: 2</option>
            <option value="3">Difficulty: 3</option>
            <option value="4">Difficulty: 4</option>
            <option value="5">Difficulty: 5</option>
          </select>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <select
            name="outcome"
            defaultValue={searchParams.outcome || ""}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All Outcomes</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
            <option value="Withdrew">Withdrew</option>
            <option value="No Response">No Response</option>
          </select>
          <select
            name="sort"
            defaultValue={searchParams.sort || "newest"}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="newest">Newest</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
        <Button type="submit">Search</Button>
      </form>

      <Suspense fallback={<p>Loading reviews...</p>}>
        <ReviewsList searchParams={searchParams} />
      </Suspense>
    </div>
  )
}


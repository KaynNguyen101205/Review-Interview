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
    console.error("Failed to fetch reviews:", response.status, response.statusText)
    return (
      <div>
        <p className="text-destructive">Failed to load reviews. Please try again later.</p>
      </div>
    )
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
                  <CardTitle>
                    {review.roleTitle || "Review"} at {review.company?.name}
                  </CardTitle>
                  <CardDescription>
                    {review.season} {review.year}
                    {review.location && ` • ${review.location}`}
                    {review.difficulty && ` • Difficulty: ${review.difficulty}/5`}
                    {review.outcome && ` • ${review.outcome}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {review.overall && (
                    <p className="text-sm line-clamp-3 mb-4">{review.overall}</p>
                  )}
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>
                      {review.votes?.filter((v: any) => v.value === "UP").length || 0} helpful
                    </span>
                    <span>By {review.user?.name || "Anonymous"}</span>
                    <span>{review.user?.school || ""}</span>
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
            <Link href={`/reviews?${new URLSearchParams({ ...searchParams, page: String(data.pagination.page - 1) })}`}>
              <Button variant="outline">Previous</Button>
            </Link>
          )}
          {data.pagination.page < data.pagination.totalPages && (
            <Link href={`/reviews?${new URLSearchParams({ ...searchParams, page: String(data.pagination.page + 1) })}`}>
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
            placeholder="Season (Summer, Fall, Winter, Spring)..."
            defaultValue={searchParams.season || ""}
          />
          <Input
            name="year"
            placeholder="Year..."
            defaultValue={searchParams.year || ""}
          />
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


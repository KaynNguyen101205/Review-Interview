import { Suspense } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

async function ReviewsList({ searchParams }: { searchParams: any }) {
  // Use direct database query instead of API call for better performance
  const { prisma } = await import("@/lib/prisma")
  
  const companySlug = searchParams.companySlug || ""
  const role = searchParams.role || ""
  const season = searchParams.season || ""
  const year = searchParams.year || ""
  const location = searchParams.location || ""
  const difficulty = searchParams.difficulty || ""
  const outcome = searchParams.outcome || ""
  const sort = searchParams.sort || "newest"
  const page = parseInt(searchParams.page || "1", 10)
  const limit = 12
  const skip = (page - 1) * limit

  const where: any = {
    status: "APPROVED",
  }

  if (companySlug) {
    const company = await prisma.company.findUnique({
      where: { slug: companySlug },
      select: { id: true },
    })
    if (company) {
      where.companyId = company.id
    } else {
      return <p className="text-muted-foreground">No reviews found.</p>
    }
  }

  if (role) {
    where.roleTitle = { contains: role, mode: "insensitive" }
  }
  if (season) {
    where.season = season
  }
  if (year) {
    where.year = parseInt(year, 10)
  }
  if (location) {
    where.location = { contains: location, mode: "insensitive" }
  }
  if (difficulty) {
    const difficultyNum = parseInt(difficulty, 10)
    if (!isNaN(difficultyNum) && difficultyNum >= 1 && difficultyNum <= 5) {
      where.difficulty = difficultyNum
    }
  }
  if (outcome) {
    where.outcome = outcome
  }

  let orderBy: any = {}
  if (sort === "newest") {
    orderBy = { publishedAt: "desc" }
  } else if (sort === "helpful") {
    orderBy = { helpfulScore: "desc" }
  }

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            school: true,
          },
        },
        votes: {
          where: { value: "UP" },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.review.count({ where }),
  ])

  const data = {
    reviews: reviews.map((review) => ({
      ...review,
      helpfulScore: review.votes.length,
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

// Enable partial prerendering for better performance
export const dynamic = "auto"
export const revalidate = 60

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


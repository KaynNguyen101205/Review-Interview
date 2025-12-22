import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

async function getUserReviews(userId: string) {
  return await prisma.review.findMany({
    where: { userId },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

export default async function MyReviewsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const reviews = await getUserReviews((user as any).id)

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">My Reviews</h1>
        <Link href="/reviews/new">
          <Button>Write New Review</Button>
        </Link>
      </div>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">
              You haven&apos;t written any reviews yet.
            </p>
            <Link href="/reviews/new">
              <Button>Write Your First Review</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>
                      {review.roleTitle || "Review"} at {review.company.name}
                    </CardTitle>
                    <CardDescription>
                      {review.season} {review.year}
                      {review.location && ` • ${review.location}`}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        review.status === "APPROVED"
                          ? "bg-green-100 text-green-800"
                          : review.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : review.status === "REJECTED"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {review.status}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  {(review.status === "PENDING" ||
                    review.status === "NEEDS_EDIT") && (
                    <Link href={`/reviews/${review.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                  )}
                  {review.status === "APPROVED" && (
                    <Link href={`/reviews/${review.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  )}
                </div>
                {review.rejectionReason && (
                  <p className="text-sm text-destructive mt-2">
                    Rejection reason: {review.rejectionReason}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}


import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

async function getUserReviews(userId: string) {
  try {
    const reviews = await prisma.review.findMany({
      where: { userId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            votes: {
              where: { value: "UP" },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return reviews
  } catch (error) {
    console.error("Error fetching user reviews:", error)
    // Return empty array instead of throwing to prevent server crash
    return []
  }
}

function getStatusBadgeColor(status: string) {
  switch (status) {
    case "APPROVED":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
    case "REJECTED":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    case "NEEDS_EDIT":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    case "REMOVED":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }
}

export default async function MyReviewsPage() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      redirect("/login")
    }

    const reviews = await getUserReviews((user as any).id)

  // Group reviews by status
  const reviewsByStatus = {
    APPROVED: reviews.filter((r) => r.status === "APPROVED"),
    PENDING: reviews.filter((r) => r.status === "PENDING"),
    REJECTED: reviews.filter((r) => r.status === "REJECTED"),
    NEEDS_EDIT: reviews.filter((r) => r.status === "NEEDS_EDIT"),
    REMOVED: reviews.filter((r) => r.status === "REMOVED"),
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">My Reviews</h1>
        <Link href="/reviews/new">
          <Button>Write a Review</Button>
        </Link>
      </div>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">
              You haven&apos;t submitted any reviews yet.
            </p>
            <Link href="/reviews/new">
              <Button>Write Your First Review</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Approved Reviews */}
          {reviewsByStatus.APPROVED.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Approved Reviews</h2>
              <div className="space-y-4">
                {reviewsByStatus.APPROVED.map((review) => (
                  <Card key={review.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>
                            {review.roleTitle || "Review"} at {review.company.name}
                          </CardTitle>
                          <CardDescription>
                            {review.season && review.year
                              ? `${review.season} ${review.year}`
                              : "Review"}
                            {review.location && ` • ${review.location}`}
                            {review.difficulty && ` • Difficulty: ${review.difficulty}/5`}
                          </CardDescription>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeColor(
                            review.status
                          )}`}
                        >
                          {review.status}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {review.overall && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {review.overall}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Link href={`/reviews/${review.id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                        {review._count.votes > 0 && (
                          <span className="text-sm text-muted-foreground flex items-center">
                            {review._count.votes} helpful
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Pending Reviews */}
          {reviewsByStatus.PENDING.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Pending Reviews</h2>
              <div className="space-y-4">
                {reviewsByStatus.PENDING.map((review) => (
                  <Card key={review.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>
                            {review.roleTitle || "Review"} at {review.company.name}
                          </CardTitle>
                          <CardDescription>
                            {review.season && review.year
                              ? `${review.season} ${review.year}`
                              : "Review"}
                            {review.location && ` • ${review.location}`}
                          </CardDescription>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeColor(
                            review.status
                          )}`}
                        >
                          {review.status}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {review.overall && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {review.overall}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground mb-4">
                        Waiting for admin approval...
                      </p>
                      <div className="flex gap-2">
                        <Link href={`/reviews/${review.id}/edit`}>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Needs Edit Reviews */}
          {reviewsByStatus.NEEDS_EDIT.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Needs Edit</h2>
              <div className="space-y-4">
                {reviewsByStatus.NEEDS_EDIT.map((review) => (
                  <Card key={review.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>
                            {review.roleTitle || "Review"} at {review.company.name}
                          </CardTitle>
                          <CardDescription>
                            {review.season && review.year
                              ? `${review.season} ${review.year}`
                              : "Review"}
                            {review.location && ` • ${review.location}`}
                          </CardDescription>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeColor(
                            review.status
                          )}`}
                        >
                          {review.status}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {review.overall && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {review.overall}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground mb-4">
                        Please edit your review based on admin feedback.
                      </p>
                      <div className="flex gap-2">
                        <Link href={`/reviews/${review.id}/edit`}>
                          <Button variant="outline" size="sm">
                            Edit Review
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Rejected Reviews */}
          {reviewsByStatus.REJECTED.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Rejected Reviews</h2>
              <div className="space-y-4">
                {reviewsByStatus.REJECTED.map((review) => (
                  <Card key={review.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>
                            {review.roleTitle || "Review"} at {review.company.name}
                          </CardTitle>
                          <CardDescription>
                            {review.season && review.year
                              ? `${review.season} ${review.year}`
                              : "Review"}
                            {review.location && ` • ${review.location}`}
                          </CardDescription>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeColor(
                            review.status
                          )}`}
                        >
                          {review.status}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {review.overall && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {review.overall}
                        </p>
                      )}
                      {review.rejectionReason && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-md mb-4">
                          <p className="text-sm font-semibold mb-1">Rejection Reason:</p>
                          <p className="text-sm">{review.rejectionReason}</p>
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Submitted: {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Removed Reviews */}
          {reviewsByStatus.REMOVED.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Removed Reviews</h2>
              <div className="space-y-4">
                {reviewsByStatus.REMOVED.map((review) => (
                  <Card key={review.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>
                            {review.roleTitle || "Review"} at {review.company.name}
                          </CardTitle>
                          <CardDescription>
                            {review.season && review.year
                              ? `${review.season} ${review.year}`
                              : "Review"}
                          </CardDescription>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeColor(
                            review.status
                          )}`}
                        >
                          {review.status}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        This review has been removed.
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
    )
  } catch (error) {
    console.error("Error in MyReviewsPage:", error)
    // Show error message to user instead of crashing
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="py-8 text-center">
            <h1 className="text-2xl font-bold mb-4 text-red-600">Error Loading Reviews</h1>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error 
                ? error.message.includes("Can't reach database")
                  ? "Database connection failed. Please check your database connection."
                  : error.message
                : "An unexpected error occurred. Please try again later."}
            </p>
            <p className="text-sm text-muted-foreground">
              If this problem persists, please check your database connection settings.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }
}


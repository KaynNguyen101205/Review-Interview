import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ReviewActions from "@/components/admin/ReviewActions"

async function getPendingReviews() {
  return await prisma.review.findMany({
    where: { status: "PENDING" },
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
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

export default async function AdminReviewsPage() {
  const user = await getCurrentUser()

  if (!user || (user as any).role !== "ADMIN") {
    redirect("/")
  }

  const reviews = await getPendingReviews()

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Pending Reviews</h1>
        <Link href="/admin">
          <button className="text-primary hover:underline">← Back to Dashboard</button>
        </Link>
      </div>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No pending reviews.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <CardTitle>
                  {review.roleTitle || "Review"} at {review.company.name}
                </CardTitle>
                <CardDescription>
                  {review.season} {review.year}
                  {review.location && ` • ${review.location}`}
                  {review.difficulty && ` • Difficulty: ${review.difficulty}/5`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {review.overall && (
                    <p className="text-sm line-clamp-3">{review.overall}</p>
                  )}
                  <div className="text-sm text-muted-foreground">
                    <p>By: {review.user.name || review.user.email}</p>
                    <p>
                      Submitted: {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <ReviewActions reviewId={review.id} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}


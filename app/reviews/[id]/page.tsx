import { notFound } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import VoteButton from "@/components/reviews/VoteButton"
import ReportButton from "@/components/reviews/ReportButton"

// Enable ISR for review pages - revalidate every 5 minutes
export const revalidate = 300

async function getReview(id: string, userId?: string) {
  const { prisma } = await import("@/lib/prisma")
  
  const review = await prisma.review.findUnique({
    where: { id },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
          industry: true,
          hqLocation: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          school: true,
          major: true,
          gradYear: true,
        },
      },
      votes: {
        include: {
          user: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  })

  if (!review) {
    return null
  }

  // Check if user has voted
  let userVote = null
  if (userId) {
    userVote = review.votes.find((vote) => vote.user.id === userId)
  }

  return {
    ...review,
    currentUserId: userId,
    userVote: userVote ? userVote.value : null,
    helpfulScore: review.votes.filter((v) => v.value === "UP").length,
  }
}

export default async function ReviewPage({
  params,
}: {
  params: { id: string }
}) {
  const { getCurrentUser } = await import("@/lib/session")
  const user = await getCurrentUser()
  const review = await getReview(params.id, (user as any)?.id)

  if (!review || review.status !== "APPROVED") {
    notFound()
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <Link
          href={`/companies/${review.company.slug}`}
          className="text-primary hover:underline mb-2 inline-block"
        >
          ← {review.company.name}
        </Link>
        <h1 className="text-4xl font-bold mb-4">
          {review.roleTitle || "Review"} - {review.season} {review.year}
        </h1>
        <div className="flex gap-4 text-muted-foreground mb-4">
          {review.location && <span>Location: {review.location}</span>}
          {review.difficulty && <span>Difficulty: {review.difficulty}/5</span>}
          {review.outcome && <span>Outcome: {review.outcome}</span>}
          {review.stagesCount && <span>Stages: {review.stagesCount}</span>}
        </div>
        <div className="text-sm text-muted-foreground">
          By {review.user?.name || "Anonymous"}
          {review.user?.school && ` from ${review.user.school}`}
          {review.user?.major && `, ${review.user.major}`}
          {review.user?.gradYear && ` (${review.user.gradYear})`}
        </div>
      </div>

      <div className="space-y-6">
        {review.applicationProcess && (
          <Card>
            <CardHeader>
              <CardTitle>Application Process</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{review.applicationProcess}</p>
            </CardContent>
          </Card>
        )}

        {review.interviewExperience && (
          <Card>
            <CardHeader>
              <CardTitle>Interview Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{review.interviewExperience}</p>
            </CardContent>
          </Card>
        )}

        {review.culture && (
          <Card>
            <CardHeader>
              <CardTitle>Culture</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{review.culture}</p>
            </CardContent>
          </Card>
        )}

        {review.tips && (
          <Card>
            <CardHeader>
              <CardTitle>Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{review.tips}</p>
            </CardContent>
          </Card>
        )}

        {review.overall && (
          <Card>
            <CardHeader>
              <CardTitle>Overall</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{review.overall}</p>
            </CardContent>
          </Card>
        )}

        {(review.payHourly || review.payMonthly || review.payYearly) && (
          <Card>
            <CardHeader>
              <CardTitle>Compensation</CardTitle>
            </CardHeader>
            <CardContent>
              {review.payHourly && (
                <p>Hourly: {review.currency || "$"}{review.payHourly}</p>
              )}
              {review.payMonthly && (
                <p>Monthly: {review.currency || "$"}{review.payMonthly}</p>
              )}
              {review.payYearly && (
                <p>Yearly: {review.currency || "$"}{review.payYearly}</p>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {review.publishedAt && (
              <p>Published: {new Date(review.publishedAt).toLocaleDateString()}</p>
            )}
          </div>
          <div className="flex gap-4">
            <VoteButton
              reviewId={review.id}
              initialVote={review.userVote}
              initialHelpfulCount={review.helpfulScore}
            />
            <ReportButton reviewId={review.id} />
          </div>
        </div>
      </div>
    </div>
  )
}


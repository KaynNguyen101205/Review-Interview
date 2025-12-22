import { redirect, notFound } from "next/navigation"
import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import ReviewForm from "@/components/reviews/ReviewForm"

async function getReview(id: string, userId: string) {
  const review = await prisma.review.findUnique({
    where: { id },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  })

  if (!review || review.userId !== userId) {
    return null
  }

  // Only allow editing if pending or needs_edit
  if (review.status !== "PENDING" && review.status !== "NEEDS_EDIT") {
    return null
  }

  return review
}

async function getCompanies() {
  return await prisma.company.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
    },
    orderBy: { name: "asc" },
  })
}

export default async function EditReviewPage({
  params,
}: {
  params: { id: string }
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const [review, companies] = await Promise.all([
    getReview(params.id, (user as any).id),
    getCompanies(),
  ])

  if (!review) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <h1 className="text-4xl font-bold mb-8">Edit Review</h1>
      <ReviewForm companies={companies} review={review} />
    </div>
  )
}


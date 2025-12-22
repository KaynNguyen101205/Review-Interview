import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import ReviewForm from "@/components/reviews/ReviewForm"

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

export default async function NewReviewPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const companies = await getCompanies()

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <h1 className="text-4xl font-bold mb-8">Write a Review</h1>
      <ReviewForm companies={companies} />
    </div>
  )
}


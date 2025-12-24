import { prisma } from "./prisma"

// Update company cached stats when a review is approved
export async function updateCompanyStats(companyId: string) {
  const reviews = await prisma.review.findMany({
    where: {
      companyId,
      status: "APPROVED",
    },
    select: {
      difficulty: true,
      publishedAt: true,
    },
  })

  const reviewCount = reviews.length
  const difficulties = reviews
    .map((r) => r.difficulty)
    .filter((d): d is number => d !== null && d !== undefined)

  const avgDifficulty =
    difficulties.length > 0
      ? difficulties.reduce((sum, d) => sum + d, 0) / difficulties.length
      : null

  const publishedDates = reviews
    .map((r) => r.publishedAt)
    .filter((d): d is Date => d !== null && d !== undefined)

  const lastReviewAt =
    publishedDates.length > 0
      ? new Date(Math.max(...publishedDates.map((d) => d.getTime())))
      : null

  await prisma.company.update({
    where: { id: companyId },
    data: {
      reviewCount,
      avgDifficulty,
      lastReviewAt,
    },
  })

  return {
    reviewCount,
    avgDifficulty,
    lastReviewAt,
  }
}


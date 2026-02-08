import { notFound } from "next/navigation"
import ReviewCardCollapsible from "@/components/reviews/ReviewCardCollapsible"

// Enable ISR for company pages - revalidate every 5 minutes
export const revalidate = 300

async function getCompany(slug: string) {
  const { prisma } = await import("@/lib/prisma")
  
  const company = await prisma.company.findUnique({
    where: { slug },
    include: {
      reviews: {
        where: { status: "APPROVED" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              school: true,
            },
          },
          votes: true,
        },
        orderBy: { publishedAt: "desc" },
        take: 10,
      },
    },
  })

  if (!company) return null

  const withPay = company.reviews.filter((r) => r.payHourly != null)
  const avgSalaryUsdPerHour =
    withPay.length > 0
      ? withPay.reduce((s, r) => s + Number(r.payHourly), 0) / withPay.length
      : null

  return { ...company, avgSalaryUsdPerHour }
}

export default async function CompanyPage({
  params,
}: {
  params: { slug: string }
}) {
  const company = await getCompany(params.slug)

  if (!company) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{company.name}</h1>
        <div className="flex gap-4 text-muted-foreground">
          {company.industry && <span>Industry: {company.industry}</span>}
          {company.hqLocation && <span>Location: {company.hqLocation}</span>}
          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Website
            </a>
          )}
        </div>
        {company.description && (
          <p className="mt-4 text-lg">{company.description}</p>
        )}
        <div className="mt-4 flex flex-wrap gap-4">
          <span>{company.reviewCount || 0} review{(company.reviewCount || 0) !== 1 ? "s" : ""}</span>
          {company.avgDifficulty && (
            <span>Avg Difficulty: {company.avgDifficulty.toFixed(1)}/5</span>
          )}
          {company.avgSalaryUsdPerHour != null && (
            <span>Avg salary: {company.avgSalaryUsdPerHour.toFixed(0)} USD/hr</span>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Reviews</h2>
        {company.reviews?.length === 0 ? (
          <p className="text-muted-foreground">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {company.reviews?.map((review: any) => (
              <ReviewCardCollapsible
                key={review.id}
                review={{
                  id: review.id,
                  roleTitle: review.roleTitle,
                  outcome: review.outcome,
                  location: review.location,
                  workOption: review.workOption,
                  payHourly: review.payHourly,
                  season: review.season,
                  year: review.year,
                  level: review.level,
                  applicationProcess: review.applicationProcess,
                  interviewExperience: review.interviewExperience,
                  culture: review.culture,
                  tips: review.tips,
                  overall: review.overall,
                  difficulty: review.difficulty,
                  stagesCount: review.stagesCount,
                  interviewType: review.interviewType,
                  publishedAt: review.publishedAt?.toISOString?.() ?? review.publishedAt,
                  company: { id: company.id, name: company.name, slug: company.slug },
                  user: review.user,
                  votes: review.votes,
                }}
                helpfulScore={review.votes?.filter((v: any) => v.value === "UP").length ?? 0}
                showCompanyName={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


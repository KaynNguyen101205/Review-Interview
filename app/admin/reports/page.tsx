import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ReportActions from "@/components/admin/ReportActions"

async function getOpenReports() {
  return await prisma.reviewReport.findMany({
    where: { status: "OPEN" },
    include: {
      review: {
        include: {
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
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

export default async function AdminReportsPage() {
  const user = await getCurrentUser()

  if (!user || (user as any).role !== "ADMIN") {
    redirect("/")
  }

  const reports = await getOpenReports()

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Reports</h1>
        <Link href="/admin">
          <button className="text-primary hover:underline">← Back to Dashboard</button>
        </Link>
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No open reports.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <CardTitle>Report #{report.id.slice(0, 8)}</CardTitle>
                <CardDescription>
                  Reported by: {report.user.name || report.user.email}
                  <br />
                  Review: {report.review.roleTitle || "Review"} at{" "}
                  {report.review.company.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <strong>Reason:</strong> {report.reason}
                  </div>
                  {report.details && (
                    <div>
                      <strong>Details:</strong> {report.details}
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground">
                    <p>
                      Reported: {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/reviews/${report.review.id}`}
                      target="_blank"
                    >
                      <button className="text-primary hover:underline text-sm">
                        View Review
                      </button>
                    </Link>
                  </div>
                  <ReportActions reportId={report.id} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}


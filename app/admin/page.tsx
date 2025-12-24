import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

async function getAdminStats() {
  const [pendingReviews, openReports, pendingRequests] = await Promise.all([
    prisma.review.count({ where: { status: "PENDING" } }),
    prisma.reviewReport.count({ where: { status: "OPEN" } }),
    prisma.companyRequest.count({ where: { status: "PENDING" } }),
  ])

  return {
    pendingReviews,
    openReports,
    pendingRequests,
  }
}

export default async function AdminPage() {
  const user = await getCurrentUser()

  if (!user || (user as any).role !== "ADMIN") {
    redirect("/")
  }

  const stats = await getAdminStats()

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Pending Reviews</CardTitle>
            <CardDescription>Reviews awaiting moderation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pendingReviews}</div>
            <Link href="/admin/reviews">
              <Button variant="outline" className="mt-4 w-full">
                Manage Reviews
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Open Reports</CardTitle>
            <CardDescription>Reports requiring action</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.openReports}</div>
            <Link href="/admin/reports">
              <Button variant="outline" className="mt-4 w-full">
                Manage Reports
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Company Requests</CardTitle>
            <CardDescription>Pending company requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.pendingRequests}</div>
            <Link href="/admin/requests">
              <Button variant="outline" className="mt-4 w-full">
                Manage Requests
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage user roles and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/users">
              <Button variant="outline" className="mt-4 w-full">
                Manage Users
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


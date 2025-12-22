import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import CompanyRequestActions from "@/components/admin/CompanyRequestActions"

async function getPendingRequests() {
  return await prisma.companyRequest.findMany({
    where: { status: "PENDING" },
    include: {
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

export default async function AdminRequestsPage() {
  const user = await getCurrentUser()

  if (!user || (user as any).role !== "ADMIN") {
    redirect("/")
  }

  const requests = await getPendingRequests()

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Company Requests</h1>
        <Link href="/admin">
          <button className="text-primary hover:underline">← Back to Dashboard</button>
        </Link>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No pending requests.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <CardTitle>{request.requestedName}</CardTitle>
                <CardDescription>
                  Requested by: {request.user?.name || request.user?.email || "Anonymous"}
                  {request.contactEmail && ` • Contact: ${request.contactEmail}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {request.website && (
                    <p>
                      <strong>Website:</strong>{" "}
                      <a
                        href={request.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {request.website}
                      </a>
                    </p>
                  )}
                  {request.note && (
                    <p className="text-sm">
                      <strong>Notes:</strong> {request.note}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Submitted: {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                  <CompanyRequestActions requestId={request.id} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}


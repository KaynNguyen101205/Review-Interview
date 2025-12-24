import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import UserRoleManager from "@/components/admin/UserRoleManager"

async function getUsers() {
  return await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          reviews: true,
          reviewReports: true,
          companyRequests: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

export default async function AdminUsersPage() {
  const user = await getCurrentUser()

  if (!user || (user as any).role !== "ADMIN") {
    redirect("/")
  }

  const users = await getUsers()

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Manage Users</h1>
        <Link href="/admin">
          <button className="text-primary hover:underline">
            ← Back to Dashboard
          </button>
        </Link>
      </div>

      {users.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No users found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <Card key={user.id}>
              <CardHeader>
                <CardTitle>{user.name || user.email}</CardTitle>
                <CardDescription>
                  {user.email}
                  {user.name && ` • ${user.name}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-4 text-sm">
                    <div>
                      <strong>Role:</strong> {user.role}
                    </div>
                    <div>
                      <strong>Reviews:</strong> {user._count.reviews}
                    </div>
                    <div>
                      <strong>Reports:</strong> {user._count.reviewReports}
                    </div>
                    <div>
                      <strong>Company Requests:</strong>{" "}
                      {user._count.companyRequests}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Joined: {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                  <UserRoleManager userId={user.id} currentRole={user.role} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}


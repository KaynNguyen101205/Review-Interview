import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/session"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function MePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">My Account</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            {user.name && (
              <p>
                <strong>Name:</strong> {user.name}
              </p>
            )}
            <p>
              <strong>Role:</strong> {(user as any).role || "USER"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your reviews and account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/me/reviews">
              <Button variant="outline" className="w-full">
                My Reviews
              </Button>
            </Link>
            <Link href="/reviews/new">
              <Button className="w-full">Write a Review</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


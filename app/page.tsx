import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Review Platform</h1>
          <p className="text-xl text-muted-foreground">
            Browse companies and read/write internship reviews
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Browse Companies</CardTitle>
              <CardDescription>
                Explore companies and read reviews from students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/companies">
                <Button className="w-full">View Companies</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Read Reviews</CardTitle>
              <CardDescription>
                Discover internship experiences and interview processes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/reviews">
                <Button className="w-full">Browse Reviews</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Request Company</CardTitle>
              <CardDescription>
                Suggest a company to be added to the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/request-company">
                <Button variant="outline" className="w-full">
                  Request Company
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Want to share your experience?
          </p>
          <Link href="/login">
            <Button>Sign In to Write a Review</Button>
          </Link>
        </div>
      </div>
    </main>
  )
}


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "About Us | Review Platform",
  description: "Learn about the Review Platform and our mission to help students find internship experiences.",
}

export default function AboutUsPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">About Us</h1>
          <p className="text-xl text-muted-foreground">
            Helping students make informed decisions about internships
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Our Mission</CardTitle>
              <CardDescription>
                What we&apos;re here for
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-neutral dark:prose-invert max-w-none">
              <p>
                Review Platform is a full-stack web platform built for students to discover companies,
                read real internship experiences, and share their own. We believe that transparent,
                peer-driven reviews help candidates prepare better and choose opportunities that fit them.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What We Offer</CardTitle>
              <CardDescription>
                Features that support your internship journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong className="text-foreground">Public browsing</strong> — Explore companies and reviews without signing in</li>
                <li><strong className="text-foreground">Authenticated reviews</strong> — Sign in with Google or email to write and manage reviews</li>
                <li><strong className="text-foreground">Moderation</strong> — Reviews are moderated to keep content helpful and appropriate</li>
                <li><strong className="text-foreground">Voting</strong> — Mark reviews as helpful so the best insights surface</li>
                <li><strong className="text-foreground">Reporting</strong> — Report inappropriate content for admin review</li>
                <li><strong className="text-foreground">Company requests</strong> — Suggest new companies to be added to the platform</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tech &amp; Transparency</CardTitle>
              <CardDescription>
                How we build and operate
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-neutral dark:prose-invert max-w-none">
              <p>
                We use Next.js, TypeScript, TailwindCSS, Prisma, and PostgreSQL. The platform is designed
                to be deployed on Vercel with a managed database, so we can focus on reliability and
                user experience. If you have feedback or ideas, we&apos;re always improving.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

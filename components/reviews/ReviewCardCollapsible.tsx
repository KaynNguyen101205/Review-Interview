"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, ChevronUp, Check, X, MapPin, Monitor, DollarSign, Calendar, Briefcase } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import VoteButton from "@/components/reviews/VoteButton"
import ReportButton from "@/components/reviews/ReportButton"

export type ReviewForCard = {
  id: string
  roleTitle: string | null
  outcome: string | null
  location: string | null
  workOption: string | null
  payHourly: number | null
  season: string | null
  year: number | null
  level: string | null
  applicationProcess: string | null
  interviewExperience: string | null
  culture: string | null
  tips: string | null
  overall: string | null
  difficulty: number | null
  stagesCount: number | null
  interviewType: string | null
  publishedAt: string | null
  company: { id: string; name: string; slug: string }
  user: { id: string; name: string | null; email: string; school: string | null }
  votes?: { value: string }[]
  currentUserId?: string | null
  userVote?: string | null
}

function formatDateRange(season: string | null, year: number | null): string {
  if (!season && !year) return "–"
  if (season && year) return `${season} ${year}`
  if (year) return String(year)
  return season || "–"
}

export default function ReviewCardCollapsible({
  review,
  helpfulScore = 0,
  showCompanyName = true,
}: {
  review: ReviewForCard
  helpfulScore?: number
  showCompanyName?: boolean
}) {
  const [open, setOpen] = useState(false)
  const receivedOffer = review.outcome === "Accepted"
  const workLabel =
    review.workOption === "ONSITE"
      ? "Onsite"
      : review.workOption === "REMOTE"
        ? "Remote"
        : review.workOption === "HYBRID"
          ? "Hybrid"
          : null

  return (
    <Card
      className={`transition-all ${
        open ? "ring-2 ring-primary/30" : ""
      }`}
    >
      <div
        className="cursor-pointer select-none"
        onClick={() => setOpen(!open)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            setOpen((o) => !o)
          }
        }}
        aria-expanded={open}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg">
                {review.roleTitle || "Review"}
                {showCompanyName && ` @ ${review.company.name}`}
              </CardTitle>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <span
                  className={`inline-flex items-center gap-1 font-medium ${
                    receivedOffer ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {receivedOffer ? (
                    <>
                      <Check className="h-4 w-4" />
                      Received Offer
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4" />
                      No Offer
                    </>
                  )}
                </span>
                {review.location && (
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {review.location}
                  </span>
                )}
                {workLabel && (
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <Monitor className="h-3.5 w-3.5" />
                    {workLabel}
                  </span>
                )}
                {review.payHourly != null && (
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <DollarSign className="h-3.5 w-3.5" />
                    {Number(review.payHourly).toFixed(0)} USD/hr
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDateRange(review.season, review.year)}
                </span>
                {(review.level || review.interviewType) && (
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <Briefcase className="h-3.5 w-3.5" />
                    {[review.level, review.interviewType].filter(Boolean).join(", ")}
                  </span>
                )}
              </div>
              <CardDescription className="mt-1">
                {review.user?.name || review.user?.email}
                {review.user?.school && ` • ${review.user.school}`}
              </CardDescription>
            </div>
            <div className="flex shrink-0 items-center text-muted-foreground">
              {open ? (
                <ChevronUp className="h-5 w-5" aria-hidden />
              ) : (
                <ChevronDown className="h-5 w-5" aria-hidden />
              )}
            </div>
          </div>
        </CardHeader>
      </div>

      {open && (
        <CardContent className="border-t pt-4 space-y-4">
          {review.applicationProcess && (
            <div>
              <h4 className="font-semibold text-sm mb-1">Application Process</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{review.applicationProcess}</p>
            </div>
          )}
          {review.interviewExperience && (
            <div>
              <h4 className="font-semibold text-sm mb-1">Interview Experience</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{review.interviewExperience}</p>
            </div>
          )}
          {review.culture && (
            <div>
              <h4 className="font-semibold text-sm mb-1">Culture</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{review.culture}</p>
            </div>
          )}
          {review.tips && (
            <div>
              <h4 className="font-semibold text-sm mb-1">Tips</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{review.tips}</p>
            </div>
          )}
          {review.overall && (
            <div>
              <h4 className="font-semibold text-sm mb-1">Overall</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{review.overall}</p>
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t">
            <div className="flex items-center gap-4">
              <VoteButton
                reviewId={review.id}
                initialVote={review.userVote ?? null}
                initialHelpfulCount={helpfulScore}
              />
              <ReportButton reviewId={review.id} />
            </div>
            <Link
              href={`/reviews/${review.id}`}
              className="text-sm text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              View full review →
            </Link>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

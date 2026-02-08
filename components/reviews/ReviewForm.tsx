"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface Company {
  id: string
  name: string
  slug: string
}

interface Review {
  id: string
  companyId: string
  level?: string | null
  roleTitle?: string | null
  workOption?: string | null
  location?: string | null
  season?: string | null
  year?: number | null
  stagesCount?: number | null
  interviewType?: string | null
  difficulty?: number | null
  outcome?: string | null
  currency?: string | null
  payHourly?: number | null
  payMonthly?: number | null
  payYearly?: number | null
  applicationProcess?: string | null
  interviewExperience?: string | null
  culture?: string | null
  tips?: string | null
  overall?: string | null
}

interface ReviewFormProps {
  companies: Company[]
  review?: Review
}

export default function ReviewForm({ companies, review }: ReviewFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    companyId: review?.companyId || "",
    level: review?.level || "",
    roleTitle: review?.roleTitle || "",
    workOption: review?.workOption || "",
    location: review?.location || "",
    season: review?.season || "",
    year: review?.year?.toString() || "",
    stagesCount: review?.stagesCount?.toString() || "",
    interviewType: review?.interviewType || "",
    difficulty: review?.difficulty?.toString() || "",
    outcome: review?.outcome || "",
    currency: review?.currency || "USD",
    payHourly: review?.payHourly?.toString() || "",
    payMonthly: review?.payMonthly?.toString() || "",
    payYearly: review?.payYearly?.toString() || "",
    applicationProcess: review?.applicationProcess || "",
    interviewExperience: review?.interviewExperience || "",
    culture: review?.culture || "",
    tips: review?.tips || "",
    overall: review?.overall || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const payload: any = {
        companyId: formData.companyId,
        level: formData.level || null,
        roleTitle: formData.roleTitle || null,
        workOption: formData.workOption && ["ONSITE", "REMOTE", "HYBRID"].includes(formData.workOption) ? formData.workOption : null,
        location: formData.location || null,
        season: formData.season || null,
        year: formData.year ? parseInt(formData.year, 10) : null,
        stagesCount: formData.stagesCount
          ? parseInt(formData.stagesCount, 10)
          : null,
        interviewType: formData.interviewType || null,
        difficulty: formData.difficulty ? parseInt(formData.difficulty, 10) : null,
        outcome: formData.outcome || null,
        currency: formData.currency || null,
        payHourly: formData.payHourly ? parseFloat(formData.payHourly) : null,
        payMonthly: formData.payMonthly
          ? parseFloat(formData.payMonthly)
          : null,
        payYearly: formData.payYearly ? parseFloat(formData.payYearly) : null,
        applicationProcess: formData.applicationProcess || null,
        interviewExperience: formData.interviewExperience || null,
        culture: formData.culture || null,
        tips: formData.tips || null,
        overall: formData.overall || null,
      }

      const url = review
        ? `/api/reviews/${review.id}`
        : "/api/reviews"
      const method = review ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit review")
      }

      // Show success message and redirect
      alert(
        review
          ? "Review updated successfully! It will be reviewed by an admin."
          : "Review submitted successfully! Your review is pending approval and will be reviewed by an admin."
      )

      // Redirect to my reviews page
      router.push("/me/reviews")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{review ? "Edit Review" : "Write a Review"}</CardTitle>
        <CardDescription>
          {review
            ? "Update your review details"
            : "Share your internship experience. Your review will be pending approval."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="companyId">Company *</Label>
            <select
              id="companyId"
              value={formData.companyId}
              onChange={(e) =>
                setFormData({ ...formData, companyId: e.target.value })
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
              disabled={isSubmitting || !!review}
            >
              <option value="">Select a company</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="roleTitle">Role Title</Label>
              <Input
                id="roleTitle"
                value={formData.roleTitle}
                onChange={(e) =>
                  setFormData({ ...formData, roleTitle: e.target.value })
                }
                placeholder="e.g., Software Engineering Intern"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Level</Label>
              <select
                id="level"
                value={formData.level}
                onChange={(e) =>
                  setFormData({ ...formData, level: e.target.value })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={isSubmitting}
              >
                <option value="">Select level</option>
                <option value="Intern">Intern</option>
                <option value="New Grad">New Grad</option>
                <option value="Entry Level">Entry Level</option>
                <option value="Mid Level">Mid Level</option>
                <option value="Senior">Senior</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="season">Season</Label>
              <select
                id="season"
                value={formData.season}
                onChange={(e) =>
                  setFormData({ ...formData, season: e.target.value })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={isSubmitting}
              >
                <option value="">Select season</option>
                <option value="Summer">Summer</option>
                <option value="Fall">Fall</option>
                <option value="Winter">Winter</option>
                <option value="Spring">Spring</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: e.target.value })
                }
                placeholder="e.g., 2024"
                min="2000"
                max="2100"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="e.g., San Francisco, CA"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workOption">Work option</Label>
              <select
                id="workOption"
                value={formData.workOption}
                onChange={(e) =>
                  setFormData({ ...formData, workOption: e.target.value })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={isSubmitting}
              >
                <option value="">Select</option>
                <option value="ONSITE">Onsite</option>
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="interviewType">Interview Type</Label>
              <select
                id="interviewType"
                value={formData.interviewType}
                onChange={(e) =>
                  setFormData({ ...formData, interviewType: e.target.value })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={isSubmitting}
              >
                <option value="">Select type</option>
                <option value="Virtual">Virtual</option>
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stagesCount">Number of Stages</Label>
              <Input
                id="stagesCount"
                type="number"
                value={formData.stagesCount}
                onChange={(e) =>
                  setFormData({ ...formData, stagesCount: e.target.value })
                }
                placeholder="e.g., 3"
                min="1"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty (1-5)</Label>
              <Input
                id="difficulty"
                type="number"
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData({ ...formData, difficulty: e.target.value })
                }
                placeholder="1-5"
                min="1"
                max="5"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="outcome">Outcome</Label>
              <select
                id="outcome"
                value={formData.outcome}
                onChange={(e) =>
                  setFormData({ ...formData, outcome: e.target.value })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                disabled={isSubmitting}
              >
                <option value="">Select outcome</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
                <option value="Withdrew">Withdrew</option>
                <option value="No Response">No Response</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Salary (USD per hour only)</Label>
            <Input
              id="payHourly"
              type="number"
              step="0.01"
              min="0"
              value={formData.payHourly}
              onChange={(e) =>
                setFormData({ ...formData, payHourly: e.target.value })
              }
              placeholder="e.g., 50"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Average salary in US dollars per hour
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="applicationProcess">Application Process</Label>
            <Textarea
              id="applicationProcess"
              value={formData.applicationProcess}
              onChange={(e) =>
                setFormData({ ...formData, applicationProcess: e.target.value })
              }
              rows={4}
              placeholder="Describe the application process..."
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interviewExperience">Interview Experience</Label>
            <Textarea
              id="interviewExperience"
              value={formData.interviewExperience}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  interviewExperience: e.target.value,
                })
              }
              rows={4}
              placeholder="Describe your interview experience..."
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="culture">Culture</Label>
            <Textarea
              id="culture"
              value={formData.culture}
              onChange={(e) =>
                setFormData({ ...formData, culture: e.target.value })
              }
              rows={3}
              placeholder="Describe the company culture..."
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tips">Tips</Label>
            <Textarea
              id="tips"
              value={formData.tips}
              onChange={(e) =>
                setFormData({ ...formData, tips: e.target.value })
              }
              rows={3}
              placeholder="Share any tips for future applicants..."
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="overall">Overall Experience</Label>
            <Textarea
              id="overall"
              value={formData.overall}
              onChange={(e) =>
                setFormData({ ...formData, overall: e.target.value })
              }
              rows={4}
              placeholder="Share your overall experience..."
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-md">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Submitting..."
                : review
                  ? "Update Review"
                  : "Submit Review"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}


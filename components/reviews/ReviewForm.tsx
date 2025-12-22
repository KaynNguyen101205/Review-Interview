"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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

const reviewSchema = z.object({
  companyId: z.string().min(1, "Company is required"),
  roleTitle: z.string().min(1, "Role title is required"),
  level: z.string().optional(),
  location: z.string().optional(),
  season: z.string().optional(),
  year: z.number().min(2000).max(2100).optional(),
  stagesCount: z.number().min(1).optional(),
  interviewType: z.string().optional(),
  difficulty: z.number().min(1).max(5).optional(),
  outcome: z.string().optional(),
  currency: z.string().optional(),
  payHourly: z.number().optional(),
  payMonthly: z.number().optional(),
  payYearly: z.number().optional(),
  applicationProcess: z.string().optional(),
  interviewExperience: z.string().optional(),
  culture: z.string().optional(),
  tips: z.string().optional(),
  overall: z.string().optional(),
})

type ReviewFormData = z.infer<typeof reviewSchema>

interface ReviewFormProps {
  companies: Array<{ id: string; name: string; slug: string }>
  review?: any
}

export default function ReviewForm({ companies, review }: ReviewFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: review
      ? {
          companyId: review.companyId,
          roleTitle: review.roleTitle || "",
          level: review.level || "",
          location: review.location || "",
          season: review.season || "",
          year: review.year || undefined,
          stagesCount: review.stagesCount || undefined,
          interviewType: review.interviewType || "",
          difficulty: review.difficulty || undefined,
          outcome: review.outcome || "",
          currency: review.currency || "",
          payHourly: review.payHourly || undefined,
          payMonthly: review.payMonthly || undefined,
          payYearly: review.payYearly || undefined,
          applicationProcess: review.applicationProcess || "",
          interviewExperience: review.interviewExperience || "",
          culture: review.culture || "",
          tips: review.tips || "",
          overall: review.overall || "",
        }
      : {},
  })

  const onSubmit = async (data: ReviewFormData) => {
    setIsSubmitting(true)
    setError("")

    try {
      const url = review
        ? `/api/reviews/${review.id}`
        : "/api/reviews"
      const method = review ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save review")
      }

      router.push("/me/reviews")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Tell us about the position you&apos;re reviewing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyId">Company *</Label>
            <select
              id="companyId"
              {...register("companyId")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              disabled={!!review}
            >
              <option value="">Select a company</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
            {errors.companyId && (
              <p className="text-sm text-destructive">
                {errors.companyId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="roleTitle">Role Title *</Label>
            <Input
              id="roleTitle"
              {...register("roleTitle")}
              placeholder="e.g., Software Engineering Intern"
            />
            {errors.roleTitle && (
              <p className="text-sm text-destructive">
                {errors.roleTitle.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="level">Level</Label>
              <Input
                id="level"
                {...register("level")}
                placeholder="e.g., Intern, New Grad"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                {...register("location")}
                placeholder="e.g., San Francisco, CA"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="season">Season</Label>
              <select
                id="season"
                {...register("season")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                {...register("year", { valueAsNumber: true })}
                placeholder="e.g., 2024"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Interview Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="stagesCount">Number of Stages</Label>
              <Input
                id="stagesCount"
                type="number"
                {...register("stagesCount", { valueAsNumber: true })}
                placeholder="e.g., 3"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interviewType">Interview Type</Label>
              <Input
                id="interviewType"
                {...register("interviewType")}
                placeholder="e.g., Virtual, On-site"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty (1-5)</Label>
              <Input
                id="difficulty"
                type="number"
                min="1"
                max="5"
                {...register("difficulty", { valueAsNumber: true })}
                placeholder="1-5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="outcome">Outcome</Label>
              <Input
                id="outcome"
                {...register("outcome")}
                placeholder="e.g., Accepted, Rejected"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Compensation (Optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input
              id="currency"
              {...register("currency")}
              placeholder="e.g., USD"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="payHourly">Hourly Rate</Label>
              <Input
                id="payHourly"
                type="number"
                step="0.01"
                {...register("payHourly", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payMonthly">Monthly</Label>
              <Input
                id="payMonthly"
                type="number"
                step="0.01"
                {...register("payMonthly", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payYearly">Yearly</Label>
              <Input
                id="payYearly"
                type="number"
                step="0.01"
                {...register("payYearly", { valueAsNumber: true })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Experience</CardTitle>
          <CardDescription>
            Share your experience with the application and interview process
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="applicationProcess">Application Process</Label>
            <Textarea
              id="applicationProcess"
              {...register("applicationProcess")}
              rows={4}
              placeholder="Describe the application process..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interviewExperience">Interview Experience</Label>
            <Textarea
              id="interviewExperience"
              {...register("interviewExperience")}
              rows={4}
              placeholder="Describe your interview experience..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="culture">Company Culture</Label>
            <Textarea
              id="culture"
              {...register("culture")}
              rows={4}
              placeholder="Share your thoughts on company culture..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tips">Tips</Label>
            <Textarea
              id="tips"
              {...register("tips")}
              rows={4}
              placeholder="Any tips for future applicants?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="overall">Overall</Label>
            <Textarea
              id="overall"
              {...register("overall")}
              rows={4}
              placeholder="Overall thoughts and summary..."
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-md">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
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

      {!review && (
        <p className="text-sm text-muted-foreground">
          Your review will be submitted for moderation and will appear after
          approval.
        </p>
      )}
    </form>
  )
}


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
  website?: string | null
  logoUri?: string | null
  industry?: string | null
  hqLocation?: string | null
  description?: string | null
}

interface CompanyFormProps {
  company?: Company
}

export default function CompanyForm({ company }: CompanyFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState({
    name: company?.name || "",
    website: company?.website || "",
    logoUri: company?.logoUri || "",
    industry: company?.industry || "",
    hqLocation: company?.hqLocation || "",
    description: company?.description || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const payload: any = {
        name: formData.name.trim(),
        website: formData.website?.trim() || null,
        logoUri: formData.logoUri?.trim() || null,
        industry: formData.industry?.trim() || null,
        hqLocation: formData.hqLocation?.trim() || null,
        description: formData.description?.trim() || null,
      }

      const url = company ? `/api/companies/${company.slug}` : "/api/companies"
      const method = company ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save company")
      }

      router.refresh()
      if (!company) {
        // Reset form for new company
        setFormData({
          name: "",
          website: "",
          logoUri: "",
          industry: "",
          hqLocation: "",
          description: "",
        })
      } else {
        setShowForm(false)
      }
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (company && !showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="text-primary hover:underline text-sm"
      >
        Edit
      </button>
    )
  }

  return (
    <Card className={company ? "" : "mb-4"}>
      <CardHeader>
        <CardTitle>{company ? "Edit Company" : "Create Company"}</CardTitle>
        <CardDescription>
          {company
            ? "Update company information"
            : "Add a new company to the platform"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Company Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                placeholder="https://example.com"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logoUri">Logo URI</Label>
              <Input
                id="logoUri"
                type="url"
                value={formData.logoUri}
                onChange={(e) =>
                  setFormData({ ...formData, logoUri: e.target.value })
                }
                placeholder="https://example.com/logo.png"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) =>
                  setFormData({ ...formData, industry: e.target.value })
                }
                placeholder="e.g., Technology"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hqLocation">HQ Location</Label>
              <Input
                id="hqLocation"
                value={formData.hqLocation}
                onChange={(e) =>
                  setFormData({ ...formData, hqLocation: e.target.value })
                }
                placeholder="e.g., San Francisco, CA"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              placeholder="Company description..."
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
                ? "Saving..."
                : company
                  ? "Update Company"
                  : "Create Company"}
            </Button>
            {company && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setError("")
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}


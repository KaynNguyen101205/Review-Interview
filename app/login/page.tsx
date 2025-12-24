"use client"

import { useState } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect } from "react"

export default function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [school, setSchool] = useState("")
  const [gradYear, setGradYear] = useState<string>("")
  const [major, setMajor] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { data: session, status } = useSession()
  const router = useRouter()

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/me")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="container mx-auto py-8 px-4 max-w-md">
        <Card>
          <CardContent className="pt-6">
            <p>Loading...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === "authenticated") {
    return null // Will redirect via useEffect
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
      } else {
        router.push("/me")
        router.refresh()
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError("")
    try {
      await signIn("google", { callbackUrl: "/me" })
    } catch (err) {
      setError("An error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          name: name || undefined,
          school: school || undefined,
          gradYear: gradYear ? parseInt(gradYear, 10) : undefined,
          major: major || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.error || "Registration failed")
        return
      }

      // Auto sign in after successful registration
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Registration successful, but auto sign-in failed. Please try signing in.")
      } else {
        router.push("/me")
        router.refresh()
      }
    } catch (err) {
      setError("An error occurred during registration. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>{isRegistering ? "Sign Up" : "Sign In"}</CardTitle>
          <CardDescription>
            {isRegistering
              ? "Create an account to get started"
              : "Sign in to submit reviews and manage your account"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 border-b">
            <button
              type="button"
              onClick={() => setIsRegistering(false)}
              className={`px-4 py-2 font-medium ${
                !isRegistering
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsRegistering(true)}
              className={`px-4 py-2 font-medium ${
                isRegistering
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          {!isRegistering ? (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg-email">Email</Label>
                <Input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password">Password</Label>
                <Input
                  id="reg-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name (optional)</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="school">School (optional)</Label>
                <Input
                  id="school"
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gradYear">Grad Year (optional)</Label>
                  <Input
                    id="gradYear"
                    type="number"
                    value={gradYear}
                    onChange={(e) => setGradYear(e.target.value)}
                    min="1900"
                    max="2100"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="major">Major (optional)</Label>
                  <Input
                    id="major"
                    type="text"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Registering..." : "Sign Up"}
              </Button>
            </form>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            Google
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}


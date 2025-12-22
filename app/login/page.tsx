"use client"

import { signIn, useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [school, setSchool] = useState("")
  const [gradYear, setGradYear] = useState("")
  const [major, setMajor] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/me")
    }
  }, [status, router])

  // Show loading while checking session
  if (status === "loading") {
    return (
      <div className="container mx-auto py-8 px-4 max-w-md">
        <Card>
          <CardContent className="py-8 text-center">
            <p>Loading...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Don't render login form if already authenticated (redirect will happen)
  if (status === "authenticated") {
    return null
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

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
          gradYear: gradYear ? parseInt(gradYear) : undefined,
          major: major || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to create account")
        return
      }

      setSuccess("Account created successfully! Signing you in...")
      
      // Automatically sign in after successful registration
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Account created but sign in failed. Please try signing in manually.")
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

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

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
    await signIn("google", { callbackUrl: "/me" })
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>{isSignUp ? "Sign Up" : "Sign In"}</CardTitle>
          <CardDescription>
            {isSignUp
              ? "Create an account to submit reviews and manage your profile"
              : "Sign in to submit reviews and manage your account"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Toggle between Sign In and Sign Up */}
          <div className="flex gap-2 border-b">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false)
                setError("")
                setSuccess("")
              }}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                !isSignUp
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true)
                setError("")
                setSuccess("")
              }}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                isSignUp
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form
            onSubmit={isSignUp ? handleSignUp : handleEmailLogin}
            className="space-y-4"
          >
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name">Name (Optional)</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            )}
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
                minLength={isSignUp ? 6 : undefined}
              />
              {isSignUp && (
                <p className="text-xs text-muted-foreground">
                  Password must be at least 6 characters
                </p>
              )}
            </div>
            {isSignUp && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="school">School (Optional)</Label>
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
                    <Label htmlFor="gradYear">Graduation Year (Optional)</Label>
                    <Input
                      id="gradYear"
                      type="number"
                      value={gradYear}
                      onChange={(e) => setGradYear(e.target.value)}
                      disabled={isLoading}
                      min="2000"
                      max="2100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="major">Major (Optional)</Label>
                    <Input
                      id="major"
                      type="text"
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading
                ? isSignUp
                  ? "Creating account..."
                  : "Signing in..."
                : isSignUp
                ? "Sign Up"
                : "Sign In"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
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


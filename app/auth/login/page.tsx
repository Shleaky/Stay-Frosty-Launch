"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Info } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, signIn, isLoading: authLoading } = useAuth()
  const { toast } = useToast()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasRedirected, setHasRedirected] = useState(false)

  // Get message and next from URL params
  const message = searchParams.get("message")
  const next = searchParams.get("next")

  // Redirect if already logged in (but only once)
  useEffect(() => {
    if (user && !hasRedirected && !authLoading) {
      console.log("User already logged in, redirecting...")
      setHasRedirected(true)
      const redirectTo = next || "/profile"
      router.replace(redirectTo)
    }
  }, [user, router, next, hasRedirected, authLoading])

  // Show message based on URL params
  useEffect(() => {
    if (message === "signed_out") {
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      })
    } else if (message === "error") {
      toast({
        title: "Session expired",
        description: "Please sign in again to continue.",
        variant: "destructive",
      })
    }
  }, [message, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isLoading || hasRedirected) return

    setIsLoading(true)
    setError(null)

    try {
      console.log("Attempting login...")
      const { data, error } = await signIn(email, password)

      if (error) {
        console.error("Login error:", error)
        setError(error.message)
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        })
      } else if (data?.user) {
        console.log("Login successful, user:", data.user.email)

        toast({
          title: "Login Successful!",
          description: "You have been logged in successfully.",
        })

        // Set redirect flag and redirect
        setHasRedirected(true)
        const redirectTo = next || "/profile"
        router.replace(redirectTo)
      }
    } catch (err) {
      console.error("Unexpected login error:", err)
      setError("An unexpected error occurred")
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading while checking authentication or if already redirected
  if (authLoading || (user && !hasRedirected)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-slushie-blue"></div>
          <p className="mt-2 text-sm text-muted-foreground">{user ? "Redirecting..." : "Loading..."}</p>
        </div>
      </div>
    )
  }

  // Don't render form if user is logged in
  if (user) {
    return null
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black py-12">
      <div className="relative w-full max-w-md px-4">
        <div className="absolute inset-0 z-0 opacity-30 splatter-bg"></div>
        <Card className="relative z-10 border border-white/10 bg-black/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              <span className="bg-gradient-to-r from-slushie-green via-slushie-blue to-slushie-pink bg-clip-text text-transparent">
                Log In
              </span>
            </CardTitle>
            <CardDescription className="text-center">Enter your credentials to access your account</CardDescription>
          </CardHeader>

          {next && (
            <div className="px-6 pb-4">
              <Alert className="border-slushie-blue/50 bg-slushie-blue/10">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-slushie-blue">
                  Please log in to access{" "}
                  {next === "/profile" ? "your profile" : next === "/bookings" ? "your bookings" : "this page"}.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-black/50 border-white/20"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-black/50 border-white/20"
                  disabled={isLoading}
                />
              </div>

              {error && <div className="rounded-md bg-red-500/20 p-3 text-sm text-red-500">{error}</div>}
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-slushie-green via-slushie-blue to-slushie-pink text-black font-bold splash-button"
                disabled={isLoading || hasRedirected}
              >
                {isLoading ? "Logging in..." : "Log In"}
              </Button>

              <div className="text-center text-sm">
                Don't have an account?{" "}
                <Link
                  href={`/auth/signup${next ? `?next=${encodeURIComponent(next)}` : ""}`}
                  className="text-slushie-green hover:underline"
                >
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

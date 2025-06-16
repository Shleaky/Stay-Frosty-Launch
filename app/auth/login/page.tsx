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

  // Get message and next from URL params
  const message = searchParams.get("message")
  const next = searchParams.get("next")

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      console.log("User already logged in, redirecting...")
      const redirectTo = next || "/profile"
      router.replace(redirectTo)
    }
  }, [user, router, next, authLoading])

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

    if (isLoading) return

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

        // Redirect
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

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
          <p className="mt-2 text-sm text-gray-400">Loading...</p>
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
        <Card className="border border-gray-700 bg-gray-900">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-white">Log In</CardTitle>
            <CardDescription className="text-center text-gray-400">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>

          {next && (
            <div className="px-6 pb-4">
              <Alert className="border-blue-500/50 bg-blue-500/10">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-blue-400">
                  Please log in to access{" "}
                  {next === "/profile" ? "your profile" : next === "/bookings" ? "your bookings" : "this page"}.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-gray-800 border-gray-600 text-white"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-gray-800 border-gray-600 text-white"
                  disabled={isLoading}
                />
              </div>

              {error && <div className="rounded-md bg-red-500/20 p-3 text-sm text-red-400">{error}</div>}
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Log In"}
              </Button>

              <div className="text-center text-sm text-gray-400">
                Don't have an account?{" "}
                <Link
                  href={`/auth/signup${next ? `?next=${encodeURIComponent(next)}` : ""}`}
                  className="text-blue-400 hover:underline"
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

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
import { Info, Mail } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, signIn, isLoading: authLoading, resendConfirmation } = useAuth()
  const { toast } = useToast()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false) // Renamed from isLoading to avoid conflict
  const [formError, setFormError] = useState<string | null>(null) // Renamed from error
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  const [confirmationEmail, setConfirmationEmail] = useState("")
  const [isResending, setIsResending] = useState(false)

  const nextRedirectUrl = searchParams.get("next") || "/profile"
  const message = searchParams.get("message")

  useEffect(() => {
    // Middleware should handle redirecting authenticated users away from login.
    // This client-side check is a fallback or for scenarios where middleware might not run (e.g. static export).
    if (!authLoading && user) {
      console.log("LoginPage: User already authenticated, redirecting to", nextRedirectUrl)
      router.replace(nextRedirectUrl)
    }
  }, [user, authLoading, router, nextRedirectUrl])

  useEffect(() => {
    if (message === "signed_out") {
      toast({ title: "Signed out successfully" })
    } else if (message === "confirmation_pending") {
      toast({ title: "Confirmation Pending", description: "Please check your email to confirm your account." })
    }
  }, [message, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    setFormError(null)
    setNeedsConfirmation(false)

    try {
      const { data, error: signInError } = await signIn(email, password)

      if (signInError) {
        console.error("Login error:", signInError)
        setFormError(signInError.message)
        // @ts-ignore - checking for custom property
        if (signInError.needsConfirmation) {
          setNeedsConfirmation(true)
          // @ts-ignore
          setConfirmationEmail(signInError.email || email)
        }
        toast({ title: "Login Failed", description: signInError.message, variant: "destructive" })
      } else if (data?.user) {
        console.log("Login successful, user:", data.user.email)
        toast({ title: "Login Successful!", description: "Redirecting..." })
        // Redirect is handled by middleware or useEffect above after user state updates
        // router.replace(nextRedirectUrl); // Avoid direct redirect here, let useEffect handle it
      }
    } catch (err) {
      console.error("Unexpected login error:", err)
      const unexpectedErrorMsg = "An unexpected error occurred during login."
      setFormError(unexpectedErrorMsg)
      toast({ title: "Error", description: unexpectedErrorMsg, variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendConfirmation = async () => {
    if (!confirmationEmail) {
      toast({ title: "Error", description: "Email for confirmation not found.", variant: "destructive" })
      return
    }
    setIsResending(true)
    try {
      const { error: resendError } = await resendConfirmation(confirmationEmail)
      if (resendError) {
        toast({ title: "Error", description: resendError.message, variant: "destructive" })
      } else {
        toast({ title: "Confirmation Email Sent", description: "Please check your email." })
        setNeedsConfirmation(false)
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to resend confirmation email.", variant: "destructive" })
    } finally {
      setIsResending(false)
    }
  }

  if (authLoading && !user) {
    // Show loading only if not yet authenticated
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-slushie-blue"></div>
      </div>
    )
  }

  // If user becomes available while on this page, useEffect will redirect.
  // Avoid rendering the form if user is already set.
  if (user) return null

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

          {searchParams.get("next") && ( // Check original 'next' from URL, not the stateful one
            <div className="px-6 pb-4">
              <Alert className="border-slushie-blue/50 bg-slushie-blue/10">
                <Info className="h-4 w-4" />
                <AlertDescription className="text-slushie-blue">Please log in to continue.</AlertDescription>
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                />
              </div>
              {formError && <div className="rounded-md bg-red-500/20 p-3 text-sm text-red-500">{formError}</div>}
              {needsConfirmation && (
                <div className="rounded-md bg-yellow-500/20 p-3 text-sm text-yellow-600 border border-yellow-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="h-4 w-4" />
                    <span className="font-medium">Email Confirmation Required</span>
                  </div>
                  <p className="mb-3">
                    Your email address needs to be confirmed. Please check your email for the confirmation link.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResendConfirmation}
                    disabled={isResending}
                    className="bg-yellow-500/10 border-yellow-500/30 text-yellow-600 hover:bg-yellow-500/20"
                  >
                    {isResending ? "Sending..." : "Resend Confirmation Email"}
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-slushie-green via-slushie-blue to-slushie-pink text-black font-bold splash-button"
                disabled={isSubmitting || authLoading}
              >
                {isSubmitting ? "Logging in..." : "Log In"}
              </Button>
              <div className="text-center text-sm">
                Don't have an account?{" "}
                <Link
                  href={`/auth/signup${searchParams.get("next") ? `?next=${encodeURIComponent(searchParams.get("next")!)}` : ""}`}
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

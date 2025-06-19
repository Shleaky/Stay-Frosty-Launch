"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { AlertTriangle, Mail, RefreshCw } from "lucide-react"

export default function ConfirmErrorPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { resendConfirmation } = useAuth()
  const { toast } = useToast()

  const [email, setEmail] = useState("")
  const [isResending, setIsResending] = useState(false)
  const [hashParams, setHashParams] = useState<URLSearchParams | null>(null)

  // Parse hash parameters from URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.substring(1) // Remove the #
      if (hash) {
        const params = new URLSearchParams(hash)
        setHashParams(params)
        console.log("Hash parameters found:", Object.fromEntries(params.entries()))
      }
    }
  }, [])

  // Get error details from either query params or hash params
  const getErrorDetails = () => {
    // First check hash parameters (from Supabase redirect)
    if (hashParams) {
      const error = hashParams.get("error")
      const error_code = hashParams.get("error_code")
      const error_description = hashParams.get("error_description")

      if (error || error_code || error_description) {
        return {
          error: error || error_code || "unknown_error",
          description: error_description || "Unknown authentication error",
          isHashError: true,
        }
      }
    }

    // Fallback to query parameters
    const error = searchParams.get("error") || "unknown_error"
    return {
      error,
      description: error,
      isHashError: false,
    }
  }

  const { error, description, isHashError } = getErrorDetails()

  const getErrorMessage = () => {
    if (error === "server_error" || error.includes("server_error")) {
      return {
        title: "Server Error During Confirmation",
        message:
          "There was a server error while confirming your email. This is usually a temporary issue with the authentication service.",
        suggestion: "Please try requesting a new confirmation email, or contact support if the problem persists.",
        canResend: true,
      }
    }

    if (error === "unexpected_failure" || description.includes("Error confirming user")) {
      return {
        title: "Email Confirmation Failed",
        message:
          "Your email confirmation could not be processed. This might be due to an expired link or a server issue.",
        suggestion: "Please request a new confirmation email to complete your account setup.",
        canResend: true,
      }
    }

    if (error === "no_code_provided") {
      return {
        title: "Invalid Confirmation Link",
        message: "The confirmation link appears to be invalid or incomplete.",
        suggestion: "Please request a new confirmation email.",
        canResend: true,
      }
    }

    return {
      title: "Authentication Error",
      message: description || "An unknown error occurred during authentication.",
      suggestion: "Please try again or contact support if the problem persists.",
      canResend: false,
    }
  }

  const errorInfo = getErrorMessage()

  const handleResendConfirmation = async () => {
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to resend the confirmation.",
        variant: "destructive",
      })
      return
    }

    setIsResending(true)

    try {
      const { error } = await resendConfirmation(email)

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Confirmation Email Sent",
          description: "Please check your email for a new confirmation link.",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to resend confirmation email",
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black py-12">
      <div className="relative w-full max-w-md px-4">
        <div className="absolute inset-0 z-0 opacity-30 splatter-bg"></div>
        <Card className="relative z-10 border border-white/10 bg-black/80 backdrop-blur-sm">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              <span className="text-red-500">{errorInfo.title}</span>
            </CardTitle>
            <CardDescription className="text-center">{errorInfo.message}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Alert className="border-yellow-500/50 bg-yellow-500/10">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-yellow-500">{errorInfo.suggestion}</AlertDescription>
            </Alert>

            {isHashError && (
              <Alert className="border-blue-500/50 bg-blue-500/10">
                <AlertDescription className="text-blue-500 text-xs">
                  <strong>Technical Details:</strong> Error received via URL hash parameters
                  <br />
                  Error: {error}
                  {description !== error && (
                    <>
                      <br />
                      Description: {description}
                    </>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {errorInfo.canResend && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>Request a new confirmation email:</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-3 py-2 bg-black/50 border border-white/20 rounded-md text-sm"
                  />
                  <Button
                    onClick={handleResendConfirmation}
                    disabled={isResending}
                    size="sm"
                    className="bg-slushie-blue hover:bg-slushie-blue/80"
                  >
                    {isResending ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Send"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              asChild
              className="w-full bg-slushie-blue hover:bg-slushie-blue/80 text-white font-bold splash-button"
            >
              <Link href="/auth/login">Try Logging In</Link>
            </Button>

            <div className="text-center text-sm">
              <Link href="/" className="text-slushie-green hover:underline">
                Return to Home
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

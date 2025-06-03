"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { checkEmailExists } from "@/app/actions/auth-actions"
import { AlertCircle, Mail } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const { signUp } = useAuth()
  const { toast } = useToast()

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [receiveMarketing, setReceiveMarketing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailExists, setEmailExists] = useState(false)
  const [checkingEmail, setCheckingEmail] = useState(false)

  const handleEmailBlur = async () => {
    if (!email.trim()) return

    setCheckingEmail(true)
    setEmailExists(false)
    setError(null)

    try {
      const { exists, error: checkError } = await checkEmailExists(email)

      if (checkError) {
        console.error("Error checking email:", checkError)
        return
      }

      if (exists) {
        setEmailExists(true)
        setError("This email address is already registered.")
      }
    } catch (err) {
      console.error("Unexpected error checking email:", err)
    } finally {
      setCheckingEmail(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      console.log("Submitting signup form:", { fullName, email, phone, receiveMarketing })

      // Validate inputs
      if (!fullName.trim()) {
        throw new Error("Full name is required")
      }

      if (!email.trim()) {
        throw new Error("Email is required")
      }

      if (!phone.trim()) {
        throw new Error("Phone number is required")
      }

      if (!password.trim() || password.length < 6) {
        throw new Error("Password must be at least 6 characters")
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match")
      }

      // Check email exists before attempting signup
      const { exists, error: checkError } = await checkEmailExists(email)

      if (checkError) {
        throw new Error("Failed to verify email. Please try again.")
      }

      if (exists) {
        setEmailExists(true)
        setError("This email address is already registered.")
        toast({
          title: "Email Already Registered",
          description: "Please log in with this email or use a different email address.",
          variant: "destructive",
        })
        return
      }

      const userData = {
        full_name: fullName,
        phone,
        receive_marketing: receiveMarketing,
      }

      console.log("Calling signUp with:", { email, password, userData })

      const { data, error: signUpError } = await signUp(email, password, userData)

      if (signUpError) {
        console.error("SignUp error:", signUpError)
        setError(signUpError.message)
        toast({
          title: "Error",
          description: signUpError.message,
          variant: "destructive",
        })
      } else {
        console.log("SignUp successful:", data)
        toast({
          title: "Success!",
          description: "Check your email for a confirmation link to complete your signup.",
        })
        router.push("/auth/verify")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      console.error("Signup error:", err)
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black py-12">
      <div className="relative w-full max-w-md px-4">
        <div className="absolute inset-0 z-0 opacity-30 splatter-bg"></div>
        <Card className="relative z-10 border border-white/10 bg-black/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              <span className="bg-gradient-to-r from-slushie-green via-slushie-blue to-slushie-pink bg-clip-text text-transparent">
                Create an Account
              </span>
            </CardTitle>
            <CardDescription className="text-center">
              Sign up to book slushie machine rentals and manage your bookings
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="bg-black/50 border-white/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setEmailExists(false) // Reset email exists state when user types
                    setError(null)
                  }}
                  onBlur={handleEmailBlur}
                  required
                  className={`bg-black/50 border-white/20 ${emailExists ? "border-red-500" : ""}`}
                />
                {checkingEmail && <p className="text-sm text-gray-400">Checking email availability...</p>}
                {emailExists && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    This email is already registered
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="bg-black/50 border-white/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password (min. 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-black/50 border-white/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-black/50 border-white/20"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="marketing"
                  checked={receiveMarketing}
                  onCheckedChange={(checked) => setReceiveMarketing(checked === true)}
                />
                <Label htmlFor="marketing" className="text-sm font-normal">
                  Receive emails for Discounts and Deals
                </Label>
              </div>

              {emailExists && (
                <Alert className="border-yellow-500/50 bg-yellow-500/10">
                  <Mail className="h-4 w-4" />
                  <AlertDescription className="text-yellow-200">
                    This email address is already registered. You can either:
                    <div className="mt-2 space-y-1">
                      <div>
                        •{" "}
                        <Link href="/auth/login" className="text-slushie-blue hover:underline font-medium">
                          Log in with this email
                        </Link>
                      </div>
                      <div>• Use a different email address to create a new account</div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {error && !emailExists && (
                <div className="rounded-md bg-red-500/20 p-3 text-sm text-red-500 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-slushie-green via-slushie-blue to-slushie-pink text-black font-bold splash-button"
                disabled={isLoading || emailExists || checkingEmail}
              >
                {isLoading ? "Creating Account..." : "Sign Up"}
              </Button>

              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-slushie-blue hover:underline">
                  Log in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

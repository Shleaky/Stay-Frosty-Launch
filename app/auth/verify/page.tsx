"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MailCheck } from "lucide-react"

export default function VerifyPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black py-12">
      <div className="relative w-full max-w-md px-4">
        <div className="absolute inset-0 z-0 opacity-30 splatter-bg"></div>
        <Card className="relative z-10 border border-white/10 bg-black/80 backdrop-blur-sm">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slushie-blue/20">
              <MailCheck className="h-8 w-8 text-slushie-blue" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              <span className="bg-gradient-to-r from-slushie-green via-slushie-blue to-slushie-pink bg-clip-text text-transparent">
                Check Your Email
              </span>
            </CardTitle>
            <CardDescription className="text-center">
              We've sent you a confirmation link to complete your signup
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">Please check your email inbox and click the link we sent to verify your account.</p>
            <p className="text-sm text-muted-foreground">
              If you don't see the email, check your spam folder or try again.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              asChild
              className="w-full bg-slushie-blue hover:bg-slushie-blue/80 text-white font-bold splash-button"
            >
              <Link href="/auth/login">Go to Login</Link>
            </Button>

            <div className="text-center text-sm">
              <Link href="/auth/signup" className="text-slushie-green hover:underline">
                Try signing up again
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

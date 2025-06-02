"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const errorMessage = searchParams.get("error") || "Unknown authentication error"

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
              <span className="text-red-500">Authentication Error</span>
            </CardTitle>
            <CardDescription className="text-center">There was a problem with your authentication</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">The authentication link may have expired or is invalid.</p>
            <p className="text-sm text-red-400 mb-4">Error: {errorMessage}</p>
            <p className="text-sm text-muted-foreground">
              Please try logging in again or contact support if the problem persists.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              asChild
              className="w-full bg-slushie-blue hover:bg-slushie-blue/80 text-white font-bold splash-button"
            >
              <Link href="/auth/login">Try Again</Link>
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

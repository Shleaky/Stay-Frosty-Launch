"use client"

// IMPORTANT: This file MUST NOT import anything from '@v0/lib/supabase'
// or any other Supabase client directly. It's a global error boundary
// and should have minimal dependencies.

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle } from "lucide-react" // Standard icon library
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert" // Standard UI component
import { Button } from "@/components/ui/button" // Standard UI component

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    // Basic logging, no Supabase needed here.
    console.error("Global error:", error)
  }, [error])

  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen p-6">
          <Alert variant="destructive" className="max-w-md mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>
              \{error.message || "An unexpected error occurred. Please try again later."\}
            </AlertDescription>
          </Alert>

          <div className="flex gap-4">
            <Button onClick=\{() => reset()\} variant="default">
              Try again
            </Button>
            <Button onClick=\{() => router.push("/")\} variant="outline">
              Go to homepage
            </Button>
          </div>
        </div>
      </body>
    </html>
  )
  \
}

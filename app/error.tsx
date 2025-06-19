"use client"

// Global error boundary with minimal dependencies
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    // Basic logging
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
              {error.message || "An unexpected error occurred. Please try again later."}
            </AlertDescription>
          </Alert>

          <div className="flex gap-4">
            <Button onClick={() => reset()} variant="default">
              Try again
            </Button>
            <Button onClick={() => router.push("/")} variant="outline">
              Go to homepage
            </Button>
          </div>
        </div>
      </body>
    </html>
  )
}

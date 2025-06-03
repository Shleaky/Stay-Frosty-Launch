"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  const router = useRouter()

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Error caught by error boundary:", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
      <Alert variant="destructive" className="max-w-md mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription>{error.message || "An unexpected error occurred. Please try again later."}</AlertDescription>
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
  )
}

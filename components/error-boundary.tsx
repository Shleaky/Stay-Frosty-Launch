"use client"

import React from "react"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by error boundary:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback } = this.props

      if (Fallback && this.state.error) {
        return <Fallback error={this.state.error} reset={() => this.setState({ hasError: false })} />
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
          <Alert variant="destructive" className="max-w-md mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>
              {this.state.error?.message || "An unexpected error occurred. Please try again later."}
            </AlertDescription>
          </Alert>

          <div className="flex gap-4">
            <Button onClick={() => this.setState({ hasError: false })} variant="default">
              Try again
            </Button>
            <Button onClick={() => (window.location.href = "/")} variant="outline">
              Go to homepage
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Also export as default for flexibility
export default ErrorBoundary

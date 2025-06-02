"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export function AuthErrorBoundary({ children }: { children: React.ReactNode }) {
  const { error } = useAuth()

  if (error) {
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
                <span className="text-red-500">Configuration Error</span>
              </CardTitle>
              <CardDescription className="text-center">
                There's an issue with the application configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-4">The application is missing required environment variables.</p>
              <p className="text-sm text-red-400 mb-4">Error: {error}</p>
              <p className="text-sm text-muted-foreground">
                Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are properly configured.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

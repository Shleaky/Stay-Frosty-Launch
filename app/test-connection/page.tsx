"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function TestConnectionPage() {
  const { toast } = useToast()
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionResult, setConnectionResult] = useState<any>(null)

  const testConnection = async () => {
    setIsTestingConnection(true)
    setConnectionResult(null)

    try {
      // Test environment variables
      const envVars = {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not Set",
      }

      console.log("Environment variables:", envVars)

      // Test Supabase client creation
      const { getBrowserClient } = await import("@/lib/supabase")
      const supabase = getBrowserClient()

      // Test basic connection
      const { data, error } = await supabase.auth.getSession()

      const result = {
        envVars,
        connectionTest: {
          success: !error,
          error: error?.message,
          data: data ? "Session data received" : "No session data",
        },
      }

      setConnectionResult(result)

      if (error) {
        toast({
          title: "Connection Test Failed",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Connection Test Successful",
          description: "Supabase connection is working properly.",
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      setConnectionResult({
        error: errorMessage,
      })
      toast({
        title: "Connection Test Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black py-12">
      <div className="container max-w-2xl">
        <Card className="border border-white/10 bg-black/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              <span className="bg-gradient-to-r from-slushie-green via-slushie-blue to-slushie-pink bg-clip-text text-transparent">
                Supabase Connection Test
              </span>
            </CardTitle>
            <CardDescription className="text-center">Test your Supabase configuration and connection</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button
              onClick={testConnection}
              disabled={isTestingConnection}
              className="w-full bg-slushie-blue hover:bg-slushie-blue/80 text-white font-bold"
            >
              {isTestingConnection ? "Testing Connection..." : "Test Connection"}
            </Button>

            {connectionResult && (
              <div className="bg-black/30 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Test Results:</h3>
                <pre className="text-sm overflow-auto whitespace-pre-wrap">
                  {JSON.stringify(connectionResult, null, 2)}
                </pre>
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              <p>This page helps diagnose connection issues with Supabase.</p>
              <p className="mt-2">If the test fails, check that your environment variables are properly set:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>NEXT_PUBLIC_SUPABASE_URL</li>
                <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

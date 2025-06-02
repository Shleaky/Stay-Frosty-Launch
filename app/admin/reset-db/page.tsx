"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { resetAndSetupDatabase } from "@/db-setup"

export default function ResetDatabasePage() {
  const { toast } = useToast()
  const [isResetting, setIsResetting] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null)

  const handleReset = async () => {
    if (!isConfirming) {
      setIsConfirming(true)
      return
    }

    setIsResetting(true)

    try {
      const result = await resetAndSetupDatabase()
      setResult(result)

      if (result.success) {
        toast({
          title: "Success",
          description: "Database has been reset and set up successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to reset database",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error resetting database:", error)
      setResult({
        success: false,
        error: "An unexpected error occurred",
      })
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsResetting(false)
      setIsConfirming(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black py-12">
      <div className="container max-w-md">
        <Card className="border border-white/10 bg-black/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              <span className="bg-gradient-to-r from-slushie-green via-slushie-blue to-slushie-pink bg-clip-text text-transparent">
                Reset Database
              </span>
            </CardTitle>
            <CardDescription className="text-center">
              This will reset your database and set up the structure for the Slushie Rental website.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-500/20 p-4 rounded-md">
              <p className="text-red-500 font-bold">Warning!</p>
              <p className="text-sm text-red-400">
                This action will delete all existing tables and data in your Supabase project and create a new database
                structure. This cannot be undone.
              </p>
            </div>

            {result && (
              <div
                className={`p-4 rounded-md ${
                  result.success ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                }`}
              >
                <p className="font-bold">{result.success ? "Success" : "Error"}</p>
                <p className="text-sm">{result.message || result.error}</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleReset}
              className={`w-full ${
                isConfirming
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-gradient-to-r from-slushie-green via-slushie-blue to-slushie-pink"
              } text-black font-bold`}
              disabled={isResetting}
            >
              {isResetting ? "Resetting..." : isConfirming ? "Click Again to Confirm Reset" : "Reset Database"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

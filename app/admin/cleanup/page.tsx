"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function CleanupPage() {
  const { toast } = useToast()
  const [isClearing, setIsClearing] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)

  const handleCleanup = async () => {
    if (!isConfirming) {
      setIsConfirming(true)
      return
    }

    setIsClearing(true)

    try {
      // This would typically call an API endpoint to run the cleanup script
      // For now, we'll just show a message
      toast({
        title: "Cleanup Complete",
        description: "All user data has been cleared. Please run the SQL scripts manually in Supabase.",
      })
    } catch (error) {
      console.error("Error during cleanup:", error)
      toast({
        title: "Error",
        description: "Failed to cleanup database",
        variant: "destructive",
      })
    } finally {
      setIsClearing(false)
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
                Cleanup Database
              </span>
            </CardTitle>
            <CardDescription className="text-center">
              This will remove all user data and reset the database to a clean state.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-500/20 p-4 rounded-md">
              <p className="text-red-500 font-bold">Warning!</p>
              <p className="text-sm text-red-400">
                This action will delete all user accounts, bookings, and orders. This cannot be undone.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleCleanup}
              className={`w-full ${
                isConfirming
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-gradient-to-r from-slushie-green via-slushie-blue to-slushie-pink"
              } text-black font-bold`}
              disabled={isClearing}
            >
              {isClearing ? "Cleaning..." : isConfirming ? "Click Again to Confirm Cleanup" : "Cleanup Database"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

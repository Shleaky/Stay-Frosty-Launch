"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function SetupProductsPage() {
  const { toast } = useToast()
  const [isSettingUp, setIsSettingUp] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null)

  const handleSetup = async () => {
    setIsSettingUp(true)
    setResult(null)

    try {
      // This would normally be a server action, but for simplicity we'll do it client-side
      const response = await fetch("/api/setup-products", {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        setResult({ success: true, message: "Product tables created successfully!" })
        toast({
          title: "Success",
          description: "Product database tables have been set up successfully.",
        })
      } else {
        setResult({ success: false, error: data.error || "Failed to setup tables" })
        toast({
          title: "Error",
          description: data.error || "Failed to setup product tables",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error setting up product tables:", error)
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
      setIsSettingUp(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black py-12">
      <div className="container max-w-md">
        <Card className="border border-white/10 bg-black/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              <span className="bg-gradient-to-r from-slushie-green via-slushie-blue to-slushie-pink bg-clip-text text-transparent">
                Setup Product Tables
              </span>
            </CardTitle>
            <CardDescription className="text-center">
              Initialize the database tables required for the products functionality.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-500/20 p-4 rounded-md">
              <p className="text-blue-400 font-bold">Information</p>
              <p className="text-sm text-blue-300">
                This will create the necessary database tables for product orders and order items.
              </p>
            </div>

            {result && (
              <div
                className={`p-4 rounded-md ${
                  result.success ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                }`}
              >
                <p className="font-bold">{result.success ? "Success" : "Error"}</p>
                <p className="text-sm">{result.message || result.error}</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleSetup}
              className="w-full bg-gradient-to-r from-slushie-green via-slushie-blue to-slushie-pink text-black font-bold"
              disabled={isSettingUp}
            >
              {isSettingUp ? "Setting up..." : "Setup Product Tables"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

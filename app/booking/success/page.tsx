"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import { getBrowserClient } from "@/lib/supabase"

export default function BookingSuccessPage() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("booking_id")
  const [booking, setBooking] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!bookingId) return

    const fetchBooking = async () => {
      try {
        const supabase = getBrowserClient()
        const { data, error } = await supabase.from("slushie_bookings").select("*").eq("id", bookingId).single()

        if (error) throw error
        setBooking(data)
      } catch (err) {
        console.error("Error fetching booking:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBooking()
  }, [bookingId])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-slushie-blue"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading payment details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-black py-12">
      <div className="container max-w-md">
        <Card className="border border-white/10 bg-black/80 backdrop-blur-sm">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slushie-green/20">
              <CheckCircle2 className="h-8 w-8 text-slushie-green" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              <span className="bg-gradient-to-r from-slushie-green via-slushie-blue to-slushie-pink bg-clip-text text-transparent">
                Payment Successful!
              </span>
            </CardTitle>
            <CardDescription className="text-center">Your booking and payment have been confirmed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-lg mb-2">Thank you for your booking!</p>
              <p className="text-sm text-muted-foreground">A confirmation email has been sent to your email address.</p>
            </div>

            {booking && (
              <div className="bg-black/30 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Booking Reference</h3>
                <p className="text-lg font-mono text-slushie-blue">{booking.id.substring(0, 8).toUpperCase()}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button asChild className="w-full bg-slushie-green hover:bg-slushie-green/80 text-black font-bold">
              <Link href="/bookings">View My Bookings</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Return to Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

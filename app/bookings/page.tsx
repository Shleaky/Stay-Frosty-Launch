"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format, parseISO, isPast, isFuture, isValid } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { getUserSlushieBookings, cancelSlushieBooking } from "@/app/actions/booking-actions"
import { Skeleton } from "@/components/ui/skeleton"

// Helper function to safely parse and validate dates
const safeParseDate = (dateString: string | null | undefined): Date | null => {
  if (!dateString) return null

  try {
    const parsed = parseISO(dateString)
    return isValid(parsed) ? parsed : null
  } catch (error) {
    console.error("Error parsing date:", dateString, error)
    return null
  }
}

// Helper function to safely format dates
const safeFormatDate = (dateString: string | null | undefined, formatString = "MMMM d, yyyy"): string => {
  const date = safeParseDate(dateString)
  if (!date) return "Invalid Date"

  try {
    return format(date, formatString)
  } catch (error) {
    console.error("Error formatting date:", dateString, error)
    return "Invalid Date"
  }
}

// Helper function to safely check if date is in the future
const safeIsFuture = (dateString: string | null | undefined): boolean => {
  const date = safeParseDate(dateString)
  if (!date) return false

  try {
    return isFuture(date)
  } catch (error) {
    console.error("Error checking if date is future:", dateString, error)
    return false
  }
}

// Helper function to safely check if date is in the past
const safeIsPast = (dateString: string | null | undefined): boolean => {
  const date = safeParseDate(dateString)
  if (!date) return false

  try {
    return isPast(date)
  } catch (error) {
    console.error("Error checking if date is past:", dateString, error)
    return false
  }
}

export default function BookingsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [bookings, setBookings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push("/auth/login?next=/bookings")
      return
    }

    const fetchBookings = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await getUserSlushieBookings(user.id)

        if (!result.success) {
          throw new Error(result.error || "Failed to fetch bookings")
        }

        // Filter out bookings with invalid dates and log them
        const validBookings = (result.data || []).filter((booking: any) => {
          if (!booking.booking_date) {
            console.warn("Booking with missing date:", booking)
            return false
          }

          const date = safeParseDate(booking.booking_date)
          if (!date) {
            console.warn("Booking with invalid date:", booking.booking_date, booking)
            return false
          }

          return true
        })

        setBookings(validBookings)
      } catch (err) {
        console.error("Error fetching bookings:", err)
        setError(err instanceof Error ? err.message : "An unexpected error occurred")
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to load bookings",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookings()
  }, [user, authLoading, router, toast])

  const handleCancelBooking = async () => {
    if (!selectedBooking || !user) return

    setIsCancelling(true)

    try {
      const result = await cancelSlushieBooking(selectedBooking.id, user.id)

      if (!result.success) {
        throw new Error(result.error || "Failed to cancel booking")
      }

      // Update the booking in the local state
      setBookings(
        bookings.map((booking) => (booking.id === selectedBooking.id ? { ...booking, status: "cancelled" } : booking)),
      )

      toast({
        title: "Booking Cancelled",
        description: "Your booking has been successfully cancelled.",
      })
    } catch (err) {
      console.error("Error cancelling booking:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to cancel booking",
        variant: "destructive",
      })
    } finally {
      setIsCancelling(false)
      setIsCancelDialogOpen(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>
      case "confirmed":
        return <Badge className="bg-slushie-green text-black">Confirmed</Badge>
      case "cancelled":
        return <Badge className="bg-red-500">Cancelled</Badge>
      case "completed":
        return <Badge className="bg-slate-500">Completed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Use the safe date functions for filtering
  const upcomingBookings = bookings.filter(
    (booking) => safeIsFuture(booking.booking_date) && booking.status !== "cancelled",
  )

  const pastBookings = bookings.filter((booking) => safeIsPast(booking.booking_date) || booking.status === "cancelled")

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

        <Card>
          <CardHeader>
            <CardTitle>Your Bookings</CardTitle>
            <CardDescription>View and manage your slushie machine bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">No bookings found. Ready to book your first slushie machine?</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

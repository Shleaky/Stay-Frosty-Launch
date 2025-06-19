"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format, parseISO, isPast, isFuture, isValid } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { getUserSlushieBookings, cancelSlushieBooking } from "@/app/actions/booking-actions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

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
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-slushie-blue"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-30 splatter-bg"></div>
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-slushie-green via-slushie-blue to-slushie-pink bg-clip-text text-transparent">
                Your Bookings
              </span>
            </h1>
            <p className="text-xl text-white/80">Manage your slushie machine bookings</p>
          </div>
        </div>
      </section>

      {/* Bookings Section */}
      <section className="py-12 bg-slate-900">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            {error ? (
              <Card className="bg-black/50 border border-white/10">
                <CardContent className="p-6 text-center">
                  <p className="text-red-500 mb-4">{error}</p>
                  <Button
                    onClick={() => window.location.reload()}
                    className="bg-slushie-blue hover:bg-slushie-blue/80 text-white font-bold"
                  >
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            ) : bookings.length === 0 ? (
              <Card className="bg-black/50 border border-white/10">
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground mb-4">You don't have any bookings yet.</p>
                  <Button
                    asChild
                    className="bg-slushie-green hover:bg-slushie-green/80 text-black font-bold splash-button"
                  >
                    <a href="/booking">Book a Slushie Machine</a>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="upcoming" className="text-lg">
                    Upcoming Bookings
                  </TabsTrigger>
                  <TabsTrigger value="past" className="text-lg">
                    Past Bookings
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="space-y-6">
                  {upcomingBookings.length === 0 ? (
                    <Card className="bg-black/50 border border-white/10">
                      <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground mb-4">You don't have any upcoming bookings.</p>
                        <Button
                          asChild
                          className="bg-slushie-green hover:bg-slushie-green/80 text-black font-bold splash-button"
                        >
                          <a href="/booking">Book a Slushie Machine</a>
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    upcomingBookings.map((booking) => (
                      <Card key={booking.id} className="bg-black/50 border border-white/10 overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-slushie-green via-slushie-blue to-slushie-pink w-full"></div>
                        <CardHeader className="flex flex-row items-start justify-between">
                          <div>
                            <CardTitle>Booking for {safeFormatDate(booking.booking_date)}</CardTitle>
                            <CardDescription>Reference: {booking.id.substring(0, 8).toUpperCase()}</CardDescription>
                          </div>
                          {getStatusBadge(booking.status)}
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h3 className="font-semibold mb-2">Booking Details</h3>
                              <ul className="space-y-1 text-sm">
                                <li>
                                  <span className="text-muted-foreground">Date:</span>{" "}
                                  {safeFormatDate(booking.booking_date, "EEEE, MMMM d, yyyy")}
                                </li>
                                <li>
                                  <span className="text-muted-foreground">Machine:</span>{" "}
                                  {booking.machine_type === "single"
                                    ? "Single Machine"
                                    : booking.machine_type === "double"
                                      ? "Double Machine"
                                      : "Triple Machine"}
                                </li>
                                <li>
                                  <span className="text-muted-foreground">Package:</span>{" "}
                                  {booking.package_type === "basic"
                                    ? "Basic Package"
                                    : booking.package_type === "standard"
                                      ? "Standard Package"
                                      : "Premium Package"}
                                </li>
                                <li>
                                  <span className="text-muted-foreground">Flavors:</span>{" "}
                                  {Array.isArray(booking.flavors) ? booking.flavors.join(", ") : "No flavors selected"}
                                </li>
                                <li>
                                  <span className="text-muted-foreground">Event Type:</span>{" "}
                                  {booking.event_type || "Not specified"}
                                </li>
                              </ul>
                            </div>
                            <div>
                              <h3 className="font-semibold mb-2">Contact Information</h3>
                              <ul className="space-y-1 text-sm">
                                <li>
                                  <span className="text-muted-foreground">Name:</span>{" "}
                                  {booking.user_name || "Not provided"}
                                </li>
                                <li>
                                  <span className="text-muted-foreground">Email:</span>{" "}
                                  {booking.user_email || "Not provided"}
                                </li>
                                <li>
                                  <span className="text-muted-foreground">Phone:</span>{" "}
                                  {booking.user_phone || "Not provided"}
                                </li>
                                <li>
                                  <span className="text-muted-foreground">Total:</span> ${booking.total_price || 0}
                                </li>
                              </ul>
                            </div>
                          </div>
                          {booking.comments && (
                            <div className="mt-4">
                              <h3 className="font-semibold mb-2">Additional Comments</h3>
                              <p className="text-sm">{booking.comments}</p>
                            </div>
                          )}
                        </CardContent>
                        <CardFooter>
                          {booking.status !== "cancelled" && (
                            <Button
                              variant="destructive"
                              onClick={() => {
                                setSelectedBooking(booking)
                                setIsCancelDialogOpen(true)
                              }}
                            >
                              Cancel Booking
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="past" className="space-y-6">
                  {pastBookings.length === 0 ? (
                    <Card className="bg-black/50 border border-white/10">
                      <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground">You don't have any past bookings.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    pastBookings.map((booking) => (
                      <Card key={booking.id} className="bg-black/50 border border-white/10 overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-slate-400 to-slate-600 w-full"></div>
                        <CardHeader className="flex flex-row items-start justify-between">
                          <div>
                            <CardTitle>Booking for {safeFormatDate(booking.booking_date)}</CardTitle>
                            <CardDescription>Reference: {booking.id.substring(0, 8).toUpperCase()}</CardDescription>
                          </div>
                          {getStatusBadge(booking.status)}
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h3 className="font-semibold mb-2">Booking Details</h3>
                              <ul className="space-y-1 text-sm">
                                <li>
                                  <span className="text-muted-foreground">Date:</span>{" "}
                                  {safeFormatDate(booking.booking_date, "EEEE, MMMM d, yyyy")}
                                </li>
                                <li>
                                  <span className="text-muted-foreground">Machine:</span>{" "}
                                  {booking.machine_type === "single"
                                    ? "Single Machine"
                                    : booking.machine_type === "double"
                                      ? "Double Machine"
                                      : "Triple Machine"}
                                </li>
                                <li>
                                  <span className="text-muted-foreground">Package:</span>{" "}
                                  {booking.package_type === "basic"
                                    ? "Basic Package"
                                    : booking.package_type === "standard"
                                      ? "Standard Package"
                                      : "Premium Package"}
                                </li>
                                <li>
                                  <span className="text-muted-foreground">Flavors:</span>{" "}
                                  {Array.isArray(booking.flavors) ? booking.flavors.join(", ") : "No flavors selected"}
                                </li>
                                <li>
                                  <span className="text-muted-foreground">Event Type:</span>{" "}
                                  {booking.event_type || "Not specified"}
                                </li>
                              </ul>
                            </div>
                            <div>
                              <h3 className="font-semibold mb-2">Contact Information</h3>
                              <ul className="space-y-1 text-sm">
                                <li>
                                  <span className="text-muted-foreground">Name:</span>{" "}
                                  {booking.user_name || "Not provided"}
                                </li>
                                <li>
                                  <span className="text-muted-foreground">Email:</span>{" "}
                                  {booking.user_email || "Not provided"}
                                </li>
                                <li>
                                  <span className="text-muted-foreground">Phone:</span>{" "}
                                  {booking.user_phone || "Not provided"}
                                </li>
                                <li>
                                  <span className="text-muted-foreground">Total:</span> ${booking.total_price || 0}
                                </li>
                              </ul>
                            </div>
                          </div>
                          {booking.comments && (
                            <div className="mt-4">
                              <h3 className="font-semibold mb-2">Additional Comments</h3>
                              <p className="text-sm">{booking.comments}</p>
                            </div>
                          )}
                        </CardContent>
                        <CardFooter>
                          {booking.status === "completed" && (
                            <Button
                              className="bg-slushie-green hover:bg-slushie-green/80 text-black font-bold"
                              onClick={() => router.push("/booking")}
                            >
                              Book Again
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </section>

      {/* Cancel Booking Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="bg-black border border-white/10">
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedBooking && (
              <div className="bg-black/30 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Booking Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Date:</div>
                  <div>{safeFormatDate(selectedBooking.booking_date, "EEEE, MMMM do, yyyy")}</div>

                  <div>Machine:</div>
                  <div>
                    {selectedBooking.machine_type === "single"
                      ? "Single Machine"
                      : selectedBooking.machine_type === "double"
                        ? "Double Machine"
                        : "Triple Machine"}
                  </div>

                  <div>Package:</div>
                  <div>
                    {selectedBooking.package_type === "basic"
                      ? "Basic Package"
                      : selectedBooking.package_type === "standard"
                        ? "Standard Package"
                        : "Premium Package"}
                  </div>

                  <div>Total:</div>
                  <div className="font-bold">${selectedBooking.total_price || 0}</div>
                </div>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Please note that cancellations made less than 48 hours before the booking date may be subject to a
              cancellation fee.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)} disabled={isCancelling}>
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelBooking}
              disabled={isCancelling}
              className="bg-red-500 hover:bg-red-600"
            >
              {isCancelling ? "Cancelling..." : "Cancel Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

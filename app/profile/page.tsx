"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { format, parseISO, isFuture, isValid } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { getBrowserClient } from "@/lib/supabase"
import { getUserSlushieBookings } from "@/app/actions/booking-actions"

type ProfileData = {
  full_name: string
  email: string
  phone: string
  receive_marketing: boolean
}

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

export default function ProfilePage() {
  const router = useRouter()
  const { user, isLoading: authLoading, signOut } = useAuth()
  const { toast } = useToast()

  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: "",
    email: "",
    phone: "",
    receive_marketing: false,
  })
  const [bookings, setBookings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (authLoading) return

    if (!user) {
      console.log("No user found, redirecting to login...")
      // Add a small delay to prevent race conditions
      const timer = setTimeout(() => {
        router.push("/auth/login?next=/profile")
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (authLoading || !user) return

    const fetchData = async () => {
      try {
        // Create supabase client only on client side
        const supabase = getBrowserClient()

        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileError) {
          throw profileError
        }

        if (profileData) {
          setProfileData({
            full_name: profileData.full_name || "",
            email: profileData.email || user.email || "",
            phone: profileData.phone || "",
            receive_marketing: profileData.receive_marketing || false,
          })
        }

        // Fetch bookings
        const bookingsResult = await getUserSlushieBookings(user.id)

        if (!bookingsResult.success) {
          throw new Error(bookingsResult.error || "Failed to fetch bookings")
        }

        // Filter out bookings with invalid dates
        const validBookings = (bookingsResult.data || []).filter((booking: any) => {
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
        console.error("Error fetching data:", err)
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user, authLoading, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      const supabase = getBrowserClient()

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profileData.full_name,
          phone: profileData.phone,
          receive_marketing: profileData.receive_marketing,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user?.id)

      if (error) {
        throw error
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred")
      toast({
        title: "Error",
        description: err.message || "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSignOut = async () => {
    try {
      console.log("Sign out initiated from profile page")

      toast({
        title: "Signing out...",
        description: "You are being signed out.",
      })

      await signOut()

      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      })
    } catch (error) {
      console.error("Error during sign out:", error)
      toast({
        title: "Sign out error",
        description: "There was an issue signing you out.",
        variant: "destructive",
      })

      // Force redirect even on error
      router.push("/auth/login")
    }
  }

  // Show loading while checking authentication
  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-slushie-blue"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-slushie-blue"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading profile data...</p>
        </div>
      </div>
    )
  }

  // Filter for upcoming bookings with safe date handling
  const upcomingBookings = bookings
    .filter((booking) => safeIsFuture(booking.booking_date) && booking.status !== "cancelled")
    .sort((a, b) => {
      const dateA = safeParseDate(a.booking_date)
      const dateB = safeParseDate(b.booking_date)
      if (!dateA || !dateB) return 0
      return dateA.getTime() - dateB.getTime()
    })
    .slice(0, 3) // Get only the next 3 upcoming bookings

  return (
    <div className="flex min-h-screen bg-black py-12">
      <div className="container max-w-4xl">
        <div className="relative">
          <div className="absolute inset-0 z-0 opacity-30 splatter-bg"></div>
          <Card className="relative z-10 border border-white/10 bg-black/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                <span className="bg-gradient-to-r from-slushie-green via-slushie-blue to-slushie-pink bg-clip-text text-transparent">
                  Your Profile
                </span>
              </CardTitle>
              <CardDescription>Manage your account information and preferences</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={profileData.full_name}
                      onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                      required
                      className="bg-black/50 border-white/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      disabled
                      className="bg-black/50 border-white/20 opacity-70"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      required
                      className="bg-black/50 border-white/20"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="marketing"
                    checked={profileData.receive_marketing}
                    onCheckedChange={(checked) =>
                      setProfileData({ ...profileData, receive_marketing: checked === true })
                    }
                  />
                  <Label htmlFor="marketing" className="text-sm font-normal">
                    Receive emails for Discounts and Deals
                  </Label>
                </div>

                {error && <div className="rounded-md bg-red-500/20 p-3 text-sm text-red-500">{error}</div>}
              </CardContent>

              <CardFooter className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:space-y-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSignOut}
                  className="w-full sm:w-auto text-red-400 border-red-400 hover:bg-red-400 hover:text-black"
                >
                  Sign Out
                </Button>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-slushie-green via-slushie-blue to-slushie-pink text-black font-bold splash-button sm:w-auto"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Your Upcoming Bookings</h2>
            <Button
              asChild
              variant="outline"
              className="text-slushie-blue hover:text-slushie-blue/80 hover:bg-slate-800"
            >
              <Link href="/bookings">View All Bookings</Link>
            </Button>
          </div>
          <Card className="border border-white/10 bg-black/80 backdrop-blur-sm">
            <CardContent className="p-6">
              {upcomingBookings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">You don't have any upcoming bookings.</p>
                  <Button
                    asChild
                    className="mt-4 bg-slushie-blue hover:bg-slushie-blue/80 text-white font-bold splash-button"
                  >
                    <Link href="/booking">Book a Slushie Machine</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {upcomingBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-4 last:border-0 last:pb-0"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{safeFormatDate(booking.booking_date)}</h3>
                          <Badge
                            className={booking.status === "confirmed" ? "bg-slushie-green text-black" : "bg-yellow-500"}
                          >
                            {booking.status === "confirmed" ? "Confirmed" : "Pending"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {booking.machine_type === "single"
                            ? "Single Machine"
                            : booking.machine_type === "double"
                              ? "Double Machine"
                              : "Triple Machine"}{" "}
                          - {Array.isArray(booking.flavors) ? booking.flavors.join(", ") : "No flavors selected"}
                        </p>
                      </div>
                      <Button
                        asChild
                        size="sm"
                        className="bg-slushie-blue hover:bg-slushie-blue/80 text-white font-bold"
                      >
                        <Link href={`/bookings?id=${booking.id}`}>View Details</Link>
                      </Button>
                    </div>
                  ))}
                  {bookings.length > 3 && (
                    <div className="text-center pt-2">
                      <Button asChild variant="outline">
                        <Link href="/bookings">View All Bookings ({bookings.length})</Link>
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

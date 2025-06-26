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
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { getBrowserClient } from "@/lib/supabase"
import { getUserSlushieBookings } from "@/app/actions/booking-actions"
import type { ProfileData } from "@/lib/supabase/types"

// Safe date utilities
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
  const supabase = getBrowserClient()

  const [profileData, setProfileData] = useState<Partial<ProfileData>>({
    full_name: "",
    email: "",
    phone: "",
    receive_marketing: false,
  })
  const [bookings, setBookings] = useState<any[]>([])
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/login?next=/profile")
    }
  }, [user, authLoading, router])

  // Load profile data
  useEffect(() => {
    if (!user || authLoading) return

    const loadProfileData = async () => {
      setIsPageLoading(true)
      try {
        // Load profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileError && profileError.code !== "PGRST116") {
          throw profileError
        }

        setProfileData({
          full_name: profile?.full_name || "",
          email: profile?.email || user.email || "",
          phone: profile?.phone || "",
          receive_marketing: profile?.receive_marketing || false,
        })

        // Load bookings
        const bookingsResult = await getUserSlushieBookings(user.id)
        if (bookingsResult.success) {
          const validBookings = (bookingsResult.data || []).filter((booking: any) => {
            return booking.booking_date && safeParseDate(booking.booking_date)
          })
          setBookings(validBookings)
        } else {
          console.warn("Failed to load bookings:", bookingsResult.error)
          setBookings([])
        }
      } catch (error: any) {
        console.error("Error loading profile data:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to load profile data",
          variant: "destructive",
        })
      } finally {
        setIsPageLoading(false)
      }
    }

    loadProfileData()
  }, [user, authLoading, supabase, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSaving(true)
    setFormError(null)

    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: profileData.full_name,
        email: profileData.email,
        phone: profileData.phone,
        receive_marketing: profileData.receive_marketing,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error: any) {
      const errorMessage = error.message || "Failed to update profile"
      setFormError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.replace("/auth/login?message=signed_out")
  }

  // Loading state
  if (authLoading || (isPageLoading && user)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="container max-w-4xl py-12">
          <Skeleton className="h-10 w-1/3 mb-6" />
          <Card className="border border-white/10 bg-black/80 backdrop-blur-sm">
            <CardHeader>
              <Skeleton className="h-8 w-1/2 mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!user) {
    return null
  }

  const upcomingBookings = bookings
    .filter((booking) => safeIsFuture(booking.booking_date) && booking.status !== "cancelled")
    .sort((a, b) => {
      const dateA = safeParseDate(a.booking_date)
      const dateB = safeParseDate(b.booking_date)
      if (!dateA || !dateB) return 0
      return dateA.getTime() - dateB.getTime()
    })
    .slice(0, 3)

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
                      value={profileData.full_name || ""}
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
                      value={profileData.email || ""}
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
                      value={profileData.phone || ""}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      required
                      className="bg-black/50 border-white/20"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="marketing"
                    checked={profileData.receive_marketing || false}
                    onCheckedChange={(checked) =>
                      setProfileData({ ...profileData, receive_marketing: checked === true })
                    }
                  />
                  <Label htmlFor="marketing" className="text-sm font-normal">
                    Receive emails for Discounts and Deals
                  </Label>
                </div>
                {formError && <div className="rounded-md bg-red-500/20 p-3 text-sm text-red-500">{formError}</div>}
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

        {/* Upcoming Bookings Section */}
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
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

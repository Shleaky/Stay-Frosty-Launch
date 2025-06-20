"use server"

import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { bookingFormSchema, validate } from "@/lib/validators"

export type SlushieBookingFormData = {
  userId: string | null
  bookingDate: string
  machineType: string
  packageType: string
  flavors: string[]
  eventType: string
  guestCount: number
  userName: string
  userEmail: string
  userPhone: string
  address: string
  comments?: string
  totalPrice: number
}

export async function createSlushieBooking(formData: SlushieBookingFormData) {
  try {
    // Validate form data
    const validation = await validate(bookingFormSchema, formData)
    if (!validation.success) {
      return { success: false, error: "Validation failed", validationErrors: validation.errors }
    }

    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    const bookingData = {
      user_id: formData.userId,
      booking_date: formData.bookingDate,
      machine_type: formData.machineType,
      package_type: formData.packageType,
      flavors: formData.flavors,
      event_type: formData.eventType,
      guest_count: formData.guestCount,
      user_name: formData.userName,
      user_email: formData.userEmail,
      user_phone: formData.userPhone,
      address: formData.address,
      comments: formData.comments,
      total_price: formData.totalPrice,
      status: "pending",
    }

    const { data, error } = await supabase.from("slushie_bookings").insert([bookingData]).select()

    if (error) {
      console.error("Error creating slushie booking:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/profile")
    revalidatePath("/bookings")

    return { success: true, data: data[0] }
  } catch (error) {
    console.error("Unexpected error creating slushie booking:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function getUserSlushieBookings(userId: string) {
  try {
    if (!userId) {
      return { success: false, error: "User ID is required" }
    }

    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    const { data, error } = await supabase
      .from("slushie_bookings")
      .select("*")
      .eq("user_id", userId)
      .order("booking_date", { ascending: true })

    if (error) {
      console.error("Error fetching user slushie bookings:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Unexpected error fetching user slushie bookings:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function cancelSlushieBooking(bookingId: string, userId: string) {
  try {
    if (!bookingId || !userId) {
      return { success: false, error: "Booking ID and User ID are required" }
    }

    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    // First verify that this booking belongs to the user
    const { data: bookingData, error: fetchError } = await supabase
      .from("slushie_bookings")
      .select("*")
      .eq("id", bookingId)
      .eq("user_id", userId)
      .single()

    if (fetchError || !bookingData) {
      console.error("Error fetching slushie booking to cancel:", fetchError)
      return { success: false, error: "Booking not found or not authorized" }
    }

    // Now update the booking status
    const { error: updateError } = await supabase
      .from("slushie_bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId)
      .eq("user_id", userId)

    if (updateError) {
      console.error("Error cancelling slushie booking:", updateError)
      return { success: false, error: updateError.message }
    }

    revalidatePath("/profile")
    revalidatePath("/bookings")

    return { success: true }
  } catch (error) {
    console.error("Unexpected error cancelling slushie booking:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// For backward compatibility with old code
export const getUserBookings = getUserSlushieBookings
export const cancelBooking = cancelSlushieBooking

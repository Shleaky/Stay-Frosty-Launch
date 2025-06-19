import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function createBooking(formData: FormData) {
  "use server"

  const supabase = createServerSupabaseClient()

  const guest_name = formData.get("guest_name") as string
  const guest_email = formData.get("guest_email") as string
  const room_id = formData.get("room_id") as string
  const check_in = formData.get("check_in") as string
  const check_out = formData.get("check_out") as string

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      guest_name,
      guest_email,
      room_id,
      check_in,
      check_out,
    })
    .select()
    .single()

  if (error) {
    console.log(error)
    return { message: "Failed to create booking" }
  }

  revalidatePath("/bookings")
  return { message: "Booking created successfully" }
}

export async function deleteBooking(id: string) {
  "use server"

  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("bookings").delete().eq("id", id)

  if (error) {
    console.log(error)
    return { message: "Failed to delete booking" }
  }

  revalidatePath("/bookings")
  return { message: "Booking deleted successfully" }
}

export async function getUserSlushieBookings(userId: string) {
  try {
    if (!userId) {
      return { success: false, error: "User ID is required" }
    }

    const supabase = createServerSupabaseClient()

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

    const supabase = createServerSupabaseClient()

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

export async function createSlushieBooking(formData: any) {
  try {
    // Validate form data
    if (!formData.userId || !formData.bookingDate || !formData.machineType) {
      return { success: false, error: "Missing required booking information" }
    }

    const supabase = createServerSupabaseClient()

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

// For backward compatibility with old code
export const getUserBookings = getUserSlushieBookings
export const cancelBooking = cancelSlushieBooking

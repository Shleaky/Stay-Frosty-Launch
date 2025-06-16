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

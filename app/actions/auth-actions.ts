"use server"

import { getBrowserClient } from "@/lib/supabase"

export async function checkEmailExists(email: string) {
  try {
    const supabase = getBrowserClient()

    // Check if email exists in auth.users table
    const { data, error } = await supabase.rpc("check_email_exists", { email_to_check: email })

    if (error) {
      console.error("Error checking email:", error)
      return { exists: false, error: error.message }
    }

    return { exists: data || false, error: null }
  } catch (err) {
    console.error("Unexpected error checking email:", err)
    return { exists: false, error: "Failed to check email" }
  }
}

"use server"

import { createServerClient } from "@/lib/supabase"

export async function resetAndSetupDatabase() {
  try {
    const supabase = createServerClient()

    // Execute the SQL script to reset and set up the database
    const { error } = await supabase.rpc("reset_and_setup_database")

    if (error) {
      console.error("Error resetting database:", error)
      return { success: false, error: error.message }
    }

    return { success: true, message: "Database reset and set up successfully" }
  } catch (error) {
    console.error("Unexpected error resetting database:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

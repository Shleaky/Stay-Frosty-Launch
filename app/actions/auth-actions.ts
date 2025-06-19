"use server"

import { createServerSupabaseClient } from "@/lib/supabase"

export async function checkEmailExists(email: string) {
  try {
    const supabase = createServerSupabaseClient()

    // Query the auth.users table to check if email exists
    const { data, error } = await supabase.from("profiles").select("id").eq("email", email).single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found" error, which is expected when email doesn't exist
      console.error("Error checking email:", error)
      return { exists: false, error: error.message }
    }

    return { exists: !!data, error: null }
  } catch (err) {
    console.error("Unexpected error checking email:", err)
    return { exists: false, error: "Failed to check email" }
  }
}

export async function signUp(email: string, password: string, userData: any) {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        data: userData,
      },
    })

    if (error) {
      console.error("SignUp error:", error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (err) {
    console.error("Unexpected signup error:", err)
    return { data: null, error: { message: "An unexpected error occurred" } }
  }
}

export async function signIn(email: string, password: string) {
  try {
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("SignIn error:", error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (err) {
    console.error("Unexpected signin error:", err)
    return { data: null, error: { message: "An unexpected error occurred" } }
  }
}

export async function signOut() {
  try {
    const supabase = createServerSupabaseClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("SignOut error:", error)
      return { error }
    }

    return { error: null }
  } catch (err) {
    console.error("Unexpected signout error:", err)
    return { error: { message: "An unexpected error occurred" } }
  }
}

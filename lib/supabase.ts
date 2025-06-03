import { createClient } from "@supabase/supabase-js"
import type { SupabaseClient } from "@supabase/supabase-js"

// Singleton pattern for browser client to prevent multiple instances
let browserClient: SupabaseClient | null = null

// Create a single supabase client for the browser
const createBrowserClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
    },
  })
}

// Singleton getter for client-side Supabase client
export const getBrowserClient = (): SupabaseClient => {
  // Only create client on browser side
  if (typeof window === "undefined") {
    throw new Error("getBrowserClient should only be called on the client side")
  }

  if (!browserClient) {
    console.log("Creating new Supabase browser client")
    browserClient = createBrowserClient()
  }

  return browserClient
}

// Server-side client with service role for admin operations
export const createServerClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL as string
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase server environment variables")
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Reset client (useful for testing or when needed)
export const resetBrowserClient = () => {
  if (typeof window !== "undefined") {
    console.log("Resetting Supabase browser client")
    browserClient = null
  }
}

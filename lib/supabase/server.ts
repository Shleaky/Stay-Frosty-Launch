import { createServerClient as _createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

/**
 * Create a Supabase client for server-side operations
 * Handles cookies automatically for session management
 *
 * @returns {SupabaseClient<Database>} Configured server Supabase client
 * @throws {Error} If environment variables are missing or if called on client
 */
export function createServerClient(): SupabaseClient<Database> {
  // Prevent client-side usage
  if (typeof window !== "undefined") {
    throw new Error("createServerClient() cannot be called on the client side")
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing required server environment variables: SUPABASE_URL and SUPABASE_ANON_KEY")
  }

  const cookieStore = cookies()

  return _createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // Handle cookie setting errors gracefully
          console.warn("Failed to set cookie:", name, error)
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.set({ name, value: "", ...options })
        } catch (error) {
          // Handle cookie removal errors gracefully
          console.warn("Failed to remove cookie:", name, error)
        }
      },
    },
  })
}

/**
 * Create a Supabase client with service role privileges
 * Bypasses RLS - use with extreme caution and only on server
 *
 * @returns {SupabaseClient<Database>} Service role Supabase client
 * @throws {Error} If called on client or missing environment variables
 */
export function createServiceRoleClient(): SupabaseClient<Database> {
  // Prevent client-side usage
  if (typeof window !== "undefined") {
    throw new Error("createServiceRoleClient() must only be used on the server")
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing required service role environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
  }

  return _createServerClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

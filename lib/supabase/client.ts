"use client"

import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

// Singleton instance - only one client per browser session
let clientInstance: SupabaseClient<Database> | null = null

/**
 * Get the Supabase client for browser/client-side operations
 * Implements singleton pattern to prevent multiple instances
 *
 * @returns {SupabaseClient<Database>} Configured Supabase client
 * @throws {Error} If environment variables are missing
 */
export function getBrowserClient(): SupabaseClient<Database> {
  // Return existing instance if available
  if (clientInstance) {
    return clientInstance
  }

  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
    )
  }

  // Create and cache the client instance
  clientInstance = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)

  return clientInstance
}

/**
 * Reset the client instance (useful for testing or auth state changes)
 * Should rarely be used in production
 */
export function resetBrowserClient(): void {
  clientInstance = null
}

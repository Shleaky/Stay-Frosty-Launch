"use client"

import { createBrowserClient as _createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

// This is a singleton instance of the Supabase client for the browser.
let clientInstance: SupabaseClient | null = null

/**
 * Provides a singleton instance of the Supabase client for use in browser environments.
 * This function should only be called from 'use client' components or other client-side code.
 *
 * @returns {SupabaseClient} The Supabase client instance.
 */
export function getBrowserClient(): SupabaseClient {
  if (clientInstance) {
    return clientInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase URL or Anon Key for browser client.")
  }

  console.log("Creating new Supabase browser client instance.")
  clientInstance = _createBrowserClient(supabaseUrl, supabaseAnonKey)

  return clientInstance
}

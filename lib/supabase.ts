import { createBrowserClient as _createBrowserClient, createServerClient as _createServerClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

// --- Client-Side Supabase Client (Singleton) ---
let browserClientInstance: SupabaseClient | null = null

export function getBrowserClient(): SupabaseClient {
  if (typeof window === "undefined") {
    // This function should only be called on the client.
    // For server-side, use createServerClient from this file or directly from @supabase/ssr.
    throw new Error("getBrowserClient() should only be called on the client side.")
  }

  if (!browserClientInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase URL or Anon Key for browser client.")
    }
    console.log("Creating new Supabase browser client instance.")
    browserClientInstance = _createBrowserClient(supabaseUrl, supabaseAnonKey)
  }
  return browserClientInstance
}

// --- Server-Side Supabase Client (for Route Handlers, Server Actions, Server Components) ---
// This version uses the service role key for elevated privileges when needed.
// For operations that should respect RLS based on user session, use the middleware client pattern.
export function createServiceRoleClient(): SupabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (typeof window !== "undefined") {
    throw new Error("createServiceRoleClient() should only be called on the server side.")
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase URL or Service Role Key for service client.")
  }
  return _createServerClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    // No cookies needed for service role client as it doesn't operate on behalf of a user
  })
}

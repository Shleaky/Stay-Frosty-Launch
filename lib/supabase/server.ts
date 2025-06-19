import { createServerClient as _createServerClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies"
import type { CookieOptions } from "@supabase/ssr"

/**
 * Creates a Supabase client for server-side operations (Server Components, Route Handlers, Server Actions).
 * This client is configured to work with Next.js cookies for session management.
 *
 * @param {ReadonlyRequestCookies} cookieStore - The cookie store from Next.js (`cookies()`).
 * @returns {SupabaseClient} A Supabase client instance for server-side use.
 */
export function createServerClient(cookieStore: ReadonlyRequestCookies): SupabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase URL or Anon Key for server client.")
  }

  return _createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: CookieOptions) {
        cookieStore.delete({ name, ...options })
      },
    },
  })
}

/**
 * Creates a Supabase client with the service role key for elevated administrative tasks.
 * This client bypasses Row Level Security (RLS) and should be used with extreme caution.
 * It is intended for use in secure server-side environments only (e.g., database seeding, admin scripts).
 *
 * @returns {SupabaseClient} A Supabase client instance with service role privileges.
 */
export function createServiceRoleClient(): SupabaseClient {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (typeof window !== "undefined") {
    throw new Error("createServiceRoleClient() must not be called on the client.")
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase URL or Service Role Key for service client.")
  }

  return _createServerClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

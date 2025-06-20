import { cookies } from "next/headers"
import { createServerClient as createServerClientSupabase, createServiceRoleClient } from "@/lib/supabase/server"

// Re-export the server client function for backward compatibility
export function createServerClient() {
  const cookieStore = cookies()
  return createServerClientSupabase(cookieStore)
}

// Re-export the service role client
export { createServiceRoleClient }

// For any legacy imports, also export the browser client
export { getBrowserClient } from "@/lib/supabase/client"

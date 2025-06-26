"use client"

// Re-export everything from the client and server modules for convenience
export { getBrowserClient } from "@/lib/supabase/client"
export { createServerClient, createServiceRoleClient } from "@/lib/supabase/server"

// For backward compatibility, also export the browser client as 'supabase'
import { getBrowserClient } from "@/lib/supabase/client"
export const supabase = getBrowserClient()

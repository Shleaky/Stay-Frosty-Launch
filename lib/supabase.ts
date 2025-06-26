"use client"

// Re-export everything from the client and server modules for convenience
export { getBrowserClient } from "./supabase/client"
export { createServerClient, createServiceRoleClient } from "./supabase/server"

// For backward compatibility, also export the browser client as 'supabase'
import { getBrowserClient } from "./supabase/client"
export const supabase = getBrowserClient()

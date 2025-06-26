// Main entry point for all Supabase operations
// This provides a clean, consistent API for the entire application

export { getBrowserClient } from "./client"
export { createServerClient, createServiceRoleClient } from "./server"
export type { Database } from "@/types/database"

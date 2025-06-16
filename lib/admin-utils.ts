import type { User } from "@supabase/supabase-js"

// List of admin email addresses
const ADMIN_EMAILS = ["admin@stayfrosty.com", "stayfrastyco@gmail.com", "codypayne.it@gmail.com"]

/**
 * Check if a user has admin privileges
 * @param user The current user object
 * @returns Boolean indicating if the user is an admin
 */
export function isAdmin(user: User | null): boolean {
  if (!user || !user.email) return false
  return ADMIN_EMAILS.includes(user.email.toLowerCase())
}

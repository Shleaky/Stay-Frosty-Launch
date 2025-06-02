import { createServerClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") || "/"

  if (code) {
    try {
      const supabase = createServerClient()

      // Exchange the code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("Error exchanging code for session:", error)
        return NextResponse.redirect(`${origin}/auth/auth-error?error=${encodeURIComponent(error.message)}`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    } catch (err) {
      console.error("Unexpected error in auth callback:", err)
      return NextResponse.redirect(`${origin}/auth/auth-error?error=unexpected_error`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-error?error=no_code_provided`)
}

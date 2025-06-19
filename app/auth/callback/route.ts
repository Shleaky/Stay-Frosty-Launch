import { createServerClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") || "/"
  const error_code = searchParams.get("error_code")
  const error_description = searchParams.get("error_description")

  console.log("Auth callback received:", { code: !!code, error_code, error_description, next })

  // Handle error cases first
  if (error_code || error_description) {
    console.error("Auth callback error:", { error_code, error_description })
    return NextResponse.redirect(
      `${origin}/auth/auth-error?error=${encodeURIComponent(error_description || error_code || "unknown_error")}`,
    )
  }

  if (code) {
    try {
      const supabase = createServerClient()

      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("Error exchanging code for session:", error)
        return NextResponse.redirect(`${origin}/auth/auth-error?error=${encodeURIComponent(error.message)}`)
      }

      if (data?.user) {
        console.log("Successfully confirmed user:", data.user.email)

        // Verify the user is confirmed
        if (!data.user.email_confirmed_at) {
          console.warn("User email not confirmed after exchange")
          return NextResponse.redirect(`${origin}/auth/verify?message=confirmation_pending`)
        }

        // Create response with proper redirect
        const response = NextResponse.redirect(`${origin}${next}`)

        // Set session cookies manually to ensure they persist
        if (data.session) {
          response.cookies.set("sb-access-token", data.session.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: data.session.expires_in,
          })

          response.cookies.set("sb-refresh-token", data.session.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
          })
        }

        return response
      }

      return NextResponse.redirect(`${origin}/auth/auth-error?error=no_user_data`)
    } catch (err) {
      console.error("Unexpected error in auth callback:", err)
      return NextResponse.redirect(`${origin}/auth/auth-error?error=unexpected_error`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-error?error=no_code_provided`)
}

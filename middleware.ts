import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function middleware(request: NextRequest) {
  // Create a Supabase client configured to use cookies
  const supabase = createServerClient()

  try {
    // Refresh session if expired - required for Server Components
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If user is not signed in and the current path is not /auth/*, redirect to /auth/login
    if (!session && !request.nextUrl.pathname.startsWith("/auth/")) {
      if (
        request.nextUrl.pathname === "/profile" ||
        request.nextUrl.pathname === "/booking" ||
        request.nextUrl.pathname === "/bookings"
      ) {
        const redirectUrl = new URL("/auth/login", request.url)
        redirectUrl.searchParams.set("next", request.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
      }
    }

    // If user is signed in and the current path is /auth/*, redirect to /profile
    if (session && request.nextUrl.pathname.startsWith("/auth/")) {
      return NextResponse.redirect(new URL("/profile", request.url))
    }

    // Add security headers to all responses
    const response = NextResponse.next()
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-XSS-Protection", "1; mode=block")

    return response
  } catch (error) {
    console.error("Middleware error:", error)

    // For API routes, return a JSON error
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Internal Server Error", message: "An unexpected error occurred" },
        { status: 500 },
      )
    }

    // For non-API routes, redirect to error page with the error message
    const errorUrl = new URL("/error", request.url)
    errorUrl.searchParams.set("message", "An unexpected error occurred")
    return NextResponse.redirect(errorUrl)
  }
}

// Specify the paths this middleware should run on
export const config = {
  matcher: ["/profile/:path*", "/booking/:path*", "/bookings/:path*", "/auth/:path*", "/api/:path*"],
}

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

    // Protected routes that require authentication
    const protectedPaths = ["/profile", "/bookings", "/booking"]
    const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

    // If user is not signed in and trying to access protected route
    if (!session && isProtectedPath) {
      console.log(`Redirecting unauthenticated user from ${request.nextUrl.pathname} to login`)
      const redirectUrl = new URL("/auth/login", request.url)
      redirectUrl.searchParams.set("next", request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If user is signed in and trying to access auth pages, redirect to profile
    if (session && request.nextUrl.pathname.startsWith("/auth/")) {
      console.log(`Redirecting authenticated user from ${request.nextUrl.pathname} to profile`)
      return NextResponse.redirect(new URL("/profile", request.url))
    }

    // Add security headers to all responses
    const response = NextResponse.next()
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-XSS-Protection", "1; mode=block")

    // Add cache control for auth-related pages
    if (isProtectedPath) {
      response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate")
      response.headers.set("Pragma", "no-cache")
      response.headers.set("Expires", "0")
    }

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

    // For non-API routes, redirect to login with error message
    const loginUrl = new URL("/auth/login", request.url)
    loginUrl.searchParams.set("message", "error")
    return NextResponse.redirect(loginUrl)
  }
}

// Specify the paths this middleware should run on
export const config = {
  matcher: ["/profile/:path*", "/booking/:path*", "/bookings/:path*", "/auth/:path*", "/api/:path*"],
}

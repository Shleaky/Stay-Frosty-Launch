import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  try {
    const response = NextResponse.next()

    // Get Supabase session cookies - these are the actual cookie names Supabase uses
    const supabaseAuthToken = request.cookies.get("sb-kzmfwad4p84q2npcqdet-auth-token")?.value
    const supabaseAuthTokenLegacy = request.cookies.get("supabase-auth-token")?.value

    // Check for any Supabase auth cookies (they can have different patterns)
    const authCookies = request.cookies
      .getAll()
      .filter(
        (cookie) =>
          cookie.name.includes("supabase") || cookie.name.includes("sb-") || cookie.name.includes("auth-token"),
      )

    const { pathname } = request.nextUrl

    // Protected routes that require authentication
    const protectedPaths = ["/profile", "/bookings", "/booking", "/admin"]
    const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path))

    // Auth routes that should redirect if already authenticated
    const authPaths = ["/auth/login", "/auth/signup"]
    const isAuthPath = authPaths.some((path) => pathname.startsWith(path))

    // More lenient session detection
    const hasSession = !!(supabaseAuthToken || supabaseAuthTokenLegacy || authCookies.length > 0)

    console.log(
      `Middleware: ${pathname}, HasSession: ${hasSession}, AuthCookies: ${authCookies.length}, Protected: ${isProtectedPath}, Auth: ${isAuthPath}`,
    )

    // If we're on a protected path and there's any doubt about auth status, let the client handle it
    // This prevents redirect loops while the client-side auth is initializing
    if (isProtectedPath && !hasSession) {
      // Only redirect if we're certain there's no session
      // Add a small delay to allow client-side auth to initialize
      const hasAnyAuthCookie = request.cookies
        .getAll()
        .some(
          (cookie) =>
            cookie.name.toLowerCase().includes("auth") ||
            cookie.name.toLowerCase().includes("session") ||
            cookie.name.toLowerCase().includes("supabase") ||
            cookie.name.toLowerCase().includes("sb-"),
        )

      if (!hasAnyAuthCookie) {
        console.log(`Redirecting unauthenticated user from ${pathname} to login`)
        const redirectUrl = new URL("/auth/login", request.url)
        redirectUrl.searchParams.set("next", pathname)
        return NextResponse.redirect(redirectUrl)
      } else {
        console.log(`Allowing access to ${pathname} - auth cookies present, letting client handle`)
      }
    }

    // If user is signed in and trying to access auth pages, redirect to profile
    if (hasSession && isAuthPath) {
      console.log(`Redirecting authenticated user from ${pathname} to profile`)
      return NextResponse.redirect(new URL("/profile", request.url))
    }

    // Add security headers to all responses
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-XSS-Protection", "1; mode=block")

    // Add cache control for auth-related pages
    if (isProtectedPath || isAuthPath) {
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

    // For non-API routes, allow the request to continue
    return NextResponse.next()
  }
}

// Specify the paths this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}

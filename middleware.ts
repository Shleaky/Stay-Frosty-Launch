import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  try {
    const response = NextResponse.next()
    const { pathname } = request.nextUrl

    // Protected routes that require authentication
    const protectedPaths = ["/profile", "/bookings", "/booking", "/admin"]
    const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path))

    // Auth routes that should redirect if already authenticated
    const authPaths = ["/auth/login", "/auth/signup"]
    const isAuthPath = authPaths.some((path) => pathname.startsWith(path))

    // Get all cookies and look for any Supabase-related ones
    const allCookies = request.cookies.getAll()
    const authCookies = allCookies.filter((cookie) => {
      const name = cookie.name.toLowerCase()
      return (
        name.includes("supabase") ||
        name.includes("sb-") ||
        name.includes("auth") ||
        name.includes("session") ||
        name.includes("access") ||
        name.includes("refresh")
      )
    })

    // More comprehensive session detection
    const hasAuthCookies = authCookies.length > 0
    const hasLocalStorageIndicator = request.headers.get("x-has-auth") === "true" // We'll set this from client

    console.log(
      `Middleware: ${pathname}, AuthCookies: ${authCookies.length}, CookieNames: [${authCookies.map((c) => c.name).join(", ")}], Protected: ${isProtectedPath}, Auth: ${isAuthPath}`,
    )

    // For protected paths, be more lenient - let client-side handle auth if there's any doubt
    if (isProtectedPath) {
      // Only redirect if we're absolutely sure there's no authentication
      // This prevents redirect loops while client-side auth is initializing
      if (!hasAuthCookies && !hasLocalStorageIndicator) {
        // Add a delay header to prevent immediate redirects
        const hasRecentRedirect = request.headers.get("referer")?.includes("/auth/login")

        if (!hasRecentRedirect) {
          console.log(`Redirecting unauthenticated user from ${pathname} to login`)
          const redirectUrl = new URL("/auth/login", request.url)
          redirectUrl.searchParams.set("next", pathname)
          return NextResponse.redirect(redirectUrl)
        } else {
          console.log(`Skipping redirect to prevent loop - letting client handle auth`)
        }
      } else {
        console.log(`Allowing access to ${pathname} - auth indicators present`)
      }
    }

    // If user has auth cookies and trying to access auth pages, redirect to profile
    if (hasAuthCookies && isAuthPath) {
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

    // For non-API routes, allow the request to continue to prevent blocking
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

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  try {
    const response = NextResponse.next()

    // Get the session token from cookies
    const accessToken = request.cookies.get("sb-access-token")?.value
    const refreshToken = request.cookies.get("sb-refresh-token")?.value

    const { pathname } = request.nextUrl

    // Protected routes that require authentication
    const protectedPaths = ["/profile", "/bookings", "/booking", "/admin"]
    const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path))

    // Auth routes that should redirect if already authenticated
    const authPaths = ["/auth/login", "/auth/signup"]
    const isAuthPath = authPaths.some((path) => pathname.startsWith(path))

    // Simple session check based on token presence
    const hasSession = !!(accessToken && refreshToken)

    console.log(
      `Middleware: ${pathname}, HasSession: ${hasSession}, Protected: ${isProtectedPath}, Auth: ${isAuthPath}`,
    )

    // If user is not signed in and trying to access protected route
    if (!hasSession && isProtectedPath) {
      console.log(`Redirecting unauthenticated user from ${pathname} to login`)
      const redirectUrl = new URL("/auth/login", request.url)
      redirectUrl.searchParams.set("next", pathname)
      return NextResponse.redirect(redirectUrl)
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

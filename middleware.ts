import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function middleware(request: NextRequest) {
  // Create a Supabase client configured to use cookies
  const supabase = createServerClient()

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is not signed in and the current path is not /auth/*, redirect to /auth/login
  if (!session && !request.nextUrl.pathname.startsWith("/auth/")) {
    if (request.nextUrl.pathname === "/profile" || request.nextUrl.pathname === "/booking") {
      const redirectUrl = new URL("/auth/login", request.url)
      redirectUrl.searchParams.set("next", request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // If user is signed in and the current path is /auth/*, redirect to /profile
  if (session && request.nextUrl.pathname.startsWith("/auth/")) {
    return NextResponse.redirect(new URL("/profile", request.url))
  }

  return NextResponse.next()
}

// Specify the paths this middleware should run on
export const config = {
  matcher: ["/profile/:path*", "/booking/:path*", "/auth/:path*"],
}

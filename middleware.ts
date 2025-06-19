import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import type { CookieOptions } from "@supabase/ssr"

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Middleware: Supabase URL or Anon Key not defined.")
    // Potentially redirect to an error page or allow request if critical env vars are missing
    return response
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options }) // Update request cookies for subsequent operations
        response.cookies.set({ name, value, ...options }) // Set cookie on the response
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.delete(name) // Update request cookies
        response.cookies.delete({ name, ...options }) // Delete cookie on the response
      },
    },
  })

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError) {
    console.error("Middleware: Error getting session:", sessionError.message)
    // Decide how to handle session errors, maybe redirect to a generic error page
  }

  const { pathname } = request.nextUrl

  const protectedPaths = ["/profile", "/bookings", "/booking", "/admin"]
  const authPaths = ["/auth/login", "/auth/signup", "/auth/verify", "/auth/auth-error", "/auth/confirm-error"]

  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path))
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path))

  console.log(
    `Middleware: Path: ${pathname}, Session: ${session ? session.user.email : "None"}, Protected: ${isProtectedPath}, AuthPage: ${isAuthPath}`,
  )

  if (!session && isProtectedPath) {
    console.log(`Middleware: No session, redirecting from protected path ${pathname} to /auth/login`)
    const redirectUrl = new URL("/auth/login", request.url)
    redirectUrl.searchParams.set("next", pathname) // Preserve intended destination
    return NextResponse.redirect(redirectUrl)
  }

  if (session && isAuthPath) {
    // User is logged in but trying to access login/signup type pages
    // Exception: /auth/verify might be needed if email isn't confirmed yet.
    if (pathname === "/auth/verify" && !session.user.email_confirmed_at) {
      console.log("Middleware: Authenticated user accessing /auth/verify for email confirmation.")
    } else if (pathname !== "/auth/verify") {
      // Allow /auth/verify if needed, otherwise redirect
      console.log(`Middleware: Session found, redirecting from auth path ${pathname} to /profile`)
      return NextResponse.redirect(new URL("/profile", request.url))
    }
  }

  // Refresh session if necessary
  // This is important to keep the session alive and cookies updated
  if (session) {
    await supabase.auth.refreshSession()
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder contents (e.g. /images/, /placeholder.svg)
     * - api routes (unless you want to protect them too)
     */
    "/((?!_next/static|_next/image|favicon.ico|images/|placeholder.svg|api/).*)",
  ],
}

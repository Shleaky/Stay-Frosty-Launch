"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { Session, User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import { getBrowserClient } from "@/lib/supabase"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  error: string | null
  signUp: (email: string, password: string, metadata: any) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<any>
  refreshSession: () => Promise<void>
  resendConfirmation: (email: string) => Promise<any>
}

const defaultAuthContext: AuthContextType = {
  user: null,
  session: null,
  isLoading: true,
  error: null,
  signUp: async () => ({ data: null, error: new Error("Auth context not initialized") }),
  signIn: async () => ({ data: null, error: new Error("Auth context not initialized") }),
  signOut: async () => ({ error: new Error("Auth context not initialized") }),
  refreshSession: async () => {},
  resendConfirmation: async () => ({ data: null, error: new Error("Auth context not initialized") }),
}

const AuthContext = createContext<AuthContextType>(defaultAuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [supabaseClient, setSupabaseClient] = useState<any>(null)
  const router = useRouter()

  // Initialize client only once
  useEffect(() => {
    if (typeof window !== "undefined" && !supabaseClient) {
      try {
        const client = getBrowserClient()
        setSupabaseClient(client)
      } catch (err) {
        console.error("Failed to get Supabase client:", err)
        setError("Failed to initialize authentication")
      }
    }
  }, [supabaseClient])

  useEffect(() => {
    // Prevent multiple initializations
    if (isInitialized || !supabaseClient) return

    const initializeAuth = async () => {
      try {
        console.log("Initializing auth context...")

        // Check if environment variables are available
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          setError("Missing Supabase configuration")
          setIsLoading(false)
          return
        }

        // Get initial session
        const {
          data: { session: initialSession },
          error: sessionError,
        } = await supabaseClient.auth.getSession()

        if (sessionError) {
          console.error("Error fetching initial session:", sessionError)
          setError(sessionError.message)
        } else {
          console.log("Initial session:", initialSession?.user?.email || "No session")
          setSession(initialSession)
          setUser(initialSession?.user || null)
        }

        setIsInitialized(true)
      } catch (err) {
        console.error("Unexpected error initializing auth:", err)
        setError("Failed to initialize authentication")
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [isInitialized, supabaseClient])

  useEffect(() => {
    if (!isInitialized || !supabaseClient) return

    console.log("Setting up auth state listener...")

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.email || "No user")

      // Prevent rapid state changes
      if (event === "INITIAL_SESSION") {
        // Only update if different from current state
        if (session?.user?.id !== user?.id) {
          setSession(session)
          setUser(session?.user || null)
        }
        return
      }

      setSession(session)
      setUser(session?.user || null)

      // Handle sign out event
      if (event === "SIGNED_OUT") {
        console.log("User signed out, clearing state and redirecting...")

        // Clear state immediately
        setUser(null)
        setSession(null)

        // Get current path for redirect logic
        const currentPath = window.location.pathname
        const protectedPaths = ["/profile", "/bookings", "/booking"]

        // Redirect logic
        if (protectedPaths.some((path) => currentPath.startsWith(path))) {
          router.replace(`/auth/login?next=${encodeURIComponent(currentPath)}`)
        } else {
          router.replace("/auth/login")
        }
      }

      // Handle sign in event
      if (event === "SIGNED_IN" && session?.user) {
        console.log("User signed in:", session.user.email)

        // Check for redirect URL
        const urlParams = new URLSearchParams(window.location.search)
        const nextUrl = urlParams.get("next")

        if (nextUrl && nextUrl.startsWith("/")) {
          router.replace(nextUrl)
        }
      }
    })

    return () => {
      console.log("Cleaning up auth state listener")
      subscription.unsubscribe()
    }
  }, [isInitialized, router, user?.id, supabaseClient])

  const signUp = async (email: string, password: string, metadata: any) => {
    try {
      console.log("Signing up with:", { email, metadata })

      if (!supabaseClient) throw new Error("Supabase client not available")

      // First, let's try a simpler signup without metadata to isolate the issue
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          // Try without metadata first to see if that's causing the issue
          data: {
            full_name: metadata.full_name || "",
            phone: metadata.phone || "",
            receive_marketing: metadata.receive_marketing || false,
          },
        },
      })

      if (error) {
        console.error("Signup error details:", {
          message: error.message,
          status: error.status,
          name: error.name,
        })

        // Handle specific database errors
        if (error.message.includes("Database error saving new user")) {
          return {
            data: null,
            error: {
              ...error,
              message:
                "There was an issue creating your account. This might be due to database configuration. Please try again or contact support if the problem persists.",
            },
          }
        }

        if (error.message.includes("User already registered")) {
          return {
            data: null,
            error: {
              ...error,
              message: "This email address is already registered. Please log in or use a different email.",
            },
          }
        }

        // Handle rate limiting
        if (error.message.includes("rate limit")) {
          return {
            data: null,
            error: {
              ...error,
              message: "Too many signup attempts. Please wait a few minutes before trying again.",
            },
          }
        }
      }

      return { data, error }
    } catch (err) {
      console.error("Unexpected signup error:", err)
      return {
        data: null,
        error: {
          message: "An unexpected error occurred during signup. Please try again.",
          originalError: err instanceof Error ? err.message : String(err),
        },
      }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Signing in with:", email)

      if (!supabaseClient) throw new Error("Supabase client not available")

      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Sign in error:", error)

        // Handle email not confirmed error specifically
        if (error.message.includes("Email not confirmed")) {
          return {
            data: null,
            error: {
              ...error,
              message:
                "Please check your email and click the confirmation link before signing in. You can request a new confirmation email below.",
              needsConfirmation: true,
              email: email,
            },
          }
        }
      } else {
        console.log("Sign in successful")
      }

      return { data, error }
    } catch (err) {
      console.error("Unexpected sign in error:", err)
      return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
    }
  }

  const signOut = async () => {
    try {
      console.log("Initiating sign out...")

      if (!supabaseClient) throw new Error("Supabase client not available")

      // Clear local state immediately
      setUser(null)
      setSession(null)

      const { error } = await supabaseClient.auth.signOut()

      if (error) {
        console.error("Sign out error:", error)
      }

      // Force redirect regardless of error
      const currentPath = window.location.pathname
      const protectedPaths = ["/profile", "/bookings", "/booking"]

      if (protectedPaths.some((path) => currentPath.startsWith(path))) {
        router.replace("/auth/login?message=signed_out")
      } else {
        router.replace("/auth/login")
      }

      return { error }
    } catch (err) {
      console.error("Unexpected sign out error:", err)

      // Clear state and redirect even on error
      setUser(null)
      setSession(null)
      router.replace("/auth/login?message=error")

      return { error: err instanceof Error ? err : new Error(String(err)) }
    }
  }

  const refreshSession = async () => {
    try {
      if (!supabaseClient) return

      const {
        data: { session },
      } = await supabaseClient.auth.getSession()

      setSession(session)
      setUser(session?.user || null)
    } catch (err) {
      console.error("Error refreshing session:", err)
    }
  }

  const resendConfirmation = async (email: string) => {
    try {
      console.log("Resending confirmation email to:", email)

      if (!supabaseClient) throw new Error("Supabase client not available")

      const { data, error } = await supabaseClient.auth.resend({
        type: "signup",
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error("Resend confirmation error:", error)
      } else {
        console.log("Confirmation email resent successfully")
      }

      return { data, error }
    } catch (err) {
      console.error("Unexpected resend confirmation error:", err)
      return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, session, isLoading, error, signUp, signIn, signOut, refreshSession, resendConfirmation }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  return context
}

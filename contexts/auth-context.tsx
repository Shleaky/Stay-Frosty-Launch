"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useRef } from "react"
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
}

const AuthContext = createContext<AuthContextType>(defaultAuthContext)

// Global flag to prevent multiple auth context initializations
let globalAuthInitialized = false

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const mountedRef = useRef(true)
  const subscriptionRef = useRef<any>(null)

  useEffect(() => {
    // Prevent multiple initializations globally
    if (globalAuthInitialized || typeof window === "undefined") {
      setIsLoading(false)
      return
    }

    globalAuthInitialized = true

    const initializeAuth = async () => {
      try {
        console.log("Initializing auth context...")

        // Check if environment variables are available
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          setError("Missing Supabase configuration")
          setIsLoading(false)
          return
        }

        const supabase = getBrowserClient()

        // Get initial session
        const {
          data: { session: initialSession },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (!mountedRef.current) return

        if (sessionError) {
          console.error("Error fetching initial session:", sessionError)
          setError(sessionError.message)
        } else {
          console.log("Initial session:", initialSession?.user?.email || "No session")
          setSession(initialSession)
          setUser(initialSession?.user || null)
        }

        // Set up auth state listener
        console.log("Setting up auth state listener...")
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!mountedRef.current) return

          console.log("Auth state changed:", event, session?.user?.email || "No user")

          // Handle different auth events
          switch (event) {
            case "INITIAL_SESSION":
              // Skip if we already have the same session
              if (session?.user?.id === user?.id) return
              setSession(session)
              setUser(session?.user || null)
              break

            case "SIGNED_IN":
              console.log("User signed in:", session?.user?.email)
              setSession(session)
              setUser(session?.user || null)

              // Handle redirects after sign in
              const urlParams = new URLSearchParams(window.location.search)
              const nextUrl = urlParams.get("next")

              if (nextUrl && nextUrl.startsWith("/")) {
                router.replace(nextUrl)
              } else if (window.location.pathname.startsWith("/auth/")) {
                router.replace("/profile")
              }
              break

            case "SIGNED_OUT":
              console.log("User signed out, clearing state")
              setUser(null)
              setSession(null)

              // Only redirect if we're on a protected route
              const currentPath = window.location.pathname
              const protectedPaths = ["/profile", "/bookings", "/booking", "/admin"]

              if (protectedPaths.some((path) => currentPath.startsWith(path))) {
                router.replace(`/auth/login?next=${encodeURIComponent(currentPath)}`)
              }
              break

            case "TOKEN_REFRESHED":
              console.log("Token refreshed")
              setSession(session)
              setUser(session?.user || null)
              break

            default:
              setSession(session)
              setUser(session?.user || null)
          }
        })

        subscriptionRef.current = subscription
      } catch (err) {
        console.error("Unexpected error initializing auth:", err)
        if (mountedRef.current) {
          setError("Failed to initialize authentication")
        }
      } finally {
        if (mountedRef.current) {
          setIsLoading(false)
        }
      }
    }

    initializeAuth()

    // Cleanup function
    return () => {
      console.log("Cleaning up auth context")
      mountedRef.current = false
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
      }
      globalAuthInitialized = false
    }
  }, [router, user?.id])

  const signUp = async (email: string, password: string, metadata: any) => {
    try {
      console.log("Signing up with:", { email, metadata })

      const supabase = getBrowserClient()

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error("Signup error:", error)

        if (error.message.includes("User already registered")) {
          return {
            data: null,
            error: {
              ...error,
              message: "This email address is already registered. Please log in or use a different email.",
            },
          }
        }
      }

      return { data, error }
    } catch (err) {
      console.error("Unexpected signup error:", err)
      return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Signing in with:", email)

      const supabase = getBrowserClient()

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Sign in error:", error)
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

      const supabase = getBrowserClient()

      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("Sign out error:", error)
      }

      return { error }
    } catch (err) {
      console.error("Unexpected sign out error:", err)
      return { error: err instanceof Error ? err : new Error(String(err)) }
    }
  }

  const refreshSession = async () => {
    try {
      const supabase = getBrowserClient()

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (mountedRef.current) {
        setSession(session)
        setUser(session?.user || null)
      }
    } catch (err) {
      console.error("Error refreshing session:", err)
    }
  }

  return (
    <AuthContext.Provider value={{ user, session, isLoading, error, signUp, signIn, signOut, refreshSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  return context
}

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

// Singleton client instance
let supabaseClientInstance: any = null

function getSupabaseClient() {
  if (!supabaseClientInstance && typeof window !== "undefined") {
    supabaseClientInstance = getBrowserClient()
  }
  return supabaseClientInstance
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()
  const initializingRef = useRef(false)

  useEffect(() => {
    // Prevent multiple initializations
    if (isInitialized || initializingRef.current) return

    initializingRef.current = true

    const initializeAuth = async () => {
      try {
        console.log("Initializing auth context...")

        // Check if environment variables are available
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          setError("Missing Supabase configuration")
          setIsLoading(false)
          return
        }

        const supabase = getSupabaseClient()
        if (!supabase) {
          setError("Failed to initialize Supabase client")
          setIsLoading(false)
          return
        }

        // Get initial session
        const {
          data: { session: initialSession },
          error: sessionError,
        } = await supabase.auth.getSession()

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
        initializingRef.current = false
      }
    }

    initializeAuth()
  }, [])

  useEffect(() => {
    if (!isInitialized) return

    const supabase = getSupabaseClient()
    if (!supabase) return

    console.log("Setting up auth state listener...")

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email || "No user")

      // Handle different auth events
      switch (event) {
        case "INITIAL_SESSION":
          // Only update if different from current state
          if (session?.user?.id !== user?.id) {
            setSession(session)
            setUser(session?.user || null)
          }
          break

        case "SIGNED_IN":
          console.log("User signed in:", session?.user?.email)
          setSession(session)
          setUser(session?.user || null)

          // Check for redirect URL
          const urlParams = new URLSearchParams(window.location.search)
          const nextUrl = urlParams.get("next")

          if (nextUrl && nextUrl.startsWith("/")) {
            router.replace(nextUrl)
          } else if (window.location.pathname.startsWith("/auth/")) {
            router.replace("/profile")
          }
          break

        case "SIGNED_OUT":
          console.log("User signed out, clearing state and redirecting...")
          setUser(null)
          setSession(null)

          // Get current path for redirect logic
          const currentPath = window.location.pathname
          const protectedPaths = ["/profile", "/bookings", "/booking", "/admin"]

          // Redirect logic
          if (protectedPaths.some((path) => currentPath.startsWith(path))) {
            router.replace(`/auth/login?next=${encodeURIComponent(currentPath)}`)
          } else if (!currentPath.startsWith("/auth/")) {
            router.replace("/auth/login")
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

    return () => {
      console.log("Cleaning up auth state listener")
      subscription.unsubscribe()
    }
  }, [isInitialized, router, user?.id])

  const signUp = async (email: string, password: string, metadata: any) => {
    try {
      console.log("Signing up with:", { email, metadata })

      const supabase = getSupabaseClient()
      if (!supabase) throw new Error("Supabase client not available")

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

      const supabase = getSupabaseClient()
      if (!supabase) throw new Error("Supabase client not available")

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

      const supabase = getSupabaseClient()
      if (!supabase) throw new Error("Supabase client not available")

      // Clear local state immediately
      setUser(null)
      setSession(null)

      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("Sign out error:", error)
      }

      // Force redirect regardless of error
      const currentPath = window.location.pathname
      const protectedPaths = ["/profile", "/bookings", "/booking", "/admin"]

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
      const supabase = getSupabaseClient()
      if (!supabase) return

      const {
        data: { session },
      } = await supabase.auth.getSession()

      setSession(session)
      setUser(session?.user || null)
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

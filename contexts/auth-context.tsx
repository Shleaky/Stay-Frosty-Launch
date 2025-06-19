"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { Session, User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase"

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

// Global flag to prevent multiple initializations
let isInitializing = false
let isInitialized = false

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Get the singleton client
  const supabase = getSupabaseClient()

  useEffect(() => {
    // Prevent multiple initializations globally
    if (isInitializing || isInitialized) {
      setIsLoading(false)
      return
    }

    isInitializing = true

    const initializeAuth = async () => {
      try {
        // Get initial session
        const {
          data: { session: initialSession },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("Error fetching initial session:", sessionError)
          setError(sessionError.message)
        } else {
          setSession(initialSession)
          setUser(initialSession?.user || null)
        }

        isInitialized = true
      } catch (err) {
        console.error("Unexpected error initializing auth:", err)
        setError("Failed to initialize authentication")
      } finally {
        setIsLoading(false)
        isInitializing = false
      }
    }

    initializeAuth()

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION") return

      setSession(session)
      setUser(session?.user || null)

      if (event === "SIGNED_OUT") {
        setUser(null)
        setSession(null)
        router.replace("/auth/login")
      }

      if (event === "SIGNED_IN" && session?.user) {
        const urlParams = new URLSearchParams(window.location.search)
        const nextUrl = urlParams.get("next")
        if (nextUrl && nextUrl.startsWith("/")) {
          router.replace(nextUrl)
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])

  const signUp = async (email: string, password: string, metadata: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: metadata.full_name || "",
            phone: metadata.phone || "",
            receive_marketing: metadata.receive_marketing || false,
          },
        },
      })

      return { data, error }
    } catch (err) {
      return {
        data: null,
        error: {
          message: "An unexpected error occurred during signup. Please try again.",
        },
      }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error && error.message.includes("Email not confirmed")) {
        return {
          data: null,
          error: {
            ...error,
            message: "Please check your email and click the confirmation link before signing in.",
            needsConfirmation: true,
            email: email,
          },
        }
      }

      return { data, error }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
    }
  }

  const signOut = async () => {
    try {
      setUser(null)
      setSession(null)
      const { error } = await supabase.auth.signOut()
      router.replace("/auth/login")
      return { error }
    } catch (err) {
      setUser(null)
      setSession(null)
      router.replace("/auth/login")
      return { error: err instanceof Error ? err : new Error(String(err)) }
    }
  }

  const refreshSession = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user || null)
    } catch (err) {
      console.error("Error refreshing session:", err)
    }
  }

  const resendConfirmation = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resend({
        type: "signup",
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      return { data, error }
    } catch (err) {
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

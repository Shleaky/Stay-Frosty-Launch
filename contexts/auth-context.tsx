"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { Session, User, AuthError } from "@supabase/supabase-js"
import { useRouter, usePathname } from "next/navigation"
import { getBrowserClient } from "@/lib/supabase" // Use the singleton client

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  error: AuthError | null // Use Supabase AuthError type
  signUp: (email: string, password: string, metadata: any) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<any>
  resendConfirmation: (email: string) => Promise<any>
}

const defaultAuthContext: AuthContextType = {
  user: null,
  session: null,
  isLoading: true,
  error: null,
  signUp: async () => ({
    data: null,
    error: { name: "UninitializedAuthError", message: "Auth context not initialized" } as AuthError,
  }),
  signIn: async () => ({
    data: null,
    error: { name: "UninitializedAuthError", message: "Auth context not initialized" } as AuthError,
  }),
  signOut: async () => ({
    error: { name: "UninitializedAuthError", message: "Auth context not initialized" } as AuthError,
  }),
  resendConfirmation: async () => ({
    data: null,
    error: { name: "UninitializedAuthError", message: "Auth context not initialized" } as AuthError,
  }),
}

const AuthContext = createContext<AuthContextType>(defaultAuthContext)

let authInitialized = false // Module-level flag to ensure one-time setup

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<AuthError | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  const supabase = getBrowserClient() // Get the singleton instance

  useEffect(() => {
    if (authInitialized) {
      // If already initialized by another AuthProvider instance (e.g. due to HMR or multiple layouts)
      // try to get current session state quickly.
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false)
      })
      return
    }
    authInitialized = true
    console.log("AuthContext: Initializing and setting up onAuthStateChange listener.")

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession }, error: sessionError }) => {
      if (sessionError) {
        console.error("AuthContext: Error fetching initial session:", sessionError)
        setError(sessionError)
      }
      setSession(initialSession)
      setUser(initialSession?.user ?? null)
      setIsLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      console.log(`AuthContext: onAuthStateChange event: ${_event}, newSession user: ${newSession?.user?.email}`)
      setSession(newSession)
      setUser(newSession?.user ?? null)
      setError(null) // Clear previous errors on auth state change
      setIsLoading(false) // Ensure loading is false after state change

      if (_event === "SIGNED_OUT") {
        // Middleware should handle redirect for protected routes.
        // Client-side redirect can be a fallback or for non-protected pages if needed.
        if (!pathname.startsWith("/auth")) {
          // Avoid redirect loop if already on auth page
          // router.replace("/auth/login?message=signed_out");
        }
      }
      // SIGNED_IN redirects are typically handled by the login page or middleware
    })

    return () => {
      console.log("AuthContext: Cleaning up onAuthStateChange listener.")
      subscription?.unsubscribe()
      authInitialized = false // Reset for potential HMR or next full mount
    }
  }, [supabase, router, pathname])

  const signUp = useCallback(
    async (email: string, password: string, metadata: any) => {
      setIsLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: metadata,
        },
      })
      setIsLoading(false)
      if (error) setError(error)
      return { data, error }
    },
    [supabase],
  )

  const signIn = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      setIsLoading(false)
      if (error) {
        setError(error)
        if (error.message.includes("Email not confirmed")) {
          return {
            data,
            error: { ...error, needsConfirmation: true, email } as AuthError & {
              needsConfirmation?: boolean
              email?: string
            },
          }
        }
      }
      return { data, error }
    },
    [supabase],
  )

  const signOut = useCallback(async () => {
    setIsLoading(true)
    const { error } = await supabase.auth.signOut()
    // Session and user will be set to null by onAuthStateChange
    setIsLoading(false)
    if (error) setError(error)
    else router.push("/auth/login?message=signed_out") // Explicit redirect after sign out
    return { error }
  }, [supabase, router])

  const resendConfirmation = useCallback(
    async (email: string) => {
      setIsLoading(true)
      const { data, error } = await supabase.auth.resend({
        type: "signup",
        email: email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })
      setIsLoading(false)
      if (error) setError(error)
      return { data, error }
    },
    [supabase],
  )

  return (
    <AuthContext.Provider value={{ user, session, isLoading, error, signUp, signIn, signOut, resendConfirmation }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

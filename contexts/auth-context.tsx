"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { getBrowserClient } from "@/lib/supabase"
import type { AuthContextType, AuthResult } from "@/lib/supabase/types"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const supabase = getBrowserClient()

  useEffect(() => {
    let mounted = true

    // Get initial session
    const initializeAuth = async () => {
      try {
        const {
          data: { session: initialSession },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting initial session:", error)
        }

        if (mounted) {
          setSession(initialSession)
          setUser(initialSession?.user ?? null)
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error)
        if (mounted) {
          setSession(null)
          setUser(null)
          setIsLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email)

      if (mounted) {
        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        })

        if (error) {
          // Handle specific error cases
          if (error.message.includes("Email not confirmed")) {
            return {
              error: {
                ...error,
                message: "Please check your email and click the confirmation link before signing in.",
              } as any,
            }
          }
          return { error }
        }

        return { data }
      } catch (err) {
        console.error("Sign in error:", err)
        return {
          error: {
            message: "An unexpected error occurred during sign in",
          } as any,
        }
      }
    },
    [supabase],
  )

  const signUp = useCallback(
    async (email: string, password: string, metadata?: any): Promise<AuthResult> => {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: metadata,
          },
        })

        return { data, error }
      } catch (err) {
        console.error("Sign up error:", err)
        return {
          error: {
            message: "An unexpected error occurred during sign up",
          } as any,
        }
      }
    },
    [supabase],
  )

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Sign out error:", error)
      }
    } catch (error) {
      console.error("Failed to sign out:", error)
    }
  }, [supabase])

  const resendConfirmation = useCallback(
    async (email: string) => {
      try {
        const { error } = await supabase.auth.resend({
          type: "signup",
          email: email.trim().toLowerCase(),
        })
        return { error }
      } catch (err) {
        console.error("Resend confirmation error:", err)
        return {
          error: {
            message: "Failed to resend confirmation email",
          } as any,
        }
      }
    },
    [supabase],
  )

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    resendConfirmation,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

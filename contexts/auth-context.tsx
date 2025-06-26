"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ data?: any; error?: any }>
  signOut: () => Promise<void>
  resendConfirmation: (email: string) => Promise<{ error?: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (mounted) {
          setUser(session?.user ?? null)
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Error getting initial session:", error)
        if (mounted) {
          setUser(null)
          setIsLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email)
      if (mounted) {
        setUser(session?.user ?? null)
        setIsLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Check if it's an email confirmation error
        if (error.message.includes("Email not confirmed")) {
          return {
            error: {
              ...error,
              needsConfirmation: true,
              email: email,
            },
          }
        }
        return { error }
      }

      return { data }
    } catch (err) {
      return { error: { message: "An unexpected error occurred" } }
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      // The auth state change listener will handle updating the user state
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }, [])

  const resendConfirmation = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      })
      return { error }
    } catch (err) {
      return { error: { message: "Failed to resend confirmation email" } }
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signOut,
        resendConfirmation,
      }}
    >
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

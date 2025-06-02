"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { Session, User } from "@supabase/supabase-js"
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

// Update the context creation to provide a default value
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = getBrowserClient()

  useEffect(() => {
    const fetchSession = async () => {
      try {
        // Check if environment variables are available
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          setError("Missing Supabase configuration")
          setIsLoading(false)
          return
        }

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error fetching session:", error)
          setError(error.message)
        }

        setSession(session)
        setUser(session?.user || null)
      } catch (err) {
        console.error("Unexpected error fetching session:", err)
        setError("Failed to initialize authentication")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user || null)
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, metadata: any) => {
    try {
      console.log("Signing up with:", { email, password, metadata })

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
      }

      return { data, error }
    } catch (err) {
      console.error("Unexpected signup error:", err)
      return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
    }
  }

  // Updated to use email/password login
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Sign in error:", error)
      }

      return { data, error }
    } catch (err) {
      console.error("Unexpected sign in error:", err)
      return { data: null, error: err instanceof Error ? err : new Error(String(err)) }
    }
  }

  const signOut = async () => {
    try {
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

// Centralized type definitions for Supabase operations
import type { User, Session, AuthError } from "@supabase/supabase-js"

export interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (email: string, password: string, metadata?: any) => Promise<AuthResult>
  signOut: () => Promise<void>
  resendConfirmation: (email: string) => Promise<{ error?: AuthError }>
}

export interface AuthResult {
  data?: {
    user: User | null
    session: Session | null
  }
  error?: AuthError | null
}

export interface ProfileData {
  id: string
  full_name: string | null
  email: string
  phone: string | null
  receive_marketing: boolean
  created_at: string
  updated_at: string
}

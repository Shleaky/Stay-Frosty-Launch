"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { z } from "zod"

const SignupSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export type SignupState = {
  errors?: {
    email?: string[]
    password?: string[]
    confirmPassword?: string[]
    general?: string[]
  }
  message?: string
  success?: boolean
}

export async function signup(prevState: SignupState, formData: FormData): Promise<SignupState> {
  // Validate form data
  const validatedFields = SignupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password } = validatedFields.data

  try {
    const supabase = await createClient()

    // Check if user already exists
    const { data: existingUser } = await supabase.from("auth.users").select("email").eq("email", email).single()

    if (existingUser) {
      return {
        errors: {
          email: ["An account with this email already exists"],
        },
      }
    }

    // Attempt to sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })

    if (error) {
      console.error("Supabase signup error:", error)

      // Handle specific error cases
      if (error.message.includes("Database error saving new user")) {
        return {
          errors: {
            general: ["There was a database error creating your account. Please try again or contact support."],
          },
        }
      }

      if (error.message.includes("User already registered")) {
        return {
          errors: {
            email: ["An account with this email already exists"],
          },
        }
      }

      if (error.message.includes("Password should be at least")) {
        return {
          errors: {
            password: ["Password does not meet security requirements"],
          },
        }
      }

      return {
        errors: {
          general: [error.message || "An unexpected error occurred during signup"],
        },
      }
    }

    if (data.user && !data.user.email_confirmed_at) {
      return {
        success: true,
        message: "Please check your email and click the confirmation link to complete your registration.",
      }
    }

    if (data.user) {
      redirect("/dashboard")
    }

    return {
      errors: {
        general: ["Signup failed. Please try again."],
      },
    }
  } catch (error) {
    console.error("Unexpected signup error:", error)
    return {
      errors: {
        general: ["An unexpected error occurred. Please try again later."],
      },
    }
  }
}

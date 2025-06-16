import { createServerSupabaseClient } from "@/lib/supabase"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function signUp(formData: FormData) {
  "use server"

  const email = String(formData.get("email"))
  const password = String(formData.get("password"))

  const supabase = createServerSupabaseClient({ cookies })

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    return { message: error.message }
  }

  return redirect("/auth/check-email")
}

export async function signIn(formData: FormData) {
  "use server"

  const email = String(formData.get("email"))
  const password = String(formData.get("password"))

  const supabase = createServerSupabaseClient({ cookies })

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { message: error.message }
  }

  return redirect("/")
}

export async function signOut() {
  "use server"

  const supabase = createServerSupabaseClient({ cookies })

  await supabase.auth.signOut()

  return redirect("/auth/sign-in")
}

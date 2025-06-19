import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function actionLoginWithGithub() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    console.log(error)
    return
  }

  redirect(data.url)
}

export async function actionSignOut() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { error } = await supabase.auth.signOut()

  if (error) {
    console.log(error)
    return
  }

  return redirect("/")
}

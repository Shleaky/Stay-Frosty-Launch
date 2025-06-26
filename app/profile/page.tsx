import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { AuthButtonServer } from "@/components/auth-button-server"
import type { Metadata } from "next"
import { supabase } from "@/lib/supabase"

export const metadata: Metadata = {
  title: "Profile",
  description: "Your profile page",
}

async function getSession() {
  const supabase = createServerComponentClient({ cookies })
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error("Error:", error)
    return null
  }
}

export default async function Profile() {
  const session = await getSession()

  if (!session) {
    redirect("/")
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(`username, full_name, avatar_url, website`)
    .eq("id", session.user.id)
    .single()

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold mb-4">Profile</h1>
      <p>Welcome {session.user.email}!</p>
      <p>Username: {profile?.username}</p>
      <AuthButtonServer />
    </div>
  )
}

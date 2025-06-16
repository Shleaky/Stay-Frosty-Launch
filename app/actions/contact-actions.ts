import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createContact(formData: FormData) {
  "use server"

  const supabase = createServerSupabaseClient()

  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const message = formData.get("message") as string

  const { data, error } = await supabase.from("contacts").insert([{ name, email, message }])

  if (error) {
    console.error(error)
    return redirect("/contact?message=Error, something went wrong")
  }

  revalidatePath("/contact")
  redirect("/contact?message=Thank you for your message!")
}

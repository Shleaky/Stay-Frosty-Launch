import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function addPaymentAction(formData: FormData) {
  "use server"

  const supabase = createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  const payment = formData.get("payment") as string

  const { error } = await supabase.from("payments").insert({ payment, user_id: user.id })

  if (error) {
    console.log(error)
    return
  }

  revalidatePath("/")
  redirect("/")
}

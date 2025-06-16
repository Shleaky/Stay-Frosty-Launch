import { createServerSupabaseClient } from "@/lib/supabase"
import type { Product } from "@/types"

export const getProducts = async (): Promise<Product[]> => {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })

  if (error) {
    console.log(error)
    return []
  }

  return (data as any) || []
}

export const getProduct = async (id: string): Promise<Product | null> => {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

  if (error) {
    console.log(error)
    return null
  }

  return (data as any) || null
}

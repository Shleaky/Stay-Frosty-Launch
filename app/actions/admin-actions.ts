"use server"

import { createServerClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { validate } from "@/lib/validators"
import { isAdmin } from "@/lib/admin-utils"
import type { User } from "@supabase/supabase-js"

// Product validation schema
const productSchema = z.object({
  id: z.string().min(3).max(50),
  name: z.string().min(3).max(100),
  description: z.string().min(10),
  price: z.number().positive(),
  category: z.string().min(2),
  hasFlavors: z.boolean(),
  inStock: z.boolean(),
  image: z.string().url(),
})

export type NewProductData = z.infer<typeof productSchema>

export async function addNewProduct(productData: NewProductData, user: User | null) {
  try {
    // Verify admin status
    if (!isAdmin(user)) {
      return { success: false, error: "Unauthorized. Admin access required." }
    }

    // Validate product data
    const validation = await validate(productSchema, productData)
    if (!validation.success) {
      return {
        success: false,
        error: "Validation failed",
        validationErrors: validation.errors,
      }
    }

    const supabase = createServerClient()

    // Insert into products table
    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          id: productData.id,
          name: productData.name,
          description: productData.description,
          price: productData.price,
          category: productData.category,
          has_flavors: productData.hasFlavors,
          in_stock: productData.inStock,
          image: productData.image,
          created_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      console.error("Error adding product:", error)
      return { success: false, error: error.message }
    }

    // Revalidate products page to show the new product
    revalidatePath("/products")
    revalidatePath("/admin/products")

    return { success: true, data: data[0] }
  } catch (error) {
    console.error("Unexpected error adding product:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

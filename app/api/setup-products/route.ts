import { createServerSupabaseClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient()

  try {
    const { data, error } = await supabase.from("products").insert([
      {
        name: "Product 1",
        description: "Description for Product 1",
        price: 29.99,
        image_url: "https://example.com/product1.jpg",
      },
      {
        name: "Product 2",
        description: "Description for Product 2",
        price: 49.99,
        image_url: "https://example.com/product2.jpg",
      },
    ])

    if (error) {
      console.error("Error inserting products:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Products setup successfully" }, { status: 200 })
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

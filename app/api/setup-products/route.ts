import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function POST() {
  try {
    const supabase = createServerClient()

    // Create product_orders table
    const { error: ordersError } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS product_orders (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            status VARCHAR(50) DEFAULT 'pending',
            total_amount DECIMAL(10,2) NOT NULL,
            shipping_status VARCHAR(50) DEFAULT 'not_shipped',
            payment_intent_id VARCHAR(255),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
    })

    if (ordersError) {
      console.error("Error creating product_orders table:", ordersError)
      return NextResponse.json({ success: false, error: ordersError.message })
    }

    // Create order_items table
    const { error: itemsError } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS order_items (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            order_id UUID REFERENCES product_orders(id) ON DELETE CASCADE,
            product_id VARCHAR(255) NOT NULL,
            quantity INTEGER NOT NULL,
            flavor_id VARCHAR(255),
            price DECIMAL(10,2) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
    })

    if (itemsError) {
      console.error("Error creating order_items table:", itemsError)
      return NextResponse.json({ success: false, error: itemsError.message })
    }

    return NextResponse.json({ success: true, message: "Product tables created successfully" })
  } catch (error) {
    console.error("Error setting up product tables:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    })
  }
}

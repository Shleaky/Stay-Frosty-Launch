"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

export async function createProductOrder(orderData: {
  items: Array<{
    productId: string
    quantity: number
    flavorId?: string
    price: number
  }>
  userId: string
  totalAmount: number
}) {
  try {
    const supabase = createServerSupabaseClient()

    // Create the order record
    const { data: order, error: orderError } = await supabase
      .from("product_orders")
      .insert({
        user_id: orderData.userId,
        total_amount: orderData.totalAmount,
        status: "pending",
        payment_status: "pending",
      })
      .select()
      .single()

    if (orderError || !order) {
      console.error("Error creating order:", orderError)
      return { success: false, error: "Failed to create order" }
    }

    // Create order items
    const orderItems = orderData.items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      flavor_id: item.flavorId,
      price: item.price,
    }))

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

    if (itemsError) {
      console.error("Error creating order items:", itemsError)
      return { success: false, error: "Failed to create order items" }
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(orderData.totalAmount * 100), // Convert to cents
      currency: "usd",
      metadata: {
        order_id: order.id,
        user_id: orderData.userId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return {
      success: true,
      orderId: order.id,
      clientSecret: paymentIntent.client_secret,
    }
  } catch (error) {
    console.error("Error creating product order:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

export async function updateOrderPaymentStatus(orderId: string, paymentIntentId: string, status: string) {
  try {
    const supabase = createServerSupabaseClient()

    const { error } = await supabase
      .from("product_orders")
      .update({
        payment_status: status,
        payment_intent_id: paymentIntentId,
        status: status === "paid" ? "confirmed" : "failed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)

    if (error) {
      console.error("Error updating order payment status:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/products")
    revalidatePath("/profile")

    return { success: true }
  } catch (error) {
    console.error("Error updating order payment status:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

export async function getProducts() {
  try {
    const supabase = createServerSupabaseClient()

    const { data: products, error } = await supabase
      .from("products")
      .select(`
        *,
        product_flavors (
          id,
          name,
          color
        )
      `)
      .eq("active", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching products:", error)
      return { success: false, error: error.message, products: [] }
    }

    return { success: true, products: products || [] }
  } catch (error) {
    console.error("Error fetching products:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
      products: [],
    }
  }
}

export async function getProductById(id: string) {
  try {
    const supabase = createServerSupabaseClient()

    const { data: product, error } = await supabase
      .from("products")
      .select(`
        *,
        product_flavors (
          id,
          name,
          color
        )
      `)
      .eq("id", id)
      .eq("active", true)
      .single()

    if (error) {
      console.error("Error fetching product:", error)
      return { success: false, error: error.message, product: null }
    }

    return { success: true, product }
  } catch (error) {
    console.error("Error fetching product:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
      product: null,
    }
  }
}

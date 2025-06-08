"use server"

import { createServerClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import Stripe from "stripe"
import { getProductById } from "@/lib/product-data"

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

type OrderItem = {
  productId: string
  quantity: number
  flavorId?: string
  price: number
}

export async function createProductOrder({
  items,
  userId,
  totalAmount,
}: {
  items: OrderItem[]
  userId: string
  totalAmount: number
}) {
  try {
    if (!userId) {
      return { success: false, error: "User ID is required" }
    }

    if (items.length === 0) {
      return { success: false, error: "No items in order" }
    }

    // Validate items
    for (const item of items) {
      const product = getProductById(item.productId)
      if (!product) {
        return { success: false, error: `Product not found: ${item.productId}` }
      }

      if (item.flavorId && product.hasFlavors) {
        const flavorExists = product.flavors?.some((f) => f.id === item.flavorId)
        if (!flavorExists) {
          return { success: false, error: `Invalid flavor for product: ${product.name}` }
        }
      }
    }

    const supabase = createServerClient()

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from("product_orders")
      .insert([
        {
          user_id: userId,
          status: "pending",
          total_amount: totalAmount,
          shipping_status: "not_shipped",
        },
      ])
      .select()

    if (orderError || !order || order.length === 0) {
      console.error("Error creating order:", orderError)
      return { success: false, error: orderError?.message || "Failed to create order" }
    }

    const orderId = order[0].id

    // Insert order items
    const orderItems = items.map((item) => ({
      order_id: orderId,
      product_id: item.productId,
      quantity: item.quantity,
      flavor_id: item.flavorId || null,
      price: item.price,
    }))

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

    if (itemsError) {
      console.error("Error creating order items:", itemsError)
      return { success: false, error: itemsError.message }
    }

    // Create a PaymentIntent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: "aud", // Australian dollars
      metadata: {
        order_id: orderId,
        user_id: userId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    // Update order with payment intent ID
    await supabase
      .from("product_orders")
      .update({
        payment_intent_id: paymentIntent.id,
      })
      .eq("id", orderId)

    revalidatePath("/products")

    return {
      success: true,
      orderId,
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
    if (!orderId || !paymentIntentId || !status) {
      return {
        success: false,
        error: "Missing required parameters",
      }
    }

    const supabase = createServerClient()

    const { error } = await supabase
      .from("product_orders")
      .update({
        status: status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .eq("payment_intent_id", paymentIntentId)

    if (error) {
      console.error("Error updating order payment status:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/products")

    return { success: true }
  } catch (error) {
    console.error("Error updating order payment status:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

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
    console.log("Creating product order with:", { items, userId, totalAmount })

    if (!userId) {
      return { success: false, error: "User ID is required" }
    }

    if (items.length === 0) {
      return { success: false, error: "No items in order" }
    }

    if (totalAmount <= 0) {
      return { success: false, error: "Invalid total amount" }
    }

    // Validate items
    for (const item of items) {
      const product = getProductById(item.productId)
      if (!product) {
        return { success: false, error: `Product not found: ${item.productId}` }
      }

      if (item.quantity <= 0) {
        return { success: false, error: `Invalid quantity for product: ${product.name}` }
      }

      if (item.flavorId && product.hasFlavors) {
        const flavorExists = product.flavors?.some((f) => f.id === item.flavorId)
        if (!flavorExists) {
          return { success: false, error: `Invalid flavor for product: ${product.name}` }
        }
      }
    }

    const supabase = createServerClient()

    console.log("Creating order in database...")

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
      .single()

    if (orderError) {
      console.error("Error creating order:", orderError)
      return {
        success: false,
        error: `Failed to create order: ${orderError.message}`,
        details: orderError,
      }
    }

    if (!order) {
      console.error("No order returned from database")
      return { success: false, error: "Failed to create order - no data returned" }
    }

    console.log("Order created successfully:", order.id)

    const orderId = order.id

    // Insert order items
    const orderItems = items.map((item) => ({
      order_id: orderId,
      product_id: item.productId,
      quantity: item.quantity,
      flavor_id: item.flavorId || null,
      price: item.price,
    }))

    console.log("Inserting order items:", orderItems)

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

    if (itemsError) {
      console.error("Error creating order items:", itemsError)

      // Try to clean up the order if items failed
      await supabase.from("product_orders").delete().eq("id", orderId)

      return {
        success: false,
        error: `Failed to create order items: ${itemsError.message}`,
        details: itemsError,
      }
    }

    console.log("Order items created successfully")

    // Create a PaymentIntent with Stripe
    console.log("Creating Stripe PaymentIntent...")

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: "aud", // Australian dollars
      metadata: {
        order_id: orderId,
        user_id: userId,
        type: "product_order",
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    console.log("PaymentIntent created:", paymentIntent.id)

    // Update order with payment intent ID
    const { error: updateError } = await supabase
      .from("product_orders")
      .update({
        payment_intent_id: paymentIntent.id,
      })
      .eq("id", orderId)

    if (updateError) {
      console.error("Error updating order with payment intent:", updateError)
      // Don't fail the whole process for this
    }

    revalidatePath("/products")

    return {
      success: true,
      orderId,
      clientSecret: paymentIntent.client_secret,
    }
  } catch (error) {
    console.error("Unexpected error creating product order:", error)

    // Log more details about the error
    if (error instanceof Error) {
      console.error("Error name:", error.name)
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
      details: error,
    }
  }
}

export async function updateOrderPaymentStatus(orderId: string, paymentIntentId: string, status: string) {
  try {
    console.log("Updating order payment status:", { orderId, paymentIntentId, status })

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
      .eq("payment_intent_id", paymentIntentId)

    if (error) {
      console.error("Error updating order payment status:", error)
      return { success: false, error: error.message }
    }

    console.log("Order payment status updated successfully")

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

export async function getUserProductOrders(userId: string) {
  try {
    if (!userId) {
      return { success: false, error: "User ID is required" }
    }

    const supabase = createServerClient()

    const { data: orders, error } = await supabase
      .from("product_orders")
      .select(`
        *,
        order_items (
          *
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching user orders:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data: orders || [] }
  } catch (error) {
    console.error("Unexpected error fetching user orders:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

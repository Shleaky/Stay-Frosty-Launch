"use server"

import Stripe from "stripe"
import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

export async function createPaymentIntent(bookingId: string, amount: number) {
  try {
    // Validate input
    if (!bookingId || !amount || amount <= 0) {
      return {
        success: false,
        error: "Invalid booking ID or amount",
      }
    }

    // Fetch the booking to verify it exists and get details
    const supabase = createServerSupabaseClient()
    const { data: booking, error: bookingError } = await supabase
      .from("slushie_bookings")
      .select("*")
      .eq("id", bookingId)
      .single()

    if (bookingError || !booking) {
      console.error("Error fetching booking:", bookingError)
      return { success: false, error: "Booking not found" }
    }

    // Create a PaymentIntent with the booking amount
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      metadata: {
        booking_id: bookingId,
        user_id: booking.user_id || "guest",
        machine_type: booking.machine_type,
        package_type: booking.package_type,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    console.log("PaymentIntent created:", paymentIntent.id)

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    }
  } catch (error) {
    console.error("Error creating payment intent:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

export async function createProductPaymentIntent(orderId: string, amount: number) {
  try {
    // Validate input
    if (!orderId || !amount || amount <= 0) {
      return {
        success: false,
        error: "Invalid order ID or amount",
      }
    }

    // Fetch the order to verify it exists
    const supabase = createServerSupabaseClient()
    const { data: order, error: orderError } = await supabase
      .from("product_orders")
      .select("*")
      .eq("id", orderId)
      .single()

    if (orderError || !order) {
      console.error("Error fetching order:", orderError)
      return { success: false, error: "Order not found" }
    }

    // Create a PaymentIntent for the product order
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      metadata: {
        order_id: orderId,
        user_id: order.user_id || "guest",
        order_type: "product",
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    console.log("Product PaymentIntent created:", paymentIntent.id)

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    }
  } catch (error) {
    console.error("Error creating product payment intent:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

export async function updateBookingPaymentStatus(bookingId: string, paymentIntentId: string, status: string) {
  try {
    if (!bookingId || !paymentIntentId || !status) {
      return {
        success: false,
        error: "Missing required parameters: bookingId, paymentIntentId, and status are required",
      }
    }

    const supabase = createServerSupabaseClient()

    const { error } = await supabase
      .from("slushie_bookings")
      .update({
        payment_status: status,
        payment_intent_id: paymentIntentId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId)

    if (error) {
      console.error("Error updating booking payment status:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/bookings")
    revalidatePath("/profile")

    return { success: true }
  } catch (error) {
    console.error("Error updating booking payment status:", error)
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
        error: "Missing required parameters: orderId, paymentIntentId, and status are required",
      }
    }

    const supabase = createServerSupabaseClient()

    const { error } = await supabase
      .from("product_orders")
      .update({
        payment_status: status,
        payment_intent_id: paymentIntentId,
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

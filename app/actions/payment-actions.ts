"use server"

import Stripe from "stripe"
import { createServerClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16", // Use the latest API version
})

export async function createPaymentIntent(bookingId: string, amount: number) {
  try {
    // Fetch the booking to verify it exists and get details
    const supabase = createServerClient()
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

    console.log("PaymentIntent created:", paymentIntent.id, "Client Secret:", paymentIntent.client_secret)

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

export async function updateBookingPaymentStatus(bookingId: string, paymentIntentId: string, status: string) {
  try {
    const supabase = createServerClient()

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

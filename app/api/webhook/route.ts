import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { updateBookingPaymentStatus } from "@/app/actions/payment-actions"
import { updateOrderPaymentStatus } from "@/app/actions/product-actions"

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

// This is your Stripe CLI webhook secret for testing your endpoint locally
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req: NextRequest) {
  const payload = await req.text()
  const sig = req.headers.get("stripe-signature")

  let event

  try {
    if (!sig || !endpointSecret) {
      return NextResponse.json({ error: "Missing signature or endpoint secret" }, { status: 400 })
    }

    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 })
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log("PaymentIntent was successful:", paymentIntent.id)

      // Extract metadata
      const bookingId = paymentIntent.metadata.booking_id
      const orderId = paymentIntent.metadata.order_id

      if (bookingId) {
        // Update booking status in Supabase
        await updateBookingPaymentStatus(bookingId, paymentIntent.id, "paid")
      } else if (orderId) {
        // Update product order status in Supabase
        await updateOrderPaymentStatus(orderId, paymentIntent.id, "paid")
      }
      break

    case "payment_intent.payment_failed":
      const failedPaymentIntent = event.data.object as Stripe.PaymentIntent
      console.log("Payment failed:", failedPaymentIntent.id)

      // Extract metadata
      const failedBookingId = failedPaymentIntent.metadata.booking_id
      const failedOrderId = failedPaymentIntent.metadata.order_id

      if (failedBookingId) {
        // Update booking status in Supabase
        await updateBookingPaymentStatus(failedBookingId, failedPaymentIntent.id, "failed")
      } else if (failedOrderId) {
        // Update product order status in Supabase
        await updateOrderPaymentStatus(failedOrderId, failedPaymentIntent.id, "failed")
      }
      break

    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { headers } from "next/headers"
import { upsertProductRecord, upsertPriceRecord, manageSubscriptionStatusChange } from "@/lib/supabase-admin"

const relevantEvents = new Set([
  "product.created",
  "product.updated",
  "price.created",
  "price.updated",
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
])

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get("Stripe-Signature")

  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!signature || !secret) return new NextResponse("Stripe webhook secret not found", { status: 400 })

  let event

  try {
    event = stripe.webhooks.constructEvent(body, signature, secret)
  } catch (err: any) {
    console.log("Webhook signature verification failed.", err.message)
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }

  const eventType = event.type

  if (relevantEvents.has(eventType)) {
    try {
      switch (eventType) {
        case "product.created":
        case "product.updated":
          await upsertProductRecord(event.data.object as any)
          break
        case "price.created":
        case "price.updated":
          await upsertPriceRecord(event.data.object as any)
          break
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted":
          const subscription = event.data.object as any
          await manageSubscriptionStatusChange(
            subscription.id,
            subscription.customer,
            eventType === "customer.subscription.created",
          )
          break
        case "checkout.session.completed":
          const checkoutSession = event.data.object as any
          if (checkoutSession.mode === "subscription") {
            const subscriptionId = checkoutSession.subscription
            await manageSubscriptionStatusChange(subscriptionId, checkoutSession.customer, true)
          }

          break
        default:
          throw new Error("Unhandled relevant event!")
      }
    } catch (error) {
      console.log(error)
      return new NextResponse('Webhook error: "Webhook handler failed. View logs."', { status: 400 })
    }
  }

  return NextResponse.json({ received: true }, { status: 200 })
}

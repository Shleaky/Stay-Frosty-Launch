"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { loadStripe, type Stripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"

interface StripeProviderProps {
  children: React.ReactNode
}

// Ensure your publishable key is correctly set as an environment variable
const NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

export function StripeProvider({ children }: StripeProviderProps) {
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null)

  useEffect(() => {
    if (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      setStripePromise(loadStripe(NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY))
    } else {
      console.error(
        "Stripe publishable key is not set. Please set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable.",
      )
    }
  }, [])

  if (!stripePromise) {
    // You can render a loading state here if needed, or null
    return null
  }

  // The options object should also be stable or memoized if it's complex.
  // For simple options, defining it here is fine.
  const options = {
    // clientSecret will be passed later when creating PaymentIntent or SetupIntent
    // appearance: { theme: 'stripe' }, // Example appearance
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  )
}

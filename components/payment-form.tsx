"use client"

import type React from "react"

import { useState } from "react"
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface PaymentFormProps {
  bookingId: string
  clientSecret: string
}

export function PaymentForm({ bookingId, clientSecret }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const { toast } = useToast()
  const router = useRouter()

  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      return
    }

    setIsProcessing(true)
    setPaymentError(null)

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking/success?booking_id=${bookingId}`,
        },
        redirect: "if_required",
      })

      if (error) {
        setPaymentError(error.message || "An error occurred with your payment")
        toast({
          title: "Payment Failed",
          description: error.message || "An error occurred with your payment",
          variant: "destructive",
        })
      } else {
        // Payment succeeded, redirect to success page
        toast({
          title: "Payment Successful",
          description: "Your payment has been processed successfully",
        })
        router.push(`/booking/success?booking_id=${bookingId}`)
      }
    } catch (err) {
      console.error("Payment error:", err)
      setPaymentError("An unexpected error occurred")
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred while processing your payment",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {paymentError && <div className="rounded-md bg-red-500/20 p-3 text-sm text-red-500">{paymentError}</div>}

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-slushie-green hover:bg-slushie-green/80 text-black font-bold splash-button"
      >
        {isProcessing ? "Processing Payment..." : "Pay Now"}
      </Button>
    </form>
  )
}

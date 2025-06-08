"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import { useCart } from "@/contexts/cart-context"

export default function OrderSuccessPage() {
  const { clearCart } = useCart()

  // Clear cart on page load
  useEffect(() => {
    clearCart()
  }, [clearCart])

  return (
    <div className="flex min-h-screen bg-black py-12">
      <div className="container max-w-md">
        <Card className="border border-white/10 bg-black/80 backdrop-blur-sm">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slushie-green/20">
              <CheckCircle2 className="h-8 w-8 text-slushie-green" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              <span className="bg-gradient-to-r from-slushie-green via-slushie-blue to-slushie-pink bg-clip-text text-transparent">
                Order Successful!
              </span>
            </CardTitle>
            <CardDescription className="text-center">Your order has been confirmed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-lg mb-2">Thank you for your purchase!</p>
              <p className="text-sm text-muted-foreground">
                A confirmation email has been sent to your email address with your order details.
              </p>
            </div>

            <div className="bg-black/30 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">What's Next?</h3>
              <p className="text-sm text-muted-foreground">
                Your order will be processed within 1-2 business days. You'll receive a shipping confirmation email with
                tracking information once your order is on its way.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button asChild className="w-full bg-slushie-green hover:bg-slushie-green/80 text-black font-bold">
              <Link href="/products">Continue Shopping</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Return to Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

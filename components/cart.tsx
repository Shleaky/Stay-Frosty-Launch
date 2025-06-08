"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShoppingCart, X, Trash2, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { createProductOrder } from "@/app/actions/product-actions"
import { useToast } from "@/hooks/use-toast"
import { StripeProvider } from "@/components/stripe-provider"
import { PaymentForm } from "@/components/payment-form"

export function Cart() {
  const { items, removeItem, updateQuantity, subtotal, totalItems, clearCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)

  const handleCheckout = async () => {
    if (!user) {
      router.push("/auth/login?next=/products")
      setIsOpen(false)
      return
    }

    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some products to your cart before checking out",
        variant: "destructive",
      })
      return
    }

    setIsCheckingOut(true)

    try {
      const result = await createProductOrder({
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          flavorId: item.flavorId,
          price: item.price,
        })),
        userId: user.id,
        totalAmount: subtotal,
      })

      if (!result.success) {
        throw new Error(result.error || "Failed to create order")
      }

      setClientSecret(result.clientSecret!)
      setOrderId(result.orderId!)
    } catch (error) {
      console.error("Error creating order:", error)
      toast({
        title: "Checkout Failed",
        description: error instanceof Error ? error.message : "Failed to process checkout",
        variant: "destructive",
      })
    } finally {
      setIsCheckingOut(false)
    }
  }

  const handlePaymentSuccess = () => {
    clearCart()
    setIsOpen(false)
    setClientSecret(null)
    setOrderId(null)
    router.push("/products/success")
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-slushie-green text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md bg-black border-white/10">
        <SheetHeader>
          <SheetTitle className="text-xl">Your Cart</SheetTitle>
        </SheetHeader>

        {clientSecret && orderId ? (
          <div className="mt-6 space-y-6">
            <h3 className="font-semibold text-lg">Complete Your Payment</h3>
            <StripeProvider clientSecret={clientSecret}>
              <PaymentForm bookingId={orderId} clientSecret={clientSecret} />
            </StripeProvider>
            <Button
              variant="outline"
              onClick={() => {
                setClientSecret(null)
                setOrderId(null)
              }}
              className="w-full mt-4"
            >
              Back to Cart
            </Button>
          </div>
        ) : (
          <>
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[60vh]">
                <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-6">Your cart is empty</p>
                <Button
                  asChild
                  className="bg-slushie-green hover:bg-slushie-green/80 text-black font-bold"
                  onClick={() => setIsOpen(false)}
                >
                  <Link href="/products">Browse Products</Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="flex-grow overflow-auto py-4">
                  {items.map((item, index) => (
                    <div key={`${item.productId}-${item.flavorId || index}`} className="mb-4">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 relative rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg?height=80&width=80"
                            }}
                          />
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between">
                            <h4 className="font-medium">{item.name}</h4>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => removeItem(item.productId, item.flavorId)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          {item.flavorName && (
                            <p className="text-sm text-muted-foreground">Flavor: {item.flavorName}</p>
                          )}
                          <div className="flex justify-between items-center mt-2">
                            <div className="flex items-center border border-white/10 rounded-md">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-none"
                                onClick={() => updateQuantity(item.productId, item.quantity - 1, item.flavorId)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-none"
                                onClick={() => updateQuantity(item.productId, item.quantity + 1, item.flavorId)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                      {index < items.length - 1 && <Separator className="my-4 bg-white/10" />}
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-4 mt-auto">
                  <div className="flex justify-between mb-2">
                    <span>Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-4 text-sm text-muted-foreground">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <Button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="w-full bg-slushie-green hover:bg-slushie-green/80 text-black font-bold splash-button mb-2"
                  >
                    {isCheckingOut ? "Processing..." : "Checkout"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={() => clearCart()}
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear Cart
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

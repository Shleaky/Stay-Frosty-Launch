"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import type { Product } from "@/types/product"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { getProductById } from "@/lib/product-data"
import { toast } from "@/components/ui/use-toast"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedFlavorId, setSelectedFlavorId] = useState(product.flavors?.[0]?.id || "")
  const { addItem } = useCart()
  const { user } = useAuth()
  const router = useRouter()

  const handleAddToCart = async () => {
    if (!user) {
      router.push("/auth/login?next=/products")
      return
    }

    const productDetails = await getProductById(product.id)
    if (!productDetails) {
      toast({
        title: "Error",
        description: "Product not found",
        variant: "destructive",
      })
      return
    }

    const selectedFlavor = product.flavors?.find((f) => f.id === selectedFlavorId)

    addItem({
      productId: product.id,
      quantity,
      flavorId: product.hasFlavors ? selectedFlavorId : undefined,
      price: product.price,
      name: product.name,
      image: product.image,
      flavorName: selectedFlavor?.name,
    })
  }

  return (
    <Card className="bg-black/50 border border-white/10 overflow-hidden h-full flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          width={500}
          height={300}
          className="object-cover w-full h-full"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg?height=300&width=500"
          }}
        />
      </div>
      <CardContent className="pt-6 flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold">{product.name}</h3>
          <span className="text-slushie-green font-bold">${product.price.toFixed(2)}</span>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{product.description}</p>

        <div className="space-y-4">
          {product.hasFlavors && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Flavor</label>
              <Select value={selectedFlavorId} onValueChange={setSelectedFlavorId}>
                <SelectTrigger className="bg-black/50 border-white/20">
                  <SelectValue placeholder="Select a flavor" />
                </SelectTrigger>
                <SelectContent className="bg-black border-white/20">
                  {product.flavors?.map((flavor) => (
                    <SelectItem key={flavor.id} value={flavor.id} className="text-white hover:bg-slate-800">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${flavor.color}`}></div>
                        {flavor.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Quantity</label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="h-8 w-8"
              >
                -
              </Button>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
                className="h-8 w-16 text-center bg-black/50 border-white/20"
              />
              <Button variant="outline" size="icon" onClick={() => setQuantity((q) => q + 1)} className="h-8 w-8">
                +
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleAddToCart}
          className="w-full bg-slushie-blue hover:bg-slushie-blue/80 text-white font-bold splash-button"
        >
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  )
}

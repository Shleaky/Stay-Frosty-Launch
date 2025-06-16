"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ProductCard } from "@/components/product-card"
import { getProducts } from "@/lib/product-data"
import type { Product } from "@/types"
import { Loader2 } from "lucide-react"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [category, setCategory] = useState<string>("all")

  useEffect(() => {
    async function loadProducts() {
      try {
        const productData = await getProducts()
        setProducts(productData)
      } catch (error) {
        console.error("Error loading products:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [])

  // Get unique categories
  const categories = ["all", ...new Set(products.map((product) => product.category))]

  // Filter products by category
  const filteredProducts = category === "all" ? products : products.filter((product) => product.category === category)

  return (
    <div className="flex flex-col min-h-screen bg-black">
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-slushie-blue" />
        </div>
      )}
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-30 splatter-bg"></div>
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-slushie-green via-slushie-blue to-slushie-pink bg-clip-text text-transparent">
                Stay Frosty Products
              </span>
            </h1>
            <p className="text-xl text-white/80">Take the Stay Frosty experience home with our premium products</p>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12 bg-slate-900">
        <div className="container">
          <Tabs defaultValue="all" value={category} onValueChange={setCategory} className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="bg-black/50">
                {categories.map((cat) => (
                  <TabsTrigger key={cat} value={cat} className="capitalize">
                    {cat.replace("-", " ")}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value={category} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No products found in this category.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Shipping Info Section */}
      <section className="py-16 bg-black relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20 splatter-bg"></div>
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              <span className="bg-gradient-to-r from-slushie-green via-slushie-blue to-slushie-pink bg-clip-text text-transparent">
                Shipping Information
              </span>
            </h2>
            <div className="bg-black/50 border border-white/10 rounded-lg p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-slushie-blue mb-2">Australia-Wide Shipping</h3>
                  <p className="text-white/80">
                    We currently only ship within Australia. All orders are processed within 1-2 business days and
                    shipped via Australia Post.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slushie-green mb-2">Shipping Rates</h3>
                  <ul className="list-disc list-inside space-y-1 text-white/80">
                    <li>Standard Shipping: $9.95 (5-7 business days)</li>
                    <li>Express Shipping: $14.95 (2-4 business days)</li>
                    <li>Free Standard Shipping on orders over $50</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slushie-pink mb-2">Returns & Refunds</h3>
                  <p className="text-white/80">
                    If you're not completely satisfied with your purchase, you can return it within 14 days for a full
                    refund. Please note that products must be unused and in their original packaging.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

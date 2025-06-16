"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { addNewProduct } from "@/app/actions/admin-actions"
import { isAdmin } from "@/lib/admin-utils"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AdminProductsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    price: "",
    category: "",
    hasFlavors: false,
    inStock: true,
    image: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({})

  // Check if user is admin
  useEffect(() => {
    if (authLoading) return

    if (!user || !isAdmin(user)) {
      router.push("/admin/unauthorized")
    }
  }, [user, authLoading, router])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setValidationErrors({})

    try {
      // Convert price to number
      const productData = {
        ...formData,
        price: Number.parseFloat(formData.price),
      }

      const result = await addNewProduct(productData, user)

      if (!result.success) {
        if (result.validationErrors) {
          setValidationErrors(result.validationErrors)
          throw new Error("Please fix the validation errors")
        }
        throw new Error(result.error || "Failed to add product")
      }

      toast({
        title: "Product Added",
        description: "The product has been successfully added to the catalog.",
      })

      // Reset form
      setFormData({
        id: "",
        name: "",
        description: "",
        price: "",
        category: "",
        hasFlavors: false,
        inStock: true,
        image: "",
      })
    } catch (error) {
      console.error("Error adding product:", error)
      setError(error instanceof Error ? error.message : "An unexpected error occurred")

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add product",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-slushie-blue mx-auto" />
          <p className="mt-2 text-sm text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  // Only render if user is admin
  if (!user || !isAdmin(user)) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-black py-12">
      <div className="container max-w-2xl">
        <Card className="border border-white/10 bg-black/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-slushie-green via-slushie-blue to-slushie-pink bg-clip-text text-transparent">
                Add New Product
              </span>
            </CardTitle>
            <CardDescription>Create a new product to add to the Stay Frosty catalog</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="id">Product ID</Label>
                  <Input
                    id="id"
                    value={formData.id}
                    onChange={(e) => handleInputChange("id", e.target.value)}
                    required
                    className="bg-black/50 border-white/20"
                    placeholder="unique-product-id"
                  />
                  {validationErrors.id && <p className="text-sm text-red-500">{validationErrors.id[0]}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                    className="bg-black/50 border-white/20"
                    placeholder="Product Name"
                  />
                  {validationErrors.name && <p className="text-sm text-red-500">{validationErrors.name[0]}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  required
                  className="bg-black/50 border-white/20 min-h-[100px]"
                  placeholder="Detailed product description"
                />
                {validationErrors.description && (
                  <p className="text-sm text-red-500">{validationErrors.description[0]}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    required
                    className="bg-black/50 border-white/20"
                    placeholder="19.99"
                  />
                  {validationErrors.price && <p className="text-sm text-red-500">{validationErrors.price[0]}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger className="bg-black/50 border-white/20">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-white/20">
                      <SelectItem value="fairy-floss">Fairy Floss</SelectItem>
                      <SelectItem value="drinks">Drinks</SelectItem>
                      <SelectItem value="spreads">Spreads</SelectItem>
                      <SelectItem value="accessories">Accessories</SelectItem>
                      <SelectItem value="machines">Machines</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.category && <p className="text-sm text-red-500">{validationErrors.category[0]}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  type="url"
                  value={formData.image}
                  onChange={(e) => handleInputChange("image", e.target.value)}
                  required
                  className="bg-black/50 border-white/20"
                  placeholder="https://example.com/image.jpg"
                />
                {validationErrors.image && <p className="text-sm text-red-500">{validationErrors.image[0]}</p>}
                {formData.image && (
                  <div className="mt-2 border border-white/10 rounded-md p-2 w-40 h-40 relative">
                    <img
                      src={formData.image || "/placeholder.svg"}
                      alt="Product preview"
                      className="w-full h-full object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=150&width=150"
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="hasFlavors"
                    checked={formData.hasFlavors}
                    onCheckedChange={(checked) => handleInputChange("hasFlavors", checked)}
                  />
                  <Label htmlFor="hasFlavors">Has Flavor Options</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="inStock"
                    checked={formData.inStock}
                    onCheckedChange={(checked) => handleInputChange("inStock", checked)}
                  />
                  <Label htmlFor="inStock">In Stock</Label>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-slushie-green via-slushie-blue to-slushie-pink text-black font-bold splash-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding Product...
                  </>
                ) : (
                  "Add Product"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

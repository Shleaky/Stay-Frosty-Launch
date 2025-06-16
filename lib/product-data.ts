import type { Product } from "@/types/product"
import { getBrowserClient } from "@/lib/supabase"

// Available flavors for products
export const flavors = [
  { id: "blue-raspberry", name: "Blue Raspberry", color: "bg-blue-500" },
  { id: "strawberry", name: "Strawberry", color: "bg-red-500" },
  { id: "lime", name: "Lime", color: "bg-green-500" },
  { id: "mango", name: "Mango", color: "bg-yellow-500" },
  { id: "grape", name: "Grape", color: "bg-purple-500" },
  { id: "cherry", name: "Cherry", color: "bg-pink-600" },
  { id: "orange", name: "Orange", color: "bg-orange-500" },
  { id: "watermelon", name: "Watermelon", color: "bg-red-400" },
  { id: "bubblegum", name: "Bubblegum", color: "bg-pink-400" },
  { id: "cola", name: "Cola", color: "bg-amber-900" },
]

// Default products (fallback if database fetch fails)
const defaultProducts: Product[] = [
  {
    id: "fairy-floss-bags",
    name: "Fairy Floss Premade Bags",
    description:
      "Ready-to-eat fairy floss in a variety of delicious flavors. Perfect for parties, events, or a sweet treat anytime!",
    price: 7.99,
    image: "/images/products/fairy-floss-bags.webp",
    category: "fairy-floss",
    hasFlavors: true,
    flavors: flavors,
    inStock: true,
  },
  // ... other default products
]

// Cached products to avoid refetching
let cachedProducts: Product[] | null = null
let lastFetchTime = 0
const CACHE_TTL = 60000 // 1 minute

// Fetch products from database
export async function fetchProducts(): Promise<Product[]> {
  try {
    // Return cached products if available and not expired
    const now = Date.now()
    if (cachedProducts && now - lastFetchTime < CACHE_TTL) {
      return cachedProducts
    }

    const supabase = getBrowserClient()
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching products:", error)
      return defaultProducts
    }

    // Transform database products to match Product type
    const products: Product[] = data.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image,
      category: item.category,
      hasFlavors: item.has_flavors,
      flavors: item.has_flavors ? flavors : undefined,
      inStock: item.in_stock,
    }))

    // Update cache
    cachedProducts = products
    lastFetchTime = now

    return products
  } catch (error) {
    console.error("Unexpected error fetching products:", error)
    return defaultProducts
  }
}

// Get all products
export async function getProducts(): Promise<Product[]> {
  return await fetchProducts()
}

// Get product by ID
export async function getProductById(id: string): Promise<Product | undefined> {
  const products = await fetchProducts()
  return products.find((product) => product.id === id)
}

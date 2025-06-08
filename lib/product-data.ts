import type { Product } from "@/types/product"

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

// Product data
export const products: Product[] = [
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
  {
    id: "fairy-floss-sugar",
    name: "Fairy Floss Sugar",
    description:
      "Premium fairy floss sugar for use with any standard fairy floss machine. Make your own fluffy treats at home!",
    price: 19.99,
    image: "/images/products/fairy-floss-sugar.webp",
    category: "fairy-floss",
    hasFlavors: true,
    flavors: flavors,
    inStock: true,
  },
  {
    id: "energy-drinks",
    name: "Stay Frosty Energy Drinks",
    description:
      "Our signature energy drinks to keep you going all day. Perfect blend of caffeine and vitamins with no crash.",
    price: 19.99,
    image: "/images/products/energy-drinks.webp",
    category: "drinks",
    hasFlavors: false,
    inStock: true,
  },
  {
    id: "pistachio-papi",
    name: "Pistachio Papi Spread",
    description:
      "Artisan pistachio spread made with premium nuts. A delicious and unique alternative to traditional nut butters.",
    price: 24.99,
    image: "/images/products/pistachio-papi.webp",
    category: "spreads",
    hasFlavors: false,
    inStock: true,
  },
]

// Get product by ID
export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id)
}

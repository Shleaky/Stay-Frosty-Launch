export type ProductFlavor = {
  id: string
  name: string
  color: string
}

export type Product = {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  hasFlavors: boolean
  flavors?: ProductFlavor[]
  inStock: boolean
}

export type CartItem = {
  productId: string
  quantity: number
  flavorId?: string
  price: number
  name: string
  image: string
  flavorName?: string
}

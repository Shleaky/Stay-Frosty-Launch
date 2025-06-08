"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { CartItem } from "@/types/product"
import { useToast } from "@/hooks/use-toast"

type CartContextType = {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string, flavorId?: string) => void
  updateQuantity: (productId: string, quantity: number, flavorId?: string) => void
  clearCart: () => void
  totalItems: number
  subtotal: number
}

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalItems: 0,
  subtotal: 0,
})

export const useCart = () => useContext(CartContext)

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([])
  const { toast } = useToast()

  // Load cart from localStorage on client side
  useEffect(() => {
    const savedCart = localStorage.getItem("stayFrostyCart")
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem("stayFrostyCart", JSON.stringify(items))
    }
  }, [items])

  const addItem = (newItem: CartItem) => {
    setItems((currentItems) => {
      // Check if item already exists in cart (with same flavor if applicable)
      const existingItemIndex = currentItems.findIndex(
        (item) =>
          item.productId === newItem.productId && (newItem.flavorId ? item.flavorId === newItem.flavorId : true),
      )

      if (existingItemIndex > -1) {
        // Update quantity of existing item
        const updatedItems = [...currentItems]
        updatedItems[existingItemIndex].quantity += newItem.quantity

        toast({
          title: "Cart updated",
          description: `${newItem.name} quantity increased to ${updatedItems[existingItemIndex].quantity}`,
        })

        return updatedItems
      } else {
        // Add new item
        toast({
          title: "Added to cart",
          description: `${newItem.name} ${newItem.flavorName ? `(${newItem.flavorName})` : ""} added to your cart`,
        })

        return [...currentItems, newItem]
      }
    })
  }

  const removeItem = (productId: string, flavorId?: string) => {
    setItems((currentItems) => {
      const filteredItems = currentItems.filter(
        (item) => !(item.productId === productId && (flavorId ? item.flavorId === flavorId : true)),
      )

      // If cart becomes empty, clear localStorage
      if (filteredItems.length === 0) {
        localStorage.removeItem("stayFrostyCart")
      }

      return filteredItems
    })

    toast({
      title: "Item removed",
      description: "Product removed from your cart",
    })
  }

  const updateQuantity = (productId: string, quantity: number, flavorId?: string) => {
    if (quantity <= 0) {
      removeItem(productId, flavorId)
      return
    }

    setItems((currentItems) => {
      return currentItems.map((item) => {
        if (item.productId === productId && (flavorId ? item.flavorId === flavorId : true)) {
          return { ...item, quantity }
        }
        return item
      })
    })
  }

  const clearCart = () => {
    setItems([])
    localStorage.removeItem("stayFrostyCart")
  }

  const totalItems = items.reduce((total, item) => total + item.quantity, 0)

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

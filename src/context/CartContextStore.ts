import { createContext } from 'react'
import type { Product, CartItem } from '../types'

export interface CartContextType {
  items: CartItem[]
  cartCount: number
  totalPrice: number
  addToCart: (product: Product) => void
  removeFromCart: (productId: number) => void
  setQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
}

export const CartContext = createContext<CartContextType | undefined>(
  undefined,
)
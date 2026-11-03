
import {
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import type { Product, CartItem } from '../types'
import { CartContext } from './CartContextStore'

interface CartProviderProps {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const savedCart = localStorage.getItem('shop_cart')

      if (!savedCart) {
        return []
      }

      const parsed: unknown = JSON.parse(savedCart)

      if (!Array.isArray(parsed)) {
        return []
      }

      return parsed as CartItem[]
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('shop_cart', JSON.stringify(items))
  }, [items])

  function addToCart(product: Product) {
    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.product.id === product.id,
      )

      if (existingItem) {
        return currentItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      }

      return [...currentItems, { product, quantity: 1 }]
    })
  }

  function removeFromCart(productId: number) {
    setItems((currentItems) =>
      currentItems.filter(
        (item) => item.product.id !== productId,
      ),
    )
  }

  function setQuantity(productId: number, quantity: number) {
    if (quantity < 1) {
      removeFromCart(productId)
      return
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.product.id === productId
          ? { ...item, quantity }
          : item,
      ),
    )
  }

  function clearCart() {
    setItems([])
  }

  const cartCount = items.reduce(
    (total, item) => total + item.quantity,
    0,
  )

  const totalPrice = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  )

  return (
    <CartContext.Provider
      value={{
        items,
        cartCount,
        totalPrice,
        addToCart,
        removeFromCart,
        setQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

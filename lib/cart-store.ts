'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '@/types/shop'

interface CartState {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string, variantId: number) => void
  updateQuantity: (productId: string, variantId: number, quantity: number) => void
  clearCart: () => void
  itemCount: () => number
  subtotalCents: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (incoming) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === incoming.productId && i.variantId === incoming.variantId
          )
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === incoming.productId && i.variantId === incoming.variantId
                  ? { ...i, quantity: i.quantity + incoming.quantity }
                  : i
              ),
            }
          }
          return { items: [...state.items, incoming] }
        })
      },

      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.variantId === variantId)
          ),
        }))
      },

      updateQuantity: (productId, variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.variantId === variantId ? { ...i, quantity } : i
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotalCents: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: 'beachfit-cart' }
  )
)

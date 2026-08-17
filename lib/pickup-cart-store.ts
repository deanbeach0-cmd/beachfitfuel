'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FlavorSelection, PickupCartItem } from '@/types/pickup'

type NewCartItem = Omit<PickupCartItem, 'lineId'>

function flavorsEqual(a?: FlavorSelection[], b?: FlavorSelection[]): boolean {
  if (!a?.length && !b?.length) return true
  if (!a || !b || a.length !== b.length) return false
  const sort = (f: FlavorSelection[]) => [...f].sort((x, y) => x.name.localeCompare(y.name))
  const sa = sort(a)
  const sb = sort(b)
  return sa.every((f, i) => f.name === sb[i].name && f.quantity === sb[i].quantity)
}

function makeLineId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

interface PickupCartState {
  items: PickupCartItem[]
  addItem: (item: NewCartItem) => void
  removeItem: (lineId: string) => void
  updateQuantity: (lineId: string, quantity: number) => void
  clearCart: () => void
  itemCount: () => number
  subtotalCents: () => number
}

export const usePickupCartStore = create<PickupCartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (incoming) => {
        set((state) => {
          // Only merge into an existing line when the flavor selection matches
          // exactly — different flavor mixes of the same item are distinct lines.
          const existing = state.items.find(
            (i) => i.menuItemId === incoming.menuItemId && flavorsEqual(i.flavors, incoming.flavors)
          )
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.lineId === existing.lineId
                  ? { ...i, quantity: i.quantity + incoming.quantity }
                  : i
              ),
            }
          }
          return { items: [...state.items, { ...incoming, lineId: makeLineId() }] }
        })
      },

      removeItem: (lineId) => {
        set((state) => ({
          items: state.items.filter((i) => i.lineId !== lineId),
        }))
      },

      updateQuantity: (lineId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(lineId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.lineId === lineId ? { ...i, quantity } : i
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotalCents: () =>
        get().items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0),
    }),
    { name: 'beachfit-pickup-cart' }
  )
)

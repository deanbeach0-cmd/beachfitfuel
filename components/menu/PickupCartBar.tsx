'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { usePickupCartStore } from '@/lib/pickup-cart-store'
import { LocationSlug } from '@/lib/locations'

interface PickupCartBarProps {
  locationSlug: LocationSlug
}

export function PickupCartBar({ locationSlug }: PickupCartBarProps) {
  const [mounted, setMounted] = useState(false)
  const itemCount = usePickupCartStore((s) => s.itemCount())
  const subtotalCents = usePickupCartStore((s) => s.subtotalCents())

  useEffect(() => { setMounted(true) }, [])

  if (!mounted || itemCount === 0) return null

  const subtotal = (subtotalCents / 100).toFixed(2)

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe"
      style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      <Link
        href={`/order/${locationSlug}`}
        className="flex items-center justify-between max-w-lg mx-auto px-5 py-4 rounded-2xl shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
        style={{ backgroundColor: '#FF7B9D' }}
      >
        <div className="flex items-center gap-3">
          <ShoppingBag className="w-5 h-5 text-white" />
          <span className="font-display tracking-widest text-white text-base">
            {itemCount} {itemCount === 1 ? 'ITEM' : 'ITEMS'} · ${subtotal}
          </span>
        </div>
        <span className="font-display tracking-widest text-white/90 text-sm">
          VIEW ORDER →
        </span>
      </Link>
    </div>
  )
}

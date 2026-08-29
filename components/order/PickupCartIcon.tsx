'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CupSoda } from 'lucide-react'
import { usePickupCartStore } from '@/lib/pickup-cart-store'

export function PickupCartIcon() {
  const count = usePickupCartStore((s) => s.itemCount())
  const items = usePickupCartStore((s) => s.items)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Send them to whichever location their cart is for; default to Marshall
  // when the cart's empty (matches the site's primary/default location).
  const locationSlug = items[0]?.locationSlug ?? 'marshall'

  return (
    <Link
      href={`/order/${locationSlug}`}
      className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-cream transition-colors"
      aria-label="Your pickup order"
    >
      <CupSoda className="w-5 h-5 text-dark" />
      {mounted && count > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
          style={{ backgroundColor: '#FF7B9D' }}
        >
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  )
}

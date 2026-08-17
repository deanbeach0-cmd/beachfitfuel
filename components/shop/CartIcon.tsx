'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/lib/cart-store'

export function CartIcon() {
  const count = useCartStore((s) => s.itemCount())
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  return (
    <Link href="/shop/cart" className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-cream transition-colors">
      <ShoppingBag className="w-5 h-5 text-dark" />
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

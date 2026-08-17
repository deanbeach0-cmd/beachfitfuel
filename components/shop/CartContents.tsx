'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/lib/cart-store'

function ItemImage({ src, alt }: { src: string; alt: string }) {
  if (!src) {
    return (
      <div className="w-full h-full flex items-center justify-center text-2xl bg-gradient-to-br from-pink-50 to-orange-50">
        👕
      </div>
    )
  }
  return <Image src={src} alt={alt} fill className="object-cover" sizes="80px" />
}

export function CartContents() {
  const { items, removeItem, updateQuantity, subtotalCents } = useCartStore()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-dark/20" />
        <h2 className="font-display text-2xl text-dark tracking-wide mb-3">YOUR CART IS EMPTY</h2>
        <p className="font-body text-dark/50 mb-8">Looks like you haven&apos;t added anything yet.</p>
        <Link
          href="/shop/apparel"
          className="font-display tracking-widest text-white px-8 py-3 rounded-full inline-block"
          style={{ backgroundColor: '#FF7B9D' }}
        >
          SHOP APPAREL
        </Link>
      </div>
    )
  }

  const subtotal = subtotalCents() / 100

  return (
    <div>
      {/* Item list */}
      <div className="flex flex-col gap-4 mb-8">
        {items.map((item) => (
          <div key={`${item.productId}-${item.variantId}`}
            className="flex gap-4 bg-white rounded-2xl p-4 shadow-sm">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
              <ItemImage src={item.imageUrl} alt={item.name} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-body font-bold text-dark text-sm leading-tight line-clamp-2 mb-1">
                {item.name}
              </p>
              <p className="font-body text-dark/50 text-xs mb-3">
                ${(item.price / 100).toFixed(2)} each
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                  className="w-7 h-7 rounded-full border border-gray-200 font-bold text-sm text-dark hover:border-gray-400 transition-colors"
                >
                  −
                </button>
                <span className="font-body font-bold text-dark text-sm w-4 text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                  className="w-7 h-7 rounded-full border border-gray-200 font-bold text-sm text-dark hover:border-gray-400 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
            <div className="flex flex-col items-end justify-between">
              <button
                onClick={() => removeItem(item.productId, item.variantId)}
                className="text-dark/30 hover:text-red-400 transition-colors"
                aria-label="Remove item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <p className="font-body font-bold text-dark text-sm">
                ${((item.price * item.quantity) / 100).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between mb-3">
          <span className="font-body text-dark/60">Subtotal</span>
          <span className="font-body font-bold text-dark">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mb-5 pb-5 border-b border-gray-100">
          <span className="font-body text-dark/60">Shipping</span>
          <span className="font-body text-sm font-semibold" style={{ color: '#6FBDB8' }}>
            FREE
          </span>
        </div>
        <div className="flex justify-between mb-6">
          <span className="font-body font-bold text-dark">Total</span>
          <span className="font-body font-bold text-dark">${subtotal.toFixed(2)}</span>
        </div>
        <Link
          href="/shop/checkout"
          className="block w-full text-center font-display tracking-widest text-white text-lg py-4 rounded-full transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#FF7B9D' }}
        >
          CHECKOUT — ${subtotal.toFixed(2)}
        </Link>
        <Link
          href="/shop/apparel"
          className="block w-full text-center font-body text-dark/50 text-sm mt-4 hover:text-dark transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}

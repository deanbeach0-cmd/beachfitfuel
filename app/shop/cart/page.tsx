import type { Metadata } from 'next'
import { CartContents } from '@/components/shop/CartContents'

export const metadata: Metadata = {
  title: 'Cart',
  description: 'Your BeachFit Fuel cart.',
}

export default function CartPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8EE' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="font-display text-4xl md:text-5xl text-dark tracking-widest mb-10">
          YOUR CART
        </h1>
        <CartContents />
      </div>
    </div>
  )
}

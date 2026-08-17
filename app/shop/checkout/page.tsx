import type { Metadata } from 'next'
import { CheckoutForm } from '@/components/shop/CheckoutForm'

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your BeachFit Fuel order.',
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8EE' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="font-display text-4xl md:text-5xl text-dark tracking-widest mb-10">
          CHECKOUT
        </h1>
        <CheckoutForm />
      </div>
    </div>
  )
}

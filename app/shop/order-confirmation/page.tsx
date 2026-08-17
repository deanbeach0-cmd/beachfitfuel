import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export const metadata: Metadata = { title: 'Order Confirmed' }

export default function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: { orderId?: string }
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#FFF8EE' }}>
      <div className="max-w-lg w-full text-center">
        <CheckCircle className="w-20 h-20 mx-auto mb-6" style={{ color: '#6FBDB8' }} />
        <h1 className="font-display text-4xl md:text-5xl text-dark tracking-widest mb-4">
          ORDER CONFIRMED!
        </h1>
        <p className="font-body text-dark/70 mb-3 leading-relaxed">
          Thanks for your order. Your items are heading to print and will ship directly to you.
          You&apos;ll receive a shipping notification by email.
        </p>
        {searchParams.orderId && (
          <p className="font-body text-dark/40 text-sm mb-8">
            Order #{searchParams.orderId.slice(-8).toUpperCase()}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/shop/apparel"
            className="font-display tracking-widest text-white px-8 py-3 rounded-full"
            style={{ backgroundColor: '#FF7B9D' }}
          >
            KEEP SHOPPING
          </Link>
          <Link
            href="/menu/marshall"
            className="font-display tracking-widest text-dark px-8 py-3 rounded-full border-2 border-dark/20 hover:border-teal hover:text-teal transition-colors"
          >
            VIEW MENU
          </Link>
        </div>
      </div>
    </div>
  )
}

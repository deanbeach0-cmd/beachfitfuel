import Link from 'next/link'
import { MapPin, Phone } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Order Confirmed — BeachFit Fuel',
  description: 'Your pickup order has been placed at BeachFit Fuel Marshall.',
}

interface PageProps {
  searchParams: Promise<{ orderId?: string; total?: string; fulfillment?: string }>
}

export default async function OrderConfirmationPage({ searchParams }: PageProps) {
  const params = await searchParams
  const orderId = params.orderId ?? ''
  const total = params.total ?? '0.00'
  const isShipment = params.fulfillment === 'SHIPMENT'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16" style={{ backgroundColor: '#FFF8EE' }}>
      <div className="max-w-lg w-full flex flex-col items-center gap-8 text-center">

        {/* Success icon */}
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center text-5xl"
          style={{ backgroundColor: '#FF7B9D22' }}
        >
          🏖️
        </div>

        {/* Heading */}
        <div>
          <h1 className="font-display text-5xl md:text-6xl tracking-wide text-dark">
            ORDER PLACED!
          </h1>
          <p className="font-body text-dark/60 mt-3 text-base leading-relaxed">
            {isShipment
              ? "We got it — your order will ship via USPS."
              : 'We got it — your drinks will be ready for pickup at Marshall.'}
          </p>
        </div>

        {/* Order details card */}
        <div
          className="w-full rounded-2xl p-6 flex flex-col gap-4 text-left"
          style={{ backgroundColor: 'white', border: '1.5px solid #9BBDCF33' }}
        >
          {orderId && (
            <div className="flex justify-between items-center">
              <span className="font-body text-dark/50 text-sm">Order #</span>
              <span className="font-body font-bold text-dark text-sm">{orderId.slice(-8).toUpperCase()}</span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="font-body text-dark/50 text-sm">Total</span>
            <span className="font-body font-bold text-dark text-sm">${total}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-body text-dark/50 text-sm">Payment</span>
            <span className="font-body font-bold text-sm" style={{ color: '#FF7B9D' }}>
              💳 Paid online
            </span>
          </div>

          {!isShipment && (
            <div className="border-t border-gray-100 pt-4 flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-dark/40 mt-0.5 flex-shrink-0" />
                <span className="font-body text-dark/60 text-sm">
                  205 W Michigan Ave, Marshall, MI 49068
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-dark/40 flex-shrink-0" />
                <a
                  href="tel:+12692343645"
                  className="font-body text-dark/60 text-sm hover:text-dark transition-colors"
                >
                  (269) 234-3645
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Note */}
        <p className="font-body text-dark/50 text-sm leading-relaxed">
          {isShipment
            ? "We'll email you tracking info once your order ships. Thanks for your order!"
            : "We'll call if we have any questions about your order. See you soon!"}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link
            href="/menu/marshall"
            className="flex-1 text-center font-display tracking-widest text-white text-base py-4 rounded-full transition-transform hover:scale-[1.02]"
            style={{ backgroundColor: '#FF7B9D' }}
          >
            ORDER AGAIN
          </Link>
          <Link
            href="/"
            className="flex-1 text-center font-display tracking-widest text-dark text-base py-4 rounded-full transition-transform hover:scale-[1.02]"
            style={{ backgroundColor: 'white', border: '1.5px solid #e5e7eb' }}
          >
            HOME
          </Link>
        </div>
      </div>
    </div>
  )
}

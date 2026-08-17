'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/lib/cart-store'
import { useRouter } from 'next/navigation'

declare global {
  interface Window {
    Square?: any
  }
}

interface ShippingAddress {
  firstName: string
  lastName: string
  address1: string
  address2: string
  city: string
  state: string
  zip: string
  email: string
  phone: string
}

const EMPTY_ADDRESS: ShippingAddress = {
  firstName: '', lastName: '', address1: '', address2: '',
  city: '', state: '', zip: '', email: '', phone: '',
}

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY',
]

function ItemThumb({ src, alt }: { src: string; alt: string }) {
  if (!src) {
    return (
      <div className="w-full h-full flex items-center justify-center text-xl"
        style={{ background: 'linear-gradient(135deg, #FF7B9D22, #EC8A1E22)' }}>
        👕
      </div>
    )
  }
  return <Image src={src} alt={alt} fill className="object-cover" sizes="56px" />
}

export function CheckoutForm() {
  const { items, subtotalCents, clearCart } = useCartStore()
  const router = useRouter()

  const [mounted, setMounted] = useState(false)
  const [address, setAddress] = useState<ShippingAddress>(EMPTY_ADDRESS)
  const [cardReady, setCardReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [squareLoaded, setSquareLoaded] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const cardRef = useRef<any>(null)
  const cardContainerRef = useRef<HTMLDivElement>(null)

  // Load Square Web Payments SDK
  useEffect(() => {
    const appId = process.env.NEXT_PUBLIC_SQUARE_APP_ID
    if (!appId) return

    const isSandbox = appId.startsWith('sandbox-')
    const src = isSandbox
      ? 'https://sandbox.web.squarecdn.com/v1/square.js'
      : 'https://web.squarecdn.com/v1/square.js'

    if (document.querySelector(`script[src="${src}"]`)) {
      setSquareLoaded(true)
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.onload = () => setSquareLoaded(true)
    script.onerror = () => setError('Failed to load payment form. Please refresh and try again.')
    document.head.appendChild(script)
  }, [])

  // Initialize Square card form once SDK is loaded
  useEffect(() => {
    if (!squareLoaded || !cardContainerRef.current) return
    const appId = process.env.NEXT_PUBLIC_SQUARE_APP_ID
    const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID
    if (!appId || !locationId || !window.Square) return

    let isMounted = true

    async function initCard() {
      const payments = window.Square.payments(appId, locationId)
      const card = await payments.card({
        style: {
          '.input-container': { borderRadius: '12px', borderColor: '#e5e7eb' },
          '.input-container.is-focus': { borderColor: '#FF7B9D' },
          '.input-container.is-error': { borderColor: '#ef4444' },
        },
      })
      if (!isMounted) return
      await card.attach('#square-card-container')
      cardRef.current = card
      setCardReady(true)
    }

    initCard().catch((err: Error) => {
      if (isMounted) setError(`Card setup failed: ${err.message}`)
    })

    return () => { isMounted = false }
  }, [squareLoaded])

  if (!mounted) return null

  const subtotal = subtotalCents() / 100

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="font-body text-dark/50 mb-6">Your cart is empty.</p>
        <Link href="/shop/apparel"
          className="font-display tracking-widest text-white px-8 py-3 rounded-full inline-block"
          style={{ backgroundColor: '#FF7B9D' }}>
          SHOP APPAREL
        </Link>
      </div>
    )
  }

  if (!process.env.NEXT_PUBLIC_SQUARE_APP_ID) {
    return (
      <div className="rounded-2xl border-2 border-dashed p-10 text-center" style={{ borderColor: '#EC8A1E' }}>
        <p className="font-display text-2xl text-dark tracking-wide mb-3">CHECKOUT COMING SOON</p>
        <p className="font-body text-dark/60 text-sm">
          Online payment is being set up. In the meantime,{' '}
          <Link href="/locations" className="underline" style={{ color: '#FF7B9D' }}>visit us in store</Link>.
        </p>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!cardRef.current || !cardReady) return
    setError(null)
    setLoading(true)

    try {
      const result = await cardRef.current.tokenize()
      if (result.status !== 'OK') {
        throw new Error(result.errors?.[0]?.message ?? 'Card tokenization failed')
      }

      const res = await fetch('/api/orders/apparel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId: result.token,
          amountCents: subtotalCents(),
          items,
          shippingAddress: address,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Order failed')

      clearCart()
      router.push(`/shop/order-confirmation?orderId=${data.orderId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function field(
    label: string,
    key: keyof ShippingAddress,
    opts: { placeholder?: string; type?: string; half?: boolean; required?: boolean } = {}
  ) {
    const isRequired = opts.required !== false
    return (
      <div className={opts.half ? 'col-span-1' : 'col-span-2'}>
        <label className="block font-body text-sm font-bold text-dark mb-1">{label}</label>
        <input
          type={opts.type ?? 'text'}
          placeholder={opts.placeholder}
          value={address[key]}
          onChange={(e) => setAddress((a) => ({ ...a, [key]: e.target.value }))}
          required={isRequired}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white font-body text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
        />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* Form */}
      <form onSubmit={handleSubmit} className="lg:col-span-3 flex flex-col gap-6">

        {/* Contact */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-display text-xl tracking-widest text-dark mb-4">CONTACT</h2>
          <div className="grid grid-cols-2 gap-4">
            {field('Email', 'email', { type: 'email', placeholder: 'you@example.com' })}
            {field('Phone', 'phone', { type: 'tel', placeholder: '(555) 555-5555' })}
          </div>
        </div>

        {/* Shipping */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-display text-xl tracking-widest text-dark mb-4">SHIPPING ADDRESS</h2>
          <div className="grid grid-cols-2 gap-4">
            {field('First Name', 'firstName', { half: true })}
            {field('Last Name', 'lastName', { half: true })}
            {field('Street Address', 'address1', { placeholder: '123 Beach Blvd' })}
            {field('Apt / Suite', 'address2', { required: false })}
            {field('City', 'city', { half: true })}
            <div>
              <label className="block font-body text-sm font-bold text-dark mb-1">State</label>
              <select
                value={address.state}
                onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white font-body text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              >
                <option value="">Select state</option>
                {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {field('ZIP Code', 'zip', { half: true, placeholder: '49068' })}
          </div>
        </div>

        {/* Payment */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-display text-xl tracking-widest text-dark mb-4">PAYMENT</h2>
          {!squareLoaded ? (
            <div className="flex items-center gap-2 py-4">
              <div className="w-4 h-4 rounded-full border-2 border-pink-300 border-t-transparent animate-spin" />
              <p className="font-body text-dark/50 text-sm">Loading payment form…</p>
            </div>
          ) : (
            <div id="square-card-container" ref={cardContainerRef} className="min-h-[90px]" />
          )}
          <p className="font-body text-dark/40 text-xs mt-3 flex items-center gap-1">
            🔒 Secured by Square. We never store your card details.
          </p>
        </div>

        {error && (
          <div className="font-body text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !cardReady}
          className="w-full py-4 rounded-full font-display tracking-widest text-white text-lg disabled:opacity-50 transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#FF7B9D' }}
        >
          {loading
            ? 'PROCESSING…'
            : !cardReady
            ? 'LOADING PAYMENT FORM…'
            : `PLACE ORDER — $${subtotal.toFixed(2)}`}
        </button>
      </form>

      {/* Order summary */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-20">
          <h2 className="font-display text-xl tracking-widest text-dark mb-5">ORDER SUMMARY</h2>

          <div className="flex flex-col gap-3 mb-5">
            {items.map((item) => (
              <div key={`${item.productId}-${item.variantId}`} className="flex gap-3 items-start">
                <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <ItemThumb src={item.imageUrl} alt={item.name} />
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-dark text-white text-xs font-bold flex items-center justify-center">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm font-bold text-dark leading-tight line-clamp-2">{item.name}</p>
                </div>
                <p className="font-body text-sm text-dark/70 flex-shrink-0">
                  ${((item.price * item.quantity) / 100).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4 flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="font-body text-dark/60 text-sm">Subtotal</span>
              <span className="font-body text-sm">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-body text-dark/60 text-sm">Shipping</span>
              <span className="font-body text-sm font-semibold" style={{ color: '#6FBDB8' }}>FREE</span>
            </div>
            <div className="flex justify-between font-bold pt-2 border-t border-gray-100 mt-1">
              <span className="font-body">Total</span>
              <span className="font-body">${subtotal.toFixed(2)}</span>
            </div>
          </div>

          <p className="font-body text-dark/40 text-xs mt-4 text-center">
            Printed &amp; shipped by Printful · Ships within 3–7 business days
          </p>
        </div>
      </div>
    </div>
  )
}

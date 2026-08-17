'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Trash2, ShoppingBag, CreditCard, Store } from 'lucide-react'
import { usePickupCartStore } from '@/lib/pickup-cart-store'
import type { PickupCustomer, PickupTime } from '@/types/pickup'

declare global {
  interface Window {
    Square?: any
  }
}

const PICKUP_TIMES: { value: PickupTime; label: string }[] = [
  { value: 'ASAP',  label: 'ASAP' },
  { value: '15min', label: '15 min' },
  { value: '30min', label: '30 min' },
  { value: '45min', label: '45 min' },
  { value: '1hr',   label: '1 hr' },
]

const EMPTY_CUSTOMER: PickupCustomer = {
  name: '',
  phone: '',
  pickupTime: 'ASAP',
  note: '',
}

export function PickupOrderForm() {
  const { items, removeItem, updateQuantity, clearCart, subtotalCents } = usePickupCartStore()
  const router = useRouter()

  const [mounted, setMounted] = useState(false)
  const [customer, setCustomer] = useState<PickupCustomer>(EMPTY_CUSTOMER)
  const [payNow, setPayNow] = useState(true)
  const [squareLoaded, setSquareLoaded] = useState(false)
  const [cardReady, setCardReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cardRef = useRef<any>(null)
  const cardContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  // Load Square Web Payments SDK
  useEffect(() => {
    if (!payNow) return
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
  }, [payNow])

  // Initialize Square card form
  useEffect(() => {
    if (!payNow || !squareLoaded || !cardContainerRef.current) return
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
      await card.attach('#pickup-card-container')
      cardRef.current = card
      setCardReady(true)
    }

    setCardReady(false)
    initCard().catch((err: Error) => {
      if (isMounted) setError(`Card setup failed: ${err.message}`)
    })

    return () => { isMounted = false }
  }, [squareLoaded, payNow])

  if (!mounted) return null

  const total = subtotalCents()
  const totalDollars = (total / 100).toFixed(2)

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-dark/20" />
        <h2 className="font-display text-2xl text-dark tracking-wide mb-3">YOUR ORDER IS EMPTY</h2>
        <p className="font-body text-dark/50 mb-8">Add drinks from the menu to get started.</p>
        <Link
          href="/menu/marshall"
          className="font-display tracking-widest text-white px-8 py-3 rounded-full inline-block"
          style={{ backgroundColor: '#FF7B9D' }}
        >
          BROWSE THE MENU
        </Link>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!customer.name || !customer.phone) {
      setError('Please enter your name and phone number.')
      return
    }
    if (payNow && (!cardRef.current || !cardReady)) {
      setError('Card payment form is not ready yet.')
      return
    }
    setError(null)
    setLoading(true)

    try {
      let sourceId: string | undefined

      if (payNow) {
        const result = await cardRef.current.tokenize()
        if (result.status !== 'OK') {
          throw new Error(result.errors?.[0]?.message ?? 'Card tokenization failed')
        }
        sourceId = result.token
      }

      const res = await fetch('/api/orders/pickup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId,
          items,
          customer,
          totalCents: total,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Order failed')

      clearCart()
      router.push(`/order/confirmation?orderId=${data.orderId}&total=${totalDollars}&paid=${data.paidOnline}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const submitLabel = loading
    ? 'PLACING ORDER…'
    : payNow
    ? (!cardReady ? 'LOADING PAYMENT…' : `PLACE ORDER — $${totalDollars}`)
    : `PLACE ORDER · PAY AT PICKUP`

  const submitDisabled = loading || (payNow && !cardReady)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

      {/* ── Main form ─────────────────────────────── */}
      <form onSubmit={handleSubmit} className="lg:col-span-3 flex flex-col gap-6">

        {/* Cart items */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl tracking-widest text-dark">YOUR ORDER</h2>
            <Link
              href="/menu/marshall"
              className="font-body text-sm text-dark/40 hover:text-dark transition-colors"
            >
              + Add more
            </Link>
          </div>

          <div className="flex flex-col divide-y divide-gray-50">
            {items.map((item) => (
              <div key={item.lineId} className="flex items-center gap-3 py-3">
                {/* Emoji thumb */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                  style={{ backgroundColor: '#FFF8EE' }}
                >
                  {item.emoji}
                </div>

                {/* Name + qty controls */}
                <div className="flex-1 min-w-0">
                  <p className="font-body font-bold text-dark text-sm leading-tight">{item.name}</p>
                  {item.flavors && item.flavors.length > 0 && (
                    <p className="font-body text-dark/50 text-xs mt-0.5 leading-snug">
                      {item.flavors.map((f) => `${f.quantity}x ${f.name}`).join(', ')}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.lineId, item.quantity - 1)}
                      className="w-6 h-6 rounded-full border border-gray-200 font-bold text-xs text-dark hover:border-gray-400 transition-colors"
                    >
                      −
                    </button>
                    <span className="font-body font-bold text-dark text-sm w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.lineId, item.quantity + 1)}
                      className="w-6 h-6 rounded-full border border-gray-200 font-bold text-xs text-dark hover:border-gray-400 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Price + remove */}
                <div className="flex flex-col items-end gap-1">
                  <button
                    type="button"
                    onClick={() => removeItem(item.lineId)}
                    className="text-dark/25 hover:text-red-400 transition-colors"
                    aria-label="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <p className="font-body font-bold text-dark text-sm">
                    ${((item.priceCents * item.quantity) / 100).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pickup details */}
        <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <h2 className="font-display text-xl tracking-widest text-dark">PICKUP DETAILS</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block font-body text-sm font-bold text-dark mb-1">Your Name *</label>
              <input
                type="text"
                value={customer.name}
                onChange={(e) => setCustomer((c) => ({ ...c, name: e.target.value }))}
                placeholder="First & last name"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white font-body text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block font-body text-sm font-bold text-dark mb-1">Phone Number *</label>
              <input
                type="tel"
                value={customer.phone}
                onChange={(e) => setCustomer((c) => ({ ...c, phone: e.target.value }))}
                placeholder="(555) 555-5555"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white font-body text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
          </div>

          {/* Pickup time */}
          <div>
            <label className="block font-body text-sm font-bold text-dark mb-2">
              When do you want to pick up?
            </label>
            <div className="flex flex-wrap gap-2">
              {PICKUP_TIMES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setCustomer((c) => ({ ...c, pickupTime: value }))}
                  className="px-4 py-2 rounded-full font-body font-bold text-sm transition-all"
                  style={
                    customer.pickupTime === value
                      ? { backgroundColor: '#FF7B9D', color: 'white' }
                      : { backgroundColor: 'white', color: '#2C2C2C', border: '1.5px solid #e5e7eb' }
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-body text-sm font-bold text-dark mb-1">
              Special Instructions <span className="font-normal text-dark/40">(optional)</span>
            </label>
            <textarea
              value={customer.note}
              onChange={(e) => setCustomer((c) => ({ ...c, note: e.target.value }))}
              placeholder="Extra ice, no whip, etc."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white font-body text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none"
            />
          </div>
        </div>

        {/* Payment method toggle */}
        <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <h2 className="font-display text-xl tracking-widest text-dark">PAYMENT</h2>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setPayNow(true)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-body font-bold text-sm transition-all"
              style={
                payNow
                  ? { backgroundColor: '#FF7B9D', color: 'white' }
                  : { backgroundColor: 'white', color: '#2C2C2C', border: '1.5px solid #e5e7eb' }
              }
            >
              <CreditCard className="w-4 h-4" />
              PAY NOW
            </button>
            <button
              type="button"
              onClick={() => { setPayNow(false); setError(null) }}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-body font-bold text-sm transition-all"
              style={
                !payNow
                  ? { backgroundColor: '#6FBDB8', color: 'white' }
                  : { backgroundColor: 'white', color: '#2C2C2C', border: '1.5px solid #e5e7eb' }
              }
            >
              <Store className="w-4 h-4" />
              PAY AT PICKUP
            </button>
          </div>

          {payNow ? (
            <div>
              {!squareLoaded ? (
                <div className="flex items-center gap-2 py-4">
                  <div className="w-4 h-4 rounded-full border-2 border-pink-300 border-t-transparent animate-spin" />
                  <p className="font-body text-dark/50 text-sm">Loading payment form…</p>
                </div>
              ) : (
                <div id="pickup-card-container" ref={cardContainerRef} className="min-h-[90px]" />
              )}
              <p className="font-body text-dark/40 text-xs mt-3 flex items-center gap-1">
                🔒 Secured by Square. We never store your card details.
              </p>
            </div>
          ) : (
            <div className="rounded-xl px-4 py-3 font-body text-sm text-dark/60" style={{ backgroundColor: '#6FBDB822' }}>
              You&apos;ll pay in store when you arrive to pick up your order.
            </div>
          )}
        </div>

        {error && (
          <div className="font-body text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitDisabled}
          className="w-full py-4 rounded-full font-display tracking-widest text-white text-lg disabled:opacity-50 transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#FF7B9D' }}
        >
          {submitLabel}
        </button>
      </form>

      {/* ── Order summary sidebar ─────────────────── */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-20">
          <h2 className="font-display text-xl tracking-widest text-dark mb-5">ORDER SUMMARY</h2>

          <div className="flex flex-col gap-3 mb-5">
            {items.map((item) => (
              <div key={item.lineId} className="flex items-center gap-3">
                <span className="text-xl w-8 text-center flex-shrink-0">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm font-bold text-dark leading-tight line-clamp-1">
                    {item.name}
                  </p>
                  <p className="font-body text-xs text-dark/40">× {item.quantity}</p>
                </div>
                <p className="font-body text-sm text-dark/70 flex-shrink-0">
                  ${((item.priceCents * item.quantity) / 100).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4 flex flex-col gap-2">
            <div className="flex justify-between font-bold pt-2">
              <span className="font-body">Total</span>
              <span className="font-body">${totalDollars}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-body text-dark/50 text-sm">Pickup at</span>
              <span className="font-body text-sm text-right">209 W Michigan Ave</span>
            </div>
          </div>

          <div
            className="mt-4 flex items-center justify-center gap-2 rounded-xl py-2 px-3 font-body text-sm font-bold"
            style={
              payNow
                ? { backgroundColor: '#FF7B9D22', color: '#FF7B9D' }
                : { backgroundColor: '#6FBDB822', color: '#6FBDB8' }
            }
          >
            {payNow ? <><CreditCard className="w-4 h-4" /> Pay Now</> : <><Store className="w-4 h-4" /> Pay at Pickup</>}
          </div>
        </div>
      </div>
    </div>
  )
}

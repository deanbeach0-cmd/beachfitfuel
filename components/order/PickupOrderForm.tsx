'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Trash2, ShoppingBag, CreditCard, Store, Truck } from 'lucide-react'
import { usePickupCartStore } from '@/lib/pickup-cart-store'
import { getPickupAvailability, PickupAvailability } from '@/lib/business-hours'
import { SHIPPING_FLAT_FEE_CENTS } from '@/lib/shipping'
import { SALES_TAX_RATE } from '@/lib/tax'
import { LocationSlug, LOCATIONS } from '@/lib/locations'
import type { PickupCustomer, PickupTime, FulfillmentType, ShippingAddress } from '@/types/pickup'

interface PickupOrderFormProps {
  locationSlug: LocationSlug
}

const TIP_PRESETS = [15, 20, 25] as const
type TipOption = (typeof TIP_PRESETS)[number] | 'custom' | 'none'

declare global {
  interface Window {
    Square?: any
  }
}

const OFFSET_LABELS: Record<Exclude<PickupTime, 'ASAP'>, string> = {
  '15min': '15 min',
  '30min': '30 min',
  '45min': '45 min',
  '1hr': '1 hr',
}

const EMPTY_CUSTOMER: PickupCustomer = {
  name: '',
  phone: '',
  email: '',
  pickupTime: 'ASAP',
  note: '',
}

const EMPTY_SHIPPING: ShippingAddress = {
  firstName: '',
  lastName: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  zip: '',
}

export function PickupOrderForm({ locationSlug }: PickupOrderFormProps) {
  const { items, removeItem, updateQuantity, clearCart, subtotalCents } = usePickupCartStore()
  const router = useRouter()
  const location = LOCATIONS[locationSlug]

  const [mounted, setMounted] = useState(false)
  const [customer, setCustomer] = useState<PickupCustomer>(EMPTY_CUSTOMER)
  const [fulfillment, setFulfillment] = useState<FulfillmentType>('PICKUP')
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(EMPTY_SHIPPING)
  const [availability, setAvailability] = useState<PickupAvailability | null>(null)
  const [tipOption, setTipOption] = useState<TipOption>('none')
  const [customTipInput, setCustomTipInput] = useState('')
  const [squareLoaded, setSquareLoaded] = useState(false)
  const [cardReady, setCardReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [locationSwitchNotice, setLocationSwitchNotice] = useState(false)

  const cardRef = useRef<any>(null)
  const cardContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    const avail = getPickupAvailability(locationSlug)
    setAvailability(avail)
    // Store closed right now — pre-select the first available slot so the
    // form always starts in a submittable state.
    if (!avail.openNow && avail.nextDay?.slots.length) {
      setCustomer((c) => ({ ...c, scheduledPickupAt: avail.nextDay!.slots[0].iso }))
    }
  }, [locationSlug])

  // A cart built while ordering from the other location can't be fulfilled
  // here — clear it and let the customer know, rather than silently mixing.
  useEffect(() => {
    if (items.length > 0 && items[0].locationSlug !== locationSlug) {
      clearCart()
      setLocationSwitchNotice(true)
    }
  }, [items, locationSlug, clearCart])

  const allItemsShippable = items.length > 0 && items.every((i) => i.shippable)

  // Tipping doesn't apply to mailed orders — reset if the customer switches to Ship.
  useEffect(() => {
    if (fulfillment === 'SHIPMENT') {
      setTipOption('none')
      setCustomTipInput('')
    }
  }, [fulfillment])

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

  // Initialize Square card form
  useEffect(() => {
    if (!squareLoaded || !cardContainerRef.current) return
    const appId = process.env.NEXT_PUBLIC_SQUARE_APP_ID
    // Shared across both locations on purpose — see the note in lib/locations.ts.
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
  }, [squareLoaded])

  if (!mounted) return null

  const shippingFeeCents = fulfillment === 'SHIPMENT' ? SHIPPING_FLAT_FEE_CENTS : 0
  // Estimated — Square computes the exact tax server-side at checkout, which
  // is what's actually charged; this may differ by a cent from rounding.
  const estimatedTaxCents = Math.round(subtotalCents() * SALES_TAX_RATE)
  const tipCents =
    tipOption === 'none'
      ? 0
      : tipOption === 'custom'
      ? Math.round((parseFloat(customTipInput) || 0) * 100)
      : Math.round(subtotalCents() * (tipOption / 100))
  const total = subtotalCents() + estimatedTaxCents + shippingFeeCents + tipCents
  const totalDollars = (total / 100).toFixed(2)

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        {locationSwitchNotice && (
          <div className="max-w-md mx-auto mb-8 font-body text-sm bg-sky/10 border border-sky/30 rounded-xl px-4 py-3 text-dark/70">
            Your cart had items from our other location, so we cleared it — orders can only be picked up from one spot.
          </div>
        )}
        <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-dark/20" />
        <h2 className="font-display text-2xl text-dark tracking-wide mb-3">YOUR ORDER IS EMPTY</h2>
        <p className="font-body text-dark/50 mb-8">Add drinks from the menu to get started.</p>
        <Link
          href={`/menu/${locationSlug}`}
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
    if (!customer.name || !customer.phone || !customer.email) {
      setError('Please enter your name, phone number, and email.')
      return
    }
    if (fulfillment === 'SHIPMENT') {
      const { firstName, lastName, address1, city, state, zip } = shippingAddress
      if (!firstName || !lastName || !address1 || !city || !state || !zip) {
        setError('Please fill in your full shipping address.')
        return
      }
    } else if (!availability?.openNow && !customer.scheduledPickupAt) {
      setError('Please choose a pickup time.')
      return
    }
    if (!cardRef.current || !cardReady) {
      setError('Card payment form is not ready yet.')
      return
    }
    setError(null)
    setLoading(true)

    try {
      const result = await cardRef.current.tokenize()
      if (result.status !== 'OK') {
        throw new Error(result.errors?.[0]?.message ?? 'Card tokenization failed')
      }
      const sourceId = result.token

      const res = await fetch('/api/orders/pickup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId,
          locationSlug,
          items,
          customer,
          totalCents: total,
          tipCents,
          fulfillment,
          shippingAddress: fulfillment === 'SHIPMENT' ? shippingAddress : undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Order failed')

      clearCart()
      const chargedTotal = ((data.totalCents ?? total) / 100).toFixed(2)
      router.push(
        `/order/confirmation?orderId=${data.orderId}&total=${chargedTotal}&fulfillment=${fulfillment}&location=${locationSlug}`
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const submitLabel = loading
    ? 'PLACING ORDER…'
    : !cardReady
    ? 'LOADING PAYMENT…'
    : `PLACE ORDER — $${totalDollars}`

  const submitDisabled = loading || !cardReady

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

      {/* ── Main form ─────────────────────────────── */}
      <form onSubmit={handleSubmit} className="lg:col-span-3 flex flex-col gap-6">

        {/* Cart items */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl tracking-widest text-dark">YOUR ORDER</h2>
            <Link
              href={`/menu/${locationSlug}`}
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

        {/* Pickup vs Ship — only offered when every item in the cart is a
            shippable To-Go Pack (drinks/food can't be shipped) */}
        {allItemsShippable && (
          <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <h2 className="font-display text-xl tracking-widest text-dark">HOW WOULD YOU LIKE THIS?</h2>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFulfillment('PICKUP')}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-body font-bold text-sm transition-all"
                style={
                  fulfillment === 'PICKUP'
                    ? { backgroundColor: '#FF7B9D', color: 'white' }
                    : { backgroundColor: 'white', color: '#2C2C2C', border: '1.5px solid #e5e7eb' }
                }
              >
                <Store className="w-4 h-4" />
                PICKUP
              </button>
              <button
                type="button"
                onClick={() => setFulfillment('SHIPMENT')}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-body font-bold text-sm transition-all"
                style={
                  fulfillment === 'SHIPMENT'
                    ? { backgroundColor: '#9BBDCF', color: 'white' }
                    : { backgroundColor: 'white', color: '#2C2C2C', border: '1.5px solid #e5e7eb' }
                }
              >
                <Truck className="w-4 h-4" />
                SHIP — ${(SHIPPING_FLAT_FEE_CENTS / 100).toFixed(2)}
              </button>
            </div>
            {fulfillment === 'SHIPMENT' && (
              <p className="font-body text-dark/50 text-xs">Ships via USPS. Please allow a few business days.</p>
            )}
          </div>
        )}

        {/* Contact + fulfillment details */}
        <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <h2 className="font-display text-xl tracking-widest text-dark">
            {fulfillment === 'SHIPMENT' ? 'SHIPPING DETAILS' : 'PICKUP DETAILS'}
          </h2>

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
            <div className="col-span-2">
              <label className="block font-body text-sm font-bold text-dark mb-1">Email *</label>
              <input
                type="email"
                value={customer.email}
                onChange={(e) => setCustomer((c) => ({ ...c, email: e.target.value }))}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white font-body text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
          </div>

          {fulfillment === 'SHIPMENT' ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block font-body text-sm font-bold text-dark mb-1">First Name *</label>
                <input
                  type="text"
                  value={shippingAddress.firstName}
                  onChange={(e) => setShippingAddress((a) => ({ ...a, firstName: e.target.value }))}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white font-body text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block font-body text-sm font-bold text-dark mb-1">Last Name *</label>
                <input
                  type="text"
                  value={shippingAddress.lastName}
                  onChange={(e) => setShippingAddress((a) => ({ ...a, lastName: e.target.value }))}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white font-body text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
              </div>
              <div className="col-span-2">
                <label className="block font-body text-sm font-bold text-dark mb-1">Address *</label>
                <input
                  type="text"
                  value={shippingAddress.address1}
                  onChange={(e) => setShippingAddress((a) => ({ ...a, address1: e.target.value }))}
                  placeholder="Street address"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white font-body text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="text"
                  value={shippingAddress.address2}
                  onChange={(e) => setShippingAddress((a) => ({ ...a, address2: e.target.value }))}
                  placeholder="Apt, suite, etc. (optional)"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white font-body text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block font-body text-sm font-bold text-dark mb-1">City *</label>
                <input
                  type="text"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress((a) => ({ ...a, city: e.target.value }))}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white font-body text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
              </div>
              <div className="col-span-1">
                <label className="block font-body text-sm font-bold text-dark mb-1">State *</label>
                <input
                  type="text"
                  value={shippingAddress.state}
                  onChange={(e) => setShippingAddress((a) => ({ ...a, state: e.target.value.toUpperCase() }))}
                  placeholder="MI"
                  maxLength={2}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white font-body text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
              </div>
              <div className="col-span-1">
                <label className="block font-body text-sm font-bold text-dark mb-1">ZIP *</label>
                <input
                  type="text"
                  value={shippingAddress.zip}
                  onChange={(e) => setShippingAddress((a) => ({ ...a, zip: e.target.value }))}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white font-body text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block font-body text-sm font-bold text-dark mb-2">
                When do you want to pick up?
              </label>
              {availability?.openNow ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomer((c) => ({ ...c, pickupTime: 'ASAP', scheduledPickupAt: undefined }))}
                    className="px-4 py-2 rounded-full font-body font-bold text-sm transition-all"
                    style={
                      customer.pickupTime === 'ASAP' && !customer.scheduledPickupAt
                        ? { backgroundColor: '#FF7B9D', color: 'white' }
                        : { backgroundColor: 'white', color: '#2C2C2C', border: '1.5px solid #e5e7eb' }
                    }
                  >
                    ASAP
                  </button>
                  {availability.validOffsetMinutes.map((minutes) => {
                    const value = (minutes === 15 ? '15min' : minutes === 30 ? '30min' : minutes === 45 ? '45min' : '1hr') as Exclude<PickupTime, 'ASAP'>
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setCustomer((c) => ({ ...c, pickupTime: value, scheduledPickupAt: undefined }))}
                        className="px-4 py-2 rounded-full font-body font-bold text-sm transition-all"
                        style={
                          customer.pickupTime === value && !customer.scheduledPickupAt
                            ? { backgroundColor: '#FF7B9D', color: 'white' }
                            : { backgroundColor: 'white', color: '#2C2C2C', border: '1.5px solid #e5e7eb' }
                        }
                      >
                        {OFFSET_LABELS[value]}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="font-body text-dark/50 text-sm">
                    We&apos;re closed right now — pick a time for {availability?.nextDay?.label ?? 'our next open day'}:
                  </p>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                    {availability?.nextDay?.slots.map((slot) => (
                      <button
                        key={slot.iso}
                        type="button"
                        onClick={() => setCustomer((c) => ({ ...c, scheduledPickupAt: slot.iso }))}
                        className="px-4 py-2 rounded-full font-body font-bold text-sm transition-all"
                        style={
                          customer.scheduledPickupAt === slot.iso
                            ? { backgroundColor: '#FF7B9D', color: 'white' }
                            : { backgroundColor: 'white', color: '#2C2C2C', border: '1.5px solid #e5e7eb' }
                        }
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

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

        {/* Payment */}
        <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-4">
          <h2 className="font-display text-xl tracking-widest text-dark">PAYMENT</h2>

          {fulfillment === 'PICKUP' && (
            <div>
              <label className="block font-body text-sm font-bold text-dark mb-2">Add a tip?</label>
              <div className="flex flex-wrap gap-2">
                {TIP_PRESETS.map((pct) => (
                  <button
                    type="button"
                    key={pct}
                    onClick={() => { setTipOption(pct); setCustomTipInput('') }}
                    className="px-4 py-2 rounded-full font-body font-bold text-sm transition-all"
                    style={
                      tipOption === pct
                        ? { backgroundColor: '#6FBDB8', color: 'white' }
                        : { backgroundColor: 'white', color: '#2C2C2C', border: '1.5px solid #e5e7eb' }
                    }
                  >
                    {pct}%
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setTipOption('custom')}
                  className="px-4 py-2 rounded-full font-body font-bold text-sm transition-all"
                  style={
                    tipOption === 'custom'
                      ? { backgroundColor: '#6FBDB8', color: 'white' }
                      : { backgroundColor: 'white', color: '#2C2C2C', border: '1.5px solid #e5e7eb' }
                  }
                >
                  Custom
                </button>
                <button
                  type="button"
                  onClick={() => { setTipOption('none'); setCustomTipInput('') }}
                  className="px-4 py-2 rounded-full font-body font-bold text-sm transition-all"
                  style={
                    tipOption === 'none'
                      ? { backgroundColor: '#6FBDB8', color: 'white' }
                      : { backgroundColor: 'white', color: '#2C2C2C', border: '1.5px solid #e5e7eb' }
                  }
                >
                  No tip
                </button>
              </div>
              {tipOption === 'custom' && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="font-body text-dark/50 text-sm">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={customTipInput}
                    onChange={(e) => setCustomTipInput(e.target.value)}
                    placeholder="0.00"
                    className="w-28 px-3 py-2 rounded-xl border border-gray-200 bg-white font-body text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                  />
                </div>
              )}
            </div>
          )}

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
            <div className="flex justify-between">
              <span className="font-body text-dark/50 text-sm">Subtotal</span>
              <span className="font-body text-sm">${(subtotalCents() / 100).toFixed(2)}</span>
            </div>
            {shippingFeeCents > 0 && (
              <div className="flex justify-between">
                <span className="font-body text-dark/50 text-sm">Shipping (USPS)</span>
                <span className="font-body text-sm">${(shippingFeeCents / 100).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="font-body text-dark/50 text-sm">Tax</span>
              <span className="font-body text-sm">${(estimatedTaxCents / 100).toFixed(2)}</span>
            </div>
            {tipCents > 0 && (
              <div className="flex justify-between">
                <span className="font-body text-dark/50 text-sm">Tip</span>
                <span className="font-body text-sm">${(tipCents / 100).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold pt-2">
              <span className="font-body">Total</span>
              <span className="font-body">${totalDollars}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-body text-dark/50 text-sm">
                {fulfillment === 'SHIPMENT' ? 'Ships to' : 'Pickup at'}
              </span>
              <span className="font-body text-sm text-right">
                {fulfillment === 'SHIPMENT'
                  ? (shippingAddress.city ? `${shippingAddress.city}, ${shippingAddress.state}` : 'Your address')
                  : location.address}
              </span>
            </div>
          </div>

          <div
            className="mt-4 flex items-center justify-center gap-2 rounded-xl py-2 px-3 font-body text-sm font-bold"
            style={{ backgroundColor: '#FF7B9D22', color: '#FF7B9D' }}
          >
            <CreditCard className="w-4 h-4" /> Pay Now
          </div>
        </div>
      </div>
    </div>
  )
}

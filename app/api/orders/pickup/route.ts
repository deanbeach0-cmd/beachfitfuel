import { NextRequest, NextResponse } from 'next/server'
import { squareClient, squareLocationIdForSlug } from '@/lib/square'
import { resend, FROM_EMAIL } from '@/lib/resend'
import { pickupOrderConfirmationEmail } from '@/lib/email-templates'
import { isWithinBusinessHours } from '@/lib/business-hours'
import { getLocationHours } from '@/lib/location-hours'
import { SHIPPING_FLAT_FEE_CENTS } from '@/lib/shipping'
import { SALES_TAX_CATALOG_ID } from '@/lib/tax'
import { getLocation } from '@/lib/locations'
import type { PickupCartItem, PickupCustomer, PickupTime, FulfillmentType, ShippingAddress } from '@/types/pickup'

// Square requires an explicit pickup_at timestamp whenever the fulfillment
// isn't ASAP — "SCHEDULED" alone isn't enough and gets rejected with
// MISSING_REQUIRED_PARAMETER.
const PICKUP_MINUTES: Record<Exclude<PickupTime, 'ASAP'>, number> = {
  '15min': 15,
  '30min': 30,
  '45min': 45,
  '1hr': 60,
}

// A specific next-day slot (customer.scheduledPickupAt) always wins over the
// relative pickupTime offset — the offset only applies to the "open now" case.
function resolvePickupAt(customer: PickupCustomer): string | undefined {
  if (customer.scheduledPickupAt) return customer.scheduledPickupAt
  if (customer.pickupTime === 'ASAP') return undefined
  return new Date(Date.now() + PICKUP_MINUTES[customer.pickupTime] * 60_000).toISOString()
}

interface PickupOrderRequest {
  sourceId: string
  locationSlug: string
  items: PickupCartItem[]
  customer: PickupCustomer
  totalCents: number
  tipCents?: number
  fulfillment?: FulfillmentType
  shippingAddress?: ShippingAddress
}

function randomKey() {
  return Math.random().toString(36).slice(2, 10)
}

// Flavor breakdown isn't submitted as real Square modifiers (Square doesn't
// cleanly support repeating the same modifier for a quantity) — it's written
// into the line item note so staff can see exactly what to pack.
function flavorNote(item: PickupCartItem): string | undefined {
  if (!item.flavors?.length) return undefined
  return item.flavors.map((f) => `${f.quantity}x ${f.name}`).join(', ')
}

export async function POST(request: NextRequest) {
  let body: PickupOrderRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { sourceId, items, customer, totalCents } = body
  const fulfillment: FulfillmentType = body.fulfillment ?? 'PICKUP'
  const shippingAddress = body.shippingAddress
  const tipCents = Math.max(0, Math.round(body.tipCents ?? 0))

  if (!sourceId || !items?.length || !customer?.name || !customer?.phone || !customer?.email || !totalCents) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const location = getLocation(body.locationSlug)
  if (!location) {
    return NextResponse.json({ error: 'Unknown pickup location' }, { status: 400 })
  }

  if (fulfillment === 'SHIPMENT') {
    if (
      !shippingAddress?.firstName ||
      !shippingAddress?.lastName ||
      !shippingAddress?.address1 ||
      !shippingAddress?.city ||
      !shippingAddress?.state ||
      !shippingAddress?.zip
    ) {
      return NextResponse.json({ error: 'Missing shipping address' }, { status: 400 })
    }
  }

  const pickupAt = resolvePickupAt(customer)

  if (fulfillment === 'PICKUP') {
    const hours = await getLocationHours(location.slug)
    if (!isWithinBusinessHours(hours, location.timezone, pickupAt ?? new Date().toISOString())) {
      return NextResponse.json(
        { error: 'That pickup time is outside our business hours. Please choose another time.' },
        { status: 400 }
      )
    }
  }

  const locationId = squareLocationIdForSlug(location.slug)
  if (!locationId) {
    return NextResponse.json({ error: `${location.name} location not configured` }, { status: 500 })
  }

  // Step 1: Create Square Order — shows up in POS as a pickup or shipment order.
  // Tax references the same "Michigan Sales Tax" catalog object used in-store,
  // applied only to product line items — shipping stays untaxed.
  let orderId: string
  let orderTotalCents: number
  try {
    const TAX_UID = 'sales-tax'
    const lineItems = items.map((i) => ({
      name: i.name,
      quantity: String(i.quantity),
      note: flavorNote(i),
      basePriceMoney: {
        amount: BigInt(i.priceCents),
        currency: 'USD' as const,
      },
      appliedTaxes: [{ taxUid: TAX_UID }],
    }))

    const allLineItems = fulfillment === 'SHIPMENT'
      ? [
          ...lineItems,
          {
            name: 'Shipping (USPS)',
            quantity: '1',
            note: undefined,
            basePriceMoney: { amount: BigInt(SHIPPING_FLAT_FEE_CENTS), currency: 'USD' as const },
          },
        ]
      : lineItems

    const orderRes = await squareClient.orders.create({
      idempotencyKey: `pickup-order-${Date.now()}-${randomKey()}`,
      order: {
        locationId,
        lineItems: allLineItems,
        taxes: [
          {
            uid: TAX_UID,
            catalogObjectId: SALES_TAX_CATALOG_ID,
            scope: 'LINE_ITEM',
          },
        ],
        fulfillments:
          fulfillment === 'SHIPMENT'
            ? [
                {
                  type: 'SHIPMENT',
                  shipmentDetails: {
                    recipient: {
                      displayName: `${shippingAddress!.firstName} ${shippingAddress!.lastName}`,
                      phoneNumber: customer.phone,
                      address: {
                        addressLine1: shippingAddress!.address1,
                        addressLine2: shippingAddress!.address2 || undefined,
                        locality: shippingAddress!.city,
                        administrativeDistrictLevel1: shippingAddress!.state,
                        postalCode: shippingAddress!.zip,
                        country: 'US',
                      },
                    },
                  },
                },
              ]
            : [
                {
                  type: 'PICKUP',
                  pickupDetails: {
                    recipient: {
                      displayName: customer.name,
                      phoneNumber: customer.phone,
                    },
                    scheduleType: pickupAt ? 'SCHEDULED' : 'ASAP',
                    pickupAt,
                    note: customer.note || undefined,
                  },
                },
              ],
      },
    })

    if (!orderRes.order?.id || orderRes.order.totalMoney?.amount == null) {
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }
    orderId = orderRes.order.id
    // Square computes the real total (items + tax + shipping) — trust that
    // over anything the client sent, since only Square knows the exact tax.
    orderTotalCents = Number(orderRes.order.totalMoney.amount)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Order creation failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  // Step 2: Charge card — every order is paid online now, no pay-at-pickup.
  // tip_money is added by Square on top of amount_money, so amount_money is
  // just the order total (it must NOT already include the tip).
  try {
    const payRes = await squareClient.payments.create({
      sourceId,
      amountMoney: {
        amount: BigInt(orderTotalCents),
        currency: 'USD',
      },
      tipMoney: tipCents > 0 ? { amount: BigInt(tipCents), currency: 'USD' } : undefined,
      locationId,
      orderId,
      idempotencyKey: `pickup-pay-${Date.now()}-${randomKey()}`,
      note: `Pickup order for ${customer.name}`,
    })

    if (payRes.payment?.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Payment was not completed' }, { status: 402 })
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Payment failed'
    return NextResponse.json({ error: msg }, { status: 402 })
  }

  const subtotalCents = items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0)
  const shippingCents = fulfillment === 'SHIPMENT' ? SHIPPING_FLAT_FEE_CENTS : 0
  const taxCents = orderTotalCents - subtotalCents - shippingCents
  const grandTotalCents = orderTotalCents + tipCents

  // Step 3: Send confirmation email — never let a failed send fail the order,
  // since payment/order creation already succeeded by this point.
  try {
    const { subject, html } = pickupOrderConfirmationEmail({
      customerName: customer.name,
      orderId,
      items: items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        priceCents: i.priceCents,
        flavors: i.flavors,
      })),
      subtotalCents,
      taxCents,
      shippingCents,
      tipCents,
      totalCents: grandTotalCents,
      fulfillment,
      locationName: location.name,
      pickupTime: pickupAt
        ? new Date(pickupAt).toLocaleString('en-US', {
            timeZone: location.timezone,
            weekday: 'short',
            hour: 'numeric',
            minute: '2-digit',
          })
        : 'ASAP',
      shippingAddress: fulfillment === 'SHIPMENT' ? shippingAddress : undefined,
    })
    await resend.emails.send({ from: FROM_EMAIL, to: customer.email, subject, html })
  } catch (err) {
    console.error('[orders/pickup] Confirmation email failed', err)
  }

  return NextResponse.json({
    success: true,
    orderId,
    totalCents: grandTotalCents,
  })
}

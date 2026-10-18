import { NextRequest, NextResponse } from 'next/server'
import { squareClient, squareLocationIdForSlug } from '@/lib/square'
import { resend, FROM_EMAIL } from '@/lib/resend'
import { pickupOrderConfirmationEmail } from '@/lib/email-templates'
import { isWithinBusinessHours } from '@/lib/business-hours'
import { getLocationHours } from '@/lib/location-hours'
import { isShippableItem, SHIPPING_FLAT_FEE_CENTS } from '@/lib/shipping'
import { createServerComponentClient } from '@/lib/supabase'
import { SALES_TAX_CATALOG_ID } from '@/lib/tax'
import { getLocation } from '@/lib/locations'
import type { PickupCartItem, PickupCustomer, PickupTime, FulfillmentType, ShippingAddress } from '@/types/pickup'

const PICKUP_MINUTES: Record<PickupTime, number> = {
  '15min': 15,
  '30min': 30,
  '45min': 45,
  '1hr': 60,
}

// RFC 3339 durations, as Square's prep_time_duration expects.
const PREP_DURATIONS: Record<PickupTime, string> = {
  '15min': 'PT15M',
  '30min': 'PT30M',
  '45min': 'PT45M',
  '1hr': 'PT1H',
}

type ResolvedPickup =
  | { scheduleType: 'ASAP'; prepTimeDuration: string; readyAt: string }
  | { scheduleType: 'SCHEDULED'; pickupAt: string; readyAt: string }

// `readyAt` is our own copy of when the order is due. Square derives its
// pickup_at independently for the ASAP case, so the two can differ by the
// couple of seconds this request takes — immaterial, and we need a local
// value for the hours check, the POS note, the email and the response.
function resolvePickup(customer: PickupCustomer): ResolvedPickup {
  // A specific slot — only offered while the store is closed — is a genuine
  // future booking. SCHEDULED is right, and Square parking it under the POS
  // "Upcoming" filter until its prep window is exactly where it belongs.
  if (customer.scheduledPickupAt) {
    return {
      scheduleType: 'SCHEDULED',
      pickupAt: customer.scheduledPickupAt,
      readyAt: customer.scheduledPickupAt,
    }
  }

  // Ordering for right now. Deliberately ASAP + prep_time_duration rather than
  // SCHEDULED + pickup_at: Square resolves both to the same pickup time, but an
  // ASAP fulfillment is active on the POS immediately, whereas a SCHEDULED one
  // can sit in the Terminal's "Upcoming" filter — out of the staff's default
  // view, which is how paid online orders went unnoticed.
  // An unrecognized offset falls back to the floor rather than promising faster.
  const offset: PickupTime = customer.pickupTime in PREP_DURATIONS ? customer.pickupTime : '15min'
  return {
    scheduleType: 'ASAP',
    prepTimeDuration: PREP_DURATIONS[offset],
    readyAt: new Date(Date.now() + PICKUP_MINUTES[offset] * 60_000).toISOString(),
  }
}

// Square renders this on the POS ticket (max 500 chars). On a handheld Terminal
// it's the most reliable place to put what staff must not miss, so the "this is
// an online order, due at X" marker leads and the customer's note follows.
function pickupNote(readyAt: string, timezone: string, customerNote?: string): string {
  const ready = new Date(readyAt).toLocaleString('en-US', {
    timeZone: timezone,
    weekday: 'short',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
  const parts = [`ONLINE ORDER — ready by ${ready}`]
  const trimmed = customerNote?.trim()
  if (trimmed) parts.push(trimmed)
  return parts.join(' | ').slice(0, 500)
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
    // Never take the client's word for what can be mailed — re-derive it from
    // the catalog. Without this, a crafted request could ship a smoothie.
    const supabase = await createServerComponentClient()
    const { data: rows } = await supabase
      .from('menu_items')
      .select('id, square_item_id')
      .in('id', items.map((i) => i.menuItemId))

    const shippableById = new Map((rows ?? []).map((r) => [r.id, r.square_item_id]))
    const blocked = items.filter((i) => !isShippableItem(shippableById.get(i.menuItemId)))
    if (blocked.length > 0) {
      return NextResponse.json(
        { error: `Not available for shipping: ${blocked.map((i) => i.name).join(', ')}` },
        { status: 400 }
      )
    }

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

  const resolved = resolvePickup(customer)

  if (fulfillment === 'PICKUP') {
    const hours = await getLocationHours(location.slug)
    if (!isWithinBusinessHours(hours, location.timezone, resolved.readyAt)) {
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
    // Linking to the real catalog variation (when we have one synced) is what
    // lets Square's sales-by-category reporting categorize the sale — an
    // ad-hoc name+price line item shows up as "Uncategorized". basePriceMoney
    // is always included too, so the customer is charged exactly what they
    // were quoted even if Square's catalog price has drifted since the last sync.
    const lineItems = items.map((i) => ({
      ...(i.squareVariationId ? { catalogObjectId: i.squareVariationId } : { name: i.name }),
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
        // Deliberately no `source`: Square already derives source.name from the
        // application, and live orders arrive labelled "BeachFit Fuel Website",
        // distinct from in-store "Point of Sale". Setting it here would only
        // rename a value the POS may key on — not worth the risk.
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
                    // carrier + shippingNote are what mark this as a shipping
                    // ticket on the POS, the way pickupDetails.note does for
                    // pickup. Staff see it on the Shipments tab.
                    carrier: 'USPS',
                    shippingNote: `SHIP ORDER — USPS to ${shippingAddress!.city}, ${shippingAddress!.state}`,
                    recipient: {
                      displayName: `${shippingAddress!.firstName} ${shippingAddress!.lastName}`,
                      phoneNumber: customer.phone,
                      emailAddress: customer.email,
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
                      emailAddress: customer.email,
                    },
                    ...(resolved.scheduleType === 'ASAP'
                      ? {
                          scheduleType: 'ASAP' as const,
                          prepTimeDuration: resolved.prepTimeDuration,
                        }
                      : {
                          scheduleType: 'SCHEDULED' as const,
                          pickupAt: resolved.pickupAt,
                        }),
                    note: pickupNote(resolved.readyAt, location.timezone, customer.note),
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

  // NOTE: do not advance the fulfillment past Square's default PROPOSED here.
  // We used to flip it to RESERVED immediately after payment, but RESERVED
  // means "fulfillment in progress" — every order was auto-accepted the
  // instant it was created (placedAt == acceptedAt on all 240 orders since
  // this shipped), so it never sat in the new-order queue staff act on.
  // Marshall's newer Terminal stopped alerting entirely after a hardware
  // swap; Battle Creek's older one still alerts. Leaving the fulfillment at
  // PROPOSED is what makes an order genuinely new. Staff accept it on the
  // Terminal, and that tap is what should move it to RESERVED.
  //
  // Do not set expires_at either: it exists to expire fulfillments nobody
  // starts, which is the wrong semantics for an order already charged.

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
      // Always a concrete clock time now — there is no ASAP. The date is
      // included because a next-day slot rendered as "Mon, 9:30 AM" alone is
      // ambiguous.
      pickupTime: new Date(resolved.readyAt).toLocaleString('en-US', {
        timeZone: location.timezone,
        weekday: 'short',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }),
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
    // The authoritative time, so the confirmation page shows what we actually
    // sent Square rather than re-deriving an estimate on the client.
    pickupAt: fulfillment === 'PICKUP' ? resolved.readyAt : undefined,
  })
}

import { NextRequest, NextResponse } from 'next/server'
import { squareClient, LOCATION_IDS } from '@/lib/square'
import { resend, FROM_EMAIL } from '@/lib/resend'
import { pickupOrderConfirmationEmail } from '@/lib/email-templates'
import type { PickupCartItem, PickupCustomer } from '@/types/pickup'

interface PickupOrderRequest {
  sourceId?: string
  items: PickupCartItem[]
  customer: PickupCustomer
  totalCents: number
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

  if (!items?.length || !customer?.name || !customer?.phone || !customer?.email || !totalCents) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const locationId = LOCATION_IDS.marshall
  if (!locationId) {
    return NextResponse.json({ error: 'Marshall location not configured' }, { status: 500 })
  }

  // Step 1: Create Square Order — shows up in POS as a pickup order
  let orderId: string
  try {
    const orderRes = await squareClient.orders.create({
      idempotencyKey: `pickup-order-${Date.now()}-${randomKey()}`,
      order: {
        locationId,
        lineItems: items.map((i) => ({
          name: i.name,
          quantity: String(i.quantity),
          note: flavorNote(i),
          basePriceMoney: {
            amount: BigInt(i.priceCents),
            currency: 'USD',
          },
        })),
        fulfillments: [
          {
            type: 'PICKUP',
            pickupDetails: {
              recipient: {
                displayName: customer.name,
                phoneNumber: customer.phone,
              },
              scheduleType: customer.pickupTime === 'ASAP' ? 'ASAP' : 'SCHEDULED',
              note: customer.note || undefined,
            },
          },
        ],
      },
    })

    if (!orderRes.order?.id) {
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }
    orderId = orderRes.order.id
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Order creation failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  // Step 2: Charge card (only when paying online)
  if (sourceId) {
    try {
      const payRes = await squareClient.payments.create({
        sourceId,
        amountMoney: {
          amount: BigInt(totalCents),
          currency: 'USD',
        },
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
  }

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
      totalCents,
      pickupTime: customer.pickupTime,
      paidOnline: !!sourceId,
    })
    await resend.emails.send({ from: FROM_EMAIL, to: customer.email, subject, html })
  } catch (err) {
    console.error('[orders/pickup] Confirmation email failed', err)
  }

  return NextResponse.json({
    success: true,
    orderId,
    totalCents,
    paidOnline: !!sourceId,
  })
}

import { NextRequest, NextResponse } from 'next/server'
import { squareClient } from '@/lib/square'
import { printful } from '@/lib/printful'
import { resend, FROM_EMAIL } from '@/lib/resend'
import { apparelOrderConfirmationEmail } from '@/lib/email-templates'
import type { CartItem } from '@/types/shop'

interface ShippingAddress {
  firstName: string
  lastName: string
  address1: string
  address2?: string
  city: string
  state: string
  zip: string
  email: string
  phone: string
}

interface OrderRequest {
  sourceId: string
  amountCents: number
  items: CartItem[]
  shippingAddress: ShippingAddress
}

export async function POST(request: NextRequest) {
  let body: OrderRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { sourceId, amountCents, items, shippingAddress } = body

  if (!sourceId || !amountCents || !items?.length || !shippingAddress) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // 1. Charge the card via Square
  let paymentId: string
  try {
    const paymentResponse = await squareClient.payments.create({
      sourceId,
      amountMoney: {
        amount: BigInt(amountCents),
        currency: 'USD',
      },
      locationId: process.env.SQUARE_LOCATION_ID_MARSHALL!,
      idempotencyKey: `apparel-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      buyerEmailAddress: shippingAddress.email,
      note: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
      shippingAddress: {
        addressLine1: shippingAddress.address1,
        addressLine2: shippingAddress.address2 ?? undefined,
        locality: shippingAddress.city,
        administrativeDistrictLevel1: shippingAddress.state,
        postalCode: shippingAddress.zip,
        country: 'US',
      },
    })

    if (paymentResponse.payment?.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Payment was not completed' }, { status: 402 })
    }

    paymentId = paymentResponse.payment.id!
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Payment failed'
    return NextResponse.json({ error: msg }, { status: 402 })
  }

  // 2. Create Printful fulfillment order
  let printfulOrderId: number | undefined
  try {
    const printfulRes = await printful.createOrder({
      external_id: paymentId,
      shipping: 'STANDARD',
      recipient: {
        name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
        address1: shippingAddress.address1,
        address2: shippingAddress.address2 ?? '',
        city: shippingAddress.city,
        state_code: shippingAddress.state,
        country_code: 'US',
        zip: shippingAddress.zip,
        email: shippingAddress.email,
        phone: shippingAddress.phone,
      },
      items: items
        .filter((i) => i.type === 'apparel')
        .map((i) => ({
          sync_variant_id: i.variantId,
          quantity: i.quantity,
          retail_price: (i.price / 100).toFixed(2),
          name: i.name,
        })),
    })

    printfulOrderId = printfulRes.result.id
  } catch (err) {
    // Payment succeeded but Printful failed — log for manual fulfillment
    console.error('[orders/apparel] Printful order failed after successful Square payment', {
      paymentId,
      error: err instanceof Error ? err.message : err,
    })
  }

  // Send confirmation email — never let a failed send fail the order, since
  // payment already succeeded by this point.
  try {
    const { subject, html } = apparelOrderConfirmationEmail({
      customerName: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
      orderId: printfulOrderId ? String(printfulOrderId) : paymentId,
      items: items
        .filter((i) => i.type === 'apparel')
        .map((i) => ({ name: i.name, quantity: i.quantity, priceCents: i.price })),
      totalCents: amountCents,
    })
    await resend.emails.send({ from: FROM_EMAIL, to: shippingAddress.email, subject, html })
  } catch (err) {
    console.error('[orders/apparel] Confirmation email failed', err)
  }

  return NextResponse.json({
    success: true,
    orderId: printfulOrderId ? String(printfulOrderId) : paymentId,
    paymentId,
  })
}

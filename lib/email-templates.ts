interface EmailTemplate {
  subject: string
  html: string
}

function wrapper(bodyHtml: string): string {
  return `
    <div style="background-color:#FFF8EE;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
      <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;">
        <div style="background-color:#9BBDCF;padding:24px;text-align:center;">
          <span style="font-size:22px;font-weight:bold;letter-spacing:2px;color:#ffffff;">BEACHFIT FUEL</span>
        </div>
        <div style="padding:28px 24px;color:#2C2C2C;">
          ${bodyHtml}
        </div>
        <div style="background-color:#2C2C2C;padding:16px 24px;text-align:center;">
          <span style="font-size:12px;color:rgba(255,255,255,0.5);">
            BeachFit Fuel &middot; 205 W Michigan Ave, Marshall, MI 49068 &middot; (269) 234-3645
          </span>
        </div>
      </div>
    </div>
  `
}

function money(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

interface PickupOrderEmailItem {
  name: string
  quantity: number
  priceCents: number
  flavors?: { name: string; quantity: number }[]
}

export function pickupOrderConfirmationEmail(params: {
  customerName: string
  orderId: string
  items: PickupOrderEmailItem[]
  totalCents: number
  pickupTime: string
  paidOnline: boolean
}): EmailTemplate {
  const { customerName, orderId, items, totalCents, pickupTime, paidOnline } = params

  const itemRows = items
    .map((item) => {
      const flavorLine = item.flavors?.length
        ? `<div style="font-size:12px;color:#2C2C2C99;margin-top:2px;">${item.flavors
            .map((f) => `${f.quantity}x ${f.name}`)
            .join(', ')}</div>`
        : ''
      return `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;">
            <div style="font-weight:bold;">${item.quantity}x ${item.name}</div>
            ${flavorLine}
          </td>
          <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;text-align:right;white-space:nowrap;">
            ${money(item.priceCents * item.quantity)}
          </td>
        </tr>
      `
    })
    .join('')

  const body = `
    <h1 style="font-size:22px;margin:0 0 8px;">Thanks, ${customerName}! 🌴</h1>
    <p style="font-size:14px;line-height:1.5;color:#2C2C2C99;margin:0 0 20px;">
      Your pickup order is confirmed for our Marshall location.
      ${paidOnline ? "You're all paid up — just come grab it." : "You'll pay when you arrive."}
    </p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      ${itemRows}
      <tr>
        <td style="padding:12px 0 0;font-weight:bold;">Total</td>
        <td style="padding:12px 0 0;font-weight:bold;text-align:right;">${money(totalCents)}</td>
      </tr>
    </table>
    <div style="margin-top:20px;padding:14px 16px;background-color:#FFF8EE;border-radius:12px;font-size:13px;">
      <div><strong>Pickup time:</strong> ${pickupTime === 'ASAP' ? 'ASAP' : pickupTime}</div>
      <div><strong>Order #:</strong> ${orderId}</div>
    </div>
  `

  return { subject: `Your BeachFit Fuel order is confirmed 🌴`, html: wrapper(body) }
}

interface ApparelOrderEmailItem {
  name: string
  quantity: number
  priceCents: number
}

export function apparelOrderConfirmationEmail(params: {
  customerName: string
  orderId: string
  items: ApparelOrderEmailItem[]
  totalCents: number
}): EmailTemplate {
  const { customerName, orderId, items, totalCents } = params

  const itemRows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-weight:bold;">
            ${item.quantity}x ${item.name}
          </td>
          <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;text-align:right;white-space:nowrap;">
            ${money(item.priceCents * item.quantity)}
          </td>
        </tr>
      `
    )
    .join('')

  const body = `
    <h1 style="font-size:22px;margin:0 0 8px;">Thanks for your order, ${customerName}! 👕</h1>
    <p style="font-size:14px;line-height:1.5;color:#2C2C2C99;margin:0 0 20px;">
      Your BeachFit Fuel apparel order is confirmed and on its way to being printed and shipped.
    </p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      ${itemRows}
      <tr>
        <td style="padding:12px 0 0;font-weight:bold;">Total</td>
        <td style="padding:12px 0 0;font-weight:bold;text-align:right;">${money(totalCents)}</td>
      </tr>
    </table>
    <div style="margin-top:20px;padding:14px 16px;background-color:#FFF8EE;border-radius:12px;font-size:13px;">
      <strong>Order #:</strong> ${orderId}
    </div>
  `

  return { subject: `Your BeachFit Fuel apparel order is confirmed 👕`, html: wrapper(body) }
}

export function newsletterWelcomeEmail(params: { firstName?: string | null }): EmailTemplate {
  const greeting = params.firstName ? `Hey ${params.firstName}! 🌴` : 'Hey there! 🌴'

  const body = `
    <h1 style="font-size:22px;margin:0 0 8px;">${greeting}</h1>
    <p style="font-size:14px;line-height:1.5;color:#2C2C2C99;margin:0 0 16px;">
      You're on the list! Expect new flavor drops, specials, and Battle Creek opening news
      straight to your inbox — no spam, we're not that kind of business.
    </p>
    <p style="font-size:14px;line-height:1.5;color:#2C2C2C99;margin:0;">
      In the meantime, come say hi in Marshall or order ahead for pickup.
    </p>
  `

  return { subject: `Welcome to the BeachFit Fuel tribe 🌴`, html: wrapper(body) }
}

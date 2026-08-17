import Link from 'next/link'
import { ShoppingBag, Package, Shirt } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shop',
  description:
    'Shop BeachFit Fuel — to-go packs shipped nationwide and branded apparel. Coming soon.',
}

const SHOP_SECTIONS = [
  {
    href: '/shop/to-go-packs',
    Icon: Package,
    emoji: '📦',
    title: 'TO-GO PACKS',
    subtitle: 'Ship to your door',
    description:
      "Can't make it to a location? We're building to-go packs so you can enjoy BeachFit Fuel drinks from home. Ship anywhere in the US.",
    color: '#9BBDCF',
  },
  {
    href: '/shop/apparel',
    Icon: Shirt,
    emoji: '👕',
    title: 'APPAREL',
    subtitle: 'Wear the brand',
    description:
      'BeachFit Fuel branded gear — tees, hoodies, hats, and more. Look good while you fuel up.',
    color: '#FF7B9D',
  },
]

export default function ShopPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8EE' }}>

      {/* Header */}
      <div
        className="py-16 px-4 text-center"
        style={{ background: 'linear-gradient(135deg, #FF7B9D, #FAB65F)' }}
      >
        <span className="font-body font-800 text-sm tracking-[0.2em] uppercase text-white/70">
          BeachFit Fuel
        </span>
        <h1 className="font-display text-5xl md:text-6xl tracking-wide text-white mt-2">
          THE SHOP
        </h1>
        <p className="font-body text-white/80 mt-3 text-base max-w-md mx-auto">
          To-go packs and apparel — launching soon. Get notified when we go live.
        </p>
      </div>

      {/* Shop sections */}
      <div className="max-w-4xl mx-auto px-4 py-16 flex flex-col gap-8">
        {SHOP_SECTIONS.map(({ href, Icon, emoji, title, subtitle, description, color }) => (
          <div
            key={href}
            className="rounded-3xl overflow-hidden shadow-md"
            style={{ border: `1.5px solid ${color}33` }}
          >
            <div
              className="px-8 py-6 flex items-center justify-between"
              style={{ backgroundColor: color }}
            >
              <div className="flex items-center gap-4">
                <Icon size={28} className="text-white flex-shrink-0" />
                <div>
                  <p className="font-display text-3xl tracking-widest text-white leading-none">{title}</p>
                  <p className="font-body text-white/80 text-sm mt-0.5">{subtitle}</p>
                </div>
              </div>
              <span
                className="font-body text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: 'white', color }}
              >
                COMING SOON
              </span>
            </div>

            <div className="bg-white p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <span className="text-6xl flex-shrink-0">{emoji}</span>
              <div className="flex flex-col gap-4 flex-1">
                <p className="font-body text-dark/60 leading-relaxed">{description}</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/#newsletter"
                    className="flex items-center justify-center font-display tracking-widest text-sm py-3 px-6 rounded-full text-white transition-transform hover:scale-[1.02]"
                    style={{ backgroundColor: color }}
                  >
                    NOTIFY ME WHEN IT&apos;S LIVE
                  </Link>
                  <Link
                    href={href}
                    className="flex items-center justify-center font-display tracking-widest text-sm py-3 px-6 rounded-full transition-transform hover:scale-[1.02]"
                    style={{ backgroundColor: '#FFF8EE', color: '#2C2C2C', border: `1.5px solid ${color}` }}
                  >
                    LEARN MORE
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* In the meantime CTA */}
      <div className="py-12 px-4 text-center" style={{ backgroundColor: '#2C2C2C' }}>
        <p className="font-display text-3xl tracking-wide text-white mb-3">WANT DRINKS NOW?</p>
        <p className="font-body text-white/60 mb-6 text-sm">
          Visit us in Marshall or order pickup ahead of time.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/menu/marshall"
            className="inline-flex items-center justify-center gap-2 font-display tracking-widest text-base px-8 py-4 rounded-full text-white transition-transform hover:scale-105"
            style={{ backgroundColor: '#FF7B9D' }}
          >
            <ShoppingBag size={18} />
            SEE THE MENU
          </Link>
          <Link
            href="/order/marshall"
            className="inline-flex items-center justify-center font-display tracking-widest text-base px-8 py-4 rounded-full transition-transform hover:scale-105"
            style={{ backgroundColor: 'transparent', color: 'white', border: '1.5px solid rgba(255,255,255,0.3)' }}
          >
            ORDER PICKUP
          </Link>
        </div>
      </div>
    </div>
  )
}

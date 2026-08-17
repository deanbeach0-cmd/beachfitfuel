import Link from 'next/link'
import { Package, Truck, Bell, ChevronRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'To-Go Packs',
  description:
    'BeachFit Fuel to-go packs — enjoy your favorite drinks at home. Shipping nationwide soon.',
}

const PERKS = [
  { icon: '🏖️', title: 'SAME GREAT TASTE', body: 'All the beach bomb, protein shake, and energy drink flavors you love — packaged to make at home.' },
  { icon: '📦', title: 'SHIPS NATIONWIDE', body: 'No matter where you are in the US, we\'ll get BeachFit Fuel to your door.' },
  { icon: '💪', title: 'FUEL ON YOUR SCHEDULE', body: 'Stock up and fuel every morning, workout, or afternoon slump — on your terms.' },
]

export default function ToGoPacksPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8EE' }}>

      {/* Header */}
      <div className="py-12 px-4" style={{ backgroundColor: '#9BBDCF' }}>
        <div className="max-w-4xl mx-auto">
          <Link
            href="/shop"
            className="font-body text-white/70 text-sm hover:text-white transition-colors mb-4 inline-flex items-center gap-1"
          >
            ← Back to Shop
          </Link>
          <div className="flex items-center gap-4">
            <Package size={32} className="text-white" />
            <div>
              <span className="font-body font-800 text-sm tracking-[0.2em] uppercase text-white/70">
                Coming Soon
              </span>
              <h1 className="font-display text-5xl md:text-6xl tracking-wide text-white mt-1">
                TO-GO PACKS
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-4xl mx-auto px-4 py-16 flex flex-col gap-14">

        {/* Coming soon hero */}
        <div className="flex flex-col items-center text-center gap-6">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#9BBDCF22' }}
          >
            <Truck size={40} style={{ color: '#9BBDCF' }} />
          </div>
          <div className="max-w-xl">
            <h2 className="font-display text-3xl md:text-4xl tracking-wide text-dark">
              BEACHFIT FUEL DELIVERED TO YOU
            </h2>
            <p className="font-body text-dark/60 mt-3 leading-relaxed">
              We know not everyone can make it to Marshall or Battle Creek every day. That&apos;s
              why we&apos;re building to-go packs — everything you need to make your favorite
              BeachFit Fuel drinks at home, delivered right to your door.
            </p>
          </div>

          {/* Notify CTA */}
          <div
            className="w-full max-w-md rounded-2xl p-7 flex flex-col gap-4"
            style={{ border: '2px dashed #9BBDCF', backgroundColor: '#9BBDCF0D' }}
          >
            <Bell size={22} style={{ color: '#9BBDCF' }} className="mx-auto" />
            <p className="font-display text-xl tracking-wide text-dark">BE THE FIRST TO SHOP</p>
            <p className="font-body text-dark/60 text-sm">
              Sign up and we&apos;ll let you know the moment to-go packs are available.
            </p>
            <Link
              href="/#newsletter"
              className="block w-full text-center font-display tracking-widest text-base py-3 rounded-full text-white transition-transform hover:scale-[1.02]"
              style={{ backgroundColor: '#9BBDCF' }}
            >
              GET NOTIFIED
            </Link>
          </div>
        </div>

        {/* Perks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PERKS.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl p-6 flex flex-col gap-3"
              style={{ backgroundColor: 'white', border: '1.5px solid #9BBDCF33' }}
            >
              <span className="text-4xl">{p.icon}</span>
              <h3 className="font-display text-lg tracking-widest text-dark">{p.title}</h3>
              <p className="font-body text-dark/60 text-sm leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>

        {/* Visit in person CTA */}
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="font-body text-dark/50 text-sm">In the meantime, visit us in person</p>
          <Link
            href="/menu/marshall"
            className="inline-flex items-center gap-2 font-display tracking-widest text-sm px-8 py-4 rounded-full text-white transition-transform hover:scale-[1.02]"
            style={{ backgroundColor: '#FF7B9D' }}
          >
            VIEW MARSHALL MENU <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  )
}

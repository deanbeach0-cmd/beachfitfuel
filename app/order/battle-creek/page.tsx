import Link from 'next/link'
import { Zap, MapPin, Bell } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Order Pickup — Battle Creek',
  description:
    'BeachFit Fuel is coming to Battle Creek, MI. Sign up to be notified when we open.',
}

export default function BattleCreekOrderPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FFF8EE' }}>

      {/* Header */}
      <div
        className="py-12 px-4"
        style={{ background: 'linear-gradient(135deg, #FAB65F, #EC8A1E)' }}
      >
        <div className="max-w-5xl mx-auto">
          <Link
            href="/menu"
            className="font-body text-white/70 text-sm hover:text-white transition-colors mb-4 inline-block"
          >
            ← All Locations
          </Link>
          <div className="flex items-center gap-4">
            <Zap size={32} className="text-white" />
            <div>
              <span className="font-body font-800 text-sm tracking-[0.2em] uppercase text-white/70">
                Coming Soon
              </span>
              <h1 className="font-display text-5xl md:text-6xl tracking-wide text-white mt-1">
                BATTLE CREEK
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-lg w-full flex flex-col items-center gap-10 text-center">

          <div
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#FAB65F22' }}
          >
            <span className="text-5xl">⚡</span>
          </div>

          <div>
            <h2 className="font-display text-3xl md:text-4xl tracking-wide text-dark">
              ORDERING ISN&apos;T OPEN YET
            </h2>
            <p className="font-body text-dark/60 mt-3 text-base leading-relaxed">
              Our Battle Creek location is opening in the next 90–120 days. Once we&apos;re open,
              you&apos;ll be able to order pickup right here — beach bombs, protein shakes,
              energy drinks, and more.
            </p>
          </div>

          {/* Notify CTA */}
          <div
            className="w-full rounded-2xl p-7 flex flex-col gap-4"
            style={{ border: '2px dashed #FAB65F', backgroundColor: '#FAB65F0D' }}
          >
            <Bell size={24} style={{ color: '#EC8A1E' }} className="mx-auto" />
            <p className="font-display text-xl tracking-wide text-dark">
              BE THE FIRST TO ORDER
            </p>
            <p className="font-body text-dark/60 text-sm">
              Sign up for our newsletter and we&apos;ll send you a heads-up the moment
              Battle Creek is open for orders.
            </p>
            <Link
              href="/#newsletter"
              className="block w-full text-center font-display tracking-widest text-base py-3 rounded-full text-white transition-transform hover:scale-[1.02]"
              style={{ backgroundColor: '#EC8A1E' }}
            >
              GET NOTIFIED
            </Link>
          </div>

          {/* Marshall fallback */}
          <div className="flex flex-col items-center gap-3">
            <p className="font-body text-dark/40 text-sm">Want drinks now?</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/menu/marshall"
                className="font-display tracking-widest text-sm px-6 py-3 rounded-full text-white transition-transform hover:scale-[1.02]"
                style={{ backgroundColor: '#FF7B9D' }}
              >
                VIEW MARSHALL MENU
              </Link>
              <Link
                href="/order/marshall"
                className="font-display tracking-widest text-sm px-6 py-3 rounded-full transition-transform hover:scale-[1.02]"
                style={{ backgroundColor: 'white', color: '#2C2C2C', border: '1.5px solid #9BBDCF' }}
              >
                ORDER — MARSHALL
              </Link>
            </div>
            <div className="flex items-center gap-2 mt-2 text-dark/40">
              <MapPin size={14} />
              <span className="font-body text-sm">205 W Michigan Ave, Marshall, MI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

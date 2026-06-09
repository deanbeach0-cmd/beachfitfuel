import Link from 'next/link'
import { MapPin, Zap, PalmtreeIcon } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Menu',
  description: 'Browse the BeachFit Fuel menu. Beach bombs, protein shakes, blenders, and energy drinks.',
}

export default function MenuLanding() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8EE' }}>
      {/* Header */}
      <div
        className="py-16 px-4 text-center"
        style={{ backgroundColor: '#9BBDCF' }}
      >
        <span className="font-body font-800 text-sm tracking-[0.2em] uppercase text-white/70">
          What We Serve
        </span>
        <h1 className="font-display text-5xl md:text-6xl tracking-wide text-white mt-2">
          THE MENU
        </h1>
        <p className="font-body text-white/80 mt-3 text-base max-w-md mx-auto">
          Choose your location to see the full menu and order pickup.
        </p>
      </div>

      {/* Location cards */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Marshall */}
          <Link
            href="/menu/marshall"
            className="group rounded-2xl overflow-hidden shadow-md border border-sky/20 flex flex-col hover:shadow-xl transition-shadow"
          >
            <div className="px-6 py-5 flex items-center gap-3" style={{ backgroundColor: '#9BBDCF' }}>
              <PalmtreeIcon size={24} className="text-white flex-shrink-0" />
              <div>
                <p className="font-display text-2xl tracking-widest text-white leading-none">MARSHALL</p>
                <p className="font-body text-white/80 text-sm mt-0.5">209 W Michigan Ave</p>
              </div>
              <span className="ml-auto font-body text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: 'white', color: '#6FBDB8' }}>
                ● OPEN
              </span>
            </div>
            <div className="bg-white p-6 flex-1 flex flex-col gap-3">
              <p className="font-body text-dark/60 text-sm">
                Mon–Fri 6AM–4:30PM · Sat 9AM–3:30PM · Sun Closed
              </p>
              <div
                className="mt-auto w-full text-center font-display tracking-widest text-base py-3 rounded-full text-white transition-transform group-hover:scale-[1.02]"
                style={{ backgroundColor: '#FF7B9D' }}
              >
                VIEW MARSHALL MENU →
              </div>
            </div>
          </Link>

          {/* Battle Creek */}
          <div className="rounded-2xl overflow-hidden shadow-md border border-yellow/30 flex flex-col opacity-80">
            <div className="px-6 py-5 flex items-center gap-3" style={{ background: 'linear-gradient(135deg, #FAB65F, #EC8A1E)' }}>
              <Zap size={24} className="text-white flex-shrink-0" />
              <div>
                <p className="font-display text-2xl tracking-widest text-white leading-none">BATTLE CREEK</p>
                <p className="font-body text-white/80 text-sm mt-0.5">Coming in 90–120 days</p>
              </div>
              <span className="ml-auto font-body text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: 'white', color: '#EC8A1E' }}>
                COMING SOON
              </span>
            </div>
            <div className="bg-white p-6 flex-1 flex flex-col gap-3">
              <p className="font-body text-dark/40 text-sm">
                We&apos;re bringing the full BeachFit Fuel experience to Battle Creek soon.
              </p>
              <Link
                href="/#newsletter"
                className="mt-auto w-full text-center font-display tracking-widest text-base py-3 rounded-full text-white transition-transform hover:scale-[1.02] block"
                style={{ backgroundColor: '#EC8A1E' }}
              >
                GET NOTIFIED
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

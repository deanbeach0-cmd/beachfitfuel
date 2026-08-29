import Link from 'next/link'
import { PalmtreeIcon, Zap } from 'lucide-react'
import type { Metadata } from 'next'
import { LOCATIONS, getDisplayHoursRows } from '@/lib/locations'

export const metadata: Metadata = {
  title: 'Menu',
  description: 'Browse the BeachFit Fuel menu. Beach bombs, protein shakes, blenders, and energy drinks.',
}

const CARDS = [
  { location: LOCATIONS.marshall, color: '#9BBDCF', icon: PalmtreeIcon },
  { location: LOCATIONS['battle-creek'], color: '#FAB65F', icon: Zap },
] as const

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
          {CARDS.map(({ location, color, icon: Icon }) => {
            const weekdayHours = getDisplayHoursRows(location)[0]
            return (
              <Link
                key={location.slug}
                href={`/menu/${location.slug}`}
                className="group rounded-2xl overflow-hidden shadow-md border border-sky/20 flex flex-col hover:shadow-xl transition-shadow"
              >
                <div className="px-6 py-5 flex items-center gap-3" style={{ backgroundColor: color }}>
                  <Icon size={24} className="text-white flex-shrink-0" />
                  <div>
                    <p className="font-display text-2xl tracking-widest text-white leading-none">{location.name.toUpperCase()}</p>
                    <p className="font-body text-white/80 text-sm mt-0.5">{location.address}</p>
                  </div>
                  <span className="ml-auto font-body text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: 'white', color: '#6FBDB8' }}>
                    ● OPEN
                  </span>
                </div>
                <div className="bg-white p-6 flex-1 flex flex-col gap-3">
                  <p className="font-body text-dark/60 text-sm">
                    {weekdayHours.day} {weekdayHours.hours}
                  </p>
                  <div
                    className="mt-auto w-full text-center font-display tracking-widest text-base py-3 rounded-full text-white transition-transform group-hover:scale-[1.02]"
                    style={{ backgroundColor: '#FF7B9D' }}
                  >
                    VIEW {location.name.toUpperCase()} MENU →
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

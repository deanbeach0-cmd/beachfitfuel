import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Phone, Clock, Navigation, Zap, PalmtreeIcon } from 'lucide-react'
import type { Metadata } from 'next'
import { LOCATIONS, LocationConfig, formatClockTime } from '@/lib/locations'

export const metadata: Metadata = {
  title: 'Locations',
  description: 'Find a BeachFit Fuel near you. Marshall and Battle Creek are both open now.',
}

const FULL_DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function getTodayIndex() {
  // Convert JS day (0=Sun) to our array index (0=Mon, ..., 6=Sun)
  const js = new Date().getDay()
  return js === 0 ? 6 : js - 1
}

function fullWeekHours(location: LocationConfig) {
  const order = [1, 2, 3, 4, 5, 6, 0] // Mon..Sun
  return order.map((dayIndex) => {
    const hours = location.hours[dayIndex]
    return {
      day: FULL_DAY_LABELS[dayIndex],
      hours: hours ? `${formatClockTime(hours.openMinutes)} – ${formatClockTime(hours.closeMinutes)}` : 'Closed',
    }
  })
}

const CARDS = [
  { location: LOCATIONS.marshall, color: '#9BBDCF', icon: PalmtreeIcon, storefrontPhoto: '/images/Marshall_storefront.jpg' },
  { location: LOCATIONS['battle-creek'], color: '#FAB65F', icon: Zap, storefrontPhoto: null },
] as const

export default function LocationsPage() {
  const todayIdx = getTodayIndex()

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8EE' }}>

      {/* Header */}
      <div
        className="py-16 px-4 text-center"
        style={{ background: 'linear-gradient(135deg, #9BBDCF, #6FBDB8)' }}
      >
        <span className="font-body font-800 text-sm tracking-[0.2em] uppercase text-white/70">
          Find Us
        </span>
        <h1 className="font-display text-5xl md:text-6xl tracking-wide text-white mt-2">
          OUR LOCATIONS
        </h1>
        <p className="font-body text-white/80 mt-3 text-base max-w-md mx-auto">
          Two locations in Michigan — both open now.
        </p>
      </div>

      {/* Location cards */}
      <div className="max-w-5xl mx-auto px-4 py-16 flex flex-col gap-12">
        {CARDS.map(({ location, color, icon: Icon, storefrontPhoto }) => {
          const mapsQuery = encodeURIComponent(`${location.address} ${location.city} ${location.state} ${location.zip}`)
          return (
            <div key={location.slug} className="rounded-3xl overflow-hidden shadow-lg" style={{ border: `1.5px solid ${color}33` }}>

              {/* Card header */}
              <div className="px-8 py-6 flex items-center justify-between" style={{ backgroundColor: color }}>
                <div className="flex items-center gap-4">
                  <Icon size={28} className="text-white flex-shrink-0" />
                  <div>
                    <span className="font-body text-xs tracking-[0.2em] uppercase text-white/70">Open Now</span>
                    <h2 className="font-display text-4xl tracking-widest text-white mt-1">{location.name.toUpperCase()}</h2>
                  </div>
                </div>
                <span
                  className="font-body text-xs font-bold px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: 'white', color: '#6FBDB8' }}
                >
                  ● OPEN
                </span>
              </div>

              {/* Storefront photo */}
              {storefrontPhoto && (
                <div className="relative w-full aspect-[21/9]">
                  <Image
                    src={storefrontPhoto}
                    alt={`BeachFit Fuel storefront in ${location.name}, MI`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 896px"
                  />
                </div>
              )}

              {/* Card body */}
              <div className="bg-white p-8 grid grid-cols-1 md:grid-cols-2 gap-10">

                {/* Left — address + actions */}
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <MapPin size={18} className="mt-0.5 flex-shrink-0" style={{ color }} />
                      <div>
                        <p className="font-body font-700 text-dark">{location.address}</p>
                        <p className="font-body text-dark/60">{location.city}, {location.state} {location.zip}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone size={18} className="flex-shrink-0" style={{ color }} />
                      <a href={location.phoneHref} className="font-body font-700 text-dark hover:underline">
                        {location.phoneDisplay}
                      </a>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <a
                      href={`https://maps.google.com/?q=${mapsQuery}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 font-display tracking-widest text-sm py-3 px-6 rounded-full text-white transition-transform hover:scale-[1.02]"
                      style={{ backgroundColor: color }}
                    >
                      <Navigation size={16} />
                      GET DIRECTIONS
                    </a>
                    <Link
                      href={`/menu/${location.slug}`}
                      className="flex items-center justify-center gap-2 font-display tracking-widest text-sm py-3 px-6 rounded-full transition-transform hover:scale-[1.02]"
                      style={{ backgroundColor: '#FFF8EE', color: '#2C2C2C', border: `1.5px solid ${color}` }}
                    >
                      VIEW MENU
                    </Link>
                    <Link
                      href={`/order/${location.slug}`}
                      className="flex items-center justify-center gap-2 font-display tracking-widest text-sm py-3 px-6 rounded-full text-white transition-transform hover:scale-[1.02]"
                      style={{ backgroundColor: '#FF7B9D' }}
                    >
                      ORDER PICKUP
                    </Link>
                  </div>
                </div>

                {/* Right — hours */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Clock size={16} style={{ color }} />
                    <h3 className="font-display text-lg tracking-widest text-dark">HOURS</h3>
                  </div>
                  <div className="flex flex-col divide-y divide-dark/5">
                    {fullWeekHours(location).map((row, i) => (
                      <div
                        key={row.day}
                        className={`flex justify-between py-2.5 ${i === todayIdx ? 'font-bold' : ''}`}
                      >
                        <span
                          className="font-body text-sm"
                          style={{ color: i === todayIdx ? '#FF7B9D' : '#2C2C2C' }}
                        >
                          {i === todayIdx ? `${row.day} (today)` : row.day}
                        </span>
                        <span
                          className="font-body text-sm"
                          style={{ color: row.hours === 'Closed' ? '#2C2C2C66' : i === todayIdx ? '#FF7B9D' : '#2C2C2C' }}
                        >
                          {row.hours}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom CTA */}
      <div className="py-12 px-4 text-center" style={{ backgroundColor: '#2C2C2C' }}>
        <p className="font-display text-3xl tracking-wide text-white mb-2">QUESTIONS?</p>
        <p className="font-body text-white/60 mb-6 text-sm">
          Call or text either location anytime during business hours.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {CARDS.map(({ location }) => (
            <a
              key={location.slug}
              href={location.phoneHref}
              className="inline-flex items-center gap-2 font-display tracking-widest text-base px-10 py-4 rounded-full text-white transition-transform hover:scale-105"
              style={{ backgroundColor: '#FF7B9D' }}
            >
              <Phone size={18} />
              {location.name}: {location.phoneDisplay}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

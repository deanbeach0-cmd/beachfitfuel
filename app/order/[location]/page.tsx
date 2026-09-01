import { notFound } from 'next/navigation'
import { MapPin, Phone, Clock } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { PickupOrderForm } from '@/components/order/PickupOrderForm'
import { getLocation, isLocationSlug, LOCATIONS, getDisplayHoursRows } from '@/lib/locations'
import { getLocationHours } from '@/lib/location-hours'

interface Props {
  params: { location: string }
}

export function generateStaticParams() {
  return Object.keys(LOCATIONS).map((location) => ({ location }))
}

export function generateMetadata({ params }: Props): Metadata {
  const location = getLocation(params.location)
  if (!location) return { title: 'Order Pickup' }
  return {
    title: `Order Pickup — ${location.name}`,
    description: `Order ahead for pickup at BeachFit Fuel ${location.name}. Beach bombs, protein shakes, energy drinks, and more.`,
  }
}

export default async function LocationOrderPage({ params }: Props) {
  if (!isLocationSlug(params.location)) notFound()
  const location = LOCATIONS[params.location]
  const hours = await getLocationHours(location.slug)
  const hoursRows = getDisplayHoursRows(hours)
  const mapsQuery = encodeURIComponent(`${location.address} ${location.city} ${location.state} ${location.zip}`)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8EE' }}>

      {/* Header */}
      <div className="py-12 px-4" style={{ backgroundColor: '#FF7B9D' }}>
        <div className="max-w-5xl mx-auto">
          <Link
            href={`/menu/${location.slug}`}
            className="font-body text-white/70 text-sm hover:text-white transition-colors mb-4 inline-block"
          >
            ← Back to Menu
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="font-body font-800 text-sm tracking-[0.2em] uppercase text-white/70">
                Pickup Order
              </span>
              <h1 className="font-display text-5xl md:text-6xl tracking-wide text-white mt-1">
                {location.name.toUpperCase()}
              </h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                <MapPin size={14} className="text-white/80" />
                <span className="font-body text-white/90 text-sm">{location.address}</span>
              </div>
              <a
                href={location.phoneHref}
                className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 hover:bg-white/30 transition-colors"
              >
                <Phone size={14} className="text-white/80" />
                <span className="font-body text-white/90 text-sm">{location.phoneDisplay}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* ── Order form ─────────────────────────── */}
        <div className="lg:col-span-2">
          <PickupOrderForm locationSlug={location.slug} />
        </div>

        {/* ── Sidebar ────────────────────────────── */}
        <div className="flex flex-col gap-6">

          {/* Hours */}
          <div
            className="rounded-2xl p-6 flex flex-col gap-4"
            style={{ backgroundColor: 'white', border: '1.5px solid #9BBDCF33' }}
          >
            <div className="flex items-center gap-2">
              <Clock size={16} style={{ color: '#9BBDCF' }} />
              <h3 className="font-display text-lg tracking-widest text-dark">HOURS</h3>
            </div>
            <div className="flex flex-col divide-y divide-dark/5">
              {hoursRows.map((row) => (
                <div key={row.day} className="flex justify-between py-2.5">
                  <span className="font-body text-sm text-dark">{row.day}</span>
                  <span
                    className="font-body text-sm"
                    style={{ color: row.hours === 'Closed' ? '#2C2C2C66' : '#2C2C2C' }}
                  >
                    {row.hours}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Location */}
          <div
            className="rounded-2xl p-6 flex flex-col gap-4"
            style={{ backgroundColor: 'white', border: '1.5px solid #9BBDCF33' }}
          >
            <div className="flex items-center gap-2">
              <MapPin size={16} style={{ color: '#9BBDCF' }} />
              <h3 className="font-display text-lg tracking-widests text-dark">LOCATION</h3>
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-body font-700 text-dark text-sm">{location.address}</p>
              <p className="font-body text-dark/60 text-sm">{location.city}, {location.state} {location.zip}</p>
            </div>
            <a
              href={`https://maps.google.com/?q=${mapsQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center font-display tracking-widest text-sm py-3 rounded-full text-white transition-transform hover:scale-[1.02] block"
              style={{ backgroundColor: '#9BBDCF' }}
            >
              GET DIRECTIONS
            </a>
          </div>

          {/* Phone */}
          <div
            className="rounded-2xl p-6 flex flex-col gap-4"
            style={{ backgroundColor: '#FF7B9D18', border: '1.5px solid #FF7B9D44' }}
          >
            <div className="flex items-center gap-2">
              <Phone size={16} style={{ color: '#FF7B9D' }} />
              <h3 className="font-display text-lg tracking-widests text-dark">QUESTIONS?</h3>
            </div>
            <p className="font-body text-dark/60 text-sm">
              Call us and we&apos;ll get it sorted.
            </p>
            <a
              href={location.phoneHref}
              className="w-full text-center font-display tracking-widest text-sm py-3 rounded-full text-white transition-transform hover:scale-[1.02] block"
              style={{ backgroundColor: '#FF7B9D' }}
            >
              {location.phoneDisplay}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

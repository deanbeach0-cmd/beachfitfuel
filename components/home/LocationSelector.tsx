import Link from 'next/link'
import { MapPin, Phone, Clock, Zap, PalmtreeIcon } from 'lucide-react'
import { LOCATIONS, getDisplayHoursRows } from '@/lib/locations'
import { getLocationHours } from '@/lib/location-hours'

const CARDS = [
  { location: LOCATIONS.marshall, icon: PalmtreeIcon, color: '#9BBDCF' },
  { location: LOCATIONS['battle-creek'], icon: Zap, color: '#FAB65F' },
] as const

export async function LocationSelector() {
  const hoursByCard = await Promise.all(CARDS.map((c) => getLocationHours(c.location.slug)))

  return (
    <section className="bg-white py-16 md:py-24 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Section heading */}
        <div className="text-center mb-12">
          <span className="font-body font-800 text-sm tracking-[0.2em] uppercase" style={{ color: '#6FBDB8' }}>
            Find Us
          </span>
          <h2 className="font-display text-4xl md:text-5xl tracking-wide text-dark mt-2">
            TWO LOCATIONS. ONE VIBE.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {CARDS.map(({ location, icon: Icon, color }, i) => (
            <div key={location.slug} className="rounded-2xl overflow-hidden shadow-md border border-sky/20 flex flex-col">
              {/* Header */}
              <div className="px-6 py-5 flex items-center gap-3" style={{ backgroundColor: color }}>
                <Icon size={24} className="text-white flex-shrink-0" />
                <div>
                  <p className="font-display text-2xl tracking-widest text-white leading-none">{location.name.toUpperCase()}</p>
                  <p className="font-body text-white/80 text-sm mt-0.5">Open Now</p>
                </div>
                <span
                  className="ml-auto font-body text-xs font-bold px-3 py-1 rounded-full"
                  style={{ backgroundColor: 'white', color: '#6FBDB8' }}
                >
                  ● OPEN
                </span>
              </div>

              {/* Body with dotted inner frame */}
              <div className="p-5 flex-1 bg-white">
                <div className="rounded-xl p-5 flex flex-col gap-4" style={{ border: `2px dotted ${color}` }}>
                  {/* Address */}
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="flex-shrink-0 mt-0.5" style={{ color: '#6FBDB8' }} />
                    <div>
                      <p className="font-body font-700 text-dark">{location.address}</p>
                      <p className="font-body text-dark/60 text-sm">{location.city}, {location.state} {location.zip}</p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-3">
                    <Phone size={18} className="flex-shrink-0" style={{ color: '#6FBDB8' }} />
                    <a href={location.phoneHref} className="font-body text-dark hover:text-teal transition-colors">
                      {location.phoneDisplay}
                    </a>
                  </div>

                  {/* Hours */}
                  <div className="flex items-start gap-3">
                    <Clock size={18} className="flex-shrink-0 mt-0.5" style={{ color: '#6FBDB8' }} />
                    <div className="flex flex-col gap-1">
                      {getDisplayHoursRows(hoursByCard[i]).map((row) => (
                        <div key={row.day} className="flex gap-2 text-sm font-body">
                          <span className="text-dark/60 w-24">{row.day}</span>
                          <span className="text-dark font-600">{row.hours}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="p-5 pt-0 bg-white">
                <Link
                  href={`/order/${location.slug}`}
                  className="block w-full text-center font-display tracking-widest text-base py-3 rounded-full text-white transition-transform hover:scale-[1.02]"
                  style={{ backgroundColor: '#FF7B9D' }}
                >
                  ORDER PICKUP — {location.name.toUpperCase()}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

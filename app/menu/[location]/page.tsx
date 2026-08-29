import { notFound } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase'
import { MenuGrid } from '@/components/menu/MenuGrid'
import { PickupCartBar } from '@/components/menu/PickupCartBar'
import { WaveDivider } from '@/components/shared/WaveDivider'
import { MenuItem } from '@/types/menu'
import { getLocation, isLocationSlug, LOCATIONS, getDisplayHoursRows } from '@/lib/locations'
import { MapPin, Phone, Clock } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

interface Props {
  params: { location: string }
}

export function generateStaticParams() {
  return Object.keys(LOCATIONS).map((location) => ({ location }))
}

export function generateMetadata({ params }: Props): Metadata {
  const location = getLocation(params.location)
  if (!location) return { title: 'Menu' }
  return {
    title: `${location.name} Menu`,
    description: `Full menu for BeachFit Fuel ${location.name}. Beach bombs, protein shakes, blenders, energy drinks, and food.`,
  }
}

export const revalidate = 60 // Revalidate every 60 seconds

export default async function LocationMenuPage({ params }: Props) {
  if (!isLocationSlug(params.location)) notFound()
  const location = LOCATIONS[params.location]

  const supabase = await createServerComponentClient()

  const { data: dbLocation } = await supabase
    .from('locations')
    .select('id')
    .eq('slug', location.slug)
    .single()

  // visible_menu_items already filters to available items whose Square
  // category has been mapped + made visible in /admin/categories
  const { data: items } = await supabase
    .from('visible_menu_items')
    .select('*')
    .eq('location_id', dbLocation?.id ?? '')
    .order('display_order', { ascending: true })

  const menuItems: MenuItem[] = (items ?? []) as MenuItem[]
  const weekdayHours = getDisplayHoursRows(location)[0]

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8EE' }}>

      {/* Header */}
      <div className="py-12 px-4" style={{ backgroundColor: '#9BBDCF' }}>
        <div className="max-w-5xl mx-auto">
          <Link
            href="/menu"
            className="font-body text-white/70 text-sm hover:text-white transition-colors mb-4 inline-block"
          >
            ← All Locations
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="font-body font-800 text-sm tracking-[0.2em] uppercase text-white/70">
                Full Menu
              </span>
              <h1 className="font-display text-5xl md:text-6xl tracking-wide text-white mt-1">
                {location.name.toUpperCase()}
              </h1>
            </div>

            {/* Location info pills */}
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
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                <Clock size={14} className="text-white/80" />
                <span className="font-body text-white/90 text-sm">{weekdayHours.day} {weekdayHours.hours}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <WaveDivider fromColor="#9BBDCF" toColor="#FFF8EE" />

      {/* Menu grid — pb-32 leaves room for the sticky cart bar */}
      <div className="max-w-6xl mx-auto px-4 pb-32">
        <MenuGrid items={menuItems} locationName={location.name} locationSlug={location.slug} showOrderButton />
      </div>

      <PickupCartBar locationSlug={location.slug} />

      {/* Order CTA */}
      <div className="py-12 px-4 text-center" style={{ backgroundColor: '#2C2C2C' }}>
        <h2 className="font-display text-3xl md:text-4xl tracking-wide text-white mb-4">
          READY TO ORDER?
        </h2>
        <p className="font-body text-white/60 mb-6">
          Order ahead for pickup at our {location.name} location.
        </p>
        <Link
          href={`/order/${location.slug}`}
          className="inline-block font-display tracking-widest text-base px-10 py-4 rounded-full text-white transition-transform hover:scale-105"
          style={{ backgroundColor: '#FF7B9D' }}
        >
          ORDER PICKUP — {location.name.toUpperCase()}
        </Link>
      </div>

    </div>
  )
}

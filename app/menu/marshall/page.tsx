import { createServerComponentClient } from '@/lib/supabase'
import { MenuGrid } from '@/components/menu/MenuGrid'
import { WaveDivider } from '@/components/shared/WaveDivider'
import { MenuItem } from '@/types/menu'
import { MapPin, Phone, Clock } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Marshall Menu',
  description: 'Full menu for BeachFit Fuel Marshall. Beach bombs, protein shakes, blenders, energy drinks, and food.',
}

export const revalidate = 60 // Revalidate every 60 seconds

export default async function MarshallMenuPage() {
  const supabase = await createServerComponentClient()

  // Fetch location
  const { data: location } = await supabase
    .from('locations')
    .select('id, name, address, city, phone, hours, is_open')
    .eq('slug', 'marshall')
    .single()

  // Fetch menu items
  const { data: items } = await supabase
    .from('menu_items')
    .select('*')
    .eq('location_id', location?.id ?? '')
    .eq('is_available', true)
    .order('display_order', { ascending: true })

  const menuItems: MenuItem[] = (items ?? []) as MenuItem[]

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
                MARSHALL
              </h1>
            </div>

            {/* Location info pills */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                <MapPin size={14} className="text-white/80" />
                <span className="font-body text-white/90 text-sm">209 W Michigan Ave</span>
              </div>
              <a
                href="tel:+12692343645"
                className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 hover:bg-white/30 transition-colors"
              >
                <Phone size={14} className="text-white/80" />
                <span className="font-body text-white/90 text-sm">(269) 234-3645</span>
              </a>
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                <Clock size={14} className="text-white/80" />
                <span className="font-body text-white/90 text-sm">Mon–Fri 6AM–4:30PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <WaveDivider fromColor="#9BBDCF" toColor="#FFF8EE" />

      {/* Menu grid */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        <MenuGrid items={menuItems} locationName="Marshall" />
      </div>

      {/* Order CTA */}
      <div className="py-12 px-4 text-center" style={{ backgroundColor: '#2C2C2C' }}>
        <h2 className="font-display text-3xl md:text-4xl tracking-wide text-white mb-4">
          READY TO ORDER?
        </h2>
        <p className="font-body text-white/60 mb-6">
          Order ahead for pickup at our Marshall location.
        </p>
        <Link
          href="/order/marshall"
          className="inline-block font-display tracking-widest text-base px-10 py-4 rounded-full text-white transition-transform hover:scale-105"
          style={{ backgroundColor: '#FF7B9D' }}
        >
          ORDER PICKUP — MARSHALL
        </Link>
      </div>

    </div>
  )
}

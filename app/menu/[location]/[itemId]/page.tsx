import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase'
import { MenuItemDetail } from '@/components/menu/MenuItemDetail'
import { FlavorOption, MenuItem } from '@/types/menu'
import { getLocation, isLocationSlug, LOCATIONS } from '@/lib/locations'

interface Props {
  params: { location: string; itemId: string }
}

// No generateStaticParams here — item IDs are numerous and change with the
// menu, so these render dynamically per-request rather than being
// pre-rendered at build time (unlike the [location] listing page above it).

async function getItem(locationSlug: string, itemId: string): Promise<MenuItem | null> {
  const supabase = await createServerComponentClient()

  const { data: location } = await supabase
    .from('locations')
    .select('id')
    .eq('slug', locationSlug)
    .single()

  const { data: item } = await supabase
    .from('visible_menu_items')
    .select('*')
    .eq('id', itemId)
    .eq('location_id', location?.id ?? '')
    .single()

  return (item as MenuItem) ?? null
}

async function getFlavorOptions(item: MenuItem): Promise<FlavorOption[]> {
  if (!item.required_flavor_count) return []
  const supabase = await createServerComponentClient()

  const { data } = await supabase
    .from('menu_item_flavor_options')
    .select('option_id, name, price_cents')
    .eq('menu_item_id', item.id)
    .order('display_order', { ascending: true })

  return (data ?? []).map((o) => ({ id: o.option_id, name: o.name, priceCents: o.price_cents }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const location = getLocation(params.location)
  if (!location) return { title: 'Menu Item' }
  const item = await getItem(location.slug, params.itemId)
  if (!item) return { title: 'Menu Item' }
  return {
    title: item.name,
    description: item.description ?? `${item.name} — BeachFit Fuel ${location.name}`,
  }
}

export default async function MenuItemPage({ params }: Props) {
  if (!isLocationSlug(params.location)) notFound()
  const location = LOCATIONS[params.location]

  const item = await getItem(location.slug, params.itemId)
  if (!item) notFound()

  const flavorOptions = await getFlavorOptions(item)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8EE' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href={`/menu/${location.slug}`}
          className="font-body text-dark/50 text-sm hover:text-teal transition-colors mb-8 inline-block"
        >
          ← Back to Menu
        </Link>
        <MenuItemDetail item={item} locationSlug={location.slug} flavorOptions={flavorOptions} />
      </div>
    </div>
  )
}

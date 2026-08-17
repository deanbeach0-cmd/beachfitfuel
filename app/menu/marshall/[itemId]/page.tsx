import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase'
import { MenuItemDetail } from '@/components/menu/MenuItemDetail'
import { FlavorOption, MenuItem } from '@/types/menu'

interface Props {
  params: { itemId: string }
}

async function getItem(itemId: string): Promise<MenuItem | null> {
  const supabase = await createServerComponentClient()

  const { data: location } = await supabase
    .from('locations')
    .select('id')
    .eq('slug', 'marshall')
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
  const item = await getItem(params.itemId)
  if (!item) return { title: 'Menu Item' }
  return {
    title: item.name,
    description: item.description ?? `${item.name} — BeachFit Fuel Marshall`,
  }
}

export default async function MenuItemPage({ params }: Props) {
  const item = await getItem(params.itemId)
  if (!item) notFound()

  const flavorOptions = await getFlavorOptions(item)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8EE' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/menu/marshall"
          className="font-body text-dark/50 text-sm hover:text-teal transition-colors mb-8 inline-block"
        >
          ← Back to Menu
        </Link>
        <MenuItemDetail item={item} flavorOptions={flavorOptions} />
      </div>
    </div>
  )
}

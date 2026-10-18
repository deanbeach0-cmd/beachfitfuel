import Image from 'next/image'
import Link from 'next/link'
import { Package, Truck } from 'lucide-react'
import type { Metadata } from 'next'
import { createServerComponentClient } from '@/lib/supabase'
import { getCategoryStyle } from '@/lib/category-style'
import {
  isShippableItem,
  SHIPPING_FLAT_FEE_CENTS,
  SHIPPING_LOCATION_SLUG,
  TO_GO_PACK_CATEGORY_ID,
} from '@/lib/shipping'
import type { MenuItem } from '@/types/menu'

export const metadata: Metadata = {
  title: 'To-Go Packs',
  description:
    'Beach Bomb to-go packs shipped anywhere in the US. Pick your flavors — single packs, 5-packs, and 10-packs.',
}

const SHIPPING_FEE = `$${(SHIPPING_FLAT_FEE_CENTS / 100).toFixed(2)}`

// Everything on this page ships, so it is priced and fulfilled out of the one
// shipping location rather than whichever store the visitor last browsed.
async function getShippableProducts(): Promise<MenuItem[]> {
  const supabase = await createServerComponentClient()

  const { data: location } = await supabase
    .from('locations')
    .select('id')
    .eq('slug', SHIPPING_LOCATION_SLUG)
    .single()

  const { data } = await supabase
    .from('visible_menu_items')
    .select('*')
    .eq('location_id', location?.id ?? '')
    .eq('square_category_id', TO_GO_PACK_CATEGORY_ID)

  // The Square category also holds ready-made drinks that are pickup-only, so
  // the allowlist — not the category — decides what we are willing to mail.
  return ((data ?? []) as MenuItem[])
    .filter((item) => isShippableItem(item.square_item_id))
    .sort((a, b) => Number(a.price) - Number(b.price))
}

export default async function ToGoPacksPage() {
  const products = await getShippableProducts()

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8EE' }}>

      {/* Header */}
      <div className="py-12 px-4" style={{ backgroundColor: '#9BBDCF' }}>
        <div className="max-w-4xl mx-auto">
          <Link
            href="/shop"
            className="font-body text-white/70 text-sm hover:text-white transition-colors mb-4 inline-flex items-center gap-1"
          >
            ← Back to Shop
          </Link>
          <div className="flex items-center gap-4">
            <Package size={32} className="text-white flex-shrink-0" />
            <div>
              <span className="font-body font-800 text-sm tracking-[0.2em] uppercase text-white/70">
                Shipped Nationwide
              </span>
              <h1 className="font-display text-5xl md:text-6xl tracking-wide text-white mt-1">
                TO-GO PACKS
              </h1>
            </div>
          </div>
          <p className="font-body text-white/85 mt-4 text-base max-w-xl">
            Pick your flavors and we&apos;ll put them in the mail. Flat {SHIPPING_FEE} shipping via
            USPS on every order, anywhere in the US.
          </p>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        {products.length === 0 ? (
          <div
            className="rounded-2xl p-10 text-center"
            style={{ border: '2px dashed #9BBDCF', backgroundColor: '#9BBDCF0D' }}
          >
            <Truck size={32} style={{ color: '#9BBDCF' }} className="mx-auto mb-4" />
            <p className="font-display text-xl tracking-wide text-dark">TO-GO PACKS ARE RESTOCKING</p>
            <p className="font-body text-dark/60 text-sm mt-2">
              They&apos;ll be back shortly — check again soon, or grab one in store.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((item) => {
              const style = getCategoryStyle(
                item.square_category_id ?? item.id,
                item.category_emoji,
                item.category_color
              )
              return (
                <Link
                  key={item.id}
                  href={`/shop/to-go-packs/${item.id}`}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-sky/20 flex flex-col hover:shadow-md transition-shadow"
                >
                  <div
                    className="relative h-44 flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: style.color + '33' }}
                  >
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <span className="text-5xl" role="img" aria-label="To-go pack">
                        {style.emoji}
                      </span>
                    )}
                    <span
                      className="absolute top-3 left-3 font-display tracking-widest text-xs px-3 py-1 rounded-full text-white shadow-sm"
                      style={{ backgroundColor: '#9BBDCF' }}
                    >
                      SHIPS NATIONWIDE
                    </span>
                  </div>

                  <div className="p-5 flex flex-col gap-2 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="font-display text-lg tracking-widest text-dark leading-tight">
                        {item.name}
                      </h2>
                      <span
                        className="font-display text-lg flex-shrink-0"
                        style={{ color: '#EC8A1E' }}
                      >
                        ${Number(item.price).toFixed(2)}
                      </span>
                    </div>
                    {item.description && (
                      <p className="font-body text-dark/60 text-sm leading-relaxed">
                        {item.description}
                      </p>
                    )}
                    <div
                      className="mt-auto pt-4 text-center font-display tracking-widest text-sm py-3 rounded-full"
                      style={{ backgroundColor: '#FFF8EE', color: '#2C2C2C' }}
                    >
                      CHOOSE FLAVORS →
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Local pickup nudge */}
      <div className="py-12 px-4 text-center" style={{ backgroundColor: '#2C2C2C' }}>
        <p className="font-display text-3xl tracking-wide text-white mb-2">NEARBY?</p>
        <p className="font-body text-white/60 mb-6 text-sm max-w-md mx-auto">
          Skip the {SHIPPING_FEE} shipping — order a to-go pack from the menu and pick it up in store.
        </p>
        <Link
          href="/menu/marshall"
          className="inline-flex items-center justify-center font-display tracking-widest text-base px-8 py-4 rounded-full text-white transition-transform hover:scale-105"
          style={{ backgroundColor: '#FF7B9D' }}
        >
          SEE THE MENU
        </Link>
      </div>

    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ShoppingBag, Truck } from 'lucide-react'
import { usePickupCartStore } from '@/lib/pickup-cart-store'
import { getCategoryStyle } from '@/lib/category-style'
import { SHIPPING_FLAT_FEE_CENTS, SHIPPING_LOCATION_SLUG } from '@/lib/shipping'
import { PhotoCarousel } from '@/components/menu/PhotoCarousel'
import { FlavorPicker } from '@/components/menu/FlavorPicker'
import { LocationSwitchNotice } from '@/components/menu/LocationSwitchNotice'
import type { FlavorOption, MenuItem } from '@/types/menu'
import type { FlavorSelection } from '@/types/pickup'

interface Props {
  item: MenuItem
  flavorOptions?: FlavorOption[]
}

const SHIPPING_FEE = `$${(SHIPPING_FLAT_FEE_CENTS / 100).toFixed(2)}`

export function ToGoPackDetail({ item, flavorOptions }: Props) {
  const addItem = usePickupCartStore((s) => s.addItem)
  const router = useRouter()
  const style = getCategoryStyle(item.square_category_id ?? item.id, item.category_emoji, item.category_color)
  const price = `$${Number(item.price).toFixed(2)}`
  const requiredFlavorCount = item.required_flavor_count ?? 0

  const photos = [item.image_url, ...(item.image_urls ?? [])].filter(
    (url, index, all): url is string => !!url && all.indexOf(url) === index
  )

  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [flavorSelections, setFlavorSelections] = useState<FlavorSelection[]>([])
  const [flavorTotal, setFlavorTotal] = useState(0)

  const needsFlavors = requiredFlavorCount > 0
  const flavorsReady = !needsFlavors || flavorTotal === requiredFlavorCount

  function handleAddToCart() {
    if (!flavorsReady) return
    addItem({
      menuItemId: item.id,
      name: item.name,
      priceCents: Math.round(Number(item.price) * 100),
      quantity,
      emoji: style.emoji,
      category: item.category_name ?? 'To-Go Packs',
      flavors: needsFlavors ? flavorSelections : undefined,
      shippable: true,
      // Bought from the Shop, so checkout offers shipping only.
      shipOnly: true,
      locationSlug: SHIPPING_LOCATION_SLUG,
      squareVariationId: item.square_variation_id,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div>
        <PhotoCarousel
          photos={photos}
          alt={item.name}
          backgroundColor={style.color + '33'}
          fallback={
            <span className="text-8xl" role="img" aria-label="To-go pack">
              {style.emoji}
            </span>
          }
        />
      </div>

      <div className="flex flex-col gap-6">
        <LocationSwitchNotice />

        <div>
          <span
            className="inline-flex items-center gap-1.5 font-display tracking-widest text-xs px-3 py-1 rounded-full text-white shadow-sm mb-3"
            style={{ backgroundColor: '#9BBDCF' }}
          >
            <Truck className="w-3 h-3" />
            SHIPS NATIONWIDE
          </span>
          <h1 className="font-display text-3xl md:text-4xl text-dark tracking-wide mb-2">
            {item.name}
          </h1>
          <p className="font-display text-2xl" style={{ color: '#EC8A1E' }}>
            {price}
          </p>
        </div>

        {item.description && (
          <p className="font-body text-dark/70 leading-relaxed">{item.description}</p>
        )}

        <div
          className="rounded-2xl p-5 flex items-start gap-3"
          style={{ backgroundColor: '#9BBDCF0D', border: '1.5px solid #9BBDCF44' }}
        >
          <Truck size={18} style={{ color: '#9BBDCF' }} className="flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <p className="font-body font-bold text-dark text-sm">
              Flat {SHIPPING_FEE} shipping via USPS
            </p>
            <p className="font-body text-dark/60 text-sm leading-relaxed">
              One flat fee per order, anywhere in the US. Please allow a few business days. Nearby?
              Order from the menu instead and pick it up in store for free.
            </p>
          </div>
        </div>

        {needsFlavors && flavorOptions && flavorOptions.length > 0 && (
          <FlavorPicker
            options={flavorOptions}
            requiredCount={requiredFlavorCount}
            onChange={(selections, total) => {
              setFlavorSelections(selections)
              setFlavorTotal(total)
            }}
          />
        )}

        <div>
          <label className="font-body font-bold text-dark text-sm uppercase tracking-widest mb-2 block">
            {needsFlavors ? 'How Many Packs' : 'Quantity'}
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              className="w-9 h-9 rounded-full border-2 border-gray-200 font-bold text-dark hover:border-gray-400 transition-colors"
            >
              −
            </button>
            <span className="font-body font-bold text-dark w-6 text-center">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              aria-label="Increase quantity"
              className="w-9 h-9 rounded-full border-2 border-gray-200 font-bold text-dark hover:border-gray-400 transition-colors"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!flavorsReady}
            className="flex items-center justify-center gap-3 w-full py-4 rounded-full font-display tracking-widest text-white text-lg transition-all disabled:opacity-50"
            style={{ backgroundColor: added ? '#6FBDB8' : '#FF7B9D' }}
          >
            {added ? (
              <><Check className="w-5 h-5" /> ADDED TO CART</>
            ) : !flavorsReady ? (
              `PICK ${requiredFlavorCount - flavorTotal} MORE FLAVOR${requiredFlavorCount - flavorTotal !== 1 ? 'S' : ''}`
            ) : (
              <><ShoppingBag className="w-5 h-5" /> ADD TO CART</>
            )}
          </button>

          {added && (
            <button
              type="button"
              onClick={() => router.push(`/order/${SHIPPING_LOCATION_SLUG}`)}
              className="w-full py-3 rounded-full font-display tracking-widest text-base transition-transform hover:scale-[1.02]"
              style={{ backgroundColor: '#FFF8EE', color: '#2C2C2C', border: '1.5px solid #9BBDCF' }}
            >
              CHECKOUT →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ShoppingBag, Check } from 'lucide-react'
import { usePickupCartStore } from '@/lib/pickup-cart-store'
import { FlavorOption, MenuItem, TAG_LABELS } from '@/types/menu'
import { FlavorSelection } from '@/types/pickup'
import { getCategoryStyle } from '@/lib/category-style'
import { FlavorPicker } from './FlavorPicker'

interface Props {
  item: MenuItem
  flavorOptions?: FlavorOption[]
}

export function MenuItemDetail({ item, flavorOptions }: Props) {
  const addItem = usePickupCartStore((s) => s.addItem)
  const style = getCategoryStyle(item.square_category_id ?? item.id, item.category_emoji, item.category_color)
  const price = `$${Number(item.price).toFixed(2)}`
  const requiredFlavorCount = item.required_flavor_count ?? 0

  // Gallery: primary photo first, then any extra photos Square has for this item
  const photos = [item.image_url, ...(item.image_urls ?? [])].filter(
    (url, index, all): url is string => !!url && all.indexOf(url) === index
  )

  const [activePhoto, setActivePhoto] = useState<string | undefined>(photos[0])
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [flavorSelections, setFlavorSelections] = useState<FlavorSelection[]>([])
  const [flavorTotal, setFlavorTotal] = useState(0)

  const needsFlavors = requiredFlavorCount > 0
  const flavorsReady = !needsFlavors || flavorTotal === requiredFlavorCount

  function handleAddToOrder() {
    if (!flavorsReady) return
    addItem({
      menuItemId: item.id,
      name: item.name,
      priceCents: Math.round(Number(item.price) * 100),
      quantity,
      emoji: style.emoji,
      category: item.category_name ?? 'Menu',
      flavors: needsFlavors ? flavorSelections : undefined,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      {/* Photo(s) */}
      <div>
        <div
          className="aspect-square relative rounded-2xl overflow-hidden shadow-sm mb-3 flex items-center justify-center"
          style={{ backgroundColor: style.color + '33' }}
        >
          {activePhoto ? (
            <Image
              src={activePhoto}
              alt={item.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          ) : (
            <span className="text-8xl" role="img" aria-label={item.category_name ?? 'Menu item'}>
              {style.emoji}
            </span>
          )}
        </div>
        {photos.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {photos.map((url) => (
              <button
                key={url}
                onClick={() => setActivePhoto(url)}
                className="relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors"
                style={{ borderColor: activePhoto === url ? '#FF7B9D' : 'transparent' }}
              >
                <Image src={url} alt={item.name} fill className="object-cover" sizes="56px" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-6">
        <div>
          {item.category_name && (
            <span
              className="inline-block font-display tracking-widest text-xs px-3 py-1 rounded-full text-white shadow-sm mb-3"
              style={{ backgroundColor: style.color }}
            >
              {item.category_name}
            </span>
          )}
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

        {/* Macro + tag badges */}
        <div className="flex flex-wrap gap-1.5">
          {item.calories != null && (
            <span className="text-xs font-body font-700 px-2 py-0.5 rounded-full bg-cream text-dark/70">
              {item.calories} cal
            </span>
          )}
          {item.protein_g != null && (
            <span className="text-xs font-body font-700 px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: '#FF7B9D' }}>
              {item.protein_g}g protein
            </span>
          )}
          {item.caffeine_mg != null && (
            <span className="text-xs font-body font-700 px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: '#6FBDB8' }}>
              {item.caffeine_mg}mg caffeine
            </span>
          )}
          {item.tags?.map((tag) => (
            <span key={tag} className="text-xs font-body font-700 px-2 py-0.5 rounded-full bg-white border border-sky/40 text-dark/60">
              {TAG_LABELS[tag] ?? tag}
            </span>
          ))}
        </div>

        {/* Flavor picker — required before this item can be added */}
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

        {/* Quantity — how many of this exact pack/flavor-combo */}
        <div>
          <label className="font-body font-bold text-dark text-sm uppercase tracking-widest mb-2 block">
            {needsFlavors ? 'How Many Packs' : 'Quantity'}
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-9 h-9 rounded-full border-2 border-gray-200 font-bold text-dark hover:border-gray-400 transition-colors"
            >
              −
            </button>
            <span className="font-body font-bold text-dark w-6 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-9 h-9 rounded-full border-2 border-gray-200 font-bold text-dark hover:border-gray-400 transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Add to order */}
        <button
          onClick={handleAddToOrder}
          disabled={!flavorsReady}
          className="flex items-center justify-center gap-3 w-full py-4 rounded-full font-display tracking-widest text-white text-lg transition-all disabled:opacity-50"
          style={{ backgroundColor: added ? '#6FBDB8' : '#FF7B9D' }}
        >
          {added ? (
            <><Check className="w-5 h-5" /> ADDED TO ORDER</>
          ) : !flavorsReady ? (
            `PICK ${requiredFlavorCount - flavorTotal} MORE FLAVOR${requiredFlavorCount - flavorTotal !== 1 ? 'S' : ''}`
          ) : (
            <><ShoppingBag className="w-5 h-5" /> ADD TO ORDER</>
          )}
        </button>
      </div>
    </div>
  )
}

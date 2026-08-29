import Image from 'next/image'
import Link from 'next/link'
import { MenuItem, TAG_LABELS } from '@/types/menu'
import { getCategoryStyle } from '@/lib/category-style'
import { LocationSlug } from '@/lib/locations'

interface DrinkCardProps {
  item: MenuItem
  locationSlug: LocationSlug
  onAddToOrder?: (item: MenuItem) => void
}

export function DrinkCard({ item, locationSlug, onAddToOrder }: DrinkCardProps) {
  const style = getCategoryStyle(item.square_category_id ?? item.id, item.category_emoji, item.category_color)
  const price = `$${Number(item.price).toFixed(2)}`

  return (
    <Link
      href={`/menu/${locationSlug}/${item.id}`}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-sky/20 flex flex-col hover:shadow-md transition-shadow"
    >

      {/* Image or colored placeholder */}
      <div
        className="relative h-40 flex items-center justify-center flex-shrink-0"
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
          <span className="text-5xl" role="img" aria-label={item.category_name ?? 'Menu item'}>
            {style.emoji}
          </span>
        )}

        {/* Category badge */}
        {item.category_name && (
          <span
            className="absolute top-3 left-3 font-display tracking-widest text-xs px-3 py-1 rounded-full text-white shadow-sm"
            style={{ backgroundColor: style.color }}
          >
            {item.category_name}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        {/* Name + price */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-xl tracking-wide text-dark leading-tight">
            {item.name}
          </h3>
          <span className="font-display text-lg flex-shrink-0" style={{ color: '#EC8A1E' }}>
            {price}
          </span>
        </div>

        {/* Description */}
        {item.description && (
          <p className="font-body text-sm text-dark/60 leading-relaxed">
            {item.description}
          </p>
        )}

        {/* Macro + tag badges */}
        <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
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

        {/* Add to order button — items that require picking flavors skip the
            quick-add and just rely on the card being a link to the detail page */}
        {onAddToOrder && !item.required_flavor_count && (
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onAddToOrder(item)
            }}
            className="mt-3 w-full py-2 rounded-full font-display tracking-widest text-sm text-white transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: '#FF7B9D' }}
          >
            + ADD TO ORDER
          </button>
        )}
        {onAddToOrder && !!item.required_flavor_count && (
          <div
            className="mt-3 w-full py-2 rounded-full font-display tracking-widest text-sm text-center"
            style={{ backgroundColor: '#FFF8EE', color: '#2C2C2C' }}
          >
            CHOOSE FLAVORS →
          </div>
        )}
      </div>
    </Link>
  )
}

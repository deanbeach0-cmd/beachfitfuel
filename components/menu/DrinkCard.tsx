import Image from 'next/image'
import { MenuItem, CATEGORY_META, TAG_LABELS } from '@/types/menu'

interface DrinkCardProps {
  item: MenuItem
}

export function DrinkCard({ item }: DrinkCardProps) {
  const meta = CATEGORY_META[item.category]
  const price = `$${Number(item.price).toFixed(2)}`

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-sky/20 flex flex-col hover:shadow-md transition-shadow">

      {/* Image or colored placeholder */}
      <div
        className="relative h-40 flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: meta.color + '33' }}
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
          <span className="text-5xl" role="img" aria-label={meta.label}>
            {meta.emoji}
          </span>
        )}

        {/* Category badge */}
        <span
          className="absolute top-3 left-3 font-display tracking-widest text-xs px-3 py-1 rounded-full text-white shadow-sm"
          style={{ backgroundColor: meta.color }}
        >
          {meta.label}
        </span>
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
      </div>
    </div>
  )
}

'use client'

import { useState, useMemo } from 'react'
import { MenuItem, FilterCategory, DrinkCategory } from '@/types/menu'
import { DrinkCard } from './DrinkCard'
import { MenuFilter } from './MenuFilter'

interface MenuGridProps {
  items: MenuItem[]
  locationName: string
}

export function MenuGrid({ items, locationName }: MenuGridProps) {
  const [active, setActive] = useState<FilterCategory>('all')

  const filtered = useMemo(
    () => active === 'all' ? items : items.filter((i) => i.category === active),
    [items, active]
  )

  // Count per category for the filter badges
  const counts = useMemo(() => {
    const c: Partial<Record<FilterCategory, number>> = { all: items.length }
    items.forEach((item) => {
      c[item.category] = (c[item.category] ?? 0) + 1
    })
    return c
  }, [items])

  return (
    <div className="flex flex-col gap-8">
      {/* Filter bar */}
      <MenuFilter active={active} onChange={setActive} counts={counts} />

      {/* Results summary */}
      <p className="font-body text-sm text-dark/50">
        Showing <strong className="text-dark">{filtered.length}</strong> item{filtered.length !== 1 ? 's' : ''} at {locationName}
      </p>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <DrinkCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 flex flex-col items-center gap-4">
          <span className="text-5xl">🌴</span>
          <p className="font-display text-2xl tracking-wide text-dark/40">
            {items.length === 0
              ? 'MENU COMING SOON'
              : 'NOTHING IN THIS CATEGORY YET'}
          </p>
          <p className="font-body text-dark/40 text-sm">
            {items.length === 0
              ? 'Check back soon — we\'re loading up the menu!'
              : 'Try a different filter above.'}
          </p>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useMemo } from 'react'
import { MenuItem } from '@/types/menu'
import { getCategoryStyle } from '@/lib/category-style'
import { TO_GO_PACK_CATEGORY_ID } from '@/lib/shipping'
import { DrinkCard } from './DrinkCard'
import { MenuFilter, CategoryFilterOption } from './MenuFilter'
import { usePickupCartStore } from '@/lib/pickup-cart-store'

interface MenuGridProps {
  items: MenuItem[]
  locationName: string
  showOrderButton?: boolean
}

export function MenuGrid({ items, locationName, showOrderButton }: MenuGridProps) {
  const [active, setActive] = useState<string>('all')
  const addItem = usePickupCartStore((s) => s.addItem)

  // One filter chip per distinct category actually present in the visible items
  const categories = useMemo(() => {
    const seen = new Map<string, CategoryFilterOption>()
    items.forEach((item) => {
      const name = item.category_name
      if (!name || seen.has(name)) return
      const style = getCategoryStyle(item.square_category_id ?? name, item.category_emoji, item.category_color)
      seen.set(name, { value: name, emoji: style.emoji, color: style.color })
    })
    return Array.from(seen.values())
  }, [items])

  const filtered = useMemo(
    () => (active === 'all' ? items : items.filter((i) => i.category_name === active)),
    [items, active]
  )

  // Count per category for the filter badges
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length }
    items.forEach((item) => {
      if (!item.category_name) return
      c[item.category_name] = (c[item.category_name] ?? 0) + 1
    })
    return c
  }, [items])

  return (
    <div className="flex flex-col gap-8">
      {/* Filter bar */}
      <MenuFilter active={active} onChange={setActive} categories={categories} counts={counts} />

      {/* Results summary */}
      <p className="font-body text-sm text-dark/50">
        Showing <strong className="text-dark">{filtered.length}</strong> item{filtered.length !== 1 ? 's' : ''} at {locationName}
      </p>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <DrinkCard
              key={item.id}
              item={item}
              onAddToOrder={showOrderButton ? (menuItem) => {
                const style = getCategoryStyle(menuItem.square_category_id ?? menuItem.id, menuItem.category_emoji, menuItem.category_color)
                addItem({
                  menuItemId: menuItem.id,
                  name: menuItem.name,
                  priceCents: Math.round(Number(menuItem.price) * 100),
                  quantity: 1,
                  emoji: style.emoji,
                  category: menuItem.category_name ?? 'Menu',
                  shippable: menuItem.square_category_id === TO_GO_PACK_CATEGORY_ID,
                })
              } : undefined}
            />
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

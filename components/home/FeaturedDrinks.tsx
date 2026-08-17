'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { MenuItem } from '@/types/menu'
import { getCategoryStyle } from '@/lib/category-style'
import { DrinkCard } from '@/components/menu/DrinkCard'
import { MenuFilter, CategoryFilterOption } from '@/components/menu/MenuFilter'

// Surfboard SVG data URI for the section background pattern
const SURFBOARD_PATTERN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='90'%3E%3Cpath d='M20,5 Q32,18 32,45 Q32,72 20,85 Q8,72 8,45 Q8,18 20,5 Z' fill='none' stroke='%23EC8A1E' stroke-width='1.5'/%3E%3Cline x1='20' y1='38' x2='20' y2='52' stroke='%23EC8A1E' stroke-width='1'/%3E%3C/svg%3E")`

interface FeaturedDrinksProps {
  items: MenuItem[]
}

export function FeaturedDrinks({ items }: FeaturedDrinksProps) {
  const [active, setActive] = useState('all')

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

  const visible = active === 'all' ? items : items.filter((i) => i.category_name === active)

  return (
    <section
      className="py-16 md:py-24 px-4 relative overflow-hidden"
      style={{ backgroundColor: '#FFF8EE' }}
    >
      {/* Surfboard pattern background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: SURFBOARD_PATTERN,
          backgroundSize: '40px 90px',
          opacity: 0.06,
        }}
      />

      <div className="relative max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <span className="font-body font-800 text-sm tracking-[0.2em] uppercase" style={{ color: '#6FBDB8' }}>
            What We Make
          </span>
          <h2 className="font-display text-4xl md:text-5xl tracking-wide text-dark mt-2">
            THE MENU
          </h2>
          <p className="font-body text-dark/60 mt-2 text-base max-w-lg mx-auto">
            Every drink is made to order. Low-cal, zero sugar options always available.
          </p>
        </div>

        {items.length === 0 ? (
          <p className="text-center font-body text-dark/40 py-12">Menu loading soon — check back shortly.</p>
        ) : (
          <>
            {/* Filter buttons */}
            {categories.length > 0 && (
              <div className="flex justify-center mb-10">
                <MenuFilter active={active} onChange={setActive} categories={categories} />
              </div>
            )}

            {/* Drink cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {visible.map((item) => (
                <DrinkCard key={item.id} item={item} />
              ))}
            </div>
          </>
        )}

        {/* View Full Menu CTA */}
        <div className="text-center mt-10">
          <Link
            href="/menu"
            className="inline-block font-display tracking-widest text-base px-10 py-4 rounded-full text-white transition-transform hover:scale-105"
            style={{ backgroundColor: '#FF7B9D' }}
          >
            VIEW FULL MENU
          </Link>
        </div>

      </div>
    </section>
  )
}

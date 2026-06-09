'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Zap, Dumbbell, Blend, Coffee, Utensils } from 'lucide-react'

type Category = 'all' | 'beach_bomb' | 'protein_shake' | 'blender' | 'energy_drink' | 'food'

interface SampleDrink {
  name: string
  description: string
  price: string
  category: Exclude<Category, 'all'>
  calories: number
  protein?: number
  caffeine?: number
  tags: string[]
  color: string
}

const SAMPLE_DRINKS: SampleDrink[] = [
  {
    name: 'Tropical Sunrise',
    description: 'Mango, pineapple, coconut water, energy blend',
    price: '$7.50',
    category: 'beach_bomb',
    calories: 35,
    caffeine: 100,
    tags: ['0 Sugar', 'Keto'],
    color: '#FAB65F',
  },
  {
    name: 'Strawberry Shortcake',
    description: 'Strawberry, vanilla, 25g whey protein, almond milk',
    price: '$8.50',
    category: 'protein_shake',
    calories: 180,
    protein: 25,
    tags: ['25g Protein', 'Gluten Free'],
    color: '#FF7B9D',
  },
  {
    name: 'Green Machine',
    description: 'Spinach, banana, pineapple, ginger, honey',
    price: '$9.00',
    category: 'blender',
    calories: 220,
    protein: 5,
    tags: ['Vegan', 'Kid Friendly'],
    color: '#6FBDB8',
  },
  {
    name: 'Berry Blast',
    description: 'Mixed berries, açaí, oat milk, granola',
    price: '$9.50',
    category: 'blender',
    calories: 280,
    protein: 8,
    tags: ['Dairy Free'],
    color: '#9BBDCF',
  },
  {
    name: 'OG Beach Bomb',
    description: 'Our signature low-cal energy drink — ocean breeze flavor',
    price: '$6.50',
    category: 'beach_bomb',
    calories: 20,
    caffeine: 120,
    tags: ['0 Sugar', 'Low Cal'],
    color: '#EC8A1E',
  },
  {
    name: 'Chocolate PB Power',
    description: 'Chocolate, peanut butter, 25g protein, oat milk',
    price: '$8.50',
    category: 'protein_shake',
    calories: 200,
    protein: 25,
    tags: ['25g Protein'],
    color: '#FF7B9D',
  },
]

const FILTERS: { label: string; value: Category; icon: React.ReactNode }[] = [
  { label: 'All',            value: 'all',          icon: null },
  { label: 'Beach Bombs',    value: 'beach_bomb',   icon: <Zap size={14} /> },
  { label: 'Protein Shakes', value: 'protein_shake',icon: <Dumbbell size={14} /> },
  { label: 'Blenders',       value: 'blender',      icon: <Blend size={14} /> },
  { label: 'Energy Drinks',  value: 'energy_drink', icon: <Coffee size={14} /> },
  { label: 'Food',           value: 'food',         icon: <Utensils size={14} /> },
]

// Surfboard SVG data URI for the section background pattern
const SURFBOARD_PATTERN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='90'%3E%3Cpath d='M20,5 Q32,18 32,45 Q32,72 20,85 Q8,72 8,45 Q8,18 20,5 Z' fill='none' stroke='%23EC8A1E' stroke-width='1.5'/%3E%3Cline x1='20' y1='38' x2='20' y2='52' stroke='%23EC8A1E' stroke-width='1'/%3E%3C/svg%3E")`

export function FeaturedDrinks() {
  const [active, setActive] = useState<Category>('all')

  const visible = active === 'all'
    ? SAMPLE_DRINKS
    : SAMPLE_DRINKS.filter((d) => d.category === active)

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

        {/* Filter buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setActive(f.value)}
              className="flex items-center gap-1.5 font-body font-700 text-sm px-4 py-2 rounded-full transition-all"
              style={
                active === f.value
                  ? { backgroundColor: '#EC8A1E', color: 'white' }
                  : { backgroundColor: 'white', color: '#2C2C2C', border: '1.5px solid #9BBDCF' }
              }
            >
              {f.icon}
              {f.label}
            </button>
          ))}
        </div>

        {/* Drink cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visible.map((drink) => (
            <div
              key={drink.name}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-sky/20 flex flex-col"
            >
              {/* Color swatch header */}
              <div
                className="h-3 w-full"
                style={{ backgroundColor: drink.color }}
              />

              <div className="p-5 flex flex-col gap-3 flex-1">
                {/* Name + price */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-xl tracking-wide text-dark leading-tight">
                    {drink.name}
                  </h3>
                  <span
                    className="font-display text-lg tracking-wide flex-shrink-0"
                    style={{ color: '#EC8A1E' }}
                  >
                    {drink.price}
                  </span>
                </div>

                {/* Description */}
                <p className="font-body text-sm text-dark/60 leading-relaxed">
                  {drink.description}
                </p>

                {/* Macro badges */}
                <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
                  <span className="text-xs font-body font-700 px-2 py-0.5 rounded-full bg-cream text-dark/70">
                    {drink.calories} cal
                  </span>
                  {drink.protein && (
                    <span
                      className="text-xs font-body font-700 px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: '#FF7B9D' }}
                    >
                      {drink.protein}g protein
                    </span>
                  )}
                  {drink.caffeine && (
                    <span
                      className="text-xs font-body font-700 px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: '#6FBDB8' }}
                    >
                      {drink.caffeine}mg caffeine
                    </span>
                  )}
                  {drink.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-body font-700 px-2 py-0.5 rounded-full bg-white border border-sky/40 text-dark/60"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

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

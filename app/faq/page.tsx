import { AlertTriangle, ChevronDown, Phone } from 'lucide-react'
import type { Metadata } from 'next'
import { LOCATIONS } from '@/lib/locations'

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Answers to the questions we get most — what a Beach Bomb is, how BeachFit Fuel differs from Herbalife, and what is in our drinks, including allergen and nutrition details.',
}

interface FaqItem {
  q: string
  /** One entry per paragraph. Plain strings, so no JSX entity escaping needed. */
  a: string[]
}

interface FaqSection {
  title: string
  color: string
  /** Standing callout shown above the questions. One entry per paragraph. */
  note?: { heading: string; body: string[] }
  items: FaqItem[]
}

const SECTIONS: FaqSection[] = [
  {
    title: 'ABOUT BEACHFIT FUEL',
    color: '#6FBDB8',
    items: [
      {
        q: 'What is a Beach Bomb?',
        a: [
          'A Beach Bomb is a refreshing, zero-sugar flavored caffeinated beverage with roughly 100mg of caffeine, zero sugar, and under 30 calories. Light, delicious, and fully customizable.',
        ],
      },
      {
        q: 'What’s the difference between BeachFit Fuel and Herbalife?',
        a: [
          'BeachFit Fuel isn’t a Herbalife nutrition club. We’re an independent drink shop with our own recipes, menu, and brand, built around affordability, convenience, and a lot of creativity.',
          'We use a variety of products and brands to create our Beach Bombs, protein shakes, Dirty Alanis, dirty sodas, frappes, and more. There’s no membership, no recruiting, and no MLM component — you just come in, order what you love, and enjoy it.',
        ],
      },
      {
        q: 'What do you use if you don’t use Herbalife?',
        a: ['We use a variety of zero-sugar flavored ingredients and brands, depending on the drink.'],
      },
    ],
  },
  {
    title: 'INGREDIENTS & CAFFEINE',
    color: '#EC8A1E',
    items: [
      {
        q: 'Are there dyes and artificial sweeteners?',
        a: ['Yes. Our drinks contain dyes and artificial sweeteners, primarily sucralose.'],
      },
      {
        q: 'Where does the caffeine come from?',
        a: [
          'Some of our Beach Bombs contain guarana tea, which has naturally occurring caffeine. Our other caffeine source has caffeine added during the manufacturing process.',
        ],
      },
    ],
  },
  {
    title: 'ALLERGENS & NUTRITION',
    color: '#FF7B9D',
    // Sits above the allergen answers rather than at the foot of the page, so
    // anyone reading them has the caveat first.
    note: {
      heading: 'A note on allergens',
      body: [
        'Our drinks are made by hand in a shared space, with shared blenders, utensils, and ice. Even when a recipe itself contains no gluten or dairy, we can’t guarantee any drink is free from cross-contact with allergens handled in our shops — including milk, soy, wheat, egg, and peanuts.',
        'Recipes, brands, and suppliers can change, so the answers below may not always reflect exactly what’s in your cup today.',
        'If you have a serious allergy or celiac disease, please tell our staff before you order. We’re always glad to walk through precisely what goes into a drink — we would much rather have that conversation than have you guess.',
      ],
    },
    items: [
      {
        q: 'Are your protein shakes gluten free?',
        a: [
          'Yes — our protein shakes are gluten-free, with one exception: a few recipes include corn flakes or graham cracker. Just let our staff know and we’ll leave those out.',
          'They are not dairy-free. The base is hydrolyzed whey protein isolate and whey protein isolate, both derived from milk, and the label states “Contains: Milk and Soy.”',
          'They are very low in lactose, though — the whey is heavily filtered to remove excess lactose, and some labels report less than 0.5g per serving.',
        ],
      },
      {
        q: 'How many calories are in your protein shakes?',
        a: [
          'It varies by shake, but most come in under 250 calories with about 25 grams of protein and low sugar.',
        ],
      },
      {
        q: 'Is the sweet cream gluten free and dairy free?',
        a: [
          'Yes — our sweet cream is a shelf-stable, dairy-free product. Half and half, by contrast, is a dairy product.',
        ],
      },
      {
        q: 'Are the beach bombs gluten free?',
        a: [
          'Yes, Beach Bombs are gluten-free. They’re made in a facility that also processes egg, milk, wheat, and soy, so they may not be safe for celiac or severe allergy needs.',
        ],
      },
    ],
  },
]

const CONTACT_LOCATIONS = [LOCATIONS.marshall, LOCATIONS['battle-creek']]

export default function FaqPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8EE' }}>

      {/* ── Hero ──────────────────────────────────── */}
      <div
        className="py-16 px-4 text-center"
        style={{ background: 'linear-gradient(135deg, #6FBDB8, #9BBDCF)' }}
      >
        <span className="font-body font-800 text-sm tracking-[0.2em] uppercase text-white/70">
          Good To Know
        </span>
        <h1 className="font-display text-4xl md:text-6xl tracking-wide text-white mt-2">
          FREQUENTLY ASKED QUESTIONS
        </h1>
        <p className="font-body text-white/80 mt-3 text-base max-w-lg mx-auto">
          Everything people ask us about Beach Bombs, protein shakes, ingredients, and allergens.
        </p>
      </div>

      {/* ── Questions ─────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 py-16 flex flex-col gap-12">
        {SECTIONS.map((section) => (
          <div key={section.title}>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-1 rounded-full" style={{ backgroundColor: section.color }} />
              <h2 className="font-display text-lg tracking-widest" style={{ color: section.color }}>
                {section.title}
              </h2>
            </div>

            {section.note && (
              <div
                className="rounded-2xl p-6 mb-5 flex flex-col gap-3"
                style={{ backgroundColor: `${section.color}0D`, border: `1.5px solid ${section.color}44` }}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} style={{ color: section.color }} className="flex-shrink-0" />
                  <h3 className="font-display text-base tracking-widest" style={{ color: section.color }}>
                    {section.note.heading.toUpperCase()}
                  </h3>
                </div>
                {section.note.body.map((paragraph) => (
                  <p key={paragraph} className="font-body text-dark/70 text-sm leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            )}

            <div
              className="rounded-2xl overflow-hidden divide-y divide-dark/5"
              style={{ backgroundColor: 'white', border: `1.5px solid ${section.color}33` }}
            >
              {section.items.map((item) => (
                // Native <details> keeps this page a server component with no
                // JavaScript: it works with JS disabled, is keyboard and screen
                // reader accessible for free, and leaves the answers in the HTML
                // for search engines.
                <details key={item.q} className="group">
                  <summary className="flex items-center justify-between gap-4 cursor-pointer px-6 py-5 list-none [&::-webkit-details-marker]:hidden hover:bg-cream/60 transition-colors">
                    <span className="font-body font-bold text-dark">{item.q}</span>
                    <ChevronDown
                      size={18}
                      className="flex-shrink-0 text-dark/40 transition-transform group-open:rotate-180"
                    />
                  </summary>
                  <div className="px-6 pb-5 flex flex-col gap-3 font-body text-dark/70 text-sm leading-relaxed">
                    {item.a.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </details>
              ))}
            </div>

          </div>
        ))}
      </div>

      {/* ── CTA ───────────────────────────────────── */}
      <div className="py-12 px-4 text-center" style={{ backgroundColor: '#2C2C2C' }}>
        <p className="font-display text-3xl tracking-wide text-white mb-2">STILL HAVE QUESTIONS?</p>
        <p className="font-body text-white/60 mb-6 text-sm">
          Call or text either location anytime during business hours.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {CONTACT_LOCATIONS.map((location) => (
            <a
              key={location.slug}
              href={location.phoneHref}
              className="inline-flex items-center justify-center gap-2 font-display tracking-widest text-base px-10 py-4 rounded-full text-white transition-transform hover:scale-105"
              style={{ backgroundColor: '#FF7B9D' }}
            >
              <Phone size={18} />
              {location.name}: {location.phoneDisplay}
            </a>
          ))}
        </div>
      </div>

    </div>
  )
}

import Image from 'next/image'
import Link from 'next/link'
import { Ticker } from '@/components/home/Ticker'
import { HeroBanner } from '@/components/home/HeroBanner'
import { LocationSelector } from '@/components/home/LocationSelector'
import { FeaturedDrinks } from '@/components/home/FeaturedDrinks'
import { SocialFeed } from '@/components/home/SocialFeed'
import { WaveDivider } from '@/components/shared/WaveDivider'
import { DottedCard } from '@/components/shared/DottedCard'
import { NewsletterForm } from '@/components/home/NewsletterForm'

// Hibiscus SVG pattern for the shop/pink section
const HIBISCUS_PATTERN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='70' height='70'%3E%3Cg fill='white'%3E%3Cellipse cx='35' cy='18' rx='8' ry='14' transform='rotate(0 35 35)'/%3E%3Cellipse cx='35' cy='18' rx='8' ry='14' transform='rotate(72 35 35)'/%3E%3Cellipse cx='35' cy='18' rx='8' ry='14' transform='rotate(144 35 35)'/%3E%3Cellipse cx='35' cy='18' rx='8' ry='14' transform='rotate(216 35 35)'/%3E%3Cellipse cx='35' cy='18' rx='8' ry='14' transform='rotate(288 35 35)'/%3E%3Ccircle cx='35' cy='35' r='5'/%3E%3C/g%3E%3C/svg%3E")`

// Palm tree pattern (same as hero) for sky sections
const PALM_PATTERN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='110'%3E%3Cpath d='M45,110 C44,88 42,70 45,56 C34,50 18,48 8,52 C20,46 34,52 45,56 C47,40 62,34 74,35 C62,40 48,50 45,56 C40,36 42,18 44,8 C45,26 44,46 45,56 C49,38 60,26 72,22 C60,32 47,48 45,56' fill='white'/%3E%3C/svg%3E")`

const SHOP_PRODUCTS = [
  {
    name: 'Beach Bomb To-Go Pack',
    description: '12 individual beach bomb pouches — just add water. All your favorite flavors.',
    price: '$24.99',
    badge: null,
    color: '#9BBDCF',
    emoji: '🏖️',
    href: '/shop/to-go-packs',
  },
  {
    name: 'Variety Bundle',
    description: '24 pouches with a mix of all flavors. Best value for the whole family.',
    price: '$49.99',
    badge: 'SAVE 15%',
    color: '#FAB65F',
    emoji: '🎉',
    href: '/shop/to-go-packs',
  },
  {
    name: 'BFF Apparel',
    description: 'Hats, tees, and hoodies. Rep the beach wherever you are.',
    price: 'From $22',
    badge: null,
    color: '#FF7B9D',
    emoji: '👕',
    href: '/shop/apparel',
  },
]

export default function HomePage() {
  return (
    <>
      {/* 1 — Ticker */}
      <Ticker />

      {/* 2 — Hero */}
      <HeroBanner />

      {/* 3 — Wave: sky → white */}
      <WaveDivider fromColor="#9BBDCF" toColor="#ffffff" />

      {/* 4 — Location selector */}
      <LocationSelector />

      {/* 5 — Wave: white → cream */}
      <WaveDivider fromColor="#ffffff" toColor="#FFF8EE" />

      {/* 6 — Menu preview */}
      <FeaturedDrinks />

      {/* 7 — Wave: cream → pink */}
      <WaveDivider fromColor="#FFF8EE" toColor="#FF7B9D" />

      {/* 8 — Shop section */}
      <section
        className="relative overflow-hidden py-16 md:py-24 px-4"
        style={{ backgroundColor: '#FF7B9D' }}
      >
        {/* Hibiscus pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: HIBISCUS_PATTERN, backgroundSize: '70px 70px', opacity: 0.1 }}
        />

        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="font-body font-800 text-sm tracking-[0.2em] uppercase text-white/70">
              Ship Anywhere
            </span>
            <h2 className="font-display text-4xl md:text-5xl tracking-wide text-white mt-2">
              TAKE THE BEACH HOME
            </h2>
            <p className="font-body text-white/80 mt-2 text-base">
              To-go packs ship nationwide. Apparel to rep the vibe.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {SHOP_PRODUCTS.map((product) => (
              <div
                key={product.name}
                className="bg-white rounded-2xl flex flex-col shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                {/* Product image area */}
                <div
                  className="h-36 flex items-center justify-center relative"
                  style={{ backgroundColor: product.color + '33' }}
                >
                  <span className="text-6xl">{product.emoji}</span>
                  {product.badge && (
                    <span
                      className="absolute top-3 right-3 font-display tracking-widest text-xs px-3 py-1 rounded-full text-white"
                      style={{ backgroundColor: '#EC8A1E' }}
                    >
                      {product.badge}
                    </span>
                  )}
                </div>

                <div className="p-5 flex flex-col gap-3 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-xl tracking-wide text-dark leading-tight">
                      {product.name}
                    </h3>
                    <span className="font-display text-lg flex-shrink-0" style={{ color: '#EC8A1E' }}>
                      {product.price}
                    </span>
                  </div>
                  <p className="font-body text-sm text-dark/60 leading-relaxed flex-1">
                    {product.description}
                  </p>
                  <Link
                    href={product.href}
                    className="block w-full text-center font-display tracking-widest text-sm py-2.5 rounded-full text-white mt-auto transition-transform hover:scale-[1.02]"
                    style={{ backgroundColor: product.color }}
                  >
                    SHOP NOW
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/shop"
              className="inline-block font-display tracking-widest text-base px-10 py-4 rounded-full transition-transform hover:scale-105"
              style={{ backgroundColor: 'white', color: '#FF7B9D', border: '2px solid white' }}
            >
              VIEW ALL PRODUCTS
            </Link>
          </div>
        </div>
      </section>

      {/* 9 — Wave: pink → cream */}
      <WaveDivider fromColor="#FF7B9D" toColor="#FFF8EE" />

      {/* 10 — Social feed */}
      <SocialFeed />

      {/* 11 — Story section */}
      <section
        className="relative overflow-hidden py-16 md:py-24 px-4"
        style={{ backgroundColor: '#9BBDCF' }}
      >
        {/* Palm pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: PALM_PATTERN, backgroundSize: '90px 110px', opacity: 0.12 }}
        />

        <div className="relative max-w-4xl mx-auto flex flex-col items-center text-center gap-10">

          {/* Quote card */}
          <DottedCard
            className="max-w-2xl"
            borderColor="rgba(255,255,255,0.6)"
          >
            <div className="flex flex-col items-center gap-4 p-2">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                >
                  👫
                </div>
                <div className="text-left">
                  <p className="font-display text-xl tracking-widest text-white">DEAN & JENNIFER</p>
                  <p className="font-body text-white/70 text-sm">Founders, BeachFit Fuel</p>
                </div>
              </div>
              <p className="font-body text-white/90 text-base md:text-lg leading-relaxed italic">
                &ldquo;We started BeachFit Fuel because we wanted drinks that taste amazing and make
                you feel amazing — without all the junk. Michigan deserves a beach vibe,
                even when it&apos;s snowing outside.&rdquo;
              </p>
            </div>
          </DottedCard>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-2xl">
            {[
              { value: '4+',    label: 'Years in Business' },
              { value: '2',     label: 'Locations' },
              { value: '20+',   label: 'Menu Items' },
              { value: '1000s', label: 'Happy Customers' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1">
                <span
                  className="font-display text-4xl md:text-5xl text-white leading-none"
                  style={{ textShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                >
                  {stat.value}
                </span>
                <span className="font-body text-white/70 text-sm text-center">{stat.label}</span>
              </div>
            ))}
          </div>

          <Link
            href="/our-story"
            className="font-display tracking-widest text-base px-10 py-4 rounded-full transition-transform hover:scale-105"
            style={{ backgroundColor: 'white', color: '#9BBDCF', border: '2px solid white' }}
          >
            READ OUR STORY
          </Link>
        </div>
      </section>

      {/* 12 — Newsletter signup */}
      <section
        id="newsletter"
        className="py-16 md:py-20 px-4"
        style={{ backgroundColor: '#2C2C2C' }}
      >
        <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-6">
          <div>
            <span className="font-body font-800 text-sm tracking-[0.2em] uppercase" style={{ color: '#6FBDB8' }}>
              Stay in the Loop
            </span>
            <h2 className="font-display text-4xl md:text-5xl tracking-wide text-white mt-2">
              GET THE GOOD STUFF FIRST
            </h2>
            <p className="font-body text-white/60 mt-2 text-base">
              New flavors, specials, Battle Creek opening news — straight to your inbox.
            </p>
          </div>

          <div className="w-full relative">
            <NewsletterForm />
          </div>

          <p className="font-body text-white/30 text-xs">
            No spam. Unsubscribe anytime. We&apos;re not that kind of business.
          </p>
        </div>
      </section>
    </>
  )
}

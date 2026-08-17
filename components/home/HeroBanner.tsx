import Image from 'next/image'
import Link from 'next/link'

// Inline SVG palm tree pattern encoded as a data URI background
const PALM_PATTERN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='110'%3E%3Cpath d='M45,110 C44,88 42,70 45,56 C34,50 18,48 8,52 C20,46 34,52 45,56 C47,40 62,34 74,35 C62,40 48,50 45,56 C40,36 42,18 44,8 C45,26 44,46 45,56 C49,38 60,26 72,22 C60,32 47,48 45,56' fill='white'/%3E%3C/svg%3E")`

interface HeroBannerProps {
  categories: string[]
}

export function HeroBanner({ categories }: HeroBannerProps) {
  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundColor: '#9BBDCF' }}
    >
      {/* Palm tree pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: PALM_PATTERN,
          backgroundSize: '90px 110px',
          opacity: 0.18,
        }}
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 flex flex-col items-center text-center gap-8">

        {/* Logo — source PNG has a solid white background; multiply-blend it
            away so only the dark mark shows against the hero background. */}
        <Image
          src="/images/logo.png"
          alt="BeachFit Fuel"
          width={280}
          height={280}
          className="h-32 sm:h-40 md:h-48 w-auto object-contain"
          style={{ mixBlendMode: 'multiply' }}
          priority
        />

        {/* Headline */}
        <div className="space-y-3">
          <h1
            className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white leading-none"
            style={{ letterSpacing: '0.04em', textShadow: '0 2px 12px rgba(0,0,0,0.15)' }}
          >
            FUEL YOUR DAY
            <br />
            THE BEACHFIT WAY
          </h1>
          <p className="font-body text-white/90 text-lg md:text-xl max-w-xl mx-auto font-600">
            Low-cal, high-protein drinks that taste like a vacation.
            Two locations in Michigan.
          </p>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/menu"
            className="font-display tracking-widest text-lg px-8 py-4 rounded-full text-white transition-transform hover:scale-105 active:scale-95 shadow-lg"
            style={{ backgroundColor: '#FF7B9D', letterSpacing: '0.12em' }}
          >
            ORDER PICKUP
          </Link>
          <Link
            href="/shop/to-go-packs"
            className="font-display tracking-widest text-lg px-8 py-4 rounded-full transition-transform hover:scale-105 active:scale-95 shadow-lg"
            style={{
              backgroundColor: 'white',
              color: '#EC8A1E',
              letterSpacing: '0.12em',
              border: '2px solid #EC8A1E',
            }}
          >
            SHOP TO-GO PACKS
          </Link>
        </div>

        {/* Drink category pills */}
        {categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
            {categories.map((name) => (
              <Link
                key={name}
                href={`/menu/marshall?category=${encodeURIComponent(name)}`}
                className="font-body font-700 text-sm px-5 py-2 rounded-full bg-white/25 text-white hover:bg-white/40 transition-colors backdrop-blur-sm border border-white/40"
              >
                {name}
              </Link>
            ))}
          </div>
        )}

      </div>
    </section>
  )
}

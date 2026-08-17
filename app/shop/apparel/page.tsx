import type { Metadata } from 'next'
import Link from 'next/link'
import { printful } from '@/lib/printful'
import type { PrintfulProductSummary } from '@/types/shop'

export const metadata: Metadata = {
  title: 'Apparel',
  description: 'Rep the beach lifestyle. BeachFit Fuel tees, hoodies, hats and more.',
}

async function getProducts(): Promise<PrintfulProductSummary[]> {
  try {
    const products = await printful.getProducts()
    return products.filter((p) => !p.is_ignored && p.synced > 0)
  } catch {
    return []
  }
}

export default async function ApparelPage() {
  const products = await getProducts()

  if (products.length === 0) {
    return <ComingSoon />
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8EE' }}>
      {/* Header */}
      <div className="py-16 text-center" style={{ background: 'linear-gradient(135deg, #FF7B9D 0%, #EC8A1E 100%)' }}>
        <p className="font-display text-white/80 tracking-widest text-lg mb-2">BEACHFIT FUEL</p>
        <h1 className="font-display text-5xl md:text-7xl text-white tracking-widest mb-4">WEAR THE BEACH</h1>
        <p className="text-white/90 text-lg max-w-xl mx-auto px-4">
          Rep your lifestyle. Every purchase ships nationwide.
        </p>
      </div>

      {/* Product grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <Link href="/shop" className="font-body text-dark/50 text-sm hover:text-teal transition-colors">
            ← Back to Shop
          </Link>
          <p className="text-sm text-dark/50 font-body">{products.length} items</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  )
}

function ProductCard({ product }: { product: PrintfulProductSummary }) {
  return (
    <Link href={`/shop/apparel/${product.id}`} className="group">
      {/* Branded placeholder — real images load on the product detail page */}
      <div
        className="aspect-square rounded-xl flex flex-col items-center justify-center gap-3 group-hover:opacity-90 transition-opacity"
        style={{ background: 'linear-gradient(135deg, #FF7B9D22 0%, #EC8A1E22 100%)', border: '1.5px solid #FF7B9D33' }}
      >
        <span className="text-4xl">👕</span>
        <p className="font-display tracking-widest text-dark/60 text-xs text-center px-3 leading-tight">
          {product.name.toUpperCase()}
        </p>
      </div>
      <div className="mt-3 px-1">
        <h3 className="font-body font-bold text-dark text-sm leading-tight line-clamp-2">
          {product.name}
        </h3>
        <p className="font-body text-dark/50 text-xs mt-1">
          {product.synced} color{product.synced !== 1 ? 's' : ''} · Tap to see styles
        </p>
      </div>
    </Link>
  )
}

function ComingSoon() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FFF8EE' }}>
      <div className="py-16 px-4" style={{ backgroundColor: '#FF7B9D' }}>
        <div className="max-w-4xl mx-auto">
          <Link href="/shop" className="font-body text-white/70 text-sm hover:text-white transition-colors mb-4 inline-block">
            ← Back to Shop
          </Link>
          <h1 className="font-display text-5xl md:text-6xl tracking-wide text-white mt-2">WEAR THE BEACH</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-16 text-center flex-1">
        <div className="border-2 border-dashed rounded-2xl p-10 mb-10" style={{ borderColor: '#FF7B9D' }}>
          <div className="text-5xl mb-4">🏄</div>
          <h2 className="font-display text-3xl text-dark tracking-wide mb-3">DROPPING SOON</h2>
          <p className="text-dark/70 font-body mb-6">
            We&apos;re printing up something special. Be first to know.
          </p>
          <Link href="/#newsletter">
            <button className="font-display tracking-widest text-white px-8 py-3 rounded-full text-lg"
              style={{ backgroundColor: '#FF7B9D' }}>
              NOTIFY ME
            </button>
          </Link>
        </div>
        <Link href="/menu/marshall">
          <button className="font-display tracking-widest px-8 py-3 rounded-full border-2 text-dark border-dark/20 hover:border-teal hover:text-teal transition-colors">
            VIEW MARSHALL MENU
          </button>
        </Link>
      </div>
    </div>
  )
}

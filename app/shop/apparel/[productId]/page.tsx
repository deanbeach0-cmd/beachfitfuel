import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { printful } from '@/lib/printful'
import { ProductDetail } from '@/components/shop/ProductDetail'

interface Props {
  params: { productId: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const res = await printful.getProduct(params.productId)
    return { title: res.result.sync_product.name }
  } catch {
    return { title: 'Product' }
  }
}

export default async function ProductPage({ params }: Props) {
  let product
  try {
    const res = await printful.getProduct(params.productId)
    product = res.result
  } catch {
    notFound()
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8EE' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/shop/apparel" className="font-body text-dark/50 text-sm hover:text-teal transition-colors mb-8 inline-block">
          ← Back to Apparel
        </Link>
        <ProductDetail product={product} />
      </div>
    </div>
  )
}

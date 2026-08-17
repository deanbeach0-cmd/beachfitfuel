import type {
  PrintfulProductSummary,
  PrintfulProduct,
  PrintfulListResponse,
  PrintfulProductResponse,
  PrintfulSyncVariant,
} from '@/types/shop'

const PRINTFUL_BASE = 'https://api.printful.com'

async function printfulFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${PRINTFUL_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.PRINTFUL_API_KEY!}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!res.ok) {
    throw new Error(`Printful API error ${res.status}: ${await res.text()}`)
  }

  const json = await res.json()

  if (json.code && json.code !== 200) {
    throw new Error(`Printful error ${json.code}: ${json.error?.message ?? 'Unknown error'}`)
  }

  return json as T
}

export const printful = {
  /** List ALL synced products — handles Printful's 20-item pagination automatically */
  getProducts: async (): Promise<PrintfulProductSummary[]> => {
    const limit = 20
    let offset = 0
    const all: PrintfulProductSummary[] = []

    while (true) {
      const res = await printfulFetch<PrintfulListResponse>(
        `/sync/products?limit=${limit}&offset=${offset}`,
        { next: { revalidate: 3600 } } as RequestInit
      )
      all.push(...res.result)
      if (all.length >= res.paging.total) break
      offset += limit
    }

    return all
  },

  /** Get a single synced product with all its variants and their mockup images */
  getProduct: (productId: string | number) =>
    printfulFetch<PrintfulProductResponse>(`/sync/products/${productId}`, {
      next: { revalidate: 3600 },
    } as RequestInit),

  /** Create a fulfillment order */
  createOrder: (body: unknown) =>
    printfulFetch<{ code: number; result: { id: number } }>('/orders', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
}

/** Returns enabled, synced, non-ignored variants */
export function enabledVariants(product: PrintfulProduct): PrintfulSyncVariant[] {
  return product.sync_variants.filter((v) => v.synced && !v.is_ignored)
}

/** Cheapest retail price across enabled variants, in dollars */
export function minPrice(product: PrintfulProduct): number {
  const prices = enabledVariants(product).map((v) => parseFloat(v.retail_price))
  if (prices.length === 0) return 0
  return Math.min(...prices)
}

/** Best preview image for a specific variant (first visible file preview, or catalog image) */
export function variantImage(variant: PrintfulSyncVariant): string {
  return (
    variant.files.find((f) => f.visible)?.preview_url ??
    variant.product.image ??
    ''
  )
}

/** Default product image — only available after fetching the full product with variants */
export function defaultImage(product: PrintfulProduct): string {
  const first = enabledVariants(product)[0]
  return first ? variantImage(first) : ''
}

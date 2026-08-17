// Printful API types

export interface PrintfulProductSummary {
  id: number
  external_id: string
  name: string
  variants: number      // count of total variants
  synced: number        // count of synced variants
  thumbnail_url: string | null   // null for Square-integrated stores
  is_ignored: boolean
}

export interface PrintfulFile {
  id: number
  type: string          // "default", "back", "front", etc.
  thumbnail_url: string
  preview_url: string
  visible: boolean
}

export interface PrintfulSyncVariant {
  id: number
  external_id: string
  sync_product_id: number
  name: string          // "Custom T-Shirt — Black / S"
  synced: boolean
  variant_id: number
  retail_price: string  // "21.00" (dollars as string)
  currency: string
  product: {
    variant_id: number
    product_id: number
    image: string
    name: string
  }
  files: PrintfulFile[]
  color: string         // "Black"
  size: string          // "S"
  is_ignored: boolean
}

export interface PrintfulProduct {
  sync_product: PrintfulProductSummary
  sync_variants: PrintfulSyncVariant[]
}

export interface PrintfulListResponse {
  code: number
  paging: { total: number; offset: number; limit: number }
  result: PrintfulProductSummary[]
}

export interface PrintfulProductResponse {
  code: number
  result: PrintfulProduct
}

// Cart
export interface CartItem {
  productId: string     // Printful sync_product.id as string
  variantId: number     // Printful sync_variant.id
  quantity: number
  price: number         // in cents
  name: string          // product name + "— Color / Size"
  imageUrl: string
  type: 'apparel'
}

export interface ToGoPack {
  id: string
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  inventoryCount: number
  isAvailable: boolean
  isShippable: boolean
  squareProductId: string | null
  createdAt: string
}

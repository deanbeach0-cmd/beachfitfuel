export interface ToGoPack {
  id: string
  name: string
  description: string | null
  price: number         // in cents
  imageUrl: string | null
  inventoryCount: number
  isAvailable: boolean
  isShippable: boolean
  squareProductId: string | null
  createdAt: string
}

export interface ApparelVariant {
  id: number
  title: string
  price: number         // in cents
  isEnabled: boolean
  options: Record<string, string>
}

export interface ApparelProduct {
  id: string
  title: string
  description: string
  images: { src: string; position: number }[]
  variants: ApparelVariant[]
  tags: string[]
}

export interface CartItem {
  productId: string
  variantId?: number
  quantity: number
  price: number         // in cents
  name: string
  imageUrl: string
  type: 'to-go-pack' | 'apparel'
}

export interface Cart {
  items: CartItem[]
  subtotal: number
}

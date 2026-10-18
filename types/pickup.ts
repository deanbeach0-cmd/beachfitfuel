export interface FlavorSelection {
  name: string
  quantity: number
}

export interface PickupCartItem {
  lineId: string // unique per cart line — two lines can share menuItemId with different flavors
  menuItemId: string
  name: string
  priceCents: number
  quantity: number
  emoji: string
  category: string
  flavors?: FlavorSelection[] // set when the item required flavor picking
  shippable?: boolean // true for To-Go Pack items — eligible for USPS shipping
  /** Added from the Shop, where pickup isn't offered. Set per-add rather than
   *  per-product, so the same pack added from the menu can still be picked up. */
  shipOnly?: boolean
  locationSlug: string // which location this line is fulfilled at — a cart can only hold one location at a time
  squareVariationId?: string | null // links this line to a real Square catalog object for order reporting
}

/** Relative pickup offsets. There is deliberately no ASAP option — the kitchen
 *  needs lead time, so 15 minutes is the hard floor for every online order. */
export type PickupTime = '15min' | '30min' | '45min' | '1hr'

export type FulfillmentType = 'PICKUP' | 'SHIPMENT'

export interface ShippingAddress {
  firstName: string
  lastName: string
  address1: string
  address2?: string
  city: string
  state: string
  zip: string
}

export interface PickupCustomer {
  name: string
  phone: string
  email: string
  pickupTime: PickupTime
  /** Set instead of relying on `pickupTime` when the customer picked a specific
   *  next-day slot because the store is currently closed. */
  scheduledPickupAt?: string
  note: string
}

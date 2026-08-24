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
}

export type PickupTime = 'ASAP' | '15min' | '30min' | '45min' | '1hr'

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

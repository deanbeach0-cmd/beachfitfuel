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
}

export type PickupTime = 'ASAP' | '15min' | '30min' | '45min' | '1hr'

export interface PickupCustomer {
  name: string
  phone: string
  email: string
  pickupTime: PickupTime
  note: string
}

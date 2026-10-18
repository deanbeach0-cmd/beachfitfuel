// To-go packs ship via USPS with a flat fee — confirmed $9.50 by the owner.
// Easy to change here if the real cost turns out different.
export const SHIPPING_FLAT_FEE_CENTS = 950

// The Square "To Go Pack/Kits" category. Used to list candidate products on
// the shop page — but NOT to decide what can actually be mailed, since the
// category also holds ready-made drinks (Dirty Alani Bomb To Go, Protein
// Shake To Go) that are pickup-only.
export const TO_GO_PACK_CATEGORY_ID = 'D7ZS5WMD2YCWQUJ3DSHKFQVR'

// The only products we will put in the mail. Keyed on square_item_id, which
// is stable across locations — menu_items.id is per-location (migration 0006)
// and so cannot be used for a durable allowlist.
export const SHIPPABLE_SQUARE_ITEM_IDS = new Set([
  'UONVWSGHMUZLLCCGGB67OG52', // Beach Bomb To Go Pack — $5, pick 1 flavor
  'LU2CT6IFBJRGXVXPSZKRDUDT', // 5 to go packs for $20 — pick 5 flavors
  'QG7TL5CWMJI426T3UO3DOIK2', // 10 to go packs for $40 — pick 10 flavors
])

export function isShippableItem(squareItemId?: string | null): boolean {
  return !!squareItemId && SHIPPABLE_SQUARE_ITEM_IDS.has(squareItemId)
}

// Every shipped order settles against Marshall: one store owns packing and
// postage, and it matches the apparel flow, which is already Marshall-only.
export const SHIPPING_LOCATION_SLUG = 'marshall' as const

export type DietaryTag =
  | 'keto'
  | 'dairy_free'
  | 'zero_sugar'
  | 'kid_friendly'
  | 'vegan'
  | 'gluten_free'

export interface MenuItem {
  id: string
  location_id: string
  category: string | null // legacy free-text field, superseded by category_name below
  name: string
  description: string | null
  price: number           // dollars — Supabase DECIMAL(10,2)
  image_url: string | null
  image_urls: string[] | null
  caffeine_mg: number | null
  protein_g: number | null
  calories: number | null
  tags: DietaryTag[]
  is_available: boolean
  display_order: number
  square_item_id: string | null
  square_category_id: string | null
  created_at: string
  // Present when selected from the `visible_menu_items` view (joined from
  // square_categories) — the site's real category display fields.
  category_name?: string
  category_emoji?: string | null
  category_color?: string | null
  // Flavor-picker config, admin-set in /admin/categories. Null unless this
  // item requires choosing a combination of flavors before it can be ordered.
  flavor_source_type?: 'modifier' | 'variation' | null
  flavor_modifier_list_id?: string | null
  required_flavor_count?: number | null
}

// One selectable flavor option for a menu item that requires flavor picking —
// sourced either from a Square modifier list or from the item's own variations.
export interface FlavorOption {
  id: string // square_modifier_id or square_variation_id
  name: string
  priceCents: number
}

// One row per Square catalog category — the site's category taxonomy IS this
// table. Its name is the display label; emoji/color are optional per-category
// styling (falls back to an auto-assigned style when unset, see lib/category-style.ts).
export interface SquareCategory {
  square_category_id: string
  square_category_name: string
  emoji: string | null
  color: string | null
  is_visible: boolean
  updated_at: string
}

// A Square modifier list attached to one or more items (e.g. "To Go Pack
// Flavors"). Used in /admin/categories to let the admin pick which attached
// list (if any) is the item's flavor picker.
export interface SquareModifierList {
  square_modifier_list_id: string
  name: string
}

export const TAG_LABELS: Record<DietaryTag, string> = {
  keto:          'Keto',
  dairy_free:    'Dairy Free',
  zero_sugar:    'Zero Sugar',
  kid_friendly:  'Kid Friendly',
  vegan:         'Vegan',
  gluten_free:   'Gluten Free',
}

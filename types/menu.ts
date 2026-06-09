// Snake_case matches Supabase column names exactly — no mapping needed
export type DrinkCategory =
  | 'beach_bomb'
  | 'protein_shake'
  | 'blender'
  | 'energy_drink'
  | 'food'

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
  category: DrinkCategory
  name: string
  description: string | null
  price: number           // dollars — Supabase DECIMAL(10,2)
  image_url: string | null
  caffeine_mg: number | null
  protein_g: number | null
  calories: number | null
  tags: DietaryTag[]
  is_available: boolean
  display_order: number
  square_item_id: string | null
  created_at: string
}

export type FilterCategory = DrinkCategory | 'all'

export interface CategoryMeta {
  label: string
  emoji: string
  color: string
}

export const CATEGORY_META: Record<DrinkCategory, CategoryMeta> = {
  beach_bomb:    { label: 'Beach Bomb',    emoji: '🏖️', color: '#9BBDCF' },
  protein_shake: { label: 'Protein Shake', emoji: '💪', color: '#FF7B9D' },
  blender:       { label: 'Blender',       emoji: '🥤', color: '#6FBDB8' },
  energy_drink:  { label: 'Energy Drink',  emoji: '⚡', color: '#FAB65F' },
  food:          { label: 'Food',          emoji: '🥙', color: '#EC8A1E' },
}

export const TAG_LABELS: Record<DietaryTag, string> = {
  keto:          'Keto',
  dairy_free:    'Dairy Free',
  zero_sugar:    'Zero Sugar',
  kid_friendly:  'Kid Friendly',
  vegan:         'Vegan',
  gluten_free:   'Gluten Free',
}

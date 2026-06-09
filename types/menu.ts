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
  locationId: string
  category: DrinkCategory
  name: string
  description: string | null
  price: number         // stored in cents
  imageUrl: string | null
  caffeineMg: number | null
  proteinG: number | null
  calories: number | null
  tags: DietaryTag[]
  isAvailable: boolean
  displayOrder: number
  squareItemId: string | null
  createdAt: string
}

export interface MenuFilterState {
  category: DrinkCategory | 'all'
}

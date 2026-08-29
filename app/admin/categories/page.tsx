import { createClient } from '@supabase/supabase-js'
import { CategoryManager } from '@/components/admin/CategoryManager'
import { SquareCategory, MenuItem } from '@/types/menu'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic'

export type AdminMenuItem = Pick<
  MenuItem,
  | 'id'
  | 'name'
  | 'price'
  | 'image_url'
  | 'is_available'
  | 'square_category_id'
  | 'flavor_source_type'
  | 'flavor_modifier_list_id'
  | 'required_flavor_count'
  | 'location_id'
>

export interface AdminFlavorSource {
  type: 'modifier' | 'variation'
  id: string // square_modifier_list_id, or 'variation' for the item's own variations
  label: string
}

export default async function AdminCategoriesPage() {
  const [{ data: categories }, { data: items }, { data: modifierLists }, { data: itemModifierLinks }, { data: variations }, { data: locations }] =
    await Promise.all([
      supabaseAdmin.from('square_categories').select('*').order('square_category_name', { ascending: true }),
      supabaseAdmin
        .from('menu_items')
        .select(
          'id, name, price, image_url, is_available, square_category_id, flavor_source_type, flavor_modifier_list_id, required_flavor_count, location_id'
        )
        .order('name', { ascending: true }),
      supabaseAdmin.from('square_modifier_lists').select('square_modifier_list_id, name'),
      supabaseAdmin.from('menu_item_modifier_lists').select('menu_item_id, square_modifier_list_id'),
      supabaseAdmin.from('square_item_variations').select('menu_item_id'),
      supabaseAdmin.from('locations').select('id, name'),
    ])

  const categoryList = (categories ?? []) as SquareCategory[]
  const itemList = (items ?? []) as AdminMenuItem[]
  const locationNameById: Record<string, string> = Object.fromEntries(
    (locations ?? []).map((l) => [l.id, l.name])
  )

  const modifierListNames = new Map((modifierLists ?? []).map((l) => [l.square_modifier_list_id, l.name]))

  const variationCounts = new Map<string, number>()
  for (const row of variations ?? []) {
    variationCounts.set(row.menu_item_id, (variationCounts.get(row.menu_item_id) ?? 0) + 1)
  }

  const flavorSourcesByItem: Record<string, AdminFlavorSource[]> = {}
  for (const link of itemModifierLinks ?? []) {
    const name = modifierListNames.get(link.square_modifier_list_id) ?? 'Unnamed list'
    const list = (flavorSourcesByItem[link.menu_item_id] ??= [])
    list.push({ type: 'modifier', id: link.square_modifier_list_id, label: name })
  }
  variationCounts.forEach((count, menuItemId) => {
    if (count <= 1) return
    const list = (flavorSourcesByItem[menuItemId] ??= [])
    list.push({ type: 'variation', id: 'variation', label: `This item's own variations (${count})` })
  })

  return (
    <div className="min-h-screen px-4 py-12" style={{ backgroundColor: '#FFF8EE' }}>
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <div>
          <h1 className="font-display text-3xl tracking-wide text-dark">SQUARE CATEGORIES</h1>
          <p className="font-body text-dark/60 text-sm mt-1">
            Turn categories on to show them on the site, style them with an emoji + color, and
            expand a category to hide individual items. None of this touches anything in Square.
          </p>
        </div>

        {categoryList.length === 0 ? (
          <p className="font-body text-dark/50">
            No categories yet — run a Square sync first (POST /api/square/sync).
          </p>
        ) : (
          <CategoryManager
            initialCategories={categoryList}
            allItems={itemList}
            flavorSourcesByItem={flavorSourcesByItem}
            locationNameById={locationNameById}
          />
        )}
      </div>
    </div>
  )
}

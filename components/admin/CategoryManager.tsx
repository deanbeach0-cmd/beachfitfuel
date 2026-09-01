'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { SquareCategory } from '@/types/menu'
import { getCategoryStyle } from '@/lib/category-style'
import type { AdminFlavorSource, AdminMenuItem } from '@/app/admin/categories/page'

interface CategoryManagerProps {
  initialCategories: SquareCategory[]
  allItems: AdminMenuItem[]
  flavorSourcesByItem: Record<string, AdminFlavorSource[]>
  locationNameById: Record<string, string>
}

// One row per Square item, one per-location row folded into `rows` — keeps
// hiding an item at one location from silently leaving it visible at the
// other, which isn't obvious when each location's row is listed separately.
interface GroupedItem {
  groupKey: string
  name: string
  image_url: string | null
  rows: AdminMenuItem[]
}

export function CategoryManager({ initialCategories, allItems, flavorSourcesByItem, locationNameById }: CategoryManagerProps) {
  const [categories, setCategories] = useState(initialCategories)
  const [items, setItems] = useState(allItems)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [errorKey, setErrorKey] = useState<string | null>(null)

  const itemsByCategory = useMemo(() => {
    const groupsByKey = new Map<string, GroupedItem>()
    const byCategory = new Map<string, GroupedItem[]>()

    items.forEach((item) => {
      if (!item.square_category_id) return
      const groupKey = item.square_item_id ?? item.id
      let group = groupsByKey.get(groupKey)
      if (!group) {
        group = { groupKey, name: item.name, image_url: item.image_url, rows: [] }
        groupsByKey.set(groupKey, group)
        const list = byCategory.get(item.square_category_id) ?? []
        list.push(group)
        byCategory.set(item.square_category_id, list)
      }
      group.rows.push(item)
    })

    for (const list of Array.from(byCategory.values())) {
      list.sort((a: GroupedItem, b: GroupedItem) => a.name.localeCompare(b.name))
      for (const group of list) {
        group.rows.sort((a: AdminMenuItem, b: AdminMenuItem) =>
          (locationNameById[a.location_id] ?? '').localeCompare(locationNameById[b.location_id] ?? '')
        )
      }
    }
    return byCategory
  }, [items, locationNameById])

  async function updateCategory(
    squareCategoryId: string,
    patch: { emoji?: string | null; color?: string | null; is_visible?: boolean }
  ) {
    const previous = categories
    setCategories((cs) =>
      cs.map((c) => (c.square_category_id === squareCategoryId ? { ...c, ...patch } : c))
    )
    setSavingKey(squareCategoryId)
    setErrorKey(null)

    const res = await fetch('/api/admin/categories', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ square_category_id: squareCategoryId, ...patch }),
    })

    setSavingKey(null)
    if (!res.ok) {
      setCategories(previous)
      setErrorKey(squareCategoryId)
    }
  }

  async function updateItem(
    itemId: string,
    patch: {
      is_available?: boolean
      flavor_source_type?: 'modifier' | 'variation' | null
      flavor_modifier_list_id?: string | null
      required_flavor_count?: number | null
    }
  ) {
    const previous = items
    setItems((its) => its.map((i) => (i.id === itemId ? { ...i, ...patch } : i)))
    setSavingKey(itemId)
    setErrorKey(null)

    const res = await fetch('/api/admin/menu-items', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: itemId, ...patch }),
    })

    setSavingKey(null)
    if (!res.ok) {
      setItems(previous)
      setErrorKey(itemId)
    }
  }

  // Flavor-picker config is conceptually one setting per item, not per
  // location — apply it to every location's row for this item at once so
  // they can't drift out of sync with each other.
  function updateFlavorConfig(
    group: GroupedItem,
    patch: {
      flavor_source_type?: 'modifier' | 'variation' | null
      flavor_modifier_list_id?: string | null
      required_flavor_count?: number | null
    }
  ) {
    group.rows.forEach((row) => updateItem(row.id, patch))
  }

  // Encodes a flavor source as a single <select> value: "modifier:<listId>" or "variation:variation"
  function sourceValue(item: AdminMenuItem): string {
    if (!item.flavor_source_type) return ''
    if (item.flavor_source_type === 'variation') return 'variation:variation'
    return `modifier:${item.flavor_modifier_list_id ?? ''}`
  }

  function handleSourceChange(group: GroupedItem, value: string) {
    if (!value) {
      updateFlavorConfig(group, { flavor_source_type: null, flavor_modifier_list_id: null, required_flavor_count: null })
      return
    }
    const [type, id] = value.split(':') as ['modifier' | 'variation', string]
    updateFlavorConfig(group, {
      flavor_source_type: type,
      flavor_modifier_list_id: type === 'modifier' ? id : null,
      required_flavor_count: group.rows[0].required_flavor_count ?? 1,
    })
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {categories.map((c) => {
        const style = getCategoryStyle(c.square_category_id, c.emoji, c.color)
        const categoryItems = itemsByCategory.get(c.square_category_id) ?? []
        const isExpanded = expanded === c.square_category_id

        return (
          <div key={c.square_category_id} className="border-b border-dark/5 last:border-0">
            {/* Category row */}
            <div className="flex flex-wrap items-center gap-4 px-5 py-3">
              <button
                onClick={() => setExpanded(isExpanded ? null : c.square_category_id)}
                className="flex items-center gap-2 flex-1 min-w-[200px] text-left"
              >
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                  style={{ backgroundColor: style.color + '33' }}
                >
                  {style.emoji}
                </span>
                <div>
                  <div className="font-body text-dark">{c.square_category_name}</div>
                  <div className="text-dark/40 text-xs">{categoryItems.length} item{categoryItems.length !== 1 ? 's' : ''}</div>
                </div>
              </button>

              <input
                type="text"
                value={c.emoji ?? ''}
                onChange={(e) => updateCategory(c.square_category_id, { emoji: e.target.value || null })}
                placeholder={style.emoji}
                maxLength={4}
                className="w-14 border border-dark/15 rounded-lg px-2 py-1.5 text-center font-body text-sm"
                title="Emoji"
              />
              <input
                type="text"
                value={c.color ?? ''}
                onChange={(e) => updateCategory(c.square_category_id, { color: e.target.value || null })}
                placeholder={style.color}
                className="w-24 border border-dark/15 rounded-lg px-2 py-1.5 font-body text-sm"
                title="Color (hex)"
              />

              <label className="inline-flex items-center gap-2 cursor-pointer font-body text-sm">
                <input
                  type="checkbox"
                  checked={c.is_visible}
                  onChange={(e) => updateCategory(c.square_category_id, { is_visible: e.target.checked })}
                />
                <span className="text-dark/70 w-16">
                  {savingKey === c.square_category_id
                    ? 'Saving…'
                    : errorKey === c.square_category_id
                    ? 'Failed'
                    : c.is_visible
                    ? 'Visible'
                    : 'Hidden'}
                </span>
              </label>
            </div>

            {/* Items in this category */}
            {isExpanded && (
              <div className="bg-cream/30 px-5 py-3">
                {categoryItems.length === 0 ? (
                  <p className="font-body text-dark/40 text-sm py-2">No items synced in this category yet.</p>
                ) : (
                  <table className="w-full text-left font-body text-sm">
                    <tbody>
                      {categoryItems.map((group) => {
                        const sources = flavorSourcesByItem[group.rows[0].id] ?? []
                        return (
                        <tr key={group.groupKey} className="border-b border-dark/5 last:border-0 align-top">
                          <td className="py-2 pr-3 w-10">
                            <div className="relative w-8 h-8 rounded-md overflow-hidden bg-white flex-shrink-0">
                              {group.image_url ? (
                                <Image src={group.image_url} alt={group.name} fill className="object-cover" sizes="32px" />
                              ) : (
                                <span className="flex items-center justify-center w-full h-full text-xs">{style.emoji}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-2 pr-3 text-dark">
                            {group.name}
                            {sources.length > 0 && (
                              <div className="flex items-center gap-2 mt-1.5">
                                <select
                                  value={sourceValue(group.rows[0])}
                                  onChange={(e) => handleSourceChange(group, e.target.value)}
                                  className="border border-dark/15 rounded-lg px-2 py-1 text-xs bg-white"
                                >
                                  <option value="">— No flavor picker —</option>
                                  {sources.map((s) => (
                                    <option key={`${s.type}:${s.id}`} value={`${s.type}:${s.id}`}>
                                      {s.label}
                                    </option>
                                  ))}
                                </select>
                                {group.rows[0].flavor_source_type && (
                                  <label className="flex items-center gap-1 text-xs text-dark/60">
                                    Requires
                                    <input
                                      type="number"
                                      min={1}
                                      value={group.rows[0].required_flavor_count ?? 1}
                                      onChange={(e) =>
                                        updateFlavorConfig(group, { required_flavor_count: Number(e.target.value) || 1 })
                                      }
                                      className="w-12 border border-dark/15 rounded-lg px-1.5 py-1 text-center"
                                    />
                                    flavors
                                  </label>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="py-2 text-right">
                            <div className="flex flex-col gap-1.5 items-end">
                              {group.rows.map((row) => (
                                <label key={row.id} className="inline-flex items-center gap-2 cursor-pointer">
                                  <span className="text-dark/40 text-xs w-24 text-right">
                                    {locationNameById[row.location_id] ?? 'Unknown'} · ${Number(row.price).toFixed(2)}
                                  </span>
                                  <input
                                    type="checkbox"
                                    checked={row.is_available}
                                    onChange={(e) => updateItem(row.id, { is_available: e.target.checked })}
                                  />
                                  <span className="text-dark/70 w-16">
                                    {savingKey === row.id
                                      ? 'Saving…'
                                      : errorKey === row.id
                                      ? 'Failed'
                                      : row.is_available
                                      ? 'Visible'
                                      : 'Hidden'}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </td>
                        </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

import { FilterCategory, DrinkCategory, CATEGORY_META } from '@/types/menu'

interface MenuFilterProps {
  active: FilterCategory
  onChange: (category: FilterCategory) => void
  counts?: Partial<Record<FilterCategory, number>>
}

const FILTERS: { label: string; value: FilterCategory }[] = [
  { label: 'All',           value: 'all' },
  { label: 'Beach Bombs',   value: 'beach_bomb' },
  { label: 'Protein Shakes',value: 'protein_shake' },
  { label: 'Blenders',      value: 'blender' },
  { label: 'Energy Drinks', value: 'energy_drink' },
  { label: 'Food',          value: 'food' },
]

export function MenuFilter({ active, onChange, counts }: MenuFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((f) => {
        const isActive = active === f.value
        const color = f.value === 'all'
          ? '#EC8A1E'
          : CATEGORY_META[f.value as DrinkCategory].color
        const count = counts?.[f.value]

        return (
          <button
            key={f.value}
            onClick={() => onChange(f.value)}
            className="flex items-center gap-1.5 font-body font-700 text-sm px-4 py-2 rounded-full transition-all hover:scale-[1.03] active:scale-[0.97]"
            style={
              isActive
                ? { backgroundColor: color, color: 'white', boxShadow: `0 2px 8px ${color}55` }
                : { backgroundColor: 'white', color: '#2C2C2C', border: '1.5px solid #9BBDCF' }
            }
          >
            {f.label}
            {count != null && (
              <span
                className="text-xs px-1.5 py-0.5 rounded-full leading-none"
                style={
                  isActive
                    ? { backgroundColor: 'rgba(255,255,255,0.3)', color: 'white' }
                    : { backgroundColor: '#FFF8EE', color: '#2C2C2C' }
                }
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

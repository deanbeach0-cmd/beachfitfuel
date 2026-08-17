export interface CategoryFilterOption {
  value: string // category_name
  emoji: string
  color: string
}

interface MenuFilterProps {
  active: string // category_name, or 'all'
  onChange: (category: string) => void
  categories: CategoryFilterOption[]
  counts?: Record<string, number>
}

export function MenuFilter({ active, onChange, categories, counts }: MenuFilterProps) {
  const filters = [{ value: 'all', label: 'All', color: '#EC8A1E' }, ...categories.map((c) => ({
    value: c.value,
    label: `${c.emoji} ${c.value}`,
    color: c.color,
  }))]

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((f) => {
        const isActive = active === f.value
        const count = counts?.[f.value]

        return (
          <button
            key={f.value}
            onClick={() => onChange(f.value)}
            className="flex items-center gap-1.5 font-body font-700 text-sm px-4 py-2 rounded-full transition-all hover:scale-[1.03] active:scale-[0.97]"
            style={
              isActive
                ? { backgroundColor: f.color, color: 'white', boxShadow: `0 2px 8px ${f.color}55` }
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

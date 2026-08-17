'use client'

import { useEffect, useMemo, useState } from 'react'
import { FlavorOption } from '@/types/menu'
import { FlavorSelection } from '@/types/pickup'

interface FlavorPickerProps {
  options: FlavorOption[]
  requiredCount: number
  onChange: (selections: FlavorSelection[], total: number) => void
}

export function FlavorPicker({ options, requiredCount, onChange }: FlavorPickerProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  const total = useMemo(
    () => Object.values(quantities).reduce((sum, q) => sum + q, 0),
    [quantities]
  )

  useEffect(() => {
    const selections: FlavorSelection[] = options
      .filter((o) => (quantities[o.id] ?? 0) > 0)
      .map((o) => ({ name: o.name, quantity: quantities[o.id] }))
    onChange(selections, total)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quantities])

  function adjust(id: string, delta: number) {
    setQuantities((q) => {
      if (delta > 0 && total >= requiredCount) return q
      const next = Math.max(0, (q[id] ?? 0) + delta)
      return { ...q, [id]: next }
    })
  }

  const remaining = requiredCount - total

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <label className="font-body font-bold text-dark text-sm uppercase tracking-widest">
          Choose {requiredCount} Flavor{requiredCount !== 1 ? 's' : ''}
        </label>
        <span
          className="font-body font-bold text-xs px-3 py-1 rounded-full whitespace-nowrap"
          style={
            remaining === 0
              ? { backgroundColor: '#6FBDB822', color: '#6FBDB8' }
              : { backgroundColor: '#FF7B9D22', color: '#FF7B9D' }
          }
        >
          {remaining === 0 ? `${total}/${requiredCount} picked` : `${remaining} more to pick`}
        </span>
      </div>

      <div className="flex flex-col divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden max-h-80 overflow-y-auto">
        {options.map((opt) => {
          const qty = quantities[opt.id] ?? 0
          return (
            <div key={opt.id} className="flex items-center justify-between px-4 py-2.5">
              <span className="font-body text-sm text-dark">{opt.name}</span>
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => adjust(opt.id, -1)}
                  disabled={qty === 0}
                  className="w-7 h-7 rounded-full border border-gray-200 font-bold text-xs text-dark hover:border-gray-400 transition-colors disabled:opacity-30"
                >
                  −
                </button>
                <span className="font-body font-bold text-dark text-sm w-4 text-center">{qty}</span>
                <button
                  type="button"
                  onClick={() => adjust(opt.id, 1)}
                  disabled={total >= requiredCount}
                  className="w-7 h-7 rounded-full border border-gray-200 font-bold text-xs text-dark hover:border-gray-400 transition-colors disabled:opacity-30"
                >
                  +
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

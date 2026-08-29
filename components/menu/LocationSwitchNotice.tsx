'use client'

import { useEffect, useState } from 'react'
import { usePickupCartStore } from '@/lib/pickup-cart-store'

// Brief, auto-dismissing notice shown right after addItem cleared a cart
// that had items from the other location — a pickup order can only be
// fulfilled at one physical location.
export function LocationSwitchNotice() {
  const justSwitchedLocation = usePickupCartStore((s) => s.justSwitchedLocation)
  const acknowledgeLocationSwitch = usePickupCartStore((s) => s.acknowledgeLocationSwitch)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!justSwitchedLocation) return
    setVisible(true)
    const timeout = setTimeout(() => {
      setVisible(false)
      acknowledgeLocationSwitch()
    }, 5000)
    return () => clearTimeout(timeout)
  }, [justSwitchedLocation, acknowledgeLocationSwitch])

  if (!visible) return null

  return (
    <div className="font-body text-sm bg-sky/10 border border-sky/30 rounded-xl px-4 py-3 text-dark/70">
      Started a new order here — your cart from the other location was cleared, since pickup can only happen at one spot.
    </div>
  )
}

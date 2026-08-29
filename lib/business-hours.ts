import { getLocation, LocationSlug } from './locations'

interface ZonedNow {
  dayOfWeek: number
  minutesSinceMidnight: number
  /** Midnight (00:00) of this same zoned day, as a real Date */
  startOfDay: Date
}

function zonedNow(reference: Date, timezone: string): ZonedNow {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    weekday: 'short',
  }).formatToParts(reference)

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '0'
  let hour = Number(get('hour'))
  if (hour === 24) hour = 0
  const minute = Number(get('minute'))
  const weekdayShort = get('weekday')

  const weekdayIndex: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }

  // Midnight of the zoned day, expressed as a UTC instant computed by
  // offsetting from the reference instant — safe across DST since we only
  // use this to add minute offsets, not to re-derive wall-clock time.
  const startOfDay = new Date(reference.getTime() - (hour * 60 + minute) * 60_000)

  return {
    dayOfWeek: weekdayIndex[weekdayShort] ?? 0,
    minutesSinceMidnight: hour * 60 + minute,
    startOfDay,
  }
}

export interface PickupSlot {
  label: string
  iso: string
}

export interface PickupAvailability {
  /** Store is open right now and ASAP/relative-offset pickup is valid. */
  openNow: boolean
  /** Relative offsets (in minutes) still valid today, e.g. [15, 30, 45, 60]. */
  validOffsetMinutes: number[]
  /** Only populated when the store is closed (or about to close) right now. */
  nextDay?: {
    label: string
    slots: PickupSlot[]
  }
}

const OFFSET_OPTIONS = [15, 30, 45, 60]
const SLOT_INTERVAL_MINUTES = 30

export function getPickupAvailability(locationSlug: LocationSlug, reference: Date = new Date()): PickupAvailability {
  const location = getLocation(locationSlug)
  if (!location) return { openNow: false, validOffsetMinutes: [] }

  const { hours: HOURS, timezone } = location
  const now = zonedNow(reference, timezone)
  const today = HOURS[now.dayOfWeek]

  if (today && now.minutesSinceMidnight >= today.openMinutes && now.minutesSinceMidnight < today.closeMinutes) {
    const validOffsetMinutes = OFFSET_OPTIONS.filter(
      (m) => now.minutesSinceMidnight + m <= today.closeMinutes
    )
    return { openNow: true, validOffsetMinutes }
  }

  // Closed — find the next day (starting today if it just hasn't opened yet) with hours.
  for (let daysAhead = 0; daysAhead < 8; daysAhead++) {
    const dayIndex = (now.dayOfWeek + daysAhead) % 7
    const hours = HOURS[dayIndex]
    if (!hours) continue

    // If checking today, only valid if we're before opening (not after closing).
    if (daysAhead === 0 && now.minutesSinceMidnight >= hours.closeMinutes) continue

    const dayStart = new Date(now.startOfDay.getTime() + daysAhead * 24 * 60 * 60_000)
    const slots: PickupSlot[] = []
    for (let m = hours.openMinutes; m < hours.closeMinutes; m += SLOT_INTERVAL_MINUTES) {
      const slotDate = new Date(dayStart.getTime() + m * 60_000)
      const label = slotDate.toLocaleTimeString('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        minute: '2-digit',
      })
      slots.push({ label, iso: slotDate.toISOString() })
    }

    return {
      openNow: false,
      validOffsetMinutes: [],
      nextDay: { label: daysAhead === 0 ? 'Today' : hours.label, slots },
    }
  }

  // Should never happen (Mon–Sat all have hours) — fail safe with no slots.
  return { openNow: false, validOffsetMinutes: [] }
}

/** Server-side guard: is this ISO timestamp actually within business hours? */
export function isWithinBusinessHours(locationSlug: LocationSlug, iso: string): boolean {
  const location = getLocation(locationSlug)
  if (!location) return false

  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return false
  const zoned = zonedNow(date, location.timezone)
  const hours = location.hours[zoned.dayOfWeek]
  if (!hours) return false
  return zoned.minutesSinceMidnight >= hours.openMinutes && zoned.minutesSinceMidnight < hours.closeMinutes
}

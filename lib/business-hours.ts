import type { DayHours } from './locations'

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
  /** Store is open right now and relative-offset pickup is valid. */
  openNow: boolean
  /** Relative offsets (in minutes) still valid today, e.g. [15, 30, 45, 60]. */
  validOffsetMinutes: number[]
  /** Set only when the store is physically open but online ordering hasn't
   *  started yet (we hold orders for PICKUP_OPEN_BUFFER_MINUTES after the
   *  doors open). Lets the UI say "online ordering opens at 6:30 AM" rather
   *  than claiming we're closed while staff are serving walk-ins. */
  orderingOpensAt?: string
  /** Only populated when the store is closed (or about to close) right now. */
  nextDay?: {
    label: string
    slots: PickupSlot[]
  }
}

const OFFSET_OPTIONS = [15, 30, 45, 60]
const SLOT_INTERVAL_MINUTES = 30

// Staff need prep time right at open — online pickup ordering (the earliest
// bookable slot) doesn't start until this long after the store's real opening
// time. Closing time is unaffected.
export const PICKUP_OPEN_BUFFER_MINUTES = 30

// The kitchen can never turn an order around instantly, so no online order is
// ever promised sooner than this. There is deliberately no "ASAP" option.
export const MIN_PICKUP_LEAD_MINUTES = 15

function slotLabel(dayStart: Date, minutes: number, timezone: string): { label: string; iso: string } {
  const date = new Date(dayStart.getTime() + minutes * 60_000)
  return {
    label: date.toLocaleTimeString('en-US', { timeZone: timezone, hour: 'numeric', minute: '2-digit' }),
    iso: date.toISOString(),
  }
}

export function getPickupAvailability(
  HOURS: Record<number, DayHours | null>,
  timezone: string,
  reference: Date = new Date()
): PickupAvailability {
  const now = zonedNow(reference, timezone)
  const today = HOURS[now.dayOfWeek]

  if (today) {
    const orderingOpensAt = today.openMinutes + PICKUP_OPEN_BUFFER_MINUTES
    if (now.minutesSinceMidnight >= orderingOpensAt && now.minutesSinceMidnight < today.closeMinutes) {
      // Strictly before closing: isWithinBusinessHours rejects a pickup at
      // exactly closeMinutes, so offering that offset here would push the
      // customer into a 400 *after* they'd already entered their card.
      const validOffsetMinutes = OFFSET_OPTIONS.filter(
        (m) => now.minutesSinceMidnight + m < today.closeMinutes
      )
      // Too late in the day for even the shortest offset — fall through to the
      // next-day picker instead of rendering an empty, unsubmittable form.
      if (validOffsetMinutes.length > 0) {
        return { openNow: true, validOffsetMinutes }
      }
    }
  }

  // Closed — find the next day (starting today if it just hasn't opened yet, or
  // is still inside the post-opening buffer) with hours.
  for (let daysAhead = 0; daysAhead < 8; daysAhead++) {
    const dayIndex = (now.dayOfWeek + daysAhead) % 7
    const hours = HOURS[dayIndex]
    if (!hours) continue

    // If checking today, only valid if we're before closing.
    if (daysAhead === 0 && now.minutesSinceMidnight >= hours.closeMinutes) continue

    // A slot later today still has to be far enough out to actually make.
    const earliestToday =
      daysAhead === 0 ? now.minutesSinceMidnight + MIN_PICKUP_LEAD_MINUTES : -Infinity

    const dayStart = new Date(now.startOfDay.getTime() + daysAhead * 24 * 60 * 60_000)
    const slots: PickupSlot[] = []
    for (let m = hours.openMinutes + PICKUP_OPEN_BUFFER_MINUTES; m < hours.closeMinutes; m += SLOT_INTERVAL_MINUTES) {
      if (m < earliestToday) continue
      slots.push(slotLabel(dayStart, m, timezone))
    }
    if (slots.length === 0) continue

    // Physically open, but inside the post-opening buffer — say so honestly.
    const inOpeningBuffer =
      daysAhead === 0 &&
      now.minutesSinceMidnight >= hours.openMinutes &&
      now.minutesSinceMidnight < hours.openMinutes + PICKUP_OPEN_BUFFER_MINUTES

    return {
      openNow: false,
      validOffsetMinutes: [],
      orderingOpensAt: inOpeningBuffer
        ? slotLabel(dayStart, hours.openMinutes + PICKUP_OPEN_BUFFER_MINUTES, timezone).label
        : undefined,
      nextDay: { label: daysAhead === 0 ? 'Today' : hours.label, slots },
    }
  }

  // Should never happen (Mon–Sat all have hours) — fail safe with no slots.
  return { openNow: false, validOffsetMinutes: [] }
}

/** Server-side guard: is this ISO timestamp actually within business hours? */
export function isWithinBusinessHours(HOURS: Record<number, DayHours | null>, timezone: string, iso: string): boolean {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return false
  const zoned = zonedNow(date, timezone)
  const hours = HOURS[zoned.dayOfWeek]
  if (!hours) return false
  return (
    zoned.minutesSinceMidnight >= hours.openMinutes + PICKUP_OPEN_BUFFER_MINUTES &&
    zoned.minutesSinceMidnight < hours.closeMinutes
  )
}

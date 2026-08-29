// Central per-location config — address and hours. Safe to import from
// client components: no 'square' SDK import here, unlike lib/square.ts.
//
// Note: the Web Payments SDK's client-side location ID (NEXT_PUBLIC_SQUARE_LOCATION_ID)
// is intentionally shared across both locations, not per-location — it only
// affects which payment methods are offered, and doesn't lock the resulting
// card token to that location. The server decides which location an order
// actually settles against via SQUARE_LOCATION_ID_BATTLE_CREEK/MARSHALL.

export type LocationSlug = 'marshall' | 'battle-creek'

export interface DayHours {
  openMinutes: number // minutes since midnight, e.g. 6:00 AM = 360
  closeMinutes: number
  label: string
}

export interface LocationConfig {
  slug: LocationSlug
  name: string
  address: string
  city: string
  state: string
  zip: string
  phoneDisplay: string
  phoneHref: string
  timezone: string
  /** 0 = Sunday ... 6 = Saturday, matching Date#getDay() */
  hours: Record<number, DayHours | null>
}

export const LOCATIONS: Record<LocationSlug, LocationConfig> = {
  marshall: {
    slug: 'marshall',
    name: 'Marshall',
    address: '205 W Michigan Ave',
    city: 'Marshall',
    state: 'MI',
    zip: '49068',
    phoneDisplay: '(269) 234-3645',
    phoneHref: 'tel:+12692343645',
    timezone: 'America/Detroit',
    hours: {
      0: null,
      1: { openMinutes: 360, closeMinutes: 990, label: 'Monday' },
      2: { openMinutes: 360, closeMinutes: 990, label: 'Tuesday' },
      3: { openMinutes: 360, closeMinutes: 990, label: 'Wednesday' },
      4: { openMinutes: 360, closeMinutes: 990, label: 'Thursday' },
      5: { openMinutes: 360, closeMinutes: 990, label: 'Friday' },
      6: { openMinutes: 540, closeMinutes: 930, label: 'Saturday' }, // 9:00 AM – 3:30 PM
    },
  },
  'battle-creek': {
    slug: 'battle-creek',
    name: 'Battle Creek',
    address: '1000 Territorial Rd W',
    city: 'Battle Creek',
    state: 'MI',
    zip: '49015',
    phoneDisplay: '(269) 456-1905',
    phoneHref: 'tel:+12694561905',
    timezone: 'America/Detroit',
    hours: {
      0: null,
      1: { openMinutes: 360, closeMinutes: 990, label: 'Monday' },
      2: { openMinutes: 360, closeMinutes: 990, label: 'Tuesday' },
      3: { openMinutes: 360, closeMinutes: 990, label: 'Wednesday' },
      4: { openMinutes: 360, closeMinutes: 990, label: 'Thursday' },
      5: { openMinutes: 360, closeMinutes: 990, label: 'Friday' },
      6: { openMinutes: 540, closeMinutes: 840, label: 'Saturday' }, // 9:00 AM – 2:00 PM
    },
  },
}

export function isLocationSlug(value: string): value is LocationSlug {
  return value === 'marshall' || value === 'battle-creek'
}

export function getLocation(slug: string): LocationConfig | null {
  return isLocationSlug(slug) ? LOCATIONS[slug] : null
}

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function formatClockTime(minutesSinceMidnight: number): string {
  const h24 = Math.floor(minutesSinceMidnight / 60)
  const m = minutesSinceMidnight % 60
  const period = h24 >= 12 ? 'PM' : 'AM'
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  return `${h12}:${String(m).padStart(2, '0')} ${period}`
}

function sameHours(a: DayHours | null, b: DayHours | null): boolean {
  if (!a && !b) return true
  if (!a || !b) return false
  return a.openMinutes === b.openMinutes && a.closeMinutes === b.closeMinutes
}

export interface HoursRow {
  day: string
  hours: string
}

/** Compact display rows (e.g. "Mon – Fri", "Saturday", "Sunday"), grouping
 *  consecutive days that share identical hours. Monday-first, Sunday last. */
export function getDisplayHoursRows(location: LocationConfig): HoursRow[] {
  const order = [1, 2, 3, 4, 5, 6, 0]
  const rows: HoursRow[] = []
  let i = 0
  while (i < order.length) {
    const today = location.hours[order[i]]
    const hoursLabel = today ? `${formatClockTime(today.openMinutes)} – ${formatClockTime(today.closeMinutes)}` : 'Closed'

    let j = i
    while (j + 1 < order.length && sameHours(location.hours[order[j + 1]], today)) j++

    const dayLabel = i === j ? DAY_LABELS[order[i]] : `${DAY_ABBR[order[i]]} – ${DAY_ABBR[order[j]]}`
    rows.push({ day: dayLabel, hours: hoursLabel })
    i = j + 1
  }
  return rows
}

import { createServerComponentClient } from '@/lib/supabase'
import { LOCATIONS, LocationSlug, DayHours } from '@/lib/locations'

/**
 * The live, synced hours for a location — pulled from Supabase's
 * `locations.hours` column, which the Square sync keeps fresh
 * (app/api/square/sync/route.ts). Falls back to the static default in
 * lib/locations.ts if that column is still empty (e.g. before the first
 * sync run after this was added).
 */
export async function getLocationHours(slug: LocationSlug): Promise<Record<number, DayHours | null>> {
  const supabase = await createServerComponentClient()
  const { data } = await supabase.from('locations').select('hours').eq('slug', slug).single()

  if (data?.hours && typeof data.hours === 'object') {
    return data.hours as Record<number, DayHours | null>
  }
  return LOCATIONS[slug].hours
}

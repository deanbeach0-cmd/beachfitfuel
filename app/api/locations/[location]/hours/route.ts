import { NextRequest, NextResponse } from 'next/server'
import { isLocationSlug, LOCATIONS } from '@/lib/locations'
import { getLocationHours } from '@/lib/location-hours'
import { getPickupAvailability } from '@/lib/business-hours'

// Public, no auth needed — just today's pickup availability for a location.
// Kept as a small JSON endpoint (rather than having the client query
// Supabase directly) so pages like the order form don't have to pull the
// whole Supabase SDK into their client bundle just to read business hours.
export async function GET(request: NextRequest, { params }: { params: { location: string } }) {
  if (!isLocationSlug(params.location)) {
    return NextResponse.json({ error: 'Unknown location' }, { status: 404 })
  }

  const hours = await getLocationHours(params.location)
  const availability = getPickupAvailability(hours, LOCATIONS[params.location].timezone)

  return NextResponse.json(availability)
}

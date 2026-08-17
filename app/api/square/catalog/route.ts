import { NextRequest, NextResponse } from 'next/server'
import { squareClient } from '@/lib/square'

// Debug endpoint — returns raw Square catalog items so you can verify what Square sees.
// Protected with the same SYNC_SECRET as /api/square/sync.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const syncSecret = process.env.SYNC_SECRET

  if (!syncSecret || authHeader !== `Bearer ${syncSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const items: unknown[] = []

    const page = await squareClient.catalog.list({ types: 'ITEM' })
    for await (const item of page) {
      items.push(item)
    }

    // BigInt (used for prices) can't be serialized by JSON.stringify natively
    const body = JSON.stringify(
      { count: items.length, items },
      (_, v) => (typeof v === 'bigint' ? Number(v) : v)
    )
    return new Response(body, { headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'

export async function GET() {
  const apiKey = process.env.PRINTFUL_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: 'PRINTFUL_API_KEY is not set in .env.local' }, { status: 500 })
  }

  try {
    const res = await fetch('https://api.printful.com/sync/products', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    const text = await res.text()
    let json: unknown
    try {
      json = JSON.parse(text)
    } catch {
      json = text
    }

    return NextResponse.json({
      status: res.status,
      ok: res.ok,
      response: json,
    })
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : 'Unknown fetch error',
    }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase'

export async function POST(request: Request) {
  const body = await request.json()
  const { email, firstName, locationPreference } = body

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }

  const supabase = await createServerComponentClient()

  const { error } = await supabase.from('email_signups').insert({
    email: email.toLowerCase().trim(),
    first_name: firstName ?? null,
    location_preference: locationPreference ?? 'both',
    source: 'website',
  })

  if (error) {
    // Postgres unique violation code
    if (error.code === '23505') {
      return NextResponse.json({ message: "You're already on our list! We'll keep you posted. 🌴" })
    }
    console.error('Newsletter signup error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ message: "You're on the list! Expect good vibes in your inbox. 🌴" })
}

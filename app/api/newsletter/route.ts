import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { resend, FROM_EMAIL } from '@/lib/resend'
import { newsletterWelcomeEmail } from '@/lib/email-templates'

// Server-only route — uses the service role client (like /api/square/sync
// and the admin routes) since email_signups has RLS enabled with no anon
// INSERT policy. The anon SSR client (createServerComponentClient) would
// fail here with a row-level security violation.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const body = await request.json()
  const { email, firstName, locationPreference } = body

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }

  const { error } = await supabaseAdmin.from('email_signups').insert({
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

  // Only send the welcome email on a genuinely new signup, never a resubmit.
  try {
    const { subject, html } = newsletterWelcomeEmail({ firstName })
    await resend.emails.send({ from: FROM_EMAIL, to: email, subject, html })
  } catch (err) {
    console.error('[newsletter] Welcome email failed', err)
  }

  return NextResponse.json({ message: "You're on the list! Expect good vibes in your inbox. 🌴" })
}

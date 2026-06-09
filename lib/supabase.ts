import { createBrowserClient, createServerClient } from '@supabase/ssr'
import type { CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl      = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// For Client Components
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// For Server Components, Route Handlers, and Server Actions
export async function createServerComponentClient() {
  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Called from a Server Component — reads are fine, writes are a no-op
        }
      },
    },
  })
}

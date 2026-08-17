// Single shared-password gate for /admin — same lightweight model as
// SYNC_SECRET, not a full user-auth system. Works in both the Edge
// middleware runtime and Node route handlers via the global Web Crypto API.
export const ADMIN_SESSION_COOKIE = 'beachfit_admin_session'

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function adminSessionToken(): Promise<string> {
  const password = process.env.ADMIN_PASSWORD
  if (!password) throw new Error('ADMIN_PASSWORD is not set')
  return sha256Hex(password)
}

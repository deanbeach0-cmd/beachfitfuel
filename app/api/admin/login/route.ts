import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_SESSION_COOKIE, adminSessionToken } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  const { password } = (await request.json()) as { password?: string }
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword || password !== adminPassword) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }

  const token = await adminSessionToken()
  const response = NextResponse.json({ success: true })
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
  return response
}

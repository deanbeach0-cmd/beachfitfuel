import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_SESSION_COOKIE, adminSessionToken } from '@/lib/admin-auth'

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/admin/login' || pathname === '/api/admin/login') {
    return NextResponse.next()
  }

  const cookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  const expected = await adminSessionToken()

  if (cookie === expected) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const loginUrl = new URL('/admin/login', request.url)
  return NextResponse.redirect(loginUrl)
}

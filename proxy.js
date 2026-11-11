import { NextResponse } from 'next/server'
import { SESSION_COOKIE, tokenIssuedAt } from '@/lib/sessionToken'

// A second lock on the admin area. Every admin page and API route still checks
// the session itself (lib/adminAuth.js); this is here so that one added later
// without that check isn't public.

// Reachable without a session: the login page, and the login / logout endpoint
const OPEN_PATHS = ['/admin/login', '/api/admin/session']

export function proxy(request) {
  const { pathname } = request.nextUrl
  if (OPEN_PATHS.includes(pathname)) return NextResponse.next()

  if (tokenIssuedAt(request.cookies.get(SESSION_COOKIE)?.value) !== null) return NextResponse.next()

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 })
  }
  return NextResponse.redirect(new URL('/admin/login', request.url))
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}

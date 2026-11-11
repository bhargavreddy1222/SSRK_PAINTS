import { cookies } from 'next/headers'
import {
  SESSION_COOKIE, SESSION_MAX_AGE,
  adminSetupProblem, checkPassword, createSessionToken, isAdmin, revokeAllSessions,
} from '@/lib/adminAuth'
import { clientIp, createRateLimiter } from '@/lib/rateLimit'

// Slow down password guessing: 5 failed tries per IP per 15 minutes.
const failures = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 5 })
// ...and 20 from everywhere combined, so switching IPs (or faking one) doesn't
// buy more guesses. While this is tripped nobody can log in, including the owner.
const allFailures = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 20 })
const EVERYONE = 'all'

// POST /api/admin/session  { password }  → log in
export async function POST(request) {
  const setupProblem = adminSetupProblem()
  if (setupProblem) {
    return Response.json({ error: setupProblem }, { status: 503 })
  }

  const ip = clientIp(request)
  if (failures.isLimited(ip) || allFailures.isLimited(EVERYONE)) {
    return Response.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 })
  }

  const { password } = await request.json().catch(() => ({}))
  // Ignore stray spaces from copy-paste / autofill
  if (typeof password !== 'string' || !checkPassword(password.trim())) {
    failures.hit(ip)
    allFailures.hit(EVERYONE)
    return Response.json({ error: 'Wrong password' }, { status: 401 })
  }

  failures.clear(ip)
  const store = await cookies()
  store.set(SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path:     '/',
    maxAge:   SESSION_MAX_AGE,
  })
  return Response.json({ success: true })
}

// DELETE /api/admin/session  → log out, on this device and every other one
export async function DELETE() {
  // Only a real session may end the others, or anyone could keep logging the owner out
  if (await isAdmin()) await revokeAllSessions()
  const store = await cookies()
  store.delete(SESSION_COOKIE)
  return Response.json({ success: true })
}

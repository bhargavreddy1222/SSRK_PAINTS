import 'server-only'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { SESSION_COOKIE, tokenIssuedAt } from '@/lib/sessionToken'

// ⚠️ Server-side only.
// Admin login = one shared password (ADMIN_PASSWORD) + a signed, httpOnly
// session cookie (lib/sessionToken.js).
//
// Logging out signs out every device: the time of the last logout is kept in
// the `admin_state` table and cookies issued before it stop working, so a
// copied cookie dies with the logout instead of living on for a week.
// Until supabase/setup.sql has created that table, logout only clears the
// cookie on the device that pressed it.

export { SESSION_COOKIE, SESSION_MAX_AGE, adminSetupProblem, checkPassword, createSessionToken } from '@/lib/sessionToken'

// The logout time is read at most this often per server instance
const CACHE_MS = 30 * 1000
let validFrom = { value: 0, readAt: 0 }

async function sessionsValidFrom() {
  if (Date.now() - validFrom.readAt < CACHE_MS) return validFrom.value

  const { data, error } = await supabaseAdmin
    .from('admin_state')
    .select('sessions_valid_from')
    .eq('id', 1)
    .maybeSingle()

  // Table missing or database unreachable: carry on with the signature check alone.
  // (With the database down there is nothing in the admin area to read anyway.)
  const value = !error && data?.sessions_valid_from ? Date.parse(data.sessions_valid_from) : 0
  validFrom = { value, readAt: Date.now() }
  return value
}

export async function isAdmin() {
  const store = await cookies()
  const issuedAt = tokenIssuedAt(store.get(SESSION_COOKIE)?.value)
  if (issuedAt === null) return false
  return issuedAt >= await sessionsValidFrom()
}

// Ends every session issued up to now. Returns false if it couldn't be recorded.
export async function revokeAllSessions() {
  const now = Date.now()
  const { error } = await supabaseAdmin
    .from('admin_state')
    .upsert({ id: 1, sessions_valid_from: new Date(now).toISOString() })
  if (error) return false
  validFrom = { value: now, readAt: Date.now() }
  return true
}

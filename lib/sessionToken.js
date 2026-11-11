import { createHmac, timingSafeEqual } from 'node:crypto'

// The admin session cookie: "<expiry>.<signature>", signed with
// ADMIN_SESSION_SECRET (and the password), so it can't be forged or extended.
// Changing either value logs out every existing session.
//
// Kept free of database and Next.js imports so proxy.js can use it too.

export const SESSION_COOKIE = 'admin_session'
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days, in seconds

const MIN_PASSWORD_LENGTH = 12
const MIN_SECRET_LENGTH   = 32

// This one password protects all prices and customer orders, so production
// refuses weak values instead of running with them.
export function adminSetupProblem() {
  const password = process.env.ADMIN_PASSWORD
  const secret   = process.env.ADMIN_SESSION_SECRET
  if (!password || !secret) {
    return 'Admin login is not set up. Add ADMIN_PASSWORD and ADMIN_SESSION_SECRET to the environment, then restart the server.'
  }
  if (process.env.NODE_ENV === 'production' && (password.length < MIN_PASSWORD_LENGTH || secret.length < MIN_SECRET_LENGTH)) {
    return `Admin login is turned off because its settings are too weak. ADMIN_PASSWORD needs at least ${MIN_PASSWORD_LENGTH} characters and ADMIN_SESSION_SECRET at least ${MIN_SECRET_LENGTH}. Update them, then restart the server.`
  }
  return null
}

function sign(value) {
  return createHmac('sha256', process.env.ADMIN_SESSION_SECRET).update(value).digest('base64url')
}

function safeEqual(a, b) {
  const bufA = Buffer.from(String(a))
  const bufB = Buffer.from(String(b))
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB)
}

export function checkPassword(password) {
  if (adminSetupProblem()) return false
  // Compare signatures so the check takes the same time for any input length
  return safeEqual(sign(`pw:${password}`), sign(`pw:${process.env.ADMIN_PASSWORD}`))
}

const signSession = expires => sign(`session:${expires}:${process.env.ADMIN_PASSWORD}`)

export function createSessionToken(now = Date.now()) {
  const expires = String(now + SESSION_MAX_AGE * 1000)
  return `${expires}.${signSession(expires)}`
}

// When a genuine, unexpired token was issued (ms), or null for anything else
export function tokenIssuedAt(token, now = Date.now()) {
  if (adminSetupProblem() || typeof token !== 'string') return null
  const [expires, signature, ...rest] = token.split('.')
  if (!expires || !signature || rest.length || !/^\d{1,16}$/.test(expires)) return null
  if (!safeEqual(signature, signSession(expires)) || Number(expires) <= now) return null
  return Number(expires) - SESSION_MAX_AGE * 1000
}

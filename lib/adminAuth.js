import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

// ⚠️ Server-side only.
// Admin login = one shared password (ADMIN_PASSWORD) + a signed,
// httpOnly session cookie. The cookie value is "<expiry>.<signature>",
// signed with ADMIN_SESSION_SECRET, so it can't be forged or extended.
// Changing either value logs out every existing session.

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

export function isAdminConfigured() {
  return !adminSetupProblem()
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
  if (!isAdminConfigured()) return false
  // Compare signatures so the check takes the same time for any input length
  return safeEqual(sign(`pw:${password}`), sign(`pw:${process.env.ADMIN_PASSWORD}`))
}

const signSession = expires => sign(`session:${expires}:${process.env.ADMIN_PASSWORD}`)

export function createSessionToken() {
  const expires = String(Date.now() + SESSION_MAX_AGE * 1000)
  return `${expires}.${signSession(expires)}`
}

function isValidToken(token) {
  if (!isAdminConfigured() || !token) return false
  const [expires, signature] = token.split('.')
  if (!expires || !signature) return false
  return safeEqual(signature, signSession(expires)) && Number(expires) > Date.now()
}

export async function isAdmin() {
  const store = await cookies()
  return isValidToken(store.get(SESSION_COOKIE)?.value)
}

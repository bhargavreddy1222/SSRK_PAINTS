import test from 'node:test'
import assert from 'node:assert/strict'
import { clientIp, createRateLimiter } from '../lib/rateLimit.js'

process.env.ADMIN_PASSWORD = 'correct horse battery'
process.env.ADMIN_SESSION_SECRET = 'x'.repeat(40)
const { SESSION_MAX_AGE, adminSetupProblem, checkPassword, createSessionToken, tokenIssuedAt } =
  await import('../lib/sessionToken.js')

const request = headers => ({ headers: new Headers(headers) })

test('rate limiter blocks after `max` hits and forgets old ones', t => {
  t.mock.timers.enable({ apis: ['Date'], now: 1_000_000 })
  const limiter = createRateLimiter({ windowMs: 1000, max: 2 })
  assert.equal(limiter.isLimited('a'), false)
  limiter.hit('a'); limiter.hit('a')
  assert.equal(limiter.isLimited('a'), true)
  assert.equal(limiter.isLimited('b'), false) // other keys are separate
  t.mock.timers.tick(1001)
  assert.equal(limiter.isLimited('a'), false)
  limiter.hit('a'); limiter.hit('a'); limiter.clear('a')
  assert.equal(limiter.isLimited('a'), false)
})

test('clientIp ignores addresses the caller can make up', () => {
  const before = process.env.VERCEL
  delete process.env.VERCEL
  // Off Vercel only the entry added by our own proxy (the last) counts
  assert.equal(clientIp(request({ 'x-forwarded-for': '1.1.1.1, 2.2.2.2' })), '2.2.2.2')
  assert.equal(clientIp(request({})), 'unknown')
  process.env.VERCEL = '1'
  assert.equal(clientIp(request({ 'x-vercel-forwarded-for': '3.3.3.3', 'x-forwarded-for': '9.9.9.9' })), '3.3.3.3')
  assert.equal(clientIp(request({ 'x-real-ip': '4.4.4.4' })), '4.4.4.4')
  if (before === undefined) delete process.env.VERCEL; else process.env.VERCEL = before
})

test('password check', () => {
  assert.equal(adminSetupProblem(), null)
  assert.equal(checkPassword('correct horse battery'), true)
  assert.equal(checkPassword('correct horse batterx'), false)
  assert.equal(checkPassword(''), false)
  assert.equal(checkPassword(undefined), false)
})

test('a fresh session token is accepted and reports when it was issued', () => {
  const now = 1_700_000_000_000
  assert.equal(tokenIssuedAt(createSessionToken(now), now + 5000), now)
})

test('expired, altered and malformed tokens are refused', () => {
  const now = 1_700_000_000_000
  const token = createSessionToken(now)
  const [expires, signature] = token.split('.')
  assert.equal(tokenIssuedAt(token, now + SESSION_MAX_AGE * 1000 + 1), null)            // expired
  assert.equal(tokenIssuedAt(`${Number(expires) + 1000}.${signature}`, now), null)        // lifetime extended
  assert.equal(tokenIssuedAt(`${expires}.${signature.slice(0, -1)}x`, now), null)         // signature changed
  assert.equal(tokenIssuedAt(`${token}.extra`, now), null)
  for (const junk of ['', 'abc', '.', '123.', '.abc', 'NaN.abc', undefined, null, 42]) {
    assert.equal(tokenIssuedAt(junk, now), null, String(junk))
  }
})

test('changing the password ends existing sessions', () => {
  const now = 1_700_000_000_000
  const token = createSessionToken(now)
  process.env.ADMIN_PASSWORD = 'a different password'
  assert.equal(tokenIssuedAt(token, now), null)
  process.env.ADMIN_PASSWORD = 'correct horse battery'
  assert.equal(tokenIssuedAt(token, now), now)
})

test('without settings, nothing is accepted', () => {
  const secret = process.env.ADMIN_SESSION_SECRET
  const token = createSessionToken()
  delete process.env.ADMIN_SESSION_SECRET
  assert.ok(adminSetupProblem())
  assert.equal(checkPassword('correct horse battery'), false)
  assert.equal(tokenIssuedAt(token), null)
  process.env.ADMIN_SESSION_SECRET = secret
})

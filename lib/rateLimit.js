// Basic per-key rate limiting (usually per IP).
// In-memory, so it resets on redeploy and isn't shared between serverless
// instances — enough to stop casual abuse. Use Upstash/Vercel KV for a stronger limit.

const MAX_KEYS = 5000

export function createRateLimiter({ windowMs, max }) {
  const hits = new Map()

  const recent = key => (hits.get(key) ?? []).filter(t => Date.now() - t < windowMs)

  // Random or spoofed keys must not be able to grow this forever
  function sweep() {
    if (hits.size < MAX_KEYS) return
    for (const key of hits.keys()) {
      if (!recent(key).length) hits.delete(key)
    }
    if (hits.size >= MAX_KEYS) hits.clear()
  }

  return {
    isLimited: key => recent(key).length >= max,
    hit(key) {
      sweep()
      hits.set(key, [...recent(key), Date.now()])
    },
    clear: key => hits.delete(key),
  }
}

export function clientIp(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
}

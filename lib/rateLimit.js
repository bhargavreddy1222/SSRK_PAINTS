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

// The caller's IP, from a header the caller can't choose.
// X-Forwarded-For is "client, proxy1, proxy2": everything before the last
// entry is whatever the caller sent, so the first entry is only safe where
// the host replaces the header — which Vercel does.
export function clientIp(request) {
  const header = name => request.headers.get(name)?.split(',').map(part => part.trim()).filter(Boolean) ?? []

  if (process.env.VERCEL) {
    return header('x-vercel-forwarded-for')[0] || header('x-real-ip')[0] || header('x-forwarded-for')[0] || 'unknown'
  }
  // Elsewhere, trust only the entry added by the proxy in front of us (the last one).
  // With no proxy at all the header is still the caller's, so pair this with a
  // limit that doesn't depend on the IP (see the login route).
  return header('x-forwarded-for').at(-1) || 'unknown'
}

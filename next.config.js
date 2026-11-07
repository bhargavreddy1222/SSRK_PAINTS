// Only our own Supabase project, so nobody can use our image optimizer for other people's files
const supabaseHost = process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).hostname : '*.supabase.co'

const isProd = process.env.NODE_ENV === 'production'

// Inline scripts have to stay allowed: static pages can't use per-request nonces.
// Off in development because hot reload needs eval and websockets.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  'frame-src https://www.google.com', // the shop map on the home page
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

const SECURITY_HEADERS = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  ...(isProd ? [
    { key: 'Content-Security-Policy', value: CSP },
    { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
  ] : []),
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Hostnames (not URLs) allowed to load the dev server, e.g. a phone on the LAN
  allowedDevOrigins: ['192.168.0.5'],
  images: {
    // Product photos uploaded from /admin/products live in Supabase Storage
    remotePatterns: [
      { protocol: 'https', hostname: supabaseHost, pathname: '/storage/v1/object/public/**' },
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: SECURITY_HEADERS }]
  },
}

module.exports = nextConfig

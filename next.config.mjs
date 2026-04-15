// PWA disabled until CSS build issue resolved
// import withPWAInit from '@ducanh2912/next-pwa'

const isProd = process.env.ENVIRONMENT === 'production'

// CSP: permetti solo origini necessarie
// - self: pagine Next.js
// - fonts.googleapis.com / fonts.gstatic.com: Google Fonts (DM Sans)
// - api.anthropic.com: Claude AI (fetch server-side, non serve nel browser — ma safe)
// - gate.whapi.cloud: WhatsApp API (fetch server-side)
// In prod NON usare 'unsafe-eval' — rimuovilo se non serve hot reload
const cspDirectives = [
  "default-src 'self'",
  "script-src 'self'" + (isProd ? '' : " 'unsafe-eval' 'unsafe-inline'"),
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "connect-src 'self'" + (isProd ? '' : ' ws://localhost:*'),
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Content-Security-Policy', value: cspDirectives },
  // HSTS solo in produzione — Railway serve sempre HTTPS
  ...(isProd ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }] : []),
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // Redirect apex domain to www (catches Railway's routing of playgroupsrl.it)
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'playgroupsrl.it' }],
        destination: 'https://www.playgroupsrl.it/:path*',
        permanent: true,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig

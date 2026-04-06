// PWA disabled until CSS build issue resolved
// import withPWAInit from '@ducanh2912/next-pwa'

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
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

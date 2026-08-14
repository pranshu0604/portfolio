import type { NextConfig } from 'next'

/**
 * Headers live here rather than in vercel.json so they survive a move to any
 * other host. Everything is statically prerendered, so there is nothing else to
 * configure — no image loader (the project shots are plain <img>), no rewrites.
 */
const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        // public/ assets are not content-hashed, so cache at the edge but let
        // the browser revalidate — a re-shot screenshot should not go stale.
        source: '/projects/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
          },
        ],
      },
      {
        source: '/:file(avatar-normal.png|avatar-tech.png|resume.pdf)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ]
  },
}

export default nextConfig

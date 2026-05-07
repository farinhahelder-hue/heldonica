/** @type {import('next').NextConfig} */

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://api.fontshare.com https://fonts.googleapis.com",
      "img-src 'self' data: blob: https://images.unsplash.com https://*.supabase.co https://heldonica.fr https://www.heldonica.fr https://behold.pictures https://cdn2.behold.pictures",
      "font-src 'self' https://api.fontshare.com https://fonts.gstatic.com",
      "connect-src 'self' https://*.supabase.co https://api.perplexity.ai https://api.unsplash.com https://api.bufferapp.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
]

const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2678400,
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: 'd2xsxph8kpxj0f.cloudfront.net' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'smxnruefmrmfyfhuxygq.supabase.co' },
      { protocol: 'https', hostname: 'heldonica.fr' },
      { protocol: 'https', hostname: 'www.heldonica.fr' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'behold.pictures' },
      { protocol: 'https', hostname: 'cdn2.behold.pictures' },
    ],
  },

  compress: true,

  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  experimental: {
    optimizePackageImports: ['@supabase/supabase-js'],
  },

  staticPageGenerationTimeout: 300,

  async headers() {
    return [
      { source: '/(.*)', headers: securityHeaders },
      { source: '/:path*.html', headers: [{ key: 'Content-Type', value: 'text/html; charset=utf-8' }] },
      { source: '/:path*/', headers: [{ key: 'Content-Type', value: 'text/html; charset=utf-8' }] },
      { source: '/', headers: [{ key: 'Content-Type', value: 'text/html; charset=utf-8' }] },
    ]
  },

  async redirects() {
    return [
      { source: '/admin', destination: '/cms-admin', permanent: true },
      { source: '/admin/:path*', destination: '/cms-admin/:path*', permanent: true },
      { source: '/zurich', destination: '/destinations/zurich', permanent: true },
      { source: '/zurich/', destination: '/destinations/zurich', permanent: true },
      { source: '/suisse', destination: '/destinations/suisse', permanent: true },
      { source: '/suisse/', destination: '/destinations/suisse', permanent: true },
      { source: '/roumanie', destination: '/destinations/roumanie', permanent: true },
      { source: '/roumanie/', destination: '/destinations/roumanie', permanent: true },
      { source: '/madere', destination: '/destinations/madere', permanent: true },
      { source: '/madere/', destination: '/destinations/madere', permanent: true },
      { source: '/paris', destination: '/destinations/paris', permanent: true },
      { source: '/paris/', destination: '/destinations/paris', permanent: true },
      { source: '/stoos-ridge-notre-aventure-sur-la-crete-panoramique-2', destination: '/blog/stoos-ridge-notre-aventure-sur-la-crete-panoramique', permanent: true },
      { source: '/travel-planner', destination: '/travel-planning', permanent: true },
      { source: '/travel-planner/', destination: '/travel-planning', permanent: true },
      { source: '/nos-services', destination: '/travel-planning', permanent: true },
      { source: '/nos-services/', destination: '/travel-planning', permanent: true },
      { source: '/hotel-consulting', destination: '/travel-planning', permanent: true },
      { source: '/hotel-consulting/:path*', destination: '/travel-planning', permanent: true },
      { source: '/sujets/bons-plans', destination: '/blog', permanent: true },
      { source: '/sujets/bons-plans/', destination: '/blog', permanent: true },
      { source: '/sujets/:slug', destination: '/blog', permanent: true },
      { source: '/etiquettes/:slug', destination: '/blog', permanent: true },
    ];
  },
}

module.exports = nextConfig

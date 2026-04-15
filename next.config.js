/** @type {import('next').NextConfig} */

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()',
  },
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
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
      {
        protocol: 'https',
        hostname: 'd2xsxph8kpxj0f.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'heldonica.fr',
      },
      {
        protocol: 'https',
        hostname: 'www.heldonica.fr',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'behold.pictures',
      },
      {
        protocol: 'https',
        hostname: 'cdn2.behold.pictures',
      },
    ],
  },
  compress: true,
  // Lint + typecheck déjà réactivés (sprint 10 avril)
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },
  experimental: {
    optimizePackageImports: ['lodash'],
  },
  staticPageGenerationTimeout: 300,

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },

  // ── Redirections permanentes (legacy WordPress + anciens slugs) ──
  async redirects() {
    return [
      // Admin redirect
      { source: '/admin', destination: '/cms-admin', permanent: true },
      { source: '/admin/:path*', destination: '/cms-admin/:path*', permanent: true },
      // Zurich
      { source: '/zurich', destination: '/destinations/zurich', permanent: true },
      { source: '/zurich/', destination: '/destinations/zurich', permanent: true },
      // Suisse
      { source: '/suisse', destination: '/destinations/suisse', permanent: true },
      { source: '/suisse/', destination: '/destinations/suisse', permanent: true },
      // Roumanie
      { source: '/roumanie', destination: '/destinations/roumanie', permanent: true },
      { source: '/roumanie/', destination: '/destinations/roumanie', permanent: true },
      // Madère
      { source: '/madere', destination: '/destinations/madere', permanent: true },
      { source: '/madere/', destination: '/destinations/madere', permanent: true },
      // Paris
      { source: '/paris', destination: '/destinations/paris', permanent: true },
      { source: '/paris/', destination: '/destinations/paris', permanent: true },
      // Stoos Ridge — ancien slug -2 indexé par Google
      { source: '/stoos-ridge-notre-aventure-sur-la-crete-panoramique-2', destination: '/blog/stoos-ridge-notre-aventure-sur-la-crete-panoramique', permanent: true },
      // Legacy WordPress — URLs encore indexées par Google
      { source: '/travel-planner', destination: '/travel-planning', permanent: true },
      { source: '/travel-planner/', destination: '/travel-planning', permanent: true },
      { source: '/nos-services', destination: '/travel-planning', permanent: true },
      { source: '/nos-services/', destination: '/travel-planning', permanent: true },
      { source: '/sujets/bons-plans', destination: '/blog', permanent: true },
      { source: '/sujets/bons-plans/', destination: '/blog', permanent: true },
      { source: '/sujets/:slug', destination: '/blog', permanent: true },
      { source: '/etiquettes/:slug', destination: '/blog', permanent: true },
    ];
  },
}

module.exports = nextConfig

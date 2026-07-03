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
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline' https://api.fontshare.com https://fonts.googleapis.com https://unpkg.com",
      "img-src 'self' data: blob: https://images.unsplash.com https://*.supabase.co https://heldonica.fr https://www.heldonica.fr https://behold.pictures https://cdn2.behold.pictures https://lh3.googleusercontent.com https://lh4.googleusercontent.com https://lh5.googleusercontent.com https://lh6.googleusercontent.com https://storage.googleapis.com",
      "font-src 'self' https://api.fontshare.com https://fonts.gstatic.com https://frontend-cdn.perplexity.ai",
      "connect-src 'self' https://*.supabase.co https://api.perplexity.ai https://api.unsplash.com https://api.bufferapp.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
]

const nextConfig = {
  outputFileTracingRoot: __dirname,
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
      // Google user profile images (OAuth avatars)
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh4.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh5.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh6.googleusercontent.com' },
      // Google Storage & other CDNs
      { protocol: 'https', hostname: 'storage.googleapis.com' },
      { protocol: 'https', hostname: '*.cloudfront.net' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },

  compress: true,

  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },

  experimental: {
    optimizePackageImports: ['@supabase/supabase-js'],
  },
  serverExternalPackages: ['jsdom', 'html-encoding-sniffer', '@exodus/bytes'],

  staticPageGenerationTimeout: 300,

  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclure dompurify du bundle serveur — ESM-only, client uniquement
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : [config.externals].filter(Boolean)),
        'dompurify',
        'jsdom',
        'html-encoding-sniffer',
        '@exodus/bytes',
      ];
    }
    return config;
  },

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
      { source: '/bons-plans', destination: '/guides-pratiques', permanent: true },
      { source: '/bons-plans/', destination: '/guides-pratiques', permanent: true },
      { source: '/about', destination: '/a-propos', permanent: true },
      { source: '/about-us', destination: '/a-propos', permanent: true },
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
      { source: '/hotel-consulting', destination: '/expert-hotelier', permanent: true },
      { source: '/hotel-consulting/:path*', destination: '/expert-hotelier', permanent: true },
      { source: '/sujets/bons-plans', destination: '/blog', permanent: true },
      { source: '/sujets/bons-plans/', destination: '/blog', permanent: true },
      { source: '/sujets/:slug', destination: '/blog', permanent: true },
      { source: '/etiquettes/:slug', destination: '/blog', permanent: true },
      { source: '/coaching', destination: '/travel-planning', permanent: true },
      { source: '/coaching/', destination: '/travel-planning', permanent: true },
      { source: '/happiness-design', destination: '/travel-planning', permanent: true },
      { source: '/happiness-design/', destination: '/travel-planning', permanent: true },
    ];
  },
}

module.exports = nextConfig

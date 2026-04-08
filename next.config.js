/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
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
    ],
  },
  compress: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizePackageImports: ['lodash'],
  },
  staticPageGenerationTimeout: 300,

  // ── Redirections permanentes (legacy WordPress + anciens slugs) ──
  async redirects() {
    return [
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

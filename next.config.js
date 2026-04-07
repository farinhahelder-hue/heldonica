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

  // ── Redirections 301 depuis les anciennes URLs WordPress ──────
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
    ];
  },
}

module.exports = nextConfig

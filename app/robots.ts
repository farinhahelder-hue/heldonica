import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/cms-admin',
          '/panel-manager',
          '/cms',
          '/dashboard',
          '/auth',
          '/api',
          '/organisateur',
          '/travel-planning-form',
          '/merci',
        ],
      },
    ],
    sitemap: 'https://heldonica.fr/sitemap.xml',
    host: 'https://heldonica.fr',
  };
}

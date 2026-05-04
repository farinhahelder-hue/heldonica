import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/cms-admin',
          '/cms',
          '/dashboard',
          '/auth',
          '/api/',
          '/organisateur',
          '/travel-planning-form',
        ],
      },
    ],
    sitemap: 'https://www.heldonica.fr/sitemap.xml',
    host: 'https://www.heldonica.fr',
  };
}

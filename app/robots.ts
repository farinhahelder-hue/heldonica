import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/cms-admin',
          '/api/',
          '/travel-planning-form',
        ],
      },
    ],
    sitemap: 'https://heldonica.fr/sitemap.xml',
    host: 'https://heldonica.fr',
  };
}

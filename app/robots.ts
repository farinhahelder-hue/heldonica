import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/cms-admin/',
          '/cms/',
          '/dashboard/',
          '/auth/',
          '/organisateur/',
        ],
      },
    ],
    sitemap: 'https://heldonica.fr/sitemap.xml',
    host: 'https://heldonica.fr',
  };
}

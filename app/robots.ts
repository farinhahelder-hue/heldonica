import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/api/',
        '/_next/',
        '/cms/',
        '/panel-manager/',
        // Pages hors positionnement principal (hors sitemap)
        '/start',
        '/expert-hotelier',
      ],
    },
    sitemap: 'https://www.heldonica.fr/sitemap.xml',
  }
}

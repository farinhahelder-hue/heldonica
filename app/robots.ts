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
        '/start',
      ],
    },
    sitemap: 'https://www.heldonica.fr/sitemap.xml',
  }
}

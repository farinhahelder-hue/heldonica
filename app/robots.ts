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
        // Page linktree pour les réseaux, volontairement hors index
        '/start',
      ],
    },
    sitemap: 'https://www.heldonica.fr/sitemap.xml',
  }
}

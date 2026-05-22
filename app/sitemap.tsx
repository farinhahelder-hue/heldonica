import { MetadataRoute } from 'next'

const SITE_URL = 'https://heldonica.fr'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  
  // Main pages
  const mainPages = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'weekly' as const, priority: 1.0 },
    { url: `${SITE_URL}/destinations`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: `${SITE_URL}/travel-planning`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${SITE_URL}/a-propos`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${SITE_URL}/planifier`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.8 },
  ]

  // Destinations (dynamic would be better but quick fix)
  const destinations = [
    'madere', 'portugal', 'roumanie', 'normandie', 'idf',
    'colombie', 'sicile', 'sardaigne', 'timisoara'
  ].map(slug => ({
    url: `${SITE_URL}/destinations/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7
  }))

  return [...mainPages, ...destinations]
}
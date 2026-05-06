import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog-supabase';
import { getAllDestinationSlugs } from '@/lib/wordpress-data';

const BASE_URL = 'https://heldonica.fr';

const STATIC_DESTINATIONS = [
  'madere',
  'madere/itineraire-7-jours',
  'madere/budget',
  'sicile',
];

const DYNAMIC_DESTINATIONS = [
  'zurich',
  'suisse',
  'roumanie',
  'paris',
  'normandie',
  'bretagne',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const today = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: today, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/blog`, lastModified: today, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/destinations`, lastModified: today, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/travel-planning`, lastModified: today, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/slow-travel`, lastModified: today, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/a-propos`, lastModified: new Date('2026-04-01'), changeFrequency: 'yearly', priority: 0.6 },
    { url: `${BASE_URL}/contact`, lastModified: new Date('2026-04-01'), changeFrequency: 'yearly', priority: 0.6 },
    { url: `${BASE_URL}/temoignages`, lastModified: new Date('2026-04-15'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/etudes-de-cas`, lastModified: new Date('2026-04-15'), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/hotel-consulting`, lastModified: today, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/ai-hotellerie`, lastModified: today, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/mentions-legales`, lastModified: new Date('2026-01-01'), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE_URL}/politique-confidentialite`, lastModified: new Date('2026-04-15'), changeFrequency: 'yearly', priority: 0.2 },
  ];

  const staticDestPages: MetadataRoute.Sitemap = STATIC_DESTINATIONS.map((path) => ({
    url: `${BASE_URL}/destinations/${path}`,
    lastModified: today,
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  const dynamicDestPages: MetadataRoute.Sitemap = DYNAMIC_DESTINATIONS.map((slug) => ({
    url: `${BASE_URL}/destinations/${slug}`,
    lastModified: today,
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  // Destinations WP supplementaires (evite les doublons)
  const knownSlugs = new Set([...STATIC_DESTINATIONS, ...DYNAMIC_DESTINATIONS])
  let wpDestPages: MetadataRoute.Sitemap = []
  try {
    const wpSlugs = getAllDestinationSlugs()
    wpDestPages = wpSlugs
      .filter((s: { slug: string }) => !knownSlugs.has(s.slug))
      .map((s: { slug: string }) => ({
        url: `${BASE_URL}/destinations/${s.slug}`,
        lastModified: today,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      }))
  } catch (_) {}

  const posts = await getAllPosts();
  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at ?? post.published_at ?? post.created_at ?? today),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    ...staticPages,
    ...staticDestPages,
    ...dynamicDestPages,
    ...wpDestPages,
    ...blogPages,
  ];
}

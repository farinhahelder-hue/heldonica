import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog-supabase';
import { getAllDestinationsForSitemap } from '@/lib/sitemap-supabase';

const BASE_URL = 'https://www.heldonica.fr';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/planifier`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/slow-travel`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/temoignages`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];

  // Dynamically fetch published posts
  const posts = await getAllPosts();
  const blogPages: MetadataRoute.Sitemap = (posts ?? []).map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(
      post.updated_at || post.published_at || post.created_at || new Date().toISOString()
    ),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Dynamically fetch published destinations
  const fetchedDestinations = await getAllDestinationsForSitemap();
  const destinationPages: MetadataRoute.Sitemap = (fetchedDestinations ?? []).map((dest) => ({
    url: `${BASE_URL}/destinations/${dest.slug}`,
    lastModified: new Date(
      dest.updated_at || dest.created_at || new Date().toISOString()
    ),
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  return [...staticPages, ...destinationPages, ...blogPages];
}

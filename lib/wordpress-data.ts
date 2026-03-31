// ============================================================
// DONNÉES HELDONICA.FR — Générées automatiquement
// Source : API WordPress REST + scraping heldonica.fr
// ============================================================

import { blogPosts, destinationPages, BlogPost, DestinationPage } from './heldonica-data'

// ── Blog ──────────────────────────────────────────
export function getAllBlogSlugs() {
  return blogPosts.map((post) => ({ slug: post.slug }))
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug)
}

export function getRelatedPosts(currentSlug: string, limit = 3): BlogPost[] {
  return blogPosts
    .filter((post) => post.slug !== currentSlug)
    .slice(0, limit)
}

// ── Destinations ──────────────────────────────────
export function getAllDestinationSlugs() {
  return destinationPages.map((dest) => ({ slug: dest.slug }))
}

export function getDestinationBySlug(slug: string): DestinationPage | undefined {
  return destinationPages.find((dest) => dest.slug === slug)
}

// ── Re-exports utiles ─────────────────────────────
export { blogPosts, destinationPages }
export type { BlogPost, DestinationPage }

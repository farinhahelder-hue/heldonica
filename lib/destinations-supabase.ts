// ============================================================
// DONNÉES HELDONICA — Supabase fetch avec fallback statique
// ============================================================

import { supabase } from './supabase-client'
import { destinationsData, DestinationMarker } from './destinations-data'

export type { DestinationMarker }

// Fetch destinations from Supabase with fallback to static data
export async function getDestinations(): Promise<DestinationMarker[]> {
  // Try Supabase first
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('cms_destinations')
        .select('slug, title, excerpt, country, region, category, latitude, longitude, image')
        .eq('published', true)
        .order('title')

      if (!error && data && data.length > 0) {
        // Transform Supabase response to DestinationMarker format
        return data.map((row) => ({
          id: row.slug,
          slug: row.slug,
          title: row.title,
          excerpt: row.excerpt || '',
          country: row.country || '',
          region: row.region || '',
          category: row.category || '',
          latitude: row.latitude || 0,
          longitude: row.longitude || 0,
          link: `/destinations/${row.slug}`,
          image: row.image || '',
        }))
      }
    } catch (err) {
      console.warn('[destinations-supabase] Supabase fetch failed, using static fallback:', err)
    }
  }

  // Fallback to static data
  return destinationsData
}

// Get single destination by slug
export async function getDestinationBySlug(slug: string): Promise<DestinationMarker | null> {
  const destinations = await getDestinations()
  return destinations.find((d) => d.slug === slug) || null
}

export default { getDestinations, getDestinationBySlug }
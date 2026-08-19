import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase-client'
import DestinationPillar from '@/components/DestinationPillar'
import { buildPillarMetadata } from '@/lib/pillar-metadata'
import { fetchPillarData, fetchSubDestinations } from '@/lib/pillar-data'
import { getPageZones } from '@/lib/cms-zones'

// ISR : Next sert le dernier rendu valide si Supabase est momentanement
// injoignable, ce qui absorbe les incidents transitoires sans contenu hardcode.
export const revalidate = 300

export async function generateMetadata() {
  const data = await fetchPillarData('montenegro')
  return buildPillarMetadata(data)
}

async function getRelatedArticles() {
  if (!supabase) return []
  // Use cms_blog_posts as the single source of truth
  const { data } = await supabase
    .from('cms_blog_posts')
    .select('slug, title, excerpt, featured_image, read_time')
    .or('destination.ilike.%montenegro%,slug.ilike.%montenegro%')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(4)
  return data || []
}

export default async function MontenegroPage() {
  const [data, relatedArticles, zones, subDestinations] = await Promise.all([
    fetchPillarData('montenegro'),
    getRelatedArticles(),
    getPageZones('destinations'),
    fetchSubDestinations('montenegro'),
  ])
  return <DestinationPillar data={data} relatedArticles={relatedArticles} initialZones={zones} subDestinations={subDestinations} />
}

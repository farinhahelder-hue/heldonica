import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase-client'
import DestinationPillar from '@/components/DestinationPillar'
import { buildPillarMetadata } from '@/lib/pillar-metadata'
import { fetchPillarData, fetchSubDestinations, fetchSeasons } from '@/lib/pillar-data'
import { getPageZones } from '@/lib/cms-zones'

export const revalidate = 300

export async function generateMetadata() {
  const data = await fetchPillarData('roumanie')
  return buildPillarMetadata(data)
}

async function getRelatedArticles() {
  if (!supabase) return []
  const { data } = await supabase
    .from('cms_blog_posts')
    .select('slug, title, excerpt, featured_image, read_time')
    .or('destination.ilike.%roumanie%,slug.ilike.%roumanie%')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(4)
  return data || []
}

export default async function RoumaniePage() {
  const [data, relatedArticles, zones, subDestinations, seasons] = await Promise.all([
    fetchPillarData('roumanie'),
    getRelatedArticles(),
    getPageZones('destinations'),
    fetchSubDestinations('roumanie'),
    fetchSeasons('roumanie'),
  ])
  return <DestinationPillar data={data} relatedArticles={relatedArticles} initialZones={zones} subDestinations={subDestinations} seasons={seasons} />
}

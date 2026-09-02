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
  // `destination` et `read_time` n'existent pas dans cms_blog_posts : la requête
  // partait en 400 et, l'erreur n'étant pas lue, `data` valait null. La section
  // « Dans la même veine » restait donc vide sans que rien ne le signale.
  const { data, error } = await supabase
    .from('cms_blog_posts')
    .select('slug, title, excerpt, featured_image')
    .or('slug.ilike.%roumanie%,title.ilike.%roumanie%,title.ilike.%transylvanie%')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(4)

  if (error) console.error('[destinations/roumanie] articles liés :', error.message)
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

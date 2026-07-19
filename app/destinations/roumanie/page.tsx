import { supabase } from '@/lib/supabase-client'
import DestinationPillar from '@/components/DestinationPillar'
import { buildPillarMetadata } from '@/lib/pillar-metadata'
import { fetchPillarData } from '@/lib/pillar-data'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  const data = await fetchPillarData('roumanie')
  return buildPillarMetadata(data)
}

async function getRelatedArticles() {
  if (!supabase) return []
  // Use cms_blog_posts as the single source of truth
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
  const [data, relatedArticles] = await Promise.all([
    fetchPillarData('roumanie'),
    getRelatedArticles(),
  ])
  return <DestinationPillar data={data} relatedArticles={relatedArticles} />
}

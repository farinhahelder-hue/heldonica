import { supabase } from '@/lib/supabase-client'
import DestinationPillar from '@/components/DestinationPillar'
import { buildPillarMetadata } from '@/lib/pillar-metadata'
import { MONTENEGRO } from '@/lib/pillar-data'

export const dynamic = 'force-dynamic'

export const metadata = buildPillarMetadata(MONTENEGRO)

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
  const relatedArticles = await getRelatedArticles()
  return <DestinationPillar data={MONTENEGRO} relatedArticles={relatedArticles} />
}

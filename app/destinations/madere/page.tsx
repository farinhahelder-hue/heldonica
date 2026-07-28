import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase-client'
import DestinationPillar from '@/components/DestinationPillar'
import { buildPillarMetadata } from '@/lib/pillar-metadata'
import { getPillarData } from '@/lib/get-pillar-data'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const pillar = await getPillarData('madere')
  return buildPillarMetadata(pillar)
}

async function getRelatedArticles() {
  if (!supabase) return []
  // Use cms_blog_posts as the single source of truth
  const { data } = await supabase
    .from('cms_blog_posts')
    .select('slug, title, excerpt, featured_image, read_time')
    .or('destination.ilike.%madere%,slug.ilike.%madere%')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(4)
  return data || []
}

export default async function MaderePage() {
  const [pillar, relatedArticles] = await Promise.all([
    getPillarData('madere'),
    getRelatedArticles(),
  ])
  return <DestinationPillar data={pillar} relatedArticles={relatedArticles} />
}

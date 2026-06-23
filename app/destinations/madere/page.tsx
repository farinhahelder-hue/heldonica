import { supabase } from '@/lib/supabase-client'
import DestinationPillar, { buildPillarMetadata } from '@/components/DestinationPillar'
import { MADERE } from '@/lib/pillar-data'

export const dynamic = 'force-dynamic'

export const metadata = buildPillarMetadata(MADERE)

async function getRelatedArticles() {
  if (!supabase) return []
  const { data } = await (supabase as any)
    .from('articles')
    .select('slug, title, excerpt, image_url, read_time')
    .or('destination.eq.madere,slug.ilike.%madere%')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(4)
  return data || []
}

export default async function MaderePage() {
  const relatedArticles = await getRelatedArticles()
  return <DestinationPillar data={MADERE} relatedArticles={relatedArticles} />
}

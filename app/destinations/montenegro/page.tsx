import { supabase } from '@/lib/supabase-client'
import DestinationPillar from '@/components/DestinationPillar'
import { buildPillarMetadata } from '@/lib/pillar-metadata'
import { MONTENEGRO } from '@/lib/pillar-data'

export const dynamic = 'force-dynamic'

export const metadata = buildPillarMetadata(MONTENEGRO)

async function getRelatedArticles() {
  if (!supabase) return []
  const { data } = await (supabase as any)
    .from('articles')
    .select('slug, title, excerpt, image_url, read_time')
    .or('destination.eq.montenegro,slug.ilike.%montenegro%')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(4)
  return data || []
}

export default async function MontenegroPage() {
  const relatedArticles = await getRelatedArticles()
  return <DestinationPillar data={MONTENEGRO} relatedArticles={relatedArticles} />
}

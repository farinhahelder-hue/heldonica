import { supabase } from '@/lib/supabase-client'
import DestinationPillar, { buildPillarMetadata } from '@/components/DestinationPillar'
import { MONTENEGRO } from '@/lib/pillar-data'

export const dynamic = 'force-dynamic'

export const metadata = buildPillarMetadata(MONTENEGRO)

async function getRelatedArticles() {
  if (!supabase) return []
  const { data } = await (supabase as any)
    .from('articles')
    .select('slug, title, excerpt, image_url, read_time')
    .eq('destination', 'montenegro')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(4)
  return data || []
}

export default async function MontenegroPage() {
  const relatedArticles = await getRelatedArticles()
  return <DestinationPillar data={MONTENEGRO} relatedArticles={relatedArticles} />
}

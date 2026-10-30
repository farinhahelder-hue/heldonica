import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase-client'
import DestinationPillar from '@/components/DestinationPillar'
import ComingSoonDestination from '@/components/ComingSoonDestination'
import { buildPillarMetadata } from '@/lib/pillar-metadata'
import { fetchPillarData, fetchSubDestinations, fetchSeasons } from '@/lib/pillar-data'
import { getPageZones } from '@/lib/cms-zones'
import { isUnpublishedPath } from '@/lib/unpublished-pages'

// ISR : Next sert le dernier rendu valide si Supabase est momentanement
// injoignable, ce qui absorbe les incidents transitoires sans contenu hardcode.
export const revalidate = 300

export async function generateMetadata() {
  const data = await fetchPillarData('madere')
  return buildPillarMetadata(data)
}

async function getRelatedArticles() {
  if (!supabase) return []
  // Use cms_blog_posts as the single source of truth
  // `destination` et `read_time` n'existent pas dans cms_blog_posts : la requête
  // partait en 400 et, l'erreur n'étant pas lue, `data` valait null. La section
  // « Dans la même veine » restait donc vide sans que rien ne le signale.
  // Le rattachement se fait par le slug et le titre, seuls champs disponibles.
  const { data, error } = await supabase
    .from('cms_blog_posts')
    .select('slug, title, excerpt, featured_image')
    .or('slug.ilike.%madere%,title.ilike.%madère%,title.ilike.%madere%')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(4)

  if (error) console.error('[destinations/madere] articles liés :', error.message)
  return data || []
}

export default async function MaderePage() {
  // Page pilier « Bientôt » tant qu'elle figure dans lib/unpublished-pages.ts.
  // Décision du 30/10/2026 : le fonds d'images de l'île est intégralement
  // généré par IA (C2PA + SynthID) et aucune photo réelle n'existe — le vécu
  // revendiqué par le texte ne peut pas être prouvé. DestinationPillar ne
  // connaît pas ce mécanisme (contrairement à SubDestinationTemplate), d'où le
  // garde explicite ici : sans lui, la page resterait complète et indexable.
  const data = await fetchPillarData('madere')

  if (isUnpublishedPath('/destinations/madere')) {
    return (
      <ComingSoonDestination
        slug="madere"
        title={data.name}
        country={data.country}
        hero_unsplash_url="/og-default.jpg"
        zones={await getPageZones('destinations-madere')}
      />
    )
  }

  const [relatedArticles, zones, subDestinations, seasons] = await Promise.all([
    getRelatedArticles(),
    getPageZones('destinations'),
    fetchSubDestinations('madere'),
    fetchSeasons('madere'),
  ])
  return <DestinationPillar data={data} relatedArticles={relatedArticles} initialZones={zones} subDestinations={subDestinations} seasons={seasons} />
}

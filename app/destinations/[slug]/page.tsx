import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase-client'
import { notFound } from 'next/navigation'
import ComingSoonDestination from '@/components/ComingSoonDestination'
import { SITE_URL, DEFAULT_OG_IMAGE, DEFAULT_DESCRIPTION } from '@/lib/seo'

interface Props {
  params: Promise<{ slug: string }>
}

export const revalidate = 3600

// Toutes les destinations « piliers » sont désormais des pages statiques
// pilotées par le CMS (DestinationPillar / DestinationPage). Cette route
// dynamique ne sert plus que les slugs en attente (coming_soon) issus de
// destinations_public ; tout autre slug tombe en 404.

async function getDestinationStatus(slug: string): Promise<{
  status: string | null
  title: string
  country: string
  flag_emoji?: string
  teaser?: string
  hero_unsplash_url?: string
  featured_image?: string
  travel_style?: string
  best_season?: string
  avg_budget_couple_week?: number
} | null> {
  if (!supabase) return null
  try {
    const { data, error } = await supabase
      .from('destinations_public')
      .select('status, title, country, flag_emoji, teaser, hero_unsplash_url, featured_image, travel_style, best_season, avg_budget_couple_week')
      .eq('slug', slug)
      .single()
    if (error || !data) return null
    return data as any
  } catch {
    return null
  }
}

export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug

  const destStatus = await getDestinationStatus(slug)
  if (destStatus && destStatus.status === 'coming_soon') {
    return {
      title: `${destStatus.title} — bientôt sur Heldonica`,
      description: destStatus.teaser || `${destStatus.title} — notre guide arrive bientôt. Sois notifié en avant-première.`,
      robots: { index: false, follow: false },
      alternates: { canonical: `${SITE_URL}/destinations/${slug}` },
      openGraph: {
        title: `${destStatus.title} — bientôt sur Heldonica`,
        description: destStatus.teaser || '',
        url: `${SITE_URL}/destinations/${slug}`,
        images: [{ url: destStatus.hero_unsplash_url || destStatus.featured_image || DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
        locale: 'fr_FR', type: 'website',
      },
    }
  }

  return {
    title: 'Destination introuvable | Heldonica',
    description: DEFAULT_DESCRIPTION,
    openGraph: {
      title: 'Destination introuvable | Heldonica',
      description: DEFAULT_DESCRIPTION,
      images: [{ url: DEFAULT_OG_IMAGE }],
      url: `${SITE_URL}/destinations`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Destination introuvable | Heldonica',
      description: DEFAULT_DESCRIPTION,
      images: [DEFAULT_OG_IMAGE],
    }
  }
}

export default async function DestinationPage({ params }: Props) {
  const slug = (await params).slug

  const destStatus = await getDestinationStatus(slug)
  if (destStatus && destStatus.status === 'coming_soon') {
    return (
      <ComingSoonDestination
        slug={slug}
        title={destStatus.title || slug}
        country={destStatus.country || ''}
        flag_emoji={destStatus.flag_emoji}
        teaser={destStatus.teaser}
        hero_unsplash_url={destStatus.hero_unsplash_url}
        featured_image={destStatus.featured_image}
        travel_style={destStatus.travel_style}
        best_season={destStatus.best_season}
        avg_budget_couple_week={destStatus.avg_budget_couple_week}
      />
    )
  }

  notFound()
}

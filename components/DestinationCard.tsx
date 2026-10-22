'use client'

import { memo } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import GuideDownloadButton from '@/components/GuideDownloadButton'

export interface DestinationCardProps {
  slug: string
  title: string
  country: string
  flag_emoji?: string
  excerpt?: string
  teaser?: string
  hero_unsplash_url?: string
  featured_image?: string
  status: 'draft' | 'coming_soon' | 'published' | 'starred'
  travel_style?: string
  best_season?: string
  avg_budget_couple_week?: number
  article_count?: number
  coming_soon_date?: string
  priority_score?: number
}

import { getStyleLabel } from '@/lib/travel-styles'


function formatBudget(amount?: number): string {
  if (!amount) return ''
  if (amount >= 1000) return `~${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1).replace(',', '.')}k€/semaine/couple`
  return `~${amount}€/semaine/couple`
}

const DestinationCard = memo(function DestinationCard({
  slug, title, country, teaser,
  hero_unsplash_url, featured_image, status,
  travel_style, best_season, avg_budget_couple_week,
  article_count, coming_soon_date
}: DestinationCardProps) {
  // Sans photo vérifiée on n'invente rien : pas d'image de remplacement (le
  // logo og-default répété sur chaque carte faisait faux), une tuile neutre.
  const imgSrc = hero_unsplash_url || featured_image
  const styleLabel = getStyleLabel(travel_style)
  const isClickable = status === 'published' || status === 'starred'
  const href = isClickable ? `/destinations/${slug}` : '#'

  const cardContent = (
    <article
      className={`group flex flex-col overflow-hidden rounded-sm border transition-all duration-300 h-full
        ${status === 'coming_soon' ? 'opacity-80 border-[#E2D9C8] dark:border-stone-850 bg-[#F4EFE6] dark:bg-[#1E1C1A]' : 'border-[#DED5C6] dark:border-stone-800 bg-[#FAF7F2] dark:bg-[#1E1C1A] hover:border-mahogany/40'}
        ${!isClickable ? 'cursor-default' : 'cursor-pointer'}
      `}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[#EAE2D6] dark:bg-stone-800 border-b border-[#E2D9C8]">
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={title}
            fill
            className={`object-cover transition-transform duration-700 ease-out ${isClickable ? 'group-hover:scale-[1.03]' : ''}`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
          />
        ) : (
          <div aria-hidden="true" className="absolute inset-0 flex flex-col items-center justify-center bg-[#EFE9DF] p-6 text-center">
            <svg width="44" height="44" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1" className="text-mahogany/30 mb-2">
              <circle cx="24" cy="24" r="20" strokeDasharray="2 3" />
              <circle cx="24" cy="24" r="13" />
              <path d="M24 6v36M6 24h36" />
              <path d="M24 14l3 10-3 10-3-10z" fill="currentColor" fillOpacity={0.18} />
            </svg>
            <span className="text-xs uppercase tracking-[0.22em] text-mahogany/70 font-medium">
              Carnet en préparation
            </span>
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {status === 'starred' && (
            <span className="inline-block rounded-sm bg-[#FAF7F2]/95 text-mahogany px-2.5 py-1 text-xs uppercase tracking-[0.16em] font-medium border border-[#DED5C6]">
              Coup de cœur
            </span>
          )}
          {status === 'coming_soon' && (
            <span className="inline-block rounded-sm bg-[#2A1D18]/85 text-[#F7F3EC] px-2.5 py-1 text-xs uppercase tracking-[0.16em] font-medium"
              title={coming_soon_date ? `Prévu : ${coming_soon_date}` : ''}
            >
              Bientôt
            </span>
          )}
        </div>
        {article_count && article_count > 0 ? (
          <span className="absolute top-3 right-3 rounded-sm bg-[#FAF7F2]/95 dark:bg-stone-900/90 px-2.5 py-1 text-xs uppercase tracking-[0.14em] font-medium text-charcoal/80 dark:text-stone-300 border border-[#DED5C6]">
            {article_count} carnet{article_count > 1 ? 's' : ''}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-eucalyptus dark:text-stone-400 uppercase tracking-[0.18em]">{country}</span>
        </div>
        <h3 className="text-xl font-serif font-normal text-mahogany dark:text-stone-100 mb-2 leading-snug group-hover:text-eucalyptus transition-colors">
          {title}
        </h3>
        {(teaser) && (
          <p className="text-sm text-charcoal/75 dark:text-stone-300 leading-relaxed mb-4 line-clamp-2 flex-1">
            {teaser}
          </p>
        )}
        <div className="flex flex-wrap gap-2 mb-3">
          {styleLabel && (
            <span className="inline-block rounded-sm bg-[#EFE9DF] dark:bg-stone-800 px-2.5 py-1 text-xs text-charcoal/75 dark:text-stone-300 border border-[#E2D9C8]">
              {styleLabel}
            </span>
          )}
          {best_season && (
            <span className="inline-block rounded-sm bg-[#EFE9DF] dark:bg-teal/20 px-2.5 py-1 text-xs text-eucalyptus border border-[#E2D9C8]">
              {best_season}
            </span>
          )}
        </div>
        {avg_budget_couple_week && (
          <p className="text-xs font-medium text-mahogany/80">
            {formatBudget(avg_budget_couple_week)}
          </p>
        )}
        {status !== 'coming_soon' && status !== 'draft' && (
          <div className="mt-3 pt-3 border-t border-[#E8E0D2]" onClick={(e) => e.stopPropagation()}>
            <GuideDownloadButton slug={slug} title={title} variant="card" />
          </div>
        )}
      </div>
    </article>
  )

  if (isClickable) {
    return (
      <Link href={href} className="block h-full" onClick={() => {
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'destination_card_clique', { destination: slug })
        }
      }}>
        {cardContent}
      </Link>
    )
  }

  return cardContent
})

export default DestinationCard

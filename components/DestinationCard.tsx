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

import { getStyleLabel, getStyleEmoji } from '@/lib/travel-styles'


function formatBudget(amount?: number): string {
  if (!amount) return ''
  if (amount >= 1000) return `~${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1).replace(',', '.')}k€/semaine/couple`
  return `~${amount}€/semaine/couple`
}

// Le drapeau n'est pas toujours renseigné en base : sans lui la tuile resterait un grand vide.
const COUNTRY_FLAGS: Record<string, string> = {
  Portugal: '🇵🇹', Italie: '🇮🇹', France: '🇫🇷', Espagne: '🇪🇸', Malte: '🇲🇹', Pologne: '🇵🇱',
  Roumanie: '🇷🇴', 'Monténégro': '🇲🇪', Suisse: '🇨🇭', 'Grèce': '🇬🇷', Colombie: '🇨🇴',
}

const DestinationCard = memo(function DestinationCard({
  slug, title, country, flag_emoji, teaser,
  hero_unsplash_url, featured_image, status,
  travel_style, best_season, avg_budget_couple_week,
  article_count, coming_soon_date
}: DestinationCardProps) {
  // Sans photo vérifiée on n'invente rien : pas d'image de remplacement (le
  // logo og-default répété sur chaque carte faisait faux), une tuile neutre.
  const imgSrc = hero_unsplash_url || featured_image
  const styleLabel = getStyleLabel(travel_style)
  const styleEmoji = getStyleEmoji(travel_style)
  const isClickable = status === 'published' || status === 'starred'
  const href = isClickable ? `/destinations/${slug}` : '#'

  const cardContent = (
    <article
      className={`group flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 h-full
        ${status === 'coming_soon' ? 'opacity-75 border-stone-200 dark:border-stone-850 bg-white dark:bg-[#1E1C1A]' : 'hover:-translate-y-1 hover:shadow-lg'}
        ${status === 'starred' ? 'border-eucalyptus/20 dark:border-eucalyptus/10 bg-gradient-to-b from-eucalyptus/5 to-white dark:from-eucalyptus/5 dark:to-[#1E1C1A] shadow-md shadow-eucalyptus/5' : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1E1C1A] shadow-sm'}
        ${!isClickable ? 'cursor-default' : 'cursor-pointer'}
      `}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-stone-100 dark:bg-stone-800">
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={title}
            fill
            className={`object-cover transition-transform duration-500 ${isClickable ? 'group-hover:scale-105' : ''}`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
          />
        ) : (
          <div aria-hidden="true" className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-mahogany via-[#4A251D] to-eucalyptus p-6 text-center">
            <svg width="52" height="52" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-white/25 mb-2">
              <circle cx="24" cy="24" r="20" strokeDasharray="3 3" />
              <circle cx="24" cy="24" r="14" />
              <path d="M24 6v36M6 24h36" />
              <path d="M24 14l3.5 10-3.5 10-3.5-10z" fill="currentColor" fillOpacity={0.25} />
            </svg>
            <span className="text-[11px] uppercase tracking-[0.22em] text-teal/90 font-semibold">
              {flag_emoji || COUNTRY_FLAGS[country] || '✦'} {country}
            </span>
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {status === 'starred' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-eucalyptus/90 backdrop-blur-sm text-white px-2.5 py-1 text-xs font-bold shadow-md border border-eucalyptus/20">
              ⭐ Coup de cœur
            </span>
          )}
          {status === 'coming_soon' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-eucalyptus text-white px-2.5 py-1 text-xs font-semibold shadow-md"
              title={coming_soon_date ? `Prévu : ${coming_soon_date}` : ''}
            >
              Bientôt
            </span>
          )}
        </div>
        {article_count && article_count > 0 && (
          <span className="absolute top-3 right-3 rounded-full bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-stone-700 dark:text-stone-300 shadow-sm">
            {article_count} article{article_count > 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-2 mb-1.5">
          {flag_emoji && <span className="text-base leading-none">{flag_emoji}</span>}
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">{country}</span>
        </div>
        <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 mb-2 leading-snug">
          {title}
        </h3>
        {(teaser) && (
          <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed mb-4 line-clamp-2 flex-1">
            {teaser}
          </p>
        )}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {styleLabel && (
            <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 dark:bg-stone-800 px-2.5 py-1 text-xs font-medium text-stone-600 dark:text-stone-300">
              {styleEmoji} {styleLabel}
            </span>
          )}
          {best_season && (
            <span className="inline-flex items-center gap-1 rounded-full bg-teal/10 dark:bg-teal/20 px-2.5 py-1 text-xs font-medium text-teal">
              📅 {best_season}
            </span>
          )}
        </div>
        {avg_budget_couple_week && (
          <p className="text-xs font-semibold text-eucalyptus">
            {formatBudget(avg_budget_couple_week)}
          </p>
        )}
        {status !== 'coming_soon' && status !== 'draft' && (
          <div className="mt-2" onClick={(e) => e.stopPropagation()}>
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

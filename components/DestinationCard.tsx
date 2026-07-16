'use client'

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

const STYLE_LABELS: Record<string, string> = {
  'slow-culture': 'Culture',
  'slow-nature': 'Nature',
  'nature': 'Nature',
  'culture': 'Culture',
  'city': 'Ville',
  'food': 'Food',
}

const STYLE_EMOJIS: Record<string, string> = {
  'slow-culture': '🏛️',
  'slow-nature': '🌿',
  'nature': '🌿',
  'culture': '🏛️',
  'city': '🏙️',
  'food': '🍽️',
}

const HERO_FALLBACK = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80'

function formatBudget(amount?: number): string {
  if (!amount) return ''
  if (amount >= 1000) return `~${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1).replace(',', '.')}k€/semaine/couple`
  return `~${amount}€/semaine/couple`
}

export default function DestinationCard({
  slug, title, country, flag_emoji, teaser,
  hero_unsplash_url, featured_image, status,
  travel_style, best_season, avg_budget_couple_week,
  article_count, coming_soon_date
}: DestinationCardProps) {
  const imgSrc = hero_unsplash_url || featured_image || HERO_FALLBACK
  const styleLabel = travel_style ? STYLE_LABELS[travel_style] || travel_style : ''
  const styleEmoji = travel_style ? STYLE_EMOJIS[travel_style] || '' : ''
  const isClickable = status === 'published' || status === 'starred'
  const href = isClickable ? `/destinations/${slug}` : '#'

  const cardContent = (
    <article
      className={`group flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 h-full
        ${status === 'coming_soon' ? 'opacity-75 border-stone-200 dark:border-stone-850 bg-white dark:bg-[#1E1C1A]' : 'hover:-translate-y-1 hover:shadow-lg'}
        ${status === 'starred' ? 'border-amber-200 dark:border-amber-900 bg-gradient-to-b from-amber-50/20 to-white dark:from-amber-900/10 dark:to-[#1E1C1A] shadow-md shadow-amber-500/5' : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1E1C1A] shadow-sm'}
        ${!isClickable ? 'cursor-default' : 'cursor-pointer'}
      `}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-stone-100 dark:bg-stone-800">
        <Image
          src={imgSrc}
          alt={title}
          fill
          className={`object-cover transition-transform duration-500 ${isClickable ? 'group-hover:scale-105' : ''}`}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {status === 'starred' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/90 backdrop-blur-sm text-white px-2.5 py-1 text-xs font-bold shadow-md border border-amber-400/20">
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
}

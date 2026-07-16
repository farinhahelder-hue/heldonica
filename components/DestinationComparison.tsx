'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpDown, Download, X } from 'lucide-react'
import GuideDownloadButton from '@/components/GuideDownloadButton'

interface DestCompare {
  slug: string
  title: string
  country: string
  flag_emoji?: string
  teaser?: string
  hero_unsplash_url?: string
  featured_image?: string
  status: string
  travel_style?: string
  best_season?: string
  avg_budget_couple_week?: number
  article_count?: number
  continent?: string
}

interface Props {
  destinations: DestCompare[]
}

const STYLE_LABELS: Record<string, string> = {
  'slow-culture': 'Slow & Culture',
  'slow-nature': 'Slow & Nature',
  'nature': 'Nature',
  'culture': 'Culture',
  'city': 'Ville',
  'food': 'Food',
}

const CONTINENT_ORDER = ['europe', 'mediterranee', 'ameriques', 'asie', 'afrique', 'oceanie']

function formatBudget(amount?: number): string {
  if (!amount) return '—'
  if (amount >= 1000) return `${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}k€`
  return `${amount}€`
}

type SortKey = 'title' | 'continent' | 'avg_budget_couple_week' | 'article_count' | 'best_season'

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'title', label: 'Nom' },
  { key: 'continent', label: 'Continent' },
  { key: 'avg_budget_couple_week', label: 'Budget' },
  { key: 'article_count', label: 'Articles' },
  { key: 'best_season', label: 'Saison' },
]

export default function DestinationComparison({ destinations }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set(
    destinations.slice(0, 4).map((d) => d.slug)
  ))
  const [sortKey, setSortKey] = useState<SortKey>('continent')
  const [sortAsc, setSortAsc] = useState(false)

  const toggle = (slug: string) => {
    const next = new Set(selected)
    if (next.has(slug)) next.delete(slug)
    else if (next.size < 5) next.add(slug)
    setSelected(next)
  }

  const sorted = useMemo(() => {
    const list = destinations.filter((d) => selected.has(d.slug))
    return [...list].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'title') cmp = a.title.localeCompare(b.title)
      else if (sortKey === 'continent') cmp = CONTINENT_ORDER.indexOf(a.continent || '') - CONTINENT_ORDER.indexOf(b.continent || '')
      else if (sortKey === 'avg_budget_couple_week') cmp = (a.avg_budget_couple_week || 0) - (b.avg_budget_couple_week || 0)
      else if (sortKey === 'article_count') cmp = (a.article_count || 0) - (b.article_count || 0)
      else if (sortKey === 'best_season') cmp = (a.best_season || '').localeCompare(b.best_season || '')
      return sortAsc ? cmp : -cmp
    })
  }, [selected, sortKey, sortAsc, destinations])

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-lg font-serif text-mahogany mb-3">
          {selected.size} destination{selected.size > 1 ? 's' : ''} sélectionnée{selected.size > 1 ? 's' : ''}
          <span className="text-sm font-normal text-stone-500 ml-2">(max 5)</span>
        </h2>
        <div className="flex flex-wrap gap-2">
          {destinations.map((d) => {
            const active = selected.has(d.slug)
            return (
              <button key={d.slug} onClick={() => toggle(d.slug)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  active ? 'bg-eucalyptus text-white border-eucalyptus' : 'bg-white text-stone-600 border-stone-200 hover:border-eucalyptus'
                } ${!active && selected.size >= 5 ? 'opacity-40 cursor-not-allowed' : ''}`}
                disabled={!active && selected.size >= 5}
              >
                {d.flag_emoji} {d.title}
                {active && <X size={12} />}
              </button>
            )
          })}
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center">
          <p className="text-stone-500 text-sm">Sélectionne des destinations pour les comparer</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50">
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-stone-500 w-40">
                  <button onClick={() => { setSortKey('title'); setSortAsc(!sortAsc) }}
                    className="flex items-center gap-1 hover:text-eucalyptus">
                    Critère <ArrowUpDown size={12} />
                  </button>
                </th>
                {sorted.map((d) => (
                  <th key={d.slug} className="p-4 text-center min-w-[180px]">
                    <div className="relative h-24 w-full rounded-lg overflow-hidden mb-2">
                      <Image
                        src={d.hero_unsplash_url || d.featured_image || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80'}
                        alt={d.title}
                        fill
                        className="object-cover"
                        sizes="200px"
                      />
                    </div>
                    <Link href={`/destinations/${d.slug}`} className="font-serif font-bold text-mahogany hover:text-eucalyptus">
                      {d.flag_emoji} {d.title}
                    </Link>
                    <p className="text-xs text-stone-500 mt-0.5">{d.country}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { key: 'continent', label: 'Continent', render: (d: DestCompare) => <span className="capitalize">{d.continent || '—'}</span> },
                { key: 'travel_style', label: 'Style', render: (d: DestCompare) => <span>{d.travel_style ? STYLE_LABELS[d.travel_style] || d.travel_style : '—'}</span> },
                { key: 'best_season', label: 'Meilleure saison', render: (d: DestCompare) => <span>{d.best_season || '—'}</span> },
                { key: 'budget', label: 'Budget / semaine / couple', render: (d: DestCompare) => <span className="font-semibold text-eucalyptus">{formatBudget(d.avg_budget_couple_week)}</span> },
                { key: 'articles', label: 'Articles', render: (d: DestCompare) => <span>{d.article_count || 0}</span> },
                { key: 'teaser', label: 'En bref', render: (d: DestCompare) => <p className="text-xs text-stone-600 line-clamp-3">{d.teaser || '—'}</p> },
                { key: 'guide', label: 'Guide PDF', render: (d: DestCompare) => (
                  <div onClick={(e) => e.stopPropagation()}>
                    <GuideDownloadButton slug={d.slug} title={d.title} variant="card" />
                  </div>
                )},
              ].map((row) => (
                <tr key={row.key} className="border-b border-stone-100 last:border-b-0 hover:bg-stone-50/50">
                  <td className="p-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">{row.label}</td>
                  {sorted.map((d) => (
                    <td key={d.slug} className="p-4 text-center text-stone-700">{row.render(d)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

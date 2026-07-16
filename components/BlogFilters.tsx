'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export interface BlogCategory {
  key: string
  label: string
  icon?: string
}

export interface BlogFiltersProps {
  activeCategory?: string
  counts?: Record<string, number>
  categories?: BlogCategory[]
}

const DEFAULT_CATEGORIES: BlogCategory[] = [
  { key: 'Tous', label: 'Tous' },
  { key: 'Carnets Voyage', label: 'Carnets Voyage' },
  { key: 'Découvertes Locales', label: 'Découvertes Locales' },
  { key: 'Guides Pratiques', label: 'Guides Pratiques' },
  { key: 'Coulisses de marque', label: 'Coulisses de marque' },
]

const ACTIVE_CLASS = 'bg-eucalyptus text-white border-transparent'
const INACTIVE_CLASS = 'bg-stone-100 text-eucalyptus/80 border border-eucalyptus/60'

/**
 * Filtres de catégorie pour la page blog
 * Gère le filtrage via URL params pour persistance et partage
 * Accepte les catégories depuis les props ou utilise les valeurs par défaut
 */
export default function BlogFilters({ 
  activeCategory = 'Tous', 
  counts,
  categories = DEFAULT_CATEGORIES 
}: BlogFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleFilter = useCallback((category: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (category === 'Tous') {
      params.delete('category')
    } else {
      params.set('category', category.toLowerCase().replace(/\s+/g, '-'))
    }
    
    router.push(`/blog${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false })
  }, [router, searchParams])

  return (
    <div className="mb-8 flex flex-wrap items-center gap-3">
      {categories.map(({ key, label }) => {
        const isActive = activeCategory === key
        const count = counts?.[key] ?? 0
        
        return (
          <button
            key={key}
            onClick={() => handleFilter(key)}
            className={`
              inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium
              transition-all duration-200
              ${isActive ? ACTIVE_CLASS : INACTIVE_CLASS}
              ${!isActive ? 'hover:bg-eucalyptus/10' : ''}
            `}
            aria-pressed={isActive}
          >
            {label}
            {count > 0 && (
              <span 
                className={`
                  rounded-full px-2 py-0.5 text-xs
                  ${isActive ? 'bg-white/20 text-white' : 'bg-eucalyptus/10 text-eucalyptus/80'}
                `}
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
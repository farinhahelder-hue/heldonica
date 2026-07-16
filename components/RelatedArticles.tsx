'use client'

import Image from 'next/image'
import Link from 'next/link'
import { BlogPost } from '@/lib/blog-supabase'
import { getReadingTime } from '@/lib/readingTime'

interface RelatedArticlesProps {
  articles: BlogPost[]
  destinationTitle: string
  currentSlug?: string
}

// Destination patterns for matching related articles
export const DESTINATION_PATTERNS: Record<string, string[]> = {
  'roumanie': ['Roumanie', 'Maramures', 'Maramureș', 'Timisoara', 'Timișoara', 'Transylvanie', 'Sibiu', 'Brasov'],
  'madere': ['Madère', 'Madeira', 'Funchal'],
  'paris': ['Paris', 'Canal Saint-Martin', 'Le Marais'],
  'zurich': ['Zurich', 'Limmat', 'Suisse'],
  'sicile': ['Sicile', 'Sicilia', 'Agrigente', 'Palerme', 'Taormine'],
  'lisbonne': ['Lisbonne', 'Lisboa', 'Alfama', 'LX Factory'],
  'montenegro': ['Monténégro', 'Montenegro', 'Podgorica', 'Kotor', 'Boka'],
  'suisse': ['Suisse', 'Stoos', 'Alpes', 'Zurich'],
  'colombie': ['Colombie', 'Bogota', 'Medellín', 'Cartagena', 'Cali'],
  'normandie': ['Normandie', 'Rouen', 'Caen', 'Le Havre', 'Etretat'],
  'sardaigne': ['Sardaigne', 'Sardegna', 'Cagliari', 'Alghero', 'Costa Smeralda'],
}

/**
 * Get related articles based on destination slug
 * Matches articles using destination patterns
 */
export function getRelatedArticlesByDestination(articles: BlogPost[], destinationSlug: string): BlogPost[] {
  const patterns = DESTINATION_PATTERNS[destinationSlug.toLowerCase()] || []
  if (patterns.length === 0) return []

  return articles
    .filter(article => {
      const searchText = `${article.title} ${article.excerpt || ''} ${article.destination || ''}`.toLowerCase()
      return patterns.some(pattern => searchText.includes(pattern.toLowerCase()))
    })
    .slice(0, 3)
}

export default function RelatedArticles({ articles, destinationTitle, currentSlug }: RelatedArticlesProps) {
  // Filter out current article if slug is provided
  const filteredArticles = currentSlug 
    ? articles.filter(a => a.slug !== currentSlug)
    : articles

  if (!filteredArticles || filteredArticles.length === 0) {
    return null
  }

  return (
    <section className="py-16 md:py-24 bg-cloud-dancer">
      <div className="container max-w-6xl">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-teal font-semibold mb-2">
            À lire aussi
          </p>
          <h2 className="text-3xl font-serif text-mahogany">
            {destinationTitle ? `Nos articles sur ${destinationTitle}` : 'Articles similaires'}
          </h2>
        </div>

        {/* Horizontal card row */}
        <div className="flex flex-col md:flex-row gap-6 overflow-x-auto md:overflow-visible pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
          {filteredArticles.map((article) => {
            const readTime = getReadingTime(article.content)
            return (
              <Link 
                key={article.slug} 
                href={`/blog/${article.slug}`}
                className="group flex-shrink-0 w-full md:w-80 bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="relative h-48 overflow-hidden">
                  {article.featured_image ? (
                    <Image
                      src={article.featured_image}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 320px"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-stone-200 flex items-center justify-center">
                      <span className="text-stone-600 text-sm">Photo</span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  {article.category && (
                    <p className="text-xs font-semibold text-teal uppercase tracking-wider mb-2">
                      {article.category}
                    </p>
                  )}
                  <h3 className="font-serif text-lg text-mahogany mb-2 group-hover:text-mahogany/80 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  {readTime > 0 && (
                    <p className="text-xs text-stone-500 mt-3">
                      {readTime} min de lecture
                    </p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
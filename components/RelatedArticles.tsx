'use client'

import Image from 'next/image'
import Link from 'next/link'
import { BlogPost } from '@/lib/blog-supabase'

interface RelatedArticlesProps {
  articles: BlogPost[]
  destinationTitle: string
}

const DESTINATION_PATTERNS: Record<string, string[]> = {
  'roumanie': ['Roumanie', 'Maramures', 'Maramureș', 'Timisoara', 'Timișoara', 'Transylvanie', 'Sibiu', 'Brasov'],
  'madere': ['Madère', 'Madeira', 'Funchal'],
  'paris': ['Paris', 'Canal Saint-Martin', 'Le Marais'],
  'zurich': ['Zurich', 'Limmat', 'Suisse'],
  'sicile': ['Sicile', 'Sicilia', 'Agrigente', 'Palerme', 'Taormine'],
  'lisbonne': ['Lisbonne', 'Lisboa', 'Alfama', 'LX Factory'],
  'montenegro': ['Monténégro', 'Montenegro', 'Podgorica', 'Kotor', 'Boka'],
  'suisse': ['Suisse', 'Stoos', 'Alpes', 'Zurich'],
}

export function getRelatedArticles(articles: BlogPost[], destinationSlug: string): BlogPost[] {
  const patterns = DESTINATION_PATTERNS[destinationSlug] || []
  if (patterns.length === 0) return []

  return articles
    .filter(article => {
      const searchText = `${article.title} ${article.excerpt || ''} ${article.destination || ''}`.toLowerCase()
      return patterns.some(pattern => searchText.includes(pattern.toLowerCase()))
    })
    .slice(0, 3)
}

export default function RelatedArticles({ articles, destinationTitle }: RelatedArticlesProps) {
  if (!articles || articles.length === 0) {
    return null
  }

  return (
    <section className="py-16 md:py-24 bg-stone-50">
      <div className="container max-w-6xl">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-700 font-semibold mb-2">
            À lire aussi
          </p>
          <h2 className="text-3xl font-serif text-stone-900">
            Nos articles sur {destinationTitle}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link 
              key={article.slug} 
              href={`/blog/${article.slug}`}
              className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                {article.featured_image ? (
                  <Image
                    src={article.featured_image}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-stone-200 flex items-center justify-center">
                    <span className="text-stone-400 text-sm">Photo</span>
                  </div>
                )}
              </div>
              <div className="p-5">
                {article.category && (
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">
                    {article.category}
                  </p>
                )}
                <h3 className="font-serif text-lg text-stone-900 mb-2 group-hover:text-amber-800 transition-colors">
                  {article.title}
                </h3>
                {article.excerpt && (
                  <p className="text-sm text-stone-600 line-clamp-2">
                    {article.excerpt}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
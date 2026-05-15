import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { BlogPost } from '@/lib/blog-supabase'
import { getExcerpt } from '@/lib/blog-supabase'

const HELDONICA_BADGE_FALLBACK = '/images/badges-heldonica.svg'
const CATEGORY_FALLBACK_BG: Record<string, string> = {
  'Carnets Voyage': 'bg-gradient-to-br from-[#355C7D] to-[#6C5B7B]',
  'Découvertes Locales': 'bg-gradient-to-br from-[#0F766E] to-[#155E75]',
  'Guides Pratiques': 'bg-gradient-to-br from-[#7C2D12] to-[#9A3412]',
}

export function displayExcerpt(post: BlogPost): string {
  return getExcerpt(post, 140)
}

export default function ArticleCard({ post }: { post: BlogPost & { formattedDate: string; readTime?: number } }) {
  const fallbackBg = CATEGORY_FALLBACK_BG[post.category ?? ''] ?? 'bg-cloud-dancer'
  const [imageSrc, setImageSrc] = useState(post.featured_image ?? null)

  useEffect(() => {
    setImageSrc(post.featured_image ?? null)
  }, [post.featured_image])

  const isFallback = !imageSrc
  const safeTags = Array.isArray(post.tags) ? post.tags : []
  const readTime = post.readTime ?? post.read_time ?? 0

  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full transition-all duration-200">
      <article className="flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-cloud-dancer bg-white shadow-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-lg">
        {isFallback ? (
          <div className={`flex h-48 w-full flex-col items-center justify-center gap-2 ${fallbackBg}`}>
            <img
              src={HELDONICA_BADGE_FALLBACK}
              alt="Heldonica"
              width={60}
              height={38}
              className="h-auto w-14 opacity-90"
              loading="lazy"
            />
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80">
              Heldonica
            </span>
            {post.category && (
              <div className="absolute left-4 top-4">
                <span className="rounded-full bg-eucalyptus/90 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm shadow-sm">
                  {post.category}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="relative h-48 w-full overflow-hidden">
            <img
              src={imageSrc!}
              alt={post.title}
              width={400}
              height={208}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={() => setImageSrc(null)}
              style={{ filter: 'brightness(0.95) contrast(1.05) saturate(1.05)' }} // Subtle unified color grading
            />
            {post.category && (
              <div className="absolute left-4 top-4">
                <span className="rounded-full bg-eucalyptus/90 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm shadow-sm">
                  {post.category}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-1 flex-col p-5">
          <h3 className="mb-2 text-lg font-semibold leading-snug text-mahogany transition-colors duration-200 group-hover:text-eucalyptus line-clamp-2">
            {post.title}
          </h3>
          {(post.excerpt || displayExcerpt(post)) && (
            <p className="mb-4 flex-1 text-sm leading-relaxed text-charcoal/70 line-clamp-3">
              {post.excerpt || displayExcerpt(post)}
            </p>
          )}
          {safeTags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2 hidden">
              {safeTags.slice(0, 3).map((tag) => (
                <span key={tag} className="rounded-full bg-cloud-dancer px-2.5 py-1 text-[10px] uppercase font-semibold text-charcoal/60">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="mt-auto flex items-center justify-between border-t border-cloud-dancer pt-4 text-xs font-medium text-charcoal/50">
            <div className="flex items-center gap-2">
              <span className="uppercase tracking-wider">{post.author ?? 'Équipe Heldonica'}</span>
              {readTime > 0 ? (
                <>
                  <span className="text-cloud-dancer/50">•</span>
                  <span>{readTime} min</span>
                </>
              ) : null}
            </div>
            <span className="font-bold text-eucalyptus transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}

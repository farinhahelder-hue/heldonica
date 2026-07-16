'use client'

import { useEffect, useMemo, useState, useDeferredValue } from 'react'
import Link from 'next/link'
import NewsletterForm from '@/components/NewsletterForm'
import BlogFilters, { type BlogCategory } from '@/components/BlogFilters'
import type { BlogPost } from '@/lib/blog-supabase'

const CATEGORY_LABELS: Record<string, string> = {
  Tous: 'Tout lire',
  'Carnets Voyage': 'Carnets',
  'Découvertes Locales': 'Pépites locales',
  'Guides Pratiques': 'Guides',
}

const CATEGORY_FALLBACK_BG: Record<string, string> = {
  'Carnets Voyage': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80',
  'Découvertes Locales': 'https://images.unsplash.com/photo-1520939817895-060bdaf4fe1b?w=600&q=80',
  'Guides Pratiques': 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=600&q=80',
}

const DEFAULT_CARD_FALLBACK = 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80'

const BADGE_FALLBACK_SRC = '/images/badges-heldonica.svg'

// Default categories as fallback
const DEFAULT_CATEGORIES: BlogCategory[] = [
  { key: 'Tous', label: 'Tous' },
  { key: 'Carnets Voyage', label: 'Carnets Voyage' },
  { key: 'Découvertes Locales', label: 'Découvertes Locales' },
  { key: 'Guides Pratiques', label: 'Guides Pratiques' },
]

interface Props {
  posts?: (BlogPost & { formattedDate: string; readTime?: number })[]
  categories?: BlogCategory[]
}

function ReadProgressBar() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0
      setProgress(pct)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      className="fixed top-0 left-0 z-[60] h-[3px] bg-eucalyptus transition-all duration-100"
      style={{ width: `${progress}%` }}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
    />
  )
}

export default function BlogClientPage({ posts: rawPosts, categories: propCategories }: Props) {
  const posts = useMemo(
    () => (Array.isArray(rawPosts) ? rawPosts : []),
    [rawPosts]
  )
  const [activeFilter, setActiveFilter] = useState('Tous')
  const [searchQuery, setSearchQuery] = useState('')

  // ⚡ Bolt: Use useDeferredValue to debounce the search query input.
  // This optimization prevents the potentially heavy list filtering from blocking
  // the main UI thread, ensuring smooth typing for the user.
  const deferredSearchQuery = useDeferredValue(searchQuery)

  const [categories, setCategories] = useState<BlogCategory[]>(() => {
    if (propCategories && propCategories.length > 0) return propCategories
    return DEFAULT_CATEGORIES
  })

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch('/api/cms/blog-categories')
        const data = await res.json()
        if (data.success && data.categories) {
          const mapped = [
            { key: 'Tous', label: 'Tout lire' },
            ...data.categories.map((c: any) => ({
              key: c.db_value,
              label: c.label
            }))
          ]
          setCategories(mapped)
        }
      } catch (err) {
        console.error('Failed to load dynamic blog categories:', err)
      }
    }
    loadCategories()
  }, [propCategories])

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchCategory = activeFilter === 'Tous' || post.category === activeFilter
      const query = deferredSearchQuery.trim().toLowerCase()
      const matchSearch =
        query === '' ||
        post.title.toLowerCase().includes(query) ||
        (post.excerpt ?? '').toLowerCase().includes(query) ||
        (Array.isArray(post.tags) ? post.tags : []).some((tag) => tag.toLowerCase().includes(query))

      return matchCategory && matchSearch
    })
  }, [posts, activeFilter, deferredSearchQuery])

  const featuredPost = activeFilter === 'Tous' && deferredSearchQuery === '' ? posts[0] : null

  // Compute stats dynamically from posts
  const safePosts = Array.isArray(posts) ? posts : []
  const getPostCount = (catKey: string) => {
    if (catKey === 'Tous') return safePosts.length
    return safePosts.filter((post) => post.category === catKey).length
  }

  return (
    <main className="min-h-screen bg-cloud-dancer">
      <ReadProgressBar />

      <section className="relative overflow-hidden bg-mahogany px-4 py-24 text-white md:py-28">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1400&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-mahogany/80 via-mahogany/75 to-mahogany/65" />
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-teal/80">Blog Heldonica</p>
          <h1 className="mb-6 text-5xl font-serif font-light leading-tight md:text-7xl">
            Des moments, des détours,
            <br />
            des repères qu&apos;on aurait aimé avoir avant.
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-white/75">
            On écrit depuis le terrain : une arrivée trop tardive, une adresse trouvée au bon
            moment, une erreur qu&apos;on ne refera pas. Le reste, on le laisse aux brochures.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-white/65">
            {categories.filter(c => c.key !== 'Tous').map(cat => (
              <StatChip key={cat.key} value={getPostCount(cat.key)} label={cat.label} />
            ))}
          </div>
        </div>
      </section>

      {featuredPost && (
        <section className="mx-auto max-w-7xl px-4 pb-4 pt-14">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-eucalyptus">À lire d&apos;abord</p>
              <h2 className="text-2xl font-serif font-light text-mahogany md:text-3xl">
                Un carnet qui donne le ton.
              </h2>
            </div>
          </div>
          <Link href={`/blog/${featuredPost.slug}`} className="group block transition-all duration-200">
            <article className="relative flex h-[380px] items-end overflow-hidden rounded-[2rem] bg-mahogany shadow-xl md:h-[500px]">
              {featuredPost.featured_image ? (
                <img
                  src={featuredPost.featured_image}
                  alt={featuredPost.title}
                  width={1200}
                  height={500}
                  className="absolute inset-0 h-full w-full object-cover opacity-60 transition-all duration-500 group-hover:scale-105 group-hover:opacity-70"
                  loading="eager"
                />
              ) : (
                <img
                  src={CATEGORY_FALLBACK_BG[featuredPost.category ?? ''] ?? DEFAULT_CARD_FALLBACK}
                  alt={featuredPost.title}
                  width={1200}
                  height={500}
                  className="absolute inset-0 h-full w-full object-cover opacity-60"
                  loading="eager"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="relative z-10 max-w-2xl p-6 md:p-12">
                {featuredPost.category && (
                  <span className="mb-4 inline-flex rounded-full bg-eucalyptus px-3 py-1 text-xs font-semibold text-white">
                    {featuredPost.category}
                  </span>
                )}
                <h3 className="mb-3 text-xl font-serif font-light leading-snug text-white transition-colors duration-200 group-hover:text-teal md:text-4xl">
                  {featuredPost.title}
                </h3>
                {featuredPost.excerpt && (
                  <p className="mb-4 hidden text-sm leading-relaxed text-white/75 md:block md:text-base">
                    {featuredPost.excerpt}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-4 text-xs text-white/55">
                  <span>{featuredPost.formattedDate}</span>
                  <span className="font-semibold text-teal transition-transform duration-200 group-hover:translate-x-1">
                    Lire le carnet →
                  </span>
                </div>
              </div>
            </article>
          </Link>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setActiveFilter(category.key)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  activeFilter === category.key
                    ? 'bg-eucalyptus text-white shadow-sm'
                    : 'border border-cloud-dancer bg-white text-charcoal/70 hover:border-eucalyptus hover:bg-eucalyptus/5 hover:text-eucalyptus'
                }`}
              >
                {category.label}
                <span className={`ml-1.5 rounded-full px-1.5 text-xs ${
                  activeFilter === category.key ? 'bg-white/20' : 'bg-cloud-dancer'
                }`}>
                  {getPostCount(category.key)}
                </span>
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Rechercher un carnet, un lieu, un détail"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-full border border-cloud-dancer bg-white py-3 pl-11 pr-4 text-sm text-charcoal shadow-sm outline-none transition-all duration-200 placeholder:text-charcoal/40 focus:border-eucalyptus focus:ring-2 focus:ring-eucalyptus/20"
            />
            <svg
              aria-hidden="true"
              className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-charcoal/40 transition-colors duration-200 hover:text-charcoal/60"
              >
                Effacer
              </button>
            )}
          </div>
        </div>

        {searchQuery && (
          <p className="mt-4 text-sm text-charcoal/60">
            {filteredPosts.length} article{filteredPosts.length > 1 ? 's' : ''} pour "{searchQuery}".
          </p>
        )}
      </section>

      {filteredPosts.length === 0 ? (
        <div className="mx-auto max-w-7xl px-4 pb-20 text-center">
          <div className="rounded-[2rem] border border-cloud-dancer bg-white px-6 py-16 shadow-sm">
            <h2 className="mb-3 text-2xl font-serif font-light text-mahogany">Rien de juste pour cette recherche, pour l&apos;instant.</h2>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-charcoal/70">
              Essaie un lieu, un mot plus simple, ou repars de tout le blog pour reprendre le fil.
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setActiveFilter('Tous')
              }}
              className="mt-6 text-sm font-semibold text-eucalyptus transition-colors duration-200 hover:text-eucalyptus"
            >
              Voir tous les articles →
            </button>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-7xl space-y-16 px-4 pb-20">
          {categories.filter(c => c.key !== 'Tous').map((cat) => {
            const postsInCategory = filteredPosts.filter((post) => post.category === cat.key)
            if (postsInCategory.length === 0) return null
            if (activeFilter !== 'Tous' && activeFilter !== cat.key) return null

            const isPepites = cat.key === 'Découvertes Locales'

            return (
              <section key={cat.key} className={isPepites ? "rounded-[2rem] bg-eucalyptus/5 px-4 py-12 md:px-8" : ""}>
                <SectionHeader
                  eyebrow={cat.label}
                  title={cat.label}
                  description={
                    cat.key === 'Carnets Voyage' ? "Les récits qui gardent l’heure, le rythme et ce qu’on a retenu sur place." :
                    cat.key === 'Découvertes Locales' ? "Des lieux qu’on n’était pas venus chercher, et qu’on aurait regretté de rater." :
                    cat.key === 'Guides Pratiques' ? "Des repères concrets quand le terrain devient plus utile que la théorie." :
                    `Tous les articles de la catégorie ${cat.label}.`
                  }
                  count={postsInCategory.length}
                />
                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {postsInCategory.map((post) => (
                    <ArticleCard key={post.slug} post={post} />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}

      <NewsletterForm variant="blog" />
    </main>
  )
}

function StatChip({ value, label }: { value: number; label: string }) {
  // Ne jamais afficher 0 — utiliser "—" comme fallback
  const displayValue = (value === null || value === undefined || value === 0) ? '—' : String(value)
  return (
    <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-left backdrop-blur-sm">
      <span className="mr-2 text-lg font-light text-white">{displayValue}</span>
      <span className="text-xs uppercase tracking-[0.12em] text-white/60">{label}</span>
    </div>
  )
}

function SectionHeader({
  eyebrow,
  title,
  description,
  count,
}: {
  eyebrow: string
  title: string
  description: string
  count: number
}) {
  return (
    <div className="border-b border-cloud-dancer pb-5">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-eucalyptus">{eyebrow}</p>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-serif font-light text-mahogany">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-charcoal/70">{description}</p>
        </div>
        <span className="inline-flex rounded-full bg-cloud-dancer px-3 py-1 text-xs font-semibold text-charcoal/70">
          {count} article{count > 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}

function ArticleCard({ post }: { post: BlogPost & { formattedDate: string; readTime?: number } }) {
  const fallbackImg = CATEGORY_FALLBACK_BG[post.category ?? ''] ?? DEFAULT_CARD_FALLBACK
  
  // Better image handling: check for valid URL
  const hasValidImage = post.featured_image && 
    typeof post.featured_image === 'string' && 
    post.featured_image.trim().length > 0 &&
    (post.featured_image.startsWith('http') || post.featured_image.startsWith('/'))
  
  const [imageSrc, setImageSrc] = useState(hasValidImage ? post.featured_image : null)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    setImageSrc(hasValidImage ? post.featured_image : null)
    setImageError(false)
  }, [post.featured_image, hasValidImage])

  // Ensure tags is always an array
  const safeTags = Array.isArray(post.tags) ? post.tags : []

  // Category icon SVG
  const categoryIcons: Record<string, string> = {
    'Carnets Voyage': 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    'Découvertes Locales': 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 12m-3 0a3 3 0 106 0 3 3 0 10-6 0',
    'Guides Pratiques': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  }
  const categoryIcon = categoryIcons[post.category ?? ''] || 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
  const categoryColors: Record<string, string> = {
    'Carnets Voyage': '#2D8B7A',
    'Découvertes Locales': '#C4714A', 
    'Guides Pratiques': '#6B5B4F',
  }
  const accentColor = categoryColors[post.category ?? ''] || '#2D8B7A'

  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full transition-all duration-200">
      <article className="flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-cloud-dancer bg-white shadow-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-lg">
        {/* Image section - always show something, never empty blocks */}
        <div className="relative h-52 w-full overflow-hidden bg-gradient-to-br from-stone-100 to-stone-200">
          {imageSrc && !imageError ? (
            <img
              src={imageSrc}
              alt={post.title}
              width={400}
              height={208}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            /* Elegant gradient fallback with SVG icon */
            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-stone-100 via-stone-50 to-stone-200 p-6">
              <svg 
                aria-hidden="true"
                className="h-12 w-12 opacity-30" 
                style={{ color: accentColor }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={categoryIcon} />
              </svg>
              <span className="mt-2 text-xs font-medium uppercase tracking-wider text-stone-600">
                {post.category || 'Slow Travel'}
              </span>
            </div>
          )}
          {/* Category badge */}
          {post.category && (
            <div className="absolute left-4 top-4">
              <span 
                className="rounded-full px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm"
                style={{ backgroundColor: `${accentColor}dd` }}
              >
                {post.category}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="mb-2 text-lg font-semibold leading-snug text-mahogany transition-colors duration-200 group-hover:text-eucalyptus">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="mb-4 flex-1 text-sm leading-relaxed text-charcoal/70 line-clamp-3">
              {post.excerpt}
            </p>
          )}
          {safeTags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {safeTags.slice(0, 3).map((tag) => (
                <span key={tag} className="rounded-full bg-cloud-dancer px-2.5 py-1 text-xs text-charcoal/60">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="mt-auto flex items-center justify-between border-t border-cloud-dancer pt-4 text-xs text-charcoal/40">
            <div className="flex items-center gap-2">
              <span>{post.author || 'Heldonica'}</span>
              {post.readTime && post.readTime > 0 ? (
                <>
                  <span>•</span>
                  <span>{post.readTime} min</span>
                </>
              ) : null}
            </div>
            <span className="font-semibold text-eucalyptus transition-transform duration-200 group-hover:translate-x-1">
              Lire →
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}

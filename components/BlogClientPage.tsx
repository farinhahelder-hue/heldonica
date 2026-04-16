'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import NewsletterForm from '@/components/NewsletterForm'
import type { BlogPost } from '@/lib/blog-supabase'

const CATEGORY_LABELS: Record<string, string> = {
  Tous: 'Tout lire',
  'Carnets Voyage': 'Carnets',
  'Découvertes Locales': 'Pépites locales',
  'Guides Pratiques': 'Guides',
}

const CATEGORY_FALLBACK_BG: Record<string, string> = {
  'Carnets Voyage': 'bg-gradient-to-br from-[#355C7D] to-[#6C5B7B]',
  'Découvertes Locales': 'bg-gradient-to-br from-[#0F766E] to-[#155E75]',
  'Guides Pratiques': 'bg-gradient-to-br from-[#7C2D12] to-[#9A3412]',
}

const BADGE_FALLBACK_SRC = '/images/badges-heldonica.svg'

interface Props {
  posts: (BlogPost & { formattedDate: string })[]
}

export default function BlogClientPage({ posts }: Props) {
  const [activeFilter, setActiveFilter] = useState('Tous')
  const [searchQuery, setSearchQuery] = useState('')

  const categories = ['Tous', 'Carnets Voyage', 'Découvertes Locales', 'Guides Pratiques']

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchCategory = activeFilter === 'Tous' || post.category === activeFilter
      const query = searchQuery.trim().toLowerCase()
      const matchSearch =
        query === '' ||
        post.title.toLowerCase().includes(query) ||
        (post.excerpt ?? '').toLowerCase().includes(query) ||
        (post.tags ?? []).some((tag) => tag.toLowerCase().includes(query))

      return matchCategory && matchSearch
    })
  }, [posts, activeFilter, searchQuery])

  const featuredPost = activeFilter === 'Tous' && searchQuery === '' ? posts[0] : null
  const carnets = filteredPosts.filter((post) => post.category === 'Carnets Voyage')
  const decouvertes = filteredPosts.filter((post) => post.category === 'Découvertes Locales')
  const guides = filteredPosts.filter((post) => post.category === 'Guides Pratiques')

  const totalCarnets = posts.filter((post) => post.category === 'Carnets Voyage').length
  const totalDecouvertes = posts.filter((post) => post.category === 'Découvertes Locales').length
  const totalGuides = posts.filter((post) => post.category === 'Guides Pratiques').length

  return (
    <main className="min-h-screen bg-[#f7f5f1]">
      <section className="relative overflow-hidden bg-stone-950 px-4 py-24 text-white md:py-28">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "url('https://heldonica.fr/wp-content/uploads/2025/08/PXL_20250712_190916811.RAW-01.COVER-EDIT-1024x771.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-stone-950/80 via-stone-900/75 to-amber-950/65" />
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">Blog Heldonica</p>
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
            <StatChip value={totalCarnets} label="Carnets" />
            <StatChip value={totalDecouvertes} label="Pépites locales" />
            <StatChip value={totalGuides} label="Guides" />
          </div>
        </div>
      </section>

      {featuredPost && (
        <section className="mx-auto max-w-7xl px-4 pb-4 pt-14">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">À lire d&apos;abord</p>
              <h2 className="text-2xl font-serif font-light text-stone-900 md:text-3xl">
                Un carnet qui donne le ton.
              </h2>
            </div>
          </div>
          <Link href={`/blog/${featuredPost.slug}`} className="group block transition-all duration-200">
            <article className="relative flex h-[420px] items-end overflow-hidden rounded-[2rem] bg-stone-900 shadow-xl md:h-[500px]">
              {featuredPost.featured_image ? (
                <img
                  src={featuredPost.featured_image}
                  alt={featuredPost.title}
                  width={1200}
                  height={500}
                  className="absolute inset-0 h-full w-full object-cover opacity-60 transition-all duration-500 group-hover:scale-105 group-hover:opacity-70"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-amber-900 to-stone-900" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="relative z-10 max-w-2xl p-8 md:p-12">
                {featuredPost.category && (
                  <span className="mb-4 inline-flex rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white">
                    {featuredPost.category}
                  </span>
                )}
                <h3 className="mb-3 text-2xl font-serif font-light leading-snug text-white transition-colors duration-200 group-hover:text-amber-200 md:text-4xl">
                  {featuredPost.title}
                </h3>
                {featuredPost.excerpt && (
                  <p className="mb-4 text-sm leading-relaxed text-white/75 md:text-base">
                    {featuredPost.excerpt}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-4 text-xs text-white/55">
                  <span>{featuredPost.formattedDate}</span>
                  <span className="font-semibold text-amber-300 transition-transform duration-200 group-hover:translate-x-1">
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
                key={category}
                onClick={() => setActiveFilter(category)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  activeFilter === category
                    ? 'bg-amber-900 text-white shadow-sm'
                    : 'border border-stone-200 bg-white text-stone-600 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-900'
                }`}
              >
                {CATEGORY_LABELS[category]}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Rechercher un carnet, un lieu, un détail"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-full border border-stone-200 bg-white py-3 pl-11 pr-4 text-sm text-stone-700 shadow-sm outline-none transition-all duration-200 placeholder:text-stone-400 focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
            />
            <svg
              className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
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
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-stone-400 transition-colors duration-200 hover:text-stone-600"
              >
                Effacer
              </button>
            )}
          </div>
        </div>

        {searchQuery && (
          <p className="mt-4 text-sm text-stone-500">
            {filteredPosts.length} article{filteredPosts.length > 1 ? 's' : ''} pour “{searchQuery}”.
          </p>
        )}
      </section>

      {filteredPosts.length === 0 ? (
        <div className="mx-auto max-w-7xl px-4 pb-20 text-center">
          <div className="rounded-[2rem] border border-stone-200 bg-white px-6 py-16 shadow-sm">
            <h2 className="mb-3 text-2xl font-serif font-light text-stone-900">Rien de juste pour cette recherche, pour l&apos;instant.</h2>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-stone-600">
              Essaie un lieu, un mot plus simple, ou repars de tout le blog pour reprendre le fil.
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setActiveFilter('Tous')
              }}
              className="mt-6 text-sm font-semibold text-amber-800 transition-colors duration-200 hover:text-amber-700"
            >
              Voir tous les articles →
            </button>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-7xl space-y-16 px-4 pb-20">
          {(activeFilter === 'Tous' || activeFilter === 'Carnets Voyage') && carnets.length > 0 && (
            <section>
              <SectionHeader
                eyebrow="Carnets"
                title="Carnets de voyage"
                description="Les récits qui gardent l&apos;heure, le rythme et ce qu&apos;on a retenu sur place."
                count={carnets.length}
              />
              <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {carnets.map((post) => (
                  <ArticleCard key={post.slug} post={post} />
                ))}
              </div>
            </section>
          )}

          {(activeFilter === 'Tous' || activeFilter === 'Découvertes Locales') && decouvertes.length > 0 && (
            <section className="rounded-[2rem] bg-amber-50 px-4 py-12 md:px-8">
              <SectionHeader
                eyebrow="Pépites"
                title="Découvertes locales"
                description="Des lieux qu&apos;on n&apos;était pas venus chercher, et qu&apos;on aurait regretté de rater."
                count={decouvertes.length}
              />
              <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {decouvertes.map((post) => (
                  <ArticleCard key={post.slug} post={post} />
                ))}
              </div>
            </section>
          )}

          {(activeFilter === 'Tous' || activeFilter === 'Guides Pratiques') && guides.length > 0 && (
            <section>
              <SectionHeader
                eyebrow="Guides"
                title="Guides pratiques"
                description="Des repères concrets quand le terrain devient plus utile que la théorie."
                count={guides.length}
              />
              <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {guides.map((post) => (
                  <ArticleCard key={post.slug} post={post} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <NewsletterForm variant="blog" />
    </main>
  )
}

function StatChip({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-left backdrop-blur-sm">
      <span className="mr-2 text-lg font-light text-white">{value}</span>
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
    <div className="border-b border-stone-200 pb-5">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">{eyebrow}</p>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-serif font-light text-stone-900">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">{description}</p>
        </div>
        <span className="inline-flex rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">
          {count} article{count > 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}

function ArticleCard({ post }: { post: BlogPost & { formattedDate: string } }) {
  const fallbackBg = CATEGORY_FALLBACK_BG[post.category ?? ''] ?? 'bg-stone-200'
  const [imageSrc, setImageSrc] = useState(post.featured_image ?? BADGE_FALLBACK_SRC)

  useEffect(() => {
    setImageSrc(post.featured_image ?? BADGE_FALLBACK_SRC)
  }, [post.featured_image])

  const isFallback = !post.featured_image || imageSrc === BADGE_FALLBACK_SRC

  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full transition-all duration-200">
      <article className="flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-stone-100 bg-white shadow-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-lg">
        <div className="relative h-56 overflow-hidden">
          {!isFallback ? (
            <img
              src={imageSrc}
              alt={post.title}
              width={400}
              height={224}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={() => setImageSrc(BADGE_FALLBACK_SRC)}
            />
          ) : (
            <div className={`flex h-full w-full flex-col items-center justify-center gap-3 ${fallbackBg}`}>
              <img
                src={BADGE_FALLBACK_SRC}
                alt="Heldonica"
                width={220}
                height={140}
                className="h-auto w-36 opacity-95"
                loading="lazy"
              />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/85">
                Heldonica
              </span>
            </div>
          )}
          {post.category && (
            <div className="absolute left-4 top-4">
              <span className="rounded-full bg-amber-700/90 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                {post.category}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="mb-2 text-lg font-semibold leading-snug text-stone-900 transition-colors duration-200 group-hover:text-amber-700">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="mb-4 flex-1 text-sm leading-relaxed text-stone-600">
              {post.excerpt}
            </p>
          )}
          {post.tags && post.tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {post.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-500">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="mt-auto flex items-center justify-between border-t border-stone-100 pt-4 text-xs text-stone-400">
            <span>{post.formattedDate}</span>
            <span className="font-semibold text-amber-700 transition-transform duration-200 group-hover:translate-x-1">
              Lire le carnet →
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}

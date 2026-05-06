'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BlogPost } from '@/lib/blog-supabase'

interface PostWithMeta extends BlogPost {
  formattedDate: string
  readTime: number
}

interface Props {
  posts: PostWithMeta[]
}

const CATEGORIES = ['Tous', 'Slow Travel', 'Carnets de route', 'Pépites', 'Expert hôtelier', 'Coulisses']

export default function BlogClientPage({ posts }: Props) {
  const [activeCategory, setActiveCategory] = useState('Tous')
  const [searchQuery, setSearchQuery] = useState('')

  const featuredPost = posts[0] ?? null
  const restPosts = posts.slice(1)

  const filteredPosts = useMemo(() => {
    let list = activeCategory === 'Tous'
      ? restPosts
      : restPosts.filter(p => p.category === activeCategory)

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter(post =>
        post.title.toLowerCase().includes(q) ||
        (post.excerpt ?? '').toLowerCase().includes(q) ||
        (post.category ?? '').toLowerCase().includes(q) ||
        (post.tags ?? []).some(tag => tag.toLowerCase().includes(q))
      )
    }
    return list
  }, [restPosts, activeCategory, searchQuery])

  const eyebrow = activeCategory !== 'Tous' ? activeCategory : 'Tous les récits'
  const description =
    activeCategory === 'Tous'
      ? 'Des articles écrits depuis le terrain, avec les vraies odeurs, les vraies erreurs — et les pépites dénichées en chemin.'
      : `Tous nos articles dans la catégorie « ${activeCategory} ».`

  return (
    <main className="min-h-screen bg-cloud-dancer">

      {/* Hero Banner */}
      <section className="relative bg-eucalyptus-green text-white py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('/textures/organic.svg')] bg-cover" />
        <div className="relative max-w-4xl mx-auto text-center">
          <p className="text-sm uppercase tracking-widest text-white/70 mb-3 font-sans">Le blog Heldonica</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Carnets de route &amp; pépites dénichées
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto font-sans">
            On écrit depuis le terrain : une arrivée trop tardive, une adresse trouvée au bon moment,
            une erreur qu&apos;on ne refera pas. Le reste, on le laisse aux brochures.
          </p>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="max-w-5xl mx-auto px-6 -mt-10 mb-16 relative z-10">
          <Link href={`/blog/${featuredPost.slug}`} className="group block rounded-2xl overflow-hidden shadow-xl bg-white hover:shadow-2xl transition-shadow duration-300">
            <div className="md:flex">
              <div className="md:w-1/2 relative h-64 md:h-auto">
                <Image
                  src={featuredPost.featured_image || '/images/placeholder-blog.jpg'}
                  alt={featuredPost.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  priority
                />
              </div>
              <div className="md:w-1/2 p-8 flex flex-col justify-center">
                <span className="inline-block text-xs font-sans uppercase tracking-widest text-eucalyptus-green mb-3">
                  À lire d&apos;abord
                </span>
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-charcoal mb-4 leading-snug group-hover:text-eucalyptus-green transition-colors">
                  {featuredPost.title}
                </h2>
                {featuredPost.excerpt && (
                  <p className="text-charcoal/70 text-base font-sans leading-relaxed mb-6">
                    {featuredPost.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-charcoal/50 font-sans">
                  <span>{featuredPost.formattedDate}</span>
                  {featuredPost.readTime > 0 && <span>{featuredPost.readTime} min de lecture</span>}
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Search + Filters */}
      <section className="max-w-5xl mx-auto px-6 mb-10">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Search */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Rechercher un article…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full border border-charcoal/20 rounded-full px-5 py-2.5 text-sm font-sans text-charcoal placeholder-charcoal/40 focus:outline-none focus:ring-2 focus:ring-eucalyptus-green/40 bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal transition-colors"
                aria-label="Effacer la recherche"
              >
                ✕
              </button>
            )}
          </div>
          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-sans transition-colors ${
                  activeCategory === cat
                    ? 'bg-eucalyptus-green text-white'
                    : 'bg-white border border-charcoal/20 text-charcoal/70 hover:border-eucalyptus-green hover:text-eucalyptus-green'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-charcoal/40 font-sans mb-1">{eyebrow}</p>
          <p className="text-charcoal/60 text-sm font-sans">{description}</p>
        </div>

        {searchQuery && (
          <p className="text-sm text-charcoal/60 font-sans mb-6">
            {filteredPosts.length > 0
              ? <>{filteredPosts.length} article{filteredPosts.length > 1 ? 's' : ''} pour &laquo;&nbsp;{searchQuery}&nbsp;&raquo;.</>
              : <>Aucun résultat pour &laquo;&nbsp;{searchQuery}&nbsp;&raquo;. Essaie un lieu, un mot plus simple, ou repars de tout le blog pour reprendre le fil.</>
            }
          </p>
        )}

        {filteredPosts.length === 0 && !searchQuery && (
          <p className="text-charcoal/50 font-sans text-sm">Aucun article dans cette catégorie pour l&apos;instant.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map(post => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={post.featured_image || '/images/placeholder-blog.jpg'}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5 flex flex-col flex-1">
                {post.category && (
                  <span className="text-xs font-sans uppercase tracking-widest text-eucalyptus-green mb-2">
                    {post.category}
                  </span>
                )}
                <h3 className="font-serif text-lg font-bold text-charcoal mb-2 leading-snug group-hover:text-eucalyptus-green transition-colors">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-charcoal/60 text-sm font-sans leading-relaxed mb-4 flex-1">
                    {post.excerpt.length > 120 ? post.excerpt.slice(0, 120) + '…' : post.excerpt}
                  </p>
                )}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-charcoal/10">
                  <span className="text-xs text-charcoal/40 font-sans">{post.formattedDate}</span>
                  {post.readTime > 0 && (
                    <span className="text-xs text-charcoal/40 font-sans">{post.readTime} min</span>
                  )}
                </div>
                {(post.tags ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {(post.tags ?? []).slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs bg-eucalyptus-green/10 text-eucalyptus-green px-2 py-0.5 rounded-full font-sans">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}

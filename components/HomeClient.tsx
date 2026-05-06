'use client'

import { useEffect, useRef, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import type { BlogPost } from '@/lib/blog-supabase'
import { getExcerpt } from '@/lib/blog-supabase'
import InstagramEmbed from '@/components/InstagramEmbed'
import NewsletterForm from '@/components/NewsletterForm'
import BlogCtaLink from '@/components/BlogCtaLink'

const HELDONICA_BADGE_FALLBACK = '/images/badges-heldonica.svg'

function displayExcerpt(post: BlogPost): string {
  return getExcerpt(post, 140);
}

const SLUG_IMAGES: Record<string, string> = {
  'madere-slow-travel-guide':                     'https://images.unsplash.com/photo-1560719887-fe3105fa1e55?w=1200&q=80',
  'urbex-paris-safe':                             'https://images.unsplash.com/photo-1520939817895-060bdaf4fe1b?w=1200&q=80',
  'guide-pratique-comment-debuter-le-slow-travel-en-duo': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80',
  'madere-quand-partir-sur-lile-de-leternel-printemps':   'https://images.unsplash.com/photo-1569959220744-ff553533f492?w=1200&q=80',
  'pepites-mystiques-de-madere':                  'https://images.unsplash.com/photo-1560719887-fe3105fa1e55?w=1200&q=80',
  'prego-no-bolo-do-caco':                        'https://images.unsplash.com/photo-1574484284002-952d92a03a52?w=1200&q=80',
  'flotter-sur-la-limmat-a-zurich-notre-aventure-dete':   'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=1200&q=80',
}

const CAT_IMAGES: Record<string, string> = {
  'Carnets Voyage': 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/blog-images/stoos-01.jpg',
  'Découvertes Locales': 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/blog-images/romania-01.jpg',
  'Guides Pratiques': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80',
  'Expert Hôtelier': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80',
  Travel: 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=1200&q=80',
  'Food & Lifestyle': 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=1200&q=80',
}

function postImage(p: BlogPost): string {
  if (p.featured_image && p.featured_image.trim().length > 0) return p.featured_image
  if (p.slug && SLUG_IMAGES[p.slug]) return SLUG_IMAGES[p.slug]
  if (p.category && CAT_IMAGES[p.category]) return CAT_IMAGES[p.category]
  return HELDONICA_BADGE_FALLBACK
}

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]')
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target) }
      }),
      { threshold: 0.12 }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

function useCounter(target: number, duration = 1400, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let t0: number | null = null
    const step = (ts: number) => {
      if (!t0) t0 = ts
      const p = Math.min((ts - t0) / duration, 1)
      setCount(Math.floor(p * target))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [start, target, duration])
  return count
}

function AnimatedStat({ nb, label, suffix = '' }: { nb: number | string; label: string; suffix?: string }) {
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isNum = typeof nb === 'number'
  const count = useCounter(isNum ? nb : 0, 1400, started && isNum)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStarted(true); io.disconnect() } }, { threshold: 0.5 })
    io.observe(el); return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} className="border-t-2 border-mahogany pt-4 group hover:-translate-y-1 transition-transform duration-300">
      <p className="text-3xl md:text-4xl font-serif font-light text-mahogany mb-1">
        {isNum ? (started ? count + suffix : '0' + suffix) : nb}
      </p>
      <p className="text-xs text-charcoal/60 leading-snug">{label}</p>
    </div>
  )
}

function ArticleCard({ post, size = 'md' }: { post: BlogPost & { formattedDate: string; readTime?: number }; size?: 'sm' | 'md' | 'lg' }) {
  const img = postImage(post)
  const [imgSrc, setImgSrc] = useState(img)
  const h = size === 'lg' ? 'h-80' : size === 'md' ? 'h-60' : 'h-44'
  const readTime = post.readTime ?? post.read_time

  useEffect(() => {
    setImgSrc(img)
  }, [img])

  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <article className="relative rounded-2xl overflow-hidden bg-mahogany/80 shadow-md hover:shadow-xl transition-all duration-400 h-full flex flex-col">
        <div className={`relative ${h} overflow-hidden`}>
          <img src={imgSrc} alt={post.title} width={600} height={400}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-90 group-hover:scale-105 transition-all duration-600"
            loading="lazy"
            onError={() => setImgSrc(HELDONICA_BADGE_FALLBACK)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
          <div className="absolute top-3 left-3">
            <span className="bg-eucalyptus/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {post.category}
            </span>
          </div>
          {readTime && readTime > 0 && (
            <span className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-sm text-white/80 text-xs px-2 py-0.5 rounded-full">
              {readTime} min
            </span>
          )}
        </div>
        <div className="p-4 flex flex-col flex-1 bg-white">
          <h3 className="font-semibold text-mahogany text-sm leading-snug mb-1.5 group-hover:text-eucalyptus transition-colors line-clamp-2">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-charcoal/70 text-xs leading-relaxed line-clamp-2 flex-1 mb-2">{post.excerpt}</p>
          )}
          {!post.excerpt && displayExcerpt(post) && (
            <p className="text-charcoal/70 text-xs leading-relaxed line-clamp-2 flex-1 mb-2">{displayExcerpt(post)}</p>
          )}
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-cloud-dancer">
            <span className="text-xs text-charcoal/60">
              {post.author ?? 'Heldonica'} {post.destination ? `• 📍 ${post.destination}` : ` • ${post.formattedDate}`}
            </span>
            <span className="text-xs text-eucalyptus font-semibold group-hover:translate-x-1 transition-transform">Lire →</span>
          </div>
        </div>
      </article>
    </Link>
  )
}

interface HomeProps {
  featured: (BlogPost & { formattedDate: string; readTime?: number }) | null
  travelPosts: (BlogPost & { formattedDate: string; readTime?: number })[]
  foodPosts: (BlogPost & { formattedDate: string; readTime?: number })[]
  latestPosts: (BlogPost & { formattedDate: string; readTime?: number })[]
  totalPosts: number
  coveredCountries?: string | null
}

export default function HomeClient({ featured, travelPosts, foodPosts, latestPosts, totalPosts, coveredCountries }: HomeProps) {
  useScrollReveal()
  const featImg = featured ? postImage(featured) : null
  const publishedArticles = typeof totalPosts === 'number' && totalPosts > 0 ? totalPosts : 10
  // FIX DATA: fallback corrigé à 7 pays (cohérent avec page À propos)
  const countryCount = typeof coveredCountries === 'number' && coveredCountries > 0 ? coveredCountries : (coveredCountries ? parseInt(coveredCountries) : 7)

  return (
    <>
      <style>{`
        [data-reveal] { opacity:0; transform:translateY(28px); transition:opacity 0.7s cubic-bezier(0.16,1,0.3,1),transform 0.7s cubic-bezier(0.16,1,0.3,1); }
        [data-reveal='left'] { transform:translateX(-32px); }
        [data-reveal='right'] { transform:translateX(32px); }
        [data-reveal='scale'] { transform:scale(0.94); }
        [data-reveal].revealed { opacity:1; transform:none; }
        [data-delay='100']{transition-delay:0.1s} [data-delay='200']{transition-delay:0.2s}
        [data-delay='300']{transition-delay:0.3s} [data-delay='400']{transition-delay:0.4s}
        [data-delay='500']{transition-delay:0.5s} [data-delay='600']{transition-delay:0.6s}
        .hero-word{display:inline;opacity:0;animation:wordIn 0.6s cubic-bezier(0.16,1,0.3,1) forwards}
        @keyframes wordIn{to{opacity:1}}
        @keyframes subtlePulse{0%,100%{opacity:.7;transform:translateY(0)}50%{opacity:1;transform:translateY(4px)}}
        .scroll-cue{animation:subtlePulse 2.2s ease-in-out infinite}
      `}</style>

      <Header />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative h-[85vh] md:h-screen bg-black flex items-end overflow-hidden">
        <video autoPlay muted loop playsInline preload="auto"
          className="absolute inset-0 w-full h-full object-cover opacity-45"
          src="https://d2xsxph8kpxj0f.cloudfront.net/310519663470606636/jAd3LynLbumRRtRSgGxysF/Heldonica_11053b9d.mp4"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
        <div className="relative z-20 px-5 md:px-16 pb-12 md:pb-24 max-w-4xl">
          <p className="text-teal text-xs font-semibold tracking-[0.2em] uppercase mb-5"
             style={{ animation: 'wordIn 0.6s 0.2s cubic-bezier(0.16,1,0.3,1) forwards', opacity: 0 }}>
            Slow travel vécu en duo · Hors sentiers · Paris
          </p>
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-serif font-light text-white leading-[1.15] mb-4 md:mb-6">
            <span className="hero-word" style={{ animationDelay: '0.3s' }}>On ferme </span>
            <span className="hero-word" style={{ animationDelay: '0.4s' }}>les ordis.</span>
            <br />
            <span className="hero-word" style={{ animationDelay: '0.55s' }}>On part.</span>
            <br />
            <em>
              <span className="hero-word" style={{ animationDelay: '0.7s' }}>On revient </span>
              <span className="hero-word" style={{ animationDelay: '0.8s' }}>avec des pépites </span>
              <span className="hero-word" style={{ animationDelay: '0.9s' }}>qu&apos;on n&apos;avait pas cherchées.</span>
            </em>
          </h1>
          <p className="text-sm md:text-lg text-gray-300 leading-relaxed mb-6 md:mb-8 max-w-xl"
             style={{ animation: 'wordIn 0.7s 1.1s cubic-bezier(0.16,1,0.3,1) forwards', opacity: 0 }}>
            Un duo Paris-Madère-Roumanie qui voyage lentement, documente vraiment et partage tout ce qu&apos;on a vécu — pas ce qu&apos;on a lu ailleurs. Dénicheurs de pépites, même en bas de chez toi.
          </p>
          <div className="flex flex-wrap gap-3"
               style={{ animation: 'wordIn 0.7s 1.3s cubic-bezier(0.16,1,0.3,1) forwards', opacity: 0 }}>
            <BlogCtaLink
              href="/blog"
              label="Lire le carnet →"
              gtag_label="hero_read_carnet"
              className="px-5 md:px-6 py-2.5 md:py-3 bg-mahogany hover:bg-eucalyptus text-white rounded-full font-semibold text-sm tracking-wide transition"
            />
            <BlogCtaLink
              href="/travel-planning-form"
              label="Nous écrire →"
              gtag_label="hero_contact"
              className="px-5 md:px-6 py-2.5 md:py-3 border border-white/50 hover:border-white text-white hover:bg-white/10 rounded-full font-semibold text-sm tracking-wide transition"
            />
          </div>
        </div>
        <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-20 scroll-cue"
             style={{ animation: 'subtlePulse 2.2s 1.8s ease-in-out infinite, wordIn 0.6s 1.6s forwards', opacity: 0 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.6">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </section>

      {/* ── IDENTITÉ ──────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="grid md:grid-cols-5 gap-12 md:gap-16 items-start">
            <div className="md:col-span-3" data-reveal="left">
              <p className="text-eucalyptus text-xs font-bold tracking-[0.2em] uppercase mb-4">Notre histoire</p>
              <h2 className="text-3xl md:text-5xl font-serif font-light text-mahogany leading-tight mb-6">
                Un art du voyage
                <span className="block italic text-eucalyptus">autrement</span>
              </h2>
              <p className="text-base text-charcoal/70 leading-relaxed mb-4">
                Elle a habité sept pays. Pas visité, habité. C&apos;est différent. Ça change la manière de lire une rue, de sentir si une table vaut vraiment le détour, de savoir quand un quartier commence à parler.
              </p>
              <p className="text-base text-charcoal/70 leading-relaxed mb-4">
                Lui est né à Madère, entre l&apos;Atlantique et des falaises que les cartes n&apos;ont pas encore toutes nommées. Il part là où les guides s&apos;arrêtent, puis il revient avec un regard que les hôtels indépendants peuvent vraiment utiliser.
              </p>
              <p className="text-base text-charcoal/70 leading-relaxed mb-8">
                Notre regard est né à deux, entre Paris, Madère et la Roumanie. On ferme les ordis, on part, on revient, on note ce qui tient vraiment sur le terrain. Ensuite seulement, on le partage.
              </p>
              <Link href="/blog" className="inline-flex items-center gap-2 text-eucalyptus font-semibold text-sm hover:gap-3 transition-all">
                Lire le carnet →
              </Link>
            </div>
            <div className="md:col-span-2 grid grid-cols-2 gap-6" data-reveal="right">
              <AnimatedStat nb="10+" label="Ans de terrain en duo" />
              <AnimatedStat nb="100+" label="Adresses vécues" />
              <AnimatedStat nb={countryCount} label="Pays habités" />
              <AnimatedStat nb={publishedArticles} suffix="" label="Carnets publiés" />
              <div className="col-span-2 mt-2">
                <p className="text-xs text-charcoal/60 leading-relaxed">
                  <span className="font-semibold text-charcoal/80">Terrains de jeu :</span><br />
                  Paris · Madère · Roumanie · Normandie · Sicile · Sardaigne · Tanzanie · Colombie · Afrique du Sud
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── À LA UNE ──────────────────────────────────────────────────────── */}
      {featured && (
        <section className="py-0 bg-mahogany">
          <Link href={`/blog/${featured.slug}`} className="group block">
            <article className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden flex items-end">
              {featImg && (
                <img src={featImg} alt={featured.title} width={1400} height={700}
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-70 group-hover:scale-105 transition-all duration-700"
                  loading="eager" fetchPriority="high" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="relative z-10 p-8 md:p-16 max-w-3xl">
                <p className="text-teal text-xs font-bold tracking-[0.2em] uppercase mb-3">✦ À la une</p>
                <span className="inline-block bg-eucalyptus text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
                  {featured.category}
                </span>
                <h2 className="text-2xl md:text-4xl font-serif font-light text-white leading-snug mb-3 group-hover:text-teal/80 transition-colors">
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p className="text-white/75 text-sm md:text-base leading-relaxed line-clamp-2 mb-4 max-w-xl">{featured.excerpt}</p>
                )}
                {!featured.excerpt && displayExcerpt(featured) && (
                  <p className="text-white/75 text-sm md:text-base leading-relaxed line-clamp-2 mb-4 max-w-xl">{displayExcerpt(featured)}</p>
                )}
                <span className="inline-flex items-center gap-2 text-teal font-semibold text-sm group-hover:gap-3 transition-all">
                  Lire le carnet →
                </span>
              </div>
            </article>
          </Link>
        </section>
      )}

      {/* ── CARNETS DE VOYAGE ─────────────────────────────────────────────── */}
      {travelPosts.length > 0 && (
        <section className="py-20 md:py-28 bg-cloud-dancer">
          <div className="max-w-6xl mx-auto px-6 md:px-10">
            <div className="flex items-end justify-between mb-10 flex-wrap gap-4" data-reveal>
              <div>
                <p className="text-eucalyptus text-xs font-bold tracking-[0.2em] uppercase mb-2">✦ Carnets de voyage</p>
                <h2 className="text-3xl md:text-4xl font-serif font-light text-mahogany">Nos itinéraires vécus</h2>
                <p className="text-sm text-charcoal/70 leading-relaxed mt-3 max-w-xl">
                  Chaque itinéraire qu&apos;on propose, on l&apos;a fait. Plusieurs fois. En conditions réelles, pas en press trip.
                </p>
              </div>
              <Link href="/blog" className="text-sm text-eucalyptus font-semibold hover:underline">Voir tous les carnets →</Link>
            </div>
            {travelPosts.length >= 1 && (
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <Link href={`/blog/${travelPosts[0].slug}`} className="card-lift group relative rounded-2xl overflow-hidden bg-mahogany/80 aspect-[4/3] md:row-span-2" data-reveal="left">
                  <img src={postImage(travelPosts[0])} alt={travelPosts[0].title}
                    className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700"
                    loading="lazy" width={800} height={600} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6">
                    <span className="inline-block bg-eucalyptus text-white text-xs font-bold px-2.5 py-1 rounded-full mb-3">
                      {travelPosts[0].destination ?? travelPosts[0].category}
                    </span>
                    <h3 className="text-white text-2xl md:text-3xl font-serif font-light leading-tight group-hover:text-teal/80 transition-colors">
                      {travelPosts[0].title}
                    </h3>
                    {travelPosts[0].excerpt && (
                      <p className="text-white/80 text-sm mt-2 line-clamp-2">{travelPosts[0].excerpt}</p>
                    )}
                    {!travelPosts[0].excerpt && displayExcerpt(travelPosts[0]) && (
                      <p className="text-white/80 text-sm mt-2 line-clamp-2">{displayExcerpt(travelPosts[0])}</p>
                    )}
                  </div>
                </Link>
                <div className="grid grid-rows-2 gap-6">
                  {travelPosts.slice(1, 3).map((p, i) => (
                    <Link key={p.slug} href={`/blog/${p.slug}`}
                      className="group relative rounded-2xl overflow-hidden bg-mahogany/80"
                      data-reveal data-delay={String((i + 1) * 150)}>
                      <img src={postImage(p)} alt={p.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-65 group-hover:opacity-75 group-hover:scale-105 transition-all duration-700"
                        loading="lazy" width={600} height={300} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <div className="relative p-5 h-44 flex flex-col justify-end">
                        <h3 className="text-white text-lg font-serif font-light group-hover:text-teal/80 transition-colors line-clamp-2">
                          {p.title}
                        </h3>
                        <p className="text-white/75 text-xs mt-1">{p.destination ?? p.formattedDate}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── FOOD & LIFESTYLE ──────────────────────────────────────────────── */}
      {foodPosts.length > 0 && (
        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-6xl mx-auto px-6 md:px-10">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
              <div className="relative" data-reveal="left">
                <img src={postImage(foodPosts[0])}
                  alt={foodPosts[0].title}
                  className="rounded-2xl w-full aspect-[4/3] object-cover shadow-lg" loading="lazy" width={700} height={525} />
                <div className="absolute -bottom-4 -right-4 bg-mahogany text-white px-5 py-3 rounded-xl shadow-lg hidden md:block">
                  <p className="text-xs font-bold tracking-wider uppercase">Adresses testées</p>
                  <p className="text-2xl font-serif font-light mt-0.5">100%</p>
                </div>
              </div>
              <div data-reveal="right">
                <p className="text-eucalyptus text-xs font-bold tracking-[0.2em] uppercase mb-4">Food &amp; Lifestyle</p>
                <h2 className="text-3xl md:text-4xl font-serif font-light text-mahogany leading-tight mb-4">Inspirations gourmandes</h2>
                <p className="text-base text-charcoal/70 leading-relaxed mb-6">
                  On mange avant de visiter. Le bolo do caco chaud acheté au marché de Câmara de Lobos, le bacalhau de la dame du coin à Funchal, la Schwarzwälder Kirschtorte à Zurich un mardi pluvieux — c&apos;est ça qu&apos;on ramène dans nos carnets. Pas des restaurants étoilés. Des adresses qui n&apos;ont pas de site web.
                </p>
                <div className="space-y-4 mb-8">
                  {foodPosts.slice(0, 3).map((p) => (
                    <Link key={p.slug} href={`/blog/${p.slug}`}
                      className="flex items-start gap-3 group hover:bg-eucalyptus/5 rounded-xl p-2 -mx-2 transition-colors">
                      <img src={postImage(p)} alt={p.title} width={60} height={60}
                        className="w-14 h-14 rounded-lg object-cover flex-shrink-0" loading="lazy" />
                      <div>
                        <p className="font-semibold text-charcoal/90 text-sm group-hover:text-eucalyptus transition-colors line-clamp-1">{p.title}</p>
                        {p.excerpt && <p className="text-charcoal/60 text-xs line-clamp-2 mt-0.5">{p.excerpt}</p>}
                        {!p.excerpt && displayExcerpt(p) && <p className="text-charcoal/60 text-xs line-clamp-2 mt-0.5">{displayExcerpt(p)}</p>}
                      </div>
                    </Link>
                  ))}
                </div>
                <Link href="/blog" className="inline-flex items-center gap-2 text-eucalyptus font-semibold text-sm hover:gap-3 transition-all">
                  Découvrir toutes les recettes →
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── DERNIERS ARTICLES ─────────────────────────────────────────────── */}
      {latestPosts.length > 0 && (
        <section className="py-20 bg-[#f7f6f2]">
          <div className="max-w-6xl mx-auto px-6 md:px-10">
            <div className="flex items-end justify-between mb-10 flex-wrap gap-4" data-reveal>
              <div>
                <p className="text-eucalyptus text-xs font-bold tracking-[0.2em] uppercase mb-2">✦ Fraîchement publié</p>
                <h2 className="text-2xl md:text-3xl font-serif font-light text-mahogany">Les dernières pépites</h2>
              </div>
              <Link href="/blog" className="text-sm text-eucalyptus font-semibold hover:underline">Tout voir →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestPosts.map((p, i) => (
                <div key={p.slug} data-reveal data-delay={String(i * 100)}>
                  <ArticleCard post={p} size="md" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA TRAVEL PLANNING (fond mahogany) ───────────────────────────── */}
      <section className="py-20 md:py-28 bg-mahogany text-white">
        <div className="max-w-5xl mx-auto px-6 md:px-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div data-reveal="left">
              <p className="text-teal text-xs font-bold tracking-[0.2em] uppercase mb-4">Travel Planning · terrain vécu</p>
              <h2 className="text-3xl md:text-5xl font-serif font-light leading-tight mb-6">
                On ne fait pas des itinéraires.<br />
                <em className="text-teal">On fait le tien.</em>
              </h2>
              {/* FIX P1: text-charcoal/40 → text-white/80 sur fond mahogany */}
              <p className="text-white/80 leading-relaxed mb-4">
                Tu nous envoies tes contraintes réelles — temps, budget, énergie, envie. On transforme ça en séquence concrète, avec les adresses qu&apos;on a testées et l&apos;ordre qui a du sens sur le terrain.
              </p>
              <p className="text-white/65 text-sm leading-relaxed mb-8">
                Notre terrain naturel : les couples qui veulent ralentir sans s&apos;ennuyer, les solos qui cherchent du vrai, les familles qui en ont marre des parcs d&apos;attractions.
              </p>
              {/* FIX P2: rounded → rounded-full + hover states */}
              <div className="flex flex-wrap gap-3">
                <BlogCtaLink
                  href="/travel-planning-form"
                  label="Nous écrire →"
                  gtag_label="services_contact"
                  className="px-6 py-3 bg-eucalyptus hover:bg-eucalyptus/80 text-white rounded-full font-semibold text-sm transition"
                />
                <BlogCtaLink
                  href="/blog"
                  label="Lire le carnet →"
                  gtag_label="services_read_carnet"
                  className="px-6 py-3 border border-white/30 hover:border-white/70 hover:bg-white/10 text-white rounded-full font-semibold text-sm transition"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4" data-reveal="right">
              {[
                { t: 'Couples aventuriers', d: "Notre spécialité : ralentir sans ennuyer, laisser de la place au vrai, et garder le hors-sentiers sans perdre le fil." },
                { t: 'Ouvert aussi à ton format', d: "Solo, famille curieuse ou groupe d'amis : on adapte cette même exigence terrain à votre énergie, vos contraintes et votre rythme." },
                { t: 'Vécu sur le terrain', d: "Cartes, adresses, conseils pratiques et pépites dénichées : tout part d'expériences testées, pas inventées." },
              ].map((item) => (
                <div key={item.t} className="border border-white/15 rounded-xl p-5 hover:border-teal/40 hover:bg-white/5 transition">
                  <h3 className="font-semibold text-white text-sm mb-1">{item.t}</h3>
                  {/* FIX P1: text-charcoal/40 → text-white/70 sur fond mahogany */}
                  <p className="text-white/70 text-sm leading-relaxed">{item.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER (fond mahogany) ────────────────────────────────────── */}
      <section className="py-20 bg-mahogany text-white">
        <div className="max-w-5xl mx-auto px-6 md:px-10">
          <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
            <div data-reveal="left">
              <p className="text-teal text-xs font-semibold tracking-[0.2em] uppercase mb-4">Newsletter terrain</p>
              <h2 className="text-3xl md:text-4xl font-serif font-light leading-tight mb-4">
                Une fois par mois, on t&apos;envoie
                <span className="block italic text-teal">ce qu&apos;on a vraiment trouvé.</span>
              </h2>
              {/* FIX P1: text-charcoal/30 → text-white/75 sur fond mahogany */}
              <p className="text-white/75 text-sm md:text-base leading-relaxed max-w-xl">
                Une adresse, un timing, une erreur à éviter. Rien de plus. Pas de remplissage, pas de bruit, juste ce qui mérite vraiment une place dans ton prochain départ.
              </p>
            </div>
            <div data-reveal="right">
              <NewsletterForm variant="inline" />
            </div>
          </div>
        </div>
      </section>

      {/* ── INSTAGRAM ────────────────────────────────────────────────────── */}
      <section className="py-16 bg-cloud-dancer">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-serif text-mahogany text-center mb-8">
            Sur le terrain, pas en studio
          </h2>
          <InstagramEmbed limit={6} />
        </div>
      </section>

      <Footer />
    </>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import Image from 'next/image'
import type { BlogPost } from '@/lib/blog-supabase'
import type { HomeDestination } from '@/lib/home-data'
import { getExcerpt } from '@/lib/blog-supabase'
import InstagramFeed from '@/components/InstagramFeed'
import NewsletterForm from '@/components/NewsletterForm'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider';
import EditableZone from '@/components/inline-edit/EditableZone'

const HELDONICA_BADGE_FALLBACK = '/images/badges-heldonica.svg'

// Get display excerpt: use stored excerpt or generate from content
function displayExcerpt(post: BlogPost): string {
  return getExcerpt(post, 140);
}

// ─── Images de secours par slug ──────────────────────────────────────────────
const SLUG_IMAGES: Record<string, string> = {
  'madere-slow-travel-guide':                     'https://images.unsplash.com/photo-1560719887-fe3105fa1e55?w=1200&q=80',
  'urbex-paris-safe':                             'https://images.unsplash.com/photo-1520939817895-060bdaf4fe1b?w=1200&q=80',
  'guide-pratique-comment-debuter-le-slow-travel-en-duo': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80',
  'madere-quand-partir-sur-lile-de-leternel-printemps':   'https://images.unsplash.com/photo-1569959220744-ff553533f492?w=1200&q=80',
  'pepites-mystiques-de-madere':                  'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&q=80',
  'prego-no-bolo-do-caco':                        'https://images.unsplash.com/photo-1574484284002-952d92a03a52?w=1200&q=80',
  'flotter-sur-la-limmat-a-zurich-notre-aventure-dete':   'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=1200&q=80',
}

const CAT_IMAGES: Record<string, string> = {
  'Carnets Voyage': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80',
  'Découvertes Locales': 'https://images.unsplash.com/photo-1520939817895-060bdaf4fe1b?w=1200&q=80',
  'Guides Pratiques': 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=1200&q=80',
  'Food & Lifestyle': 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=1200&q=80',
  'Travel': 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80',
}

function postImage(p: BlogPost): string {
  if (p.featured_image && p.featured_image.trim().length > 0) return p.featured_image
  if (p.slug && SLUG_IMAGES[p.slug]) return SLUG_IMAGES[p.slug]
  if (p.category && CAT_IMAGES[p.category]) return CAT_IMAGES[p.category]
  return HELDONICA_BADGE_FALLBACK
}

// ─── Hooks ────────────────────────────────────────────────────────────────────
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
  return (
    <div className="border-t-2 border-mahogany pt-4 group hover:-translate-y-1 transition-transform duration-300">
      <p className="text-3xl md:text-4xl font-serif font-light text-mahogany mb-1">
        {nb}{suffix}
      </p>
      <p className="text-xs text-charcoal/60 leading-snug">{label}</p>
    </div>
  )
}

// ─── Gradients et icônes SVG par catégorie ─────────────────────────────────────
const CATEGORY_GRADIENTS: Record<string, string> = {
  'Carnets Voyage': 'from-eucalyptus to-teal',
  'Découvertes Locales': 'from-mahogany to-eucalyptus',
  'Guides Pratiques': 'from-eucalyptus to-teal',
  'Food & Lifestyle': 'from-mahogany/80 to-teal/80',
  'Travel': 'from-eucalyptus to-teal',
  default: 'from-mahogany to-teal/60',
}

const CATEGORY_ICONS: Record<string, string> = {
  'Carnets Voyage': `<path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  'Découvertes Locales': `<path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="11" r="2" fill="currentColor"/>`,
  'Guides Pratiques': `<path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.882 6 2.346m6-12.33c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.346m0-12.33c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.346" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  'Food & Lifestyle': `<path d="M12 3v7.5a3 3 0 01-.984 2.137L8.016 16.5a4.5 4.5 0 01-4.004.984A3 3 0 013 13.5V3h9z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 3v2m12-2v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  'Travel': `<path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  default: `<path d="M12 21a9 9 0 100-18 9 9 0 000 18z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M12 8v4l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,
}

function getCategoryGradient(category: string | null | undefined): string {
  if (!category) return CATEGORY_GRADIENTS.default
  return CATEGORY_GRADIENTS[category] ?? CATEGORY_GRADIENTS.default
}

function getCategoryIcon(category: string | null | undefined): string {
  if (!category) return CATEGORY_ICONS.default
  return CATEGORY_ICONS[category] ?? CATEGORY_ICONS.default
}

// ─── Card article ─────────────────────────────────────────────────────────────
function ArticleCard({ post, size = 'md' }: { post: BlogPost & { formattedDate: string; readTime?: number }; size?: 'sm' | 'md' | 'lg' }) {
  const img = postImage(post)
  const [imgSrc, setImgSrc] = useState(img)
  const [imgFailed, setImgFailed] = useState(false)
  const h = size === 'lg' ? 'h-80' : size === 'md' ? 'h-52' : 'h-44'
  const readTime = (post.readTime ?? post.read_time) ?? 0
  const gradient = getCategoryGradient(post.category)
  const iconSvg = getCategoryIcon(post.category)

  useEffect(() => {
    setImgSrc(img)
    setImgFailed(false)
  }, [img])

  const displayDestination = post.destination
    ? post.destination.charAt(0).toUpperCase() + post.destination.slice(1).toLowerCase()
    : null

  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full" aria-label={`Lire le carnet : ${post.title}`}>
      <article className="relative rounded-2xl overflow-hidden bg-mahogany/80 shadow-md hover:shadow-xl transition-all duration-400 h-full flex flex-col">
        <div className={`relative ${h} overflow-hidden`}>
          {imgFailed ? (
            <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${gradient} gap-3`}>
              <svg aria-hidden="true" width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-white/80" dangerouslySetInnerHTML={{ __html: iconSvg }} />
              <span className="text-white/90 text-xs font-semibold tracking-[0.12em] uppercase">{post.category || 'Travel'}</span>
            </div>
          ) : (
            <Image
              src={imgSrc}
              alt={post.title}
              fill
              className="object-cover opacity-80 group-hover:opacity-90 group-hover:scale-105 transition-all duration-600"
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => { setImgFailed(true) }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
          <div className="absolute top-3 left-3">
            <span className="bg-eucalyptus/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize">
              {post.category}
            </span>
          </div>
          {readTime > 0 ? (
            <span className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-sm text-white/80 text-xs px-2 py-0.5 rounded-full">
              {readTime} min
            </span>
          ) : null}
        </div>
        <div className="p-4 flex flex-col flex-1 bg-white">
          <h3 className="font-semibold text-mahogany text-sm leading-snug mb-1.5 group-hover:text-eucalyptus transition-colors line-clamp-2">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-charcoal/60 text-xs leading-relaxed line-clamp-2 flex-1 mb-2">{post.excerpt}</p>
          )}
          {!post.excerpt && displayExcerpt(post) && (
            <p className="text-charcoal/60 text-xs leading-relaxed line-clamp-2 flex-1 mb-2">{displayExcerpt(post)}</p>
          )}
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-cloud-dancer">
            <div className="flex items-center gap-2 text-xs text-charcoal/40">
              <span>{post.author ?? 'Heldonica'}</span>
              {displayDestination && (
                <>
                  <span>•</span>
                  <span>📍 {displayDestination}</span>
                </>
              )}
              {!displayDestination && (
                <>
                  <span>•</span>
                  <span>{post.formattedDate || 'Récemment'}</span>
                </>
              )}
            </div>
            <span className="text-xs text-eucalyptus font-semibold group-hover:translate-x-1 transition-transform" aria-hidden="true">Lire le carnet →</span>
          </div>
        </div>
      </article>
    </Link>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface HomeProps {
  featured: (BlogPost & { formattedDate: string; readTime?: number }) | null
  travelPosts: (BlogPost & { formattedDate: string; readTime?: number })[]
  foodPosts: (BlogPost & { formattedDate: string; readTime?: number })[]
  latestPosts: (BlogPost & { formattedDate: string; readTime?: number })[]
  totalPosts: number
  coveredCountries?: string | null
  heroVideoUrl?: string | null
  heroPosterImage?: string | null
  siteSettings?: {
    instagramUsername?: string
    instagramPostCount?: number
    instagramPosts?: string
    site_email?: string
  }
  homeDestinations?: HomeDestination[]
  homeZones?: Record<string, string>
}

// ─── Premium SVG Icons ─────────────────────────────────────────────────────────
function renderPremiumIcon(slug: string) {
  const normalized = slug.toLowerCase().replace(/[^a-z]/g, '');
  if (normalized.includes('madere') || normalized.includes('maderia')) {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-eucalyptus dark:text-teal mx-auto" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 38c6-2 10 2 16 0s10-4 16-2" className="opacity-50" />
        <path d="M10 42c6-2 10 2 16 0s10-4 16-2" className="opacity-30" />
        <path d="M24 36V14" strokeWidth="2" />
        <path d="M24 18c-6-1-12 1-16 6 8-1 14-3 16-6z" fill="currentColor" fillOpacity={0.1} />
        <path d="M24 22c6-1 12 1 16 6-8-1-14-3-16-6z" fill="currentColor" fillOpacity={0.1} />
        <path d="M24 22c-5-2-10-1-14 3 6 0 11-1 14-3z" fill="currentColor" fillOpacity={0.1} />
        <path d="M24 26c5-2 10-1 14 3-6 0-11-1-14-3z" fill="currentColor" fillOpacity={0.1} />
      </svg>
    )
  }
  if (normalized.includes('suisse') || normalized.includes('switzerland')) {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-eucalyptus dark:text-teal mx-auto" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 38l12-18 8 12 12-18 4 6" strokeWidth="2" />
        <path d="M16 38h24" className="opacity-50" />
        <path d="M20 20l-3 4.5h6l-3-4.5z" fill="currentColor" fillOpacity={0.2} />
        <path d="M40 14l-3 4.5h6l-3-4.5z" fill="currentColor" fillOpacity={0.2} />
        <circle cx="34" cy="10" r="4" className="opacity-40" strokeWidth="1.2" strokeDasharray="2 2" />
      </svg>
    )
  }
  if (normalized.includes('zurich')) {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-eucalyptus dark:text-teal mx-auto" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 38c8-1.5 16-1.5 24 0M12 42c6-1 12-1 18 0" className="opacity-50" />
        <path d="M16 34V18l4-6 4 6v14" fill="currentColor" fillOpacity={0.1} strokeWidth="2" />
        <path d="M26 34l8-14v14z" fill="currentColor" fillOpacity={0.2} />
        <path d="M24 34h12" />
      </svg>
    )
  }
  if (normalized.includes('roumanie') || normalized.includes('romania')) {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-eucalyptus dark:text-teal mx-auto" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 38V22h4v-6h4v6h4v-6h4v6h4v16" fill="currentColor" fillOpacity={0.1} strokeWidth="2" />
        <path d="M12 22l5-6 5 6M26 22l5-6 5 6" />
        <path d="M8 38l3-6 3 6M36 38l3-6 3 6" className="opacity-50" />
      </svg>
    )
  }
  if (normalized.includes('montenegro')) {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-eucalyptus dark:text-teal mx-auto" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 34l12-16 10 14 14-20 4 6" strokeWidth="2" />
        <path d="M4 38c8-2 16 2 24 0s12-2 16 0" strokeWidth="2" />
        <path d="M8 42c8-2 16 2 24 0s12-2 16 0" className="opacity-40" />
      </svg>
    )
  }
  if (normalized.includes('sicile') || normalized.includes('sicily')) {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-eucalyptus dark:text-teal mx-auto" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 38l14-22 6 8 12 14" strokeWidth="2" />
        <path d="M20 18h4" strokeWidth="2" />
        <path d="M22 14c-1-3 2-4 1-6" className="opacity-50" />
        <path d="M6 42c9-1.5 18-1.5 27 0" className="opacity-30" />
      </svg>
    )
  }
  if (normalized.includes('paris')) {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-eucalyptus dark:text-teal mx-auto" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 38c2-4 3-8 4-18 1 10 2 14 4 18M16 38h16" strokeWidth="2" />
        <path d="M24 20v-8M23 12h2" />
        <path d="M21 28h6" className="opacity-50" />
        <path d="M24 38c-3-1-6-1-8-1M24 38c3-1 6-1 8-1" className="opacity-30" />
      </svg>
    )
  }
  if (normalized.includes('colombie') || normalized.includes('colombia')) {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-eucalyptus dark:text-teal mx-auto" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 38V16" strokeWidth="2" />
        <path d="M24 20c-5-2-11-2-16 2 8 0 13-1 16-2z" fill="currentColor" fillOpacity={0.1} />
        <path d="M24 24c5-2 11-2 16 2-8 0-13-1-16-2z" fill="currentColor" fillOpacity={0.1} />
        <path d="M24 28c-4-2-9-2-13 1 6 0 10-1 13-1z" fill="currentColor" fillOpacity={0.1} />
      </svg>
    )
  }
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-eucalyptus dark:text-teal mx-auto" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="24" cy="24" r="20" strokeDasharray="3 3" className="opacity-40" />
      <circle cx="24" cy="24" r="16" className="opacity-20" />
      <path d="M24 8v32M8 24h32" strokeWidth="1.2" />
      <path d="M24 14l4 10-4 10-4-10z" fill="currentColor" fillOpacity={0.2} strokeWidth="1.5" />
    </svg>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomeClient({ featured, travelPosts, foodPosts, latestPosts, totalPosts, coveredCountries, heroVideoUrl, heroPosterImage, homeDestinations, homeZones }: HomeProps) {
  useScrollReveal()
  const featImg = featured ? postImage(featured) : null
  const publishedArticles = totalPosts && totalPosts > 0 ? totalPosts : 25
  const parsedCountries = parseInt(String(coveredCountries || '0'), 10)
  const countryCount = isNaN(parsedCountries) || parsedCountries <= 0 ? 7 : parsedCountries

  const videoSrc = heroVideoUrl || 'https://d2xsxph8kpxj0f.cloudfront.net/310519663470606636/jAd3LynLbumRRtRSgGxysF/Heldonica_11053b9d.mp4'
  const posterSrc = heroPosterImage || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=80'

  return (
    <InlineEditProvider page="home">
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
        .scroll-cue{opacity: 0; animation: wordIn 0.6s 1.6s forwards, subtlePulse 2.2s 1.8s ease-in-out infinite}
      `}</style>

      <Header />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative h-[85vh] md:h-screen bg-black flex items-end overflow-hidden">
        <video autoPlay muted loop playsInline preload="auto"
          className="absolute inset-0 w-full h-full object-cover opacity-[0.45]"
          src={videoSrc}
          poster={posterSrc}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
        <div className="relative z-20 px-5 md:px-16 pb-12 md:pb-24 max-w-4xl">
          <EditableZone page="home" zone="hero_badge" fallback="Slow travel vécu en duo · Hors sentiers · Île-de-France"
            className="text-teal text-xs font-semibold tracking-[0.2em] uppercase mb-5 block"
          />
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-serif font-light text-white leading-[1.15] mb-4 md:mb-6">
            <EditableZone page="home" zone="hero_line_1" fallback="On ferme " className="hero-word inline" />
            <EditableZone page="home" zone="hero_line_2" fallback="les ordis." className="hero-word inline" />
            <br />
            <EditableZone page="home" zone="hero_line_3" fallback="On part." className="hero-word inline" />
            <br />
            <em>
              <EditableZone page="home" zone="hero_line_4" fallback="On revient avec des pépites qu'on n'avait pas cherchées." className="hero-word inline" />
            </em>
          </h1>
          <EditableZone page="home" zone="hero_tagline" type="textarea" fallback="Un duo qui fabrique des voyages authentiques sur mesure — là où les autres passent sans regarder."
            className="text-sm md:text-lg text-gray-300 leading-relaxed mb-6 md:mb-8 max-w-xl block"
          />
          <div className="flex flex-wrap gap-3">
            <Link href="/blog"
              className="px-5 md:px-6 py-2.5 md:py-3 bg-mahogany hover:bg-eucalyptus text-white rounded-full font-semibold text-sm tracking-wide transition">
              <EditableZone page="home" zone="hero_cta_1_label" fallback="Lire le carnet →" />
            </Link>
            <Link href="/travel-planning#formulaire"
              className="px-5 md:px-6 py-2.5 md:py-3 border border-white/50 hover:border-white text-white hover:bg-white/10 rounded-full font-semibold text-sm tracking-wide transition">
              <EditableZone page="home" zone="hero_cta_2_label" fallback="Nous écrire →" />
            </Link>
          </div>
        </div>
        <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-20 scroll-cue">
          <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.6">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </section>

      {/* ── IDENTITÉ ──────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="grid md:grid-cols-5 gap-12 md:gap-16 items-start">
            <div className="md:col-span-3" data-reveal="left">
              <EditableZone page="home" zone="section_story_badge" fallback="Notre histoire"
                className="text-eucalyptus text-xs font-bold tracking-[0.2em] uppercase mb-4 block"
              />
              <EditableZone page="home" zone="section_story_title" type="html" fallback={'Un art du voyage <span class="block italic text-eucalyptus">autrement</span>'}
                className="text-3xl md:text-5xl font-serif font-light text-mahogany mb-6 leading-tight block"
              />
              <EditableZone page="home" zone="section_story_text_1" type="textarea" fallback="Elena a grandi entre la France et la Roumanie, avec l'habitude de prendre la route dès que possible. Elle apporte au duo son sens du détail, sa plume éditoriale et sa passion pour les adresses insolites qui racontent une vraie histoire."
                className="text-base text-charcoal/70 leading-relaxed mb-4 block"
              />
              <EditableZone page="home" zone="section_story_text_2" type="textarea" fallback="Hélder est né à Madère, au milieu de l'Atlantique. Ses racines portugaises et son amour pour la nature sauvage lui ont donné le goût des sentiers cachés, des restaurants locaux familiaux et du voyage au rythme de l'océan."
                className="text-base text-charcoal/70 leading-relaxed mb-4 block"
              />
              <EditableZone page="home" zone="section_story_text_3" type="textarea" fallback="Notre regard est né à deux. Ensemble, on ferme les ordinateurs, on prend le large et on revient avec des pépites vécues, prêtes à être partagées. Pas de copier-coller d'Internet, uniquement des conseils terrain."
                className="text-base text-charcoal/70 leading-relaxed mb-8 block"
              />
              <Link href="/blog" className="inline-flex items-center gap-2 text-eucalyptus font-semibold text-sm hover:gap-3 transition-all">
                <EditableZone page="home" zone="section_story_cta" fallback="Lire les carnets →" />
              </Link>
            </div>
            <div className="md:col-span-2 grid grid-cols-2 gap-6" data-reveal="right">
              <AnimatedStat nb="4+" label="Ans de slow travel" />
              <AnimatedStat nb="100+" label="Adresses vécues" />
              <AnimatedStat nb={countryCount} suffix="+" label="Pays habités" />
              <AnimatedStat nb={publishedArticles} suffix="+" label="Carnets publiés" />
              <div className="col-span-2 mt-2">
                <p className="text-xs text-charcoal/40 leading-relaxed">
                  <span className="font-semibold text-charcoal/70">Terrains de jeu :</span><br />
                  <EditableZone page="home" zone="stats_playgrounds" type="textarea" fallback="Madère · Roumanie · Monténégro · Suisse · Lisbonne · Sicile · Sardaigne · Colombie · Île-de-France"
                    className="inline"
                  />
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── À LA UNE : dernier article ──────────────────────────────────── */}
      {featured && (
        <section className="py-0 bg-mahogany">
          <Link href={`/blog/${featured.slug}`} className="group block">
            <article className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden flex items-end">
              {featImg && (
                <Image src={featImg} alt={featured.title} fill
                  className="object-cover opacity-60 group-hover:opacity-70 group-hover:scale-105 transition-all duration-700"
                  priority sizes="100vw" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="relative z-10 p-8 md:p-16 max-w-3xl">
                <EditableZone page="home" zone="section_featured_badge" fallback="✦ À la une"
                  className="text-teal text-xs font-bold tracking-[0.2em] uppercase mb-3 block"
                />
                <h2 className="text-2xl md:text-4xl font-serif font-light text-white leading-tight mb-4 group-hover:text-teal/80 transition-colors">
                  {featured.title}
                </h2>
                {featured.excerpt && <p className="text-gray-300 text-sm leading-relaxed mb-6 line-clamp-2">{featured.excerpt}</p>}
                {!featured.excerpt && displayExcerpt(featured) && <p className="text-gray-300 text-sm leading-relaxed mb-6 line-clamp-2">{displayExcerpt(featured)}</p>}
                <div className="inline-flex items-center gap-2 text-teal font-semibold text-sm group-hover:gap-3 transition-all">
                  <EditableZone page="home" zone="section_featured_cta" fallback="Découvrir l'itinéraire →" />
                </div>
              </div>
            </article>
          </Link>
        </section>
      )}

      {/* ── CARNETS DE VOYAGE ──────────────────────────────────────────── */}
      {travelPosts.length > 0 && (
        <section className="py-20 md:py-28 bg-cloud-dancer">
          <div className="max-w-6xl mx-auto px-6 md:px-10">
            <div className="flex items-end justify-between mb-10 flex-wrap gap-4" data-reveal>
              <div>
                <EditableZone page="home" zone="section_travel_badge" fallback="✦ Carnets de voyage"
                  className="text-eucalyptus text-xs font-bold tracking-[0.2em] uppercase mb-2 block"
                />
                <EditableZone page="home" zone="section_travel_title" fallback="Nos itinéraires vécus"
                  className="text-3xl md:text-4xl font-serif font-light text-mahogany block"
                />
                <EditableZone page="home" zone="section_travel_text" type="textarea" fallback="Chaque itinéraire que l'on propose a été parcouru, testé et ajusté de nos propres mains. Pas de compromis, pas de copier-coller d'agences : juste la réalité du terrain et nos coups de cœur partagés."
                  className="text-sm text-charcoal/70 leading-relaxed mt-3 max-w-xl block"
                />
              </div>
              <Link href="/blog" className="text-sm text-eucalyptus font-semibold hover:underline">
                <EditableZone page="home" zone="section_travel_cta" fallback="Voir tous les carnets →" />
              </Link>
            </div>
            {travelPosts.length >= 1 && (
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <Link href={`/blog/${travelPosts[0].slug}`} className="card-lift group relative rounded-2xl overflow-hidden bg-mahogany/80 aspect-[4/3] md:row-span-2" data-reveal="left">
                  <Image src={postImage(travelPosts[0])} alt={travelPosts[0].title} fill
                    className="object-cover opacity-70 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700"
                    sizes="(max-width: 768px) 100vw, 50vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6">
                    <span className="inline-block bg-eucalyptus text-white text-xs font-bold px-2.5 py-1 rounded-full mb-3 capitalize">
                      {travelPosts[0].destination ? travelPosts[0].destination.charAt(0).toUpperCase() + travelPosts[0].destination.slice(1).toLowerCase() : travelPosts[0].category}
                    </span>
                    <h3 className="text-white text-2xl md:text-3xl font-serif font-light leading-tight group-hover:text-teal/80 transition-colors">
                      {travelPosts[0].title}
                    </h3>
                    {travelPosts[0].excerpt && (
                      <p className="text-gray-300 text-sm mt-2 line-clamp-2">{travelPosts[0].excerpt}</p>
                    )}
                    {!travelPosts[0].excerpt && displayExcerpt(travelPosts[0]) && (
                      <p className="text-gray-300 text-sm mt-2 line-clamp-2">{displayExcerpt(travelPosts[0])}</p>
                    )}
                  </div>
                </Link>
                <div className="grid grid-rows-2 gap-6">
                  {travelPosts.slice(1, 3).map((p, i) => (
                    <Link key={p.slug} href={`/blog/${p.slug}`}
                       className="group relative rounded-2xl overflow-hidden bg-mahogany/80"
                      data-reveal data-delay={String((i + 1) * 150)}>
                      <Image src={postImage(p)} alt={p.title} fill
                        className="object-cover opacity-65 group-hover:opacity-75 group-hover:scale-105 transition-all duration-700"
                        sizes="(max-width: 768px) 100vw, 33vw" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <div className="relative p-5 h-44 flex flex-col justify-end">
                        <h3 className="text-white text-lg font-serif font-light group-hover:text-teal/80 transition-colors line-clamp-2">
                          {p.title}
                        </h3>
                        <p className="text-gray-300 text-xs mt-1">{p.destination ? p.destination.charAt(0).toUpperCase() + p.destination.slice(1).toLowerCase() : p.formattedDate}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── FOOD & LIFESTYLE ───────────────────────────────────────────── */}
      {foodPosts.length > 0 && (
        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-6xl mx-auto px-6 md:px-10">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
              <div className="relative" data-reveal="left">
                <Image src={postImage(foodPosts[0])}
                  alt={foodPosts[0].title}
                  width={700} height={525}
                  className="rounded-2xl w-full aspect-[4/3] object-cover shadow-lg" />
                <div className="absolute -bottom-4 -right-4 bg-mahogany text-white px-5 py-3 rounded-xl shadow-lg hidden md:block">
                  <p className="text-xs font-bold tracking-wider uppercase">Adresses testées</p>
                  <p className="text-2xl font-serif font-light mt-0.5">100%</p>
                </div>
              </div>
              <div data-reveal="right">
                <EditableZone page="home" zone="section_food_badge" fallback="Pépites terrain"
                  className="text-eucalyptus text-xs font-bold tracking-[0.2em] uppercase mb-4 block"
                />
                <EditableZone page="home" zone="section_food_title" fallback="Pépites dénichées"
                  className="text-3xl md:text-4xl font-serif font-light text-mahogany leading-tight mb-4 block"
                />
                <EditableZone page="home" zone="section_food_text" type="textarea" fallback="Que ce soit une petite table de village à Madère ou un gîte caché en Transylvanie, on ne partage que des lieux où nous avons mangé, dormi et aimé passer du temps. Des adresses à taille humaine, loin des foules."
                  className="text-base text-charcoal/70 leading-relaxed mb-6 block"
                />
                <div className="space-y-4 mb-8">
                  {foodPosts.slice(0, 3).map((p) => (
                    <Link key={p.slug} href={`/blog/${p.slug}`}
                      className="flex items-start gap-3 group hover:bg-eucalyptus/5 rounded-xl p-2 -mx-2 transition-colors">
                      <Image src={postImage(p)} alt={p.title} width={60} height={60}
                        className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-charcoal/90 text-sm group-hover:text-eucalyptus transition-colors line-clamp-1">{p.title}</p>
                        {p.excerpt && <p className="text-charcoal/60 text-xs line-clamp-2 mt-0.5">{p.excerpt}</p>}
                        {!p.excerpt && displayExcerpt(p) && <p className="text-charcoal/60 text-xs line-clamp-2 mt-0.5">{displayExcerpt(p)}</p>}
                      </div>
                    </Link>
                  ))}
                </div>
                <Link href="/blog" className="inline-flex items-center gap-2 text-eucalyptus font-semibold text-sm hover:gap-3 transition-all">
                  <EditableZone page="home" zone="section_food_cta" fallback="Voir toutes les pépites →" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── DERNIERS ARTICLES ─────────────────────────────────────────── */}
      {latestPosts.length > 0 && (
        <section className="py-20 bg-cloud-dancer">
          <div className="max-w-6xl mx-auto px-6 md:px-10">
            <div className="flex items-end justify-between mb-10 flex-wrap gap-4" data-reveal>
              <div>
                <EditableZone page="home" zone="section_latest_badge" fallback="✦ Fraîchement publié"
                  className="text-eucalyptus text-xs font-bold tracking-[0.2em] uppercase mb-2 block"
                />
                <EditableZone page="home" zone="section_latest_title" fallback="Les dernières pépites"
                  className="text-2xl md:text-3xl font-serif font-light text-mahogany block"
                />
              </div>
              <Link href="/blog" className="text-sm text-eucalyptus font-semibold hover:underline">
                <EditableZone page="home" zone="section_latest_cta" fallback="Tout voir →" />
              </Link>
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

      {/* ── DESTINATIONS ─────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6 md:px-10 text-center">
            <EditableZone page="home" zone="section_destinations_badge" fallback="✦ Nos territoires"
              className="text-eucalyptus text-xs font-bold tracking-[0.2em] uppercase mb-4 block text-center"
            />
            <h2 className="text-3xl md:text-5xl font-serif font-light text-mahogany leading-tight mb-6">
              <EditableZone page="home" zone="section_destinations_title_1" fallback="Des lieux qu'on a aimés," className="inline" />
              <br />
              <EditableZone page="home" zone="section_destinations_title_2" fallback="qu'on comprend vraiment." className="inline" />
            </h2>
            <EditableZone page="home" zone="section_destinations_text" type="textarea" fallback="Madère, Roumanie, Monténégro, Sicile..."
              className="text-charcoal/70 leading-relaxed max-w-2xl mx-auto mb-12 block"
            />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {(homeDestinations && homeDestinations.length > 0 ? homeDestinations : [
              { destination_slug: 'madere', title: 'Madère', flag_emoji: '🏝️' },
              { destination_slug: 'roumanie', title: 'Roumanie', flag_emoji: '🏔️' },
              { destination_slug: 'montenegro', title: 'Monténégro', flag_emoji: '🌊' },
              { destination_slug: 'sicile', title: 'Sicile', flag_emoji: '🌋' },
            ]).map((dest: any) => (
              <Link key={dest.destination_slug || dest.slug} href={`/destinations/${dest.destination_slug || dest.slug}`}
                className="group p-6 md:p-8 rounded-2xl bg-stone-50 border border-stone-100 hover:border-eucalyptus/30 hover:bg-eucalyptus/5 dark:hover:bg-eucalyptus/10 transition-all duration-300 flex flex-col items-center">
                <div className="mb-4 flex justify-center h-12 w-12 items-center">
                  {renderPremiumIcon(dest.destination_slug || dest.slug || '')}
                </div>
                <span className="font-semibold text-mahogany dark:text-stone-200 group-hover:text-eucalyptus dark:group-hover:text-teal transition-colors">
                  {dest.title}
                </span>
              </Link>
            ))}
          </div>
          <Link href="/destinations" className="mt-10 inline-flex items-center gap-2 text-eucalyptus font-semibold text-sm hover:gap-3 transition-all">
            <EditableZone page="home" zone="section_destinations_cta" fallback="Explorer toutes les destinations →" />
          </Link>
        </div>
      </section>

      {/* ── CTA TRAVEL PLANNING ───────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-mahogany text-white">
        <div className="max-w-5xl mx-auto px-6 md:px-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div data-reveal="left">
              <EditableZone page="home" zone="section_cta_badge" fallback="Travel Planning · terrain vécu"
                className="text-teal text-xs font-bold tracking-[0.2em] uppercase mb-4 block"
              />
              <h2 className="text-3xl md:text-5xl font-serif font-light leading-tight mb-6">
                <EditableZone page="home" zone="section_cta_title_1" fallback="On ne fait pas des itinéraires." className="inline" />
                <br />
                <em className="text-teal">
                  <EditableZone page="home" zone="section_cta_title_2" fallback="On fait le tien." className="inline" />
                </em>
              </h2>
              <EditableZone page="home" zone="section_cta_text" type="textarea" fallback="Tu nous envoies tes contraintes réelles..."
                className="text-white/65 leading-relaxed mb-4 block"
              />
              <EditableZone page="home" zone="section_cta_subtext" type="textarea" fallback="Notre terrain naturel : les couples..."
                className="text-white/50 text-sm leading-relaxed mb-8 block"
              />
              <div className="flex flex-wrap gap-3">
                <Link href="/travel-planning#formulaire"
                  className="px-6 py-3 bg-eucalyptus hover:bg-eucalyptus/80 text-white rounded-full font-semibold text-sm transition">
                  <EditableZone page="home" zone="section_cta_btn_1" fallback="Nous écrire →" />
                </Link>
                <Link href="/travel-planning"
                  className="px-6 py-3 border border-white/30 hover:border-white/60 text-white rounded-full font-semibold text-sm transition">
                  <EditableZone page="home" zone="section_cta_btn_2" fallback="Voir nos services →" />
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4" data-reveal="right">
              {[
                { zone: 'cta_card_1', t: 'Couples aventuriers', d: "Notre spécialité : ralentir sans ennuyer, laisser de la place au vrai, et garder le hors-sentiers sans perdre le fil." },
                { zone: 'cta_card_2', t: 'Ouvert aussi à ton format', d: "Solo, famille curieuse ou groupe d'amis : on adapte cette même exigence terrain à ton énergie, tes contraintes et ton rythme." },
                { zone: 'cta_card_3', t: 'Vécu sur le terrain', d: "Cartes, adresses, conseils pratiques et pépites dénichées : tout part d'expériences testées, pas inventées." },
              ].map((item) => (
                <div key={item.zone} className="border border-white/10 rounded-xl p-5 hover:border-teal/30 transition">
                  <h3 className="font-semibold text-white text-sm mb-1">
                    <EditableZone page="home" zone={`${item.zone}_title`} fallback={item.t} />
                  </h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    <EditableZone page="home" zone={`${item.zone}_text`} type="textarea" fallback={item.d} />
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── INSTAGRAM FEED ────────────────────────────────────────────── */}
      <InstagramFeed />

      <Footer />
    </InlineEditProvider>
  )
}

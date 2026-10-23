'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import Image from 'next/image'
import type { BlogPost } from '@/lib/blog-supabase'
import type { HomeDestination } from '@/lib/home-data'
import { getExcerpt } from '@/lib/blog-supabase'
import InstagramFeed from '@/components/InstagramFeed'
import NewsletterForm from '@/components/NewsletterForm'
import EditableZone from '@/components/inline-edit/EditableZone'
import { useContentLoader, getCmsOrSetting } from '@/hooks/useContentLoader'

const HELDONICA_BADGE_FALLBACK = '/og-default.jpg'

// Get display excerpt: use stored excerpt or generate from content
function displayExcerpt(post: BlogPost): string {
  return getExcerpt(post, 140);
}

const SLUG_IMAGES_DEFAULT: Record<string, string> = {
  'madere-slow-travel-guide':                     '/og-default.jpg',
  'urbex-paris-safe':                             '/og-default.jpg',
  'guide-pratique-comment-debuter-le-slow-travel-en-duo': '/og-default.jpg',
  'madere-quand-partir-sur-lile-de-leternel-printemps':   '/og-default.jpg',
  'pepites-mystiques-de-madere':                  '/og-default.jpg',
  'prego-no-bolo-do-caco':                        '/og-default.jpg',
  'flotter-sur-la-limmat-a-zurich-notre-aventure-dete':   '/og-default.jpg',
}

const CAT_IMAGES_DEFAULT: Record<string, string> = {
  'Carnets Voyage': '/og-default.jpg',
  'Découvertes Locales': '/og-default.jpg',
  'Guides Pratiques': '/og-default.jpg',
  'Food & Lifestyle': '/og-default.jpg',
  'Travel': '/og-default.jpg',
}

function postImage(p: BlogPost, slugImages: Record<string, string>, catImages: Record<string, string>): string {
  if (p.featured_image && p.featured_image.trim().length > 0) return p.featured_image
  if (p.slug && slugImages[p.slug]) return slugImages[p.slug]
  if (p.category && catImages[p.category]) return catImages[p.category]
  return HELDONICA_BADGE_FALLBACK
}

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]')

    // Respecte la préférence système : pas d'animation, contenu visible immédiatement.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach((el) => el.classList.add('revealed'))
      return
    }

    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target) }
      }),
      { threshold: 0.12 }
    )
    els.forEach((el) => io.observe(el))

    // Filet de sécurité : un scroll très rapide peut faire manquer l'observer à
    // certains éléments (ex. 3e carte, 2e rangée) et les laisser invisibles pour
    // toujours. On force la révélation de tout ce qui reste après un délai.
    const failsafe = window.setTimeout(() => {
      els.forEach((el) => el.classList.add('revealed'))
    }, 2500)

    return () => { io.disconnect(); window.clearTimeout(failsafe) }
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
    <div className="px-4 py-3 md:px-6 md:py-4 text-center md:text-left">
      <p className="text-3xl md:text-4xl font-serif font-normal text-mahogany leading-none mb-1.5">
        {nb}{suffix}
      </p>
      <p className="text-[11px] uppercase tracking-[0.16em] text-charcoal/65 leading-snug">{label}</p>
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

function getCategoryGradient(category: string | null | undefined, gradientMap?: Record<string, string>): string {
  const map = gradientMap || CATEGORY_GRADIENTS
  if (!category) return map.default
  return map[category] ?? map.default
}

function getCategoryIcon(category: string | null | undefined, iconMap?: Record<string, string>): string {
  const map = iconMap || CATEGORY_ICONS
  if (!category) return map.default
  return map[category] ?? map.default
}

// ─── Card article (ratio harmonisé 4/3, micro-preuves E-E-A-T, CTA aligné) ───
function ArticleCard({ post, size = 'md', slugImages, catImages, gradientMap, iconMap }: { post: BlogPost & { formattedDate: string; readTime?: number }; size?: 'sm' | 'md' | 'lg'; slugImages?: Record<string, string>; catImages?: Record<string, string>; gradientMap?: Record<string, string>; iconMap?: Record<string, string> }) {
  const img = postImage(post, slugImages || SLUG_IMAGES_DEFAULT, catImages || CAT_IMAGES_DEFAULT)
  const [imgSrc, setImgSrc] = useState(img)
  const [imgFailed, setImgFailed] = useState(false)
  const h = size === 'lg' ? 'aspect-[16/10]' : 'aspect-[4/3]'
  const readTime = (post.readTime ?? post.read_time) ?? 0
  const gradient = getCategoryGradient(post.category, gradientMap)
  const iconSvg = getCategoryIcon(post.category, iconMap)

  useEffect(() => {
    setImgSrc(img)
    setImgFailed(false)
  }, [img])

  const displayDestination = post.destination
    ? post.destination.charAt(0).toUpperCase() + post.destination.slice(1).toLowerCase()
    : null

  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full" aria-label={`Lire le carnet : ${post.title}`}>
      <article className="h-full flex flex-col bg-[#FAF7F2] border border-[#DED5C6] rounded-sm p-3.5 transition-colors hover:border-mahogany/40">
        <div className={`relative ${h} w-full overflow-hidden rounded-sm bg-[#E8E0D2] mb-4`}>
          {imgFailed ? (
            <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${gradient} gap-3`}>
              <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white/75" dangerouslySetInnerHTML={{ __html: iconSvg }} />
              <span className="text-white/85 text-[11px] tracking-[0.18em] uppercase">{post.category || 'Carnet'}</span>
            </div>
          ) : (
            <Image
              src={imgSrc}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => { setImgFailed(true) }}
            />
          )}
        </div>
        <div className="flex flex-col flex-1 px-1 pb-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] uppercase tracking-[0.16em] text-eucalyptus mb-2">
            <span className="font-medium">{displayDestination || post.category || 'Carnet'}</span>
            <span className="text-charcoal/30">·</span>
            <span className="text-charcoal/60">Vécu sur le terrain</span>
            {readTime > 0 && (
              <>
                <span className="text-charcoal/30">·</span>
                <span className="text-charcoal/55">{readTime} min</span>
              </>
            )}
          </div>
          <h3 className="font-serif font-normal text-mahogany text-xl leading-snug mb-2 group-hover:text-eucalyptus transition-colors line-clamp-2 min-h-[3.2rem]">
            {post.title}
          </h3>
          {(post.excerpt || displayExcerpt(post)) && (
            <p className="text-charcoal/70 text-sm leading-relaxed line-clamp-2 flex-1 mb-4">
              {post.excerpt || displayExcerpt(post)}
            </p>
          )}
          <div className="mt-auto pt-3 border-t border-[#E8E0D2] flex items-center justify-between text-xs text-charcoal/55">
            <span>{post.formattedDate || 'Carnet terrain'}</span>
            <span className="text-mahogany border-b border-mahogany/30 pb-0.5 font-medium group-hover:text-eucalyptus group-hover:border-eucalyptus transition-colors" aria-hidden="true">
              Lire le récit
            </span>
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
  const { zones, settings } = useContentLoader()
  useScrollReveal()

  const slugImages = useMemo(() => {
    try {
      const raw = settings?.home_slug_images
      if (raw) return { ...SLUG_IMAGES_DEFAULT, ...JSON.parse(raw) }
    } catch {}
    return SLUG_IMAGES_DEFAULT
  }, [settings])

  const catImages = useMemo(() => {
    try {
      const raw = settings?.home_cat_images
      if (raw) return { ...CAT_IMAGES_DEFAULT, ...JSON.parse(raw) }
    } catch {}
    return CAT_IMAGES_DEFAULT
  }, [settings])

  const catGradients = useMemo(() => {
    try {
      const raw = settings?.home_cat_gradients
      if (raw) return { ...CATEGORY_GRADIENTS, ...JSON.parse(raw) }
    } catch {}
    return CATEGORY_GRADIENTS
  }, [settings])

  const catIcons = useMemo(() => {
    try {
      const raw = settings?.home_cat_icons
      if (raw) return { ...CATEGORY_ICONS, ...JSON.parse(raw) }
    } catch {}
    return CATEGORY_ICONS
  }, [settings])

  const featImg = featured ? postImage(featured, slugImages, catImages) : null
  const publishedArticles = totalPosts && totalPosts > 0 ? totalPosts : 25
  const parsedCountries = parseInt(String(coveredCountries || '0'), 10)
  const countryCount = isNaN(parsedCountries) || parsedCountries <= 0 ? 7 : parsedCountries

  // L'ancienne vidéo (CloudFront) renvoie 403 : sans vidéo configurée, le hero
  // montre une photo vérifiée (vallée des Apuseni, sans personne).
  const defaultVideoSrc = heroVideoUrl || ''
  const defaultPosterSrc = heroPosterImage || 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/roumanie/IMG_20260827_135023.jpg'

  const videoSrc = getCmsOrSetting('hero_video_url', 'hero_video_url', defaultVideoSrc, zones, settings)
  const posterSrc = getCmsOrSetting('hero_poster_image', 'hero_poster_image', defaultPosterSrc, zones, settings)

  // Ce composant ne monte plus son propre InlineEditProvider : app/page.tsx en
  // rend déjà un pour la page 'home' et l'alimente en zones côté serveur. Deux
  // providers imbriqués sur la même page faisaient partir un fetch et un
  // contrôle d'authentification en double à chaque affichage.

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
        .scroll-cue{opacity: 0; animation: wordIn 0.6s 1.6s forwards, subtlePulse 2.2s 1.8s ease-in-out infinite}
        @media (prefers-reduced-motion: reduce) {
          [data-reveal] { opacity:1 !important; transform:none !important; transition:none !important; }
          .hero-word { opacity:1 !important; animation:none !important; }
          .scroll-cue { opacity:1 !important; animation:none !important; }
        }
      `}</style>

      <Header />

      {/* ── 1. HERO IMMERSIF (1 CTA principal fort + 1 lien secondaire discret) ── */}
      <section className="relative h-[86vh] md:h-[92vh] bg-[#1A1614] flex items-end overflow-hidden">
        {videoSrc ? (
          <video autoPlay muted loop playsInline preload="auto"
            className="absolute inset-0 w-full h-full object-cover opacity-[0.55]"
            src={videoSrc}
            poster={posterSrc}
          />
        ) : (
          <Image src={posterSrc} alt="" fill priority sizes="100vw" quality={75}
            className="object-cover opacity-[0.65]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1614]/90 via-[#1A1614]/30 to-transparent z-10" />
        <div className="relative z-20 w-full max-w-6xl mx-auto px-6 md:px-10 pb-14 md:pb-24">
          <div className="max-w-3xl">
            <EditableZone page="home" zone="hero_badge" fallback="Slow travel vécu en duo · Hors sentiers · Île-de-France"
              className="text-[#E6DEC8]/90 text-[11px] font-medium tracking-[0.22em] uppercase mb-5 block"
            />
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-normal text-[#F7F3EC] leading-[1.12] mb-5">
              <EditableZone page="home" zone="hero_line_1" fallback="On ferme les ordis." className="hero-word inline" />{' '}
              <EditableZone page="home" zone="hero_line_2" fallback="On part." className="hero-word inline" />
              <br />
              <em className="font-normal text-[#E6DEC8]">
                <EditableZone page="home" zone="hero_line_3" fallback="On revient avec des pépites qu'on n'avait pas cherchées." className="hero-word inline" />
              </em>
            </h1>
            <EditableZone page="home" zone="hero_tagline" type="textarea" fallback="Deux voyageurs, dix ans de terrain, des destinations qu'on a vraiment arpentées — pas lu dans un guide."
              className="text-sm md:text-base text-[#E6DEC8]/85 leading-relaxed mb-8 max-w-xl block"
            />
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-7">
              <Link href="/travel-planning"
                className="w-full sm:w-auto text-center px-7 py-3.5 bg-action hover:bg-action-fonce text-[#F7F3EC] rounded-sm font-medium text-sm transition-colors shadow-sm">
                <EditableZone page="home" zone="hero_cta_1_label" fallback="Préparer un voyage" />
              </Link>
              <Link href="/blog"
                className="self-center sm:self-auto text-[#F7F3EC]/90 hover:text-[#E6DEC8] border-b border-[#F7F3EC]/45 hover:border-[#E6DEC8] pb-1 font-medium text-sm transition-colors">
                <EditableZone page="home" zone="hero_cta_2_label" fallback="Lire les carnets" />
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-5 md:bottom-7 left-1/2 -translate-x-1/2 z-20 scroll-cue hidden sm:block">
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F7F3EC" strokeWidth="1.2" strokeOpacity="0.6">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </section>

      {/* ── 2. BANDEAU PREUVE DE TERRAIN + IDENTITÉ DU DUO ──────────────────── */}
      <section className="bg-[#EFE9DF] border-b border-[#DED5C6]">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-6 md:py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#DED5C6]" data-reveal>
            <AnimatedStat nb={getCmsOrSetting('stat_1_nb', 'stat_1_nb', '4+', zones, settings)} label={getCmsOrSetting('stat_1_label', 'stat_1_label', 'Ans de slow travel', zones, settings)} />
            <AnimatedStat nb={getCmsOrSetting('stat_2_nb', 'stat_2_nb', '100+', zones, settings)} label={getCmsOrSetting('stat_2_label', 'stat_2_label', 'Adresses vécues', zones, settings)} />
            <AnimatedStat nb={countryCount} suffix="+" label={getCmsOrSetting('stat_3_label', 'stat_3_label', 'Pays habités', zones, settings)} />
            <AnimatedStat nb={publishedArticles} suffix="+" label={getCmsOrSetting('stat_4_label', 'stat_4_label', 'Carnets publiés', zones, settings)} />
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-[#F7F3EC] border-b border-[#E2D9C8]">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="grid md:grid-cols-12 gap-10 md:gap-14 items-start">
            <div className="md:col-span-5" data-reveal="left">
              <EditableZone page="home" zone="section_story_badge" fallback="Notre histoire"
                className="text-eucalyptus text-[11px] font-medium tracking-[0.22em] uppercase mb-3 block"
              />
              <EditableZone page="home" zone="section_story_title" type="html" fallback={'Deux regards. <span class="block italic text-eucalyptus">Un seul terrain.</span>'}
                className="text-3xl md:text-5xl font-serif font-normal text-mahogany mb-6 leading-tight block"
              />
              <div className="p-5 bg-[#FAF7F2] border border-[#DED5C6] rounded-sm">
                <p className="text-xs text-charcoal/70 leading-relaxed">
                  <span className="font-medium text-mahogany uppercase tracking-[0.16em] text-[10px] block mb-1.5">
                    <EditableZone page="home" zone="stats_playgrounds_label" fallback="Terrains de jeu :" />
                  </span>
                  <EditableZone page="home" zone="stats_playgrounds" type="textarea" fallback="Madère · Roumanie · Monténégro · Suisse · Lisbonne · Île-de-France · Portugal"
                    className="inline"
                  />
                  {/* Les destinations en préparation ne sont plus annoncées comme
                      ouvertes : le bandeau « Terrains de jeu » ne liste que du
                      contenu publié, le reste est dit explicitement. */}
                  <span className="mt-2 block text-[11px] text-charcoal/50">
                    <EditableZone page="home" zone="stats_playgrounds_soon" fallback="Bientôt : Sicile · Sardaigne · Colombie" />
                  </span>
                </p>
              </div>
            </div>
            <div className="md:col-span-7" data-reveal="right">
              <EditableZone page="home" zone="section_story_text_1" type="textarea" fallback="L'une a grandi entre deux pays, deux langues, la route comme habitude naturelle. Elle apporte au duo son sens du détail, sa plume éditoriale et une passion pour les adresses qui racontent une vraie histoire — celles dont tu te souviens après, pas celles que tu coches."
                className="text-base text-charcoal/80 leading-relaxed mb-4 block"
              />
              <EditableZone page="home" zone="section_story_text_2" type="textarea" fallback="L'autre est né sur une île au milieu de l'Atlantique, entre levadas et océan. Ses racines insulaires et son amour pour la nature sauvage lui ont donné le goût des sentiers cachés, des tables sans enseigne et du voyage au rythme de l'eau."
                className="text-base text-charcoal/80 leading-relaxed mb-4 block"
              />
              <EditableZone page="home" zone="section_story_text_3" type="textarea" fallback="Notre regard est né à deux. Ensemble, on ferme les ordinateurs, on prend le large et on revient avec des pépites vécues, prêtes à être partagées. Pas de copier-coller d'Internet, uniquement des conseils terrain."
                className="text-base text-charcoal/80 leading-relaxed mb-7 block"
              />
              <Link href="/blog" className="inline-block text-mahogany border-b border-mahogany/40 pb-1 font-medium text-sm hover:text-eucalyptus hover:border-eucalyptus transition-colors">
                <EditableZone page="home" zone="section_story_cta" fallback="Lire les carnets" />
              </Link>
            </div>
          </div>
        </div>
      </section>

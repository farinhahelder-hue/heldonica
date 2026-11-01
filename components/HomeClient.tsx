'use client'

import { useEffect, useState, useMemo } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import Image from 'next/image'
import type { BlogPost } from '@/lib/blog-supabase'
import type { HomeDestination } from '@/lib/home-data'
import InstagramFeed from '@/components/InstagramFeed'
import NewsletterForm from '@/components/NewsletterForm'
import EditableZone from '@/components/inline-edit/EditableZone'
import { useContentLoader, getCmsOrSetting } from '@/hooks/useContentLoader'
import {
  Compass, ArrowRight, ShieldCheck, CheckCircle2,
  Clock, Mountain, Landmark, Waves,
  UtensilsCrossed, Hotel, Check
} from 'lucide-react'

const HELDONICA_BADGE_FALLBACK = '/og-default.jpg'

const SLUG_IMAGES_DEFAULT: Record<string, string> = {
  'madere-slow-travel-guide': '/og-default.jpg',
  'urbex-paris-safe': '/og-default.jpg',
  'guide-pratique-comment-debuter-le-slow-travel-en-duo': '/og-default.jpg',
  'madere-quand-partir-sur-lile-de-leternel-printemps': '/og-default.jpg',
  'pepites-mystiques-de-madere': '/og-default.jpg',
  'prego-no-bolo-do-caco': '/og-default.jpg',
  'flotter-sur-la-limmat-a-zurich-notre-aventure-dete': '/og-default.jpg',
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

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]')
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach((el) => el.classList.add('revealed'))
      return
    }

    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('revealed')
            io.unobserve(e.target)
          }
        }),
      { threshold: 0.12 }
    )
    els.forEach((el) => io.observe(el))

    const failsafe = window.setTimeout(() => {
      els.forEach((el) => el.classList.add('revealed'))
    }, 2500)

    return () => {
      io.disconnect()
      window.clearTimeout(failsafe)
    }
  }, [])
}

function Z(
  zone: string,
  fallback: string,
  className?: string,
  type?: 'text' | 'textarea' | 'html',
  as?: any
) {
  return (
    <EditableZone
      page="home"
      zone={zone}
      fallback={fallback}
      className={className}
      type={type}
      as={as}
    />
  )
}

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

export default function HomeClient({
  featured,
  travelPosts,
  foodPosts,
  latestPosts,
  totalPosts,
  coveredCountries,
  heroVideoUrl,
  heroPosterImage,
  homeDestinations,
  homeZones,
}: HomeProps) {
  const { zones, settings } = useContentLoader()
  useScrollReveal()

  const [activeDestFilter, setActiveDestFilter] = useState<string>('all')
  const [selectedQuizProfile, setSelectedQuizProfile] = useState<string>('aventure')

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

  const defaultVideoSrc = heroVideoUrl || ''
  const defaultPosterSrc =
    heroPosterImage ||
    'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/roumanie/IMG_20260827_135023.jpg'

  const videoSrc = getCmsOrSetting('hero_video_url', 'hero_video_url', defaultVideoSrc, zones, settings)
  const posterSrc = getCmsOrSetting('hero_poster_image', 'hero_poster_image', defaultPosterSrc, zones, settings)

  const parsedCountries = parseInt(String(coveredCountries || '0'), 10)
  const countryCount = isNaN(parsedCountries) || parsedCountries <= 0 ? 12 : parsedCountries

  // Destinations list from server prop
  const destinationsList = homeDestinations || []

  // Filtered destinations based on quick pills
  const filteredDestinations = destinationsList.filter((d: any) => {
    if (activeDestFilter === 'all') return true
    const slug = (d.destination_slug || d.slug || '').toLowerCase()
    return slug.includes(activeDestFilter)
  })

  return (
    <>
      <style>{`
        [data-reveal] { opacity:0; transform:translateY(24px); transition:opacity 0.7s cubic-bezier(0.16,1,0.3,1),transform 0.7s cubic-bezier(0.16,1,0.3,1); }
        [data-reveal='left'] { transform:translateX(-28px); }
        [data-reveal='right'] { transform:translateX(28px); }
        [data-reveal].revealed { opacity:1; transform:none; }
        [data-delay='100']{transition-delay:0.1s} [data-delay='200']{transition-delay:0.2s}
        [data-delay='300']{transition-delay:0.3s} [data-delay='400']{transition-delay:0.4s}
        .hero-word{display:inline;opacity:0;animation:wordIn 0.6s cubic-bezier(0.16,1,0.3,1) forwards}
        @keyframes wordIn{to{opacity:1}}
        @media (prefers-reduced-motion: reduce) {
          [data-reveal] { opacity:1 !important; transform:none !important; transition:none !important; }
          .hero-word { opacity:1 !important; animation:none !important; }
        }
      `}</style>

      <Header />

      {/* ── 1. HERO SECTION & PROPOSITION DE VALEUR ───────────────────── */}
      <section className="relative w-full pt-28 pb-16 md:pb-24 bg-[#FAF9F5] border-b border-[#DED5C6]">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          {/* Micro-badge */}
          <div className="inline-flex items-center gap-2 bg-[#FAF7F2] border border-[#DED5C6] px-4 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-terracotta animate-pulse" />
            <span className="text-[11px] uppercase tracking-wider text-mahogany font-semibold">
              {Z('hero_badge', 'Slow Travel en duo · Curateurs de terrain indépendants')}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Colonne texte */}
            <div className="lg:col-span-7 flex flex-col gap-5">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-mahogany leading-[1.14] tracking-tight">
                {Z('hero_line_1', '« On ferme les ordis.', 'hero-word inline')}{' '}
                <em className="text-terracotta not-italic font-serif">
                  {Z('hero_line_2', 'On part.', 'hero-word inline')}
                </em>{' '}
                <br />
                <span className="italic font-normal text-charcoal/90">
                  {Z('hero_line_3', "On revient avec des pépites qu'on n'avait pas cherchées. »", 'hero-word inline')}
                </span>
              </h1>

              <div className="text-sm md:text-base text-charcoal/75 max-w-xl leading-relaxed">
                {Z(
                  'hero_tagline',
                  'Slow travel vécu en duo & itinéraires sur-mesure hors des sentiers battus. Deux voyageurs, 40 pays arpentés, 0 compromis de masse. Chaque adresse a été testée sous le soleil ou la pluie, jamais dictée par un algorithme.',
                  'block',
                  'textarea'
                )}
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/travel-planning#formulaire"
                  className="px-6 py-3.5 bg-mahogany hover:bg-mahogany/90 text-[#FAF9F5] rounded-sm font-medium text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-2"
                >
                  <span>{Z('hero_cta_1_label', 'Confier son itinéraire (Travel Planning)')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="#destinations"
                  className="px-6 py-3.5 bg-[#FAF7F2] hover:bg-[#EFECE6] border border-[#DED5C6] text-charcoal rounded-sm font-medium text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-2"
                >
                  <Compass className="w-4 h-4 text-terracotta" />
                  <span>{Z('hero_cta_2_label', 'Explorer les carnets & destinations')}</span>
                </Link>
              </div>

              {/* Barres de métriques vécues */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-[#DED5C6]">
                <div className="p-3 bg-[#FAF7F2] border border-[#DED5C6] rounded-sm">
                  <span className="text-xl md:text-2xl font-serif text-mahogany font-semibold block">{Z('stat_1_nb', '40')}</span>
                  <span className="text-[10px] uppercase tracking-wider text-charcoal/60">{Z('stat_1_unit', 'Pays arpentés')}</span>
                </div>
                <div className="p-3 bg-[#FAF7F2] border border-[#DED5C6] rounded-sm">
                  <span className="text-xl md:text-2xl font-serif text-mahogany font-semibold block">{Z('stat_2_nb', '100+')}</span>
                  <span className="text-[10px] uppercase tracking-wider text-charcoal/60">{Z('stat_2_unit', 'Pépites secrètes')}</span>
                </div>
                <div className="p-3 bg-[#FAF7F2] border border-[#DED5C6] rounded-sm">
                  <span className="text-xl md:text-2xl font-serif text-mahogany font-semibold block">{Z('stat_3_nb', String(countryCount))}</span>
                  <span className="text-[10px] uppercase tracking-wider text-charcoal/60">{Z('stat_3_unit', 'Pays habités')}</span>
                </div>
                <div className="p-3 bg-[#FAF7F2] border border-[#DED5C6] rounded-sm">
                  <span className="text-xl md:text-2xl font-serif text-mahogany font-semibold block">{Z('stat_4_nb', '100%')}</span>
                  <span className="text-[10px] uppercase tracking-wider text-charcoal/60">{Z('stat_4_unit', 'Vécu en duo')}</span>
                </div>
              </div>
            </div>

            {/* Mosaïque visuelle */}
            <div className="lg:col-span-5 relative">
              <div className="relative w-full aspect-[4/5] rounded-sm overflow-hidden border border-[#DED5C6] bg-[#241D1A]">
                {videoSrc ? (
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                    src={videoSrc}
                    poster={posterSrc}
                  />
                ) : (
                  <Image
                    src={posterSrc}
                    alt=""
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1614]/80 via-transparent to-transparent" />

                {/* Badge en direct */}
                <div className="absolute bottom-4 left-4 right-4 p-3 bg-[#FAF9F5]/95 backdrop-blur-sm rounded-sm border border-[#DED5C6]">
                  <span className="text-[10px] uppercase tracking-wider text-terracotta font-bold block">
                    {Z('hero_tag_num', 'Carnet N°38 · En direct')}
                  </span>
                  <p className="text-xs font-serif text-charcoal mt-0.5">
                    {Z('hero_tag_loc', 'Crique secrète de Perazića Do, Monténégro')}
                  </p>
                </div>
              </div>

              {/* Cachet 0% tourisme de masse */}
              <div className="absolute -top-3 -right-3 bg-[#FAF7F2] border border-[#DED5C6] px-3 py-1 rounded-sm text-xs font-medium text-mahogany flex items-center gap-1.5 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-terracotta" />
                <span>{Z('hero_stamp', '0% tourisme de masse')}</span>
              </div>
            </div>
          </div>

          {/* Quick Destination Filter Bar */}
          <div className="mt-10 p-4 bg-[#FAF7F2] border border-[#DED5C6] rounded-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex items-center gap-2 shrink-0">
                <Compass className="w-4 h-4 text-terracotta" />
                <span className="text-xs uppercase tracking-wider font-semibold text-charcoal">
                  {Z('filter_label', 'Cap direct sur nos terrains de jeu :')}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setActiveDestFilter('all')}
                  className={`px-3 py-1 rounded-sm text-xs uppercase tracking-wider transition-colors border ${
                    activeDestFilter === 'all'
                      ? 'bg-mahogany text-[#FAF9F5] border-mahogany'
                      : 'bg-[#FAF9F5] text-charcoal/70 border-[#DED5C6] hover:text-charcoal'
                  }`}
                >
                  {Z('filter_pill_all', 'Tous nos terrains')}
                </button>
                <button
                  onClick={() => setActiveDestFilter('madere')}
                  className={`px-3 py-1 rounded-sm text-xs uppercase tracking-wider transition-colors border ${
                    activeDestFilter === 'madere'
                      ? 'bg-mahogany text-[#FAF9F5] border-mahogany'
                      : 'bg-[#FAF9F5] text-charcoal/70 border-[#DED5C6] hover:text-charcoal'
                  }`}
                >
                  {Z('filter_pill_madere', 'Madère')}
                </button>
                <button
                  onClick={() => setActiveDestFilter('montenegro')}
                  className={`px-3 py-1 rounded-sm text-xs uppercase tracking-wider transition-colors border ${
                    activeDestFilter === 'montenegro'
                      ? 'bg-mahogany text-[#FAF9F5] border-mahogany'
                      : 'bg-[#FAF9F5] text-charcoal/70 border-[#DED5C6] hover:text-charcoal'
                  }`}
                >
                  {Z('filter_pill_montenegro', 'Monténégro')}
                </button>
                <button
                  onClick={() => setActiveDestFilter('roumanie')}
                  className={`px-3 py-1 rounded-sm text-xs uppercase tracking-wider transition-colors border ${
                    activeDestFilter === 'roumanie'
                      ? 'bg-mahogany text-[#FAF9F5] border-mahogany'
                      : 'bg-[#FAF9F5] text-charcoal/70 border-[#DED5C6] hover:text-charcoal'
                  }`}
                >
                  {Z('filter_pill_roumanie', 'Roumanie')}
                </button>
                <button
                  onClick={() => setActiveDestFilter('suisse')}
                  className={`px-3 py-1 rounded-sm text-xs uppercase tracking-wider transition-colors border ${
                    activeDestFilter === 'suisse'
                      ? 'bg-mahogany text-[#FAF9F5] border-mahogany'
                      : 'bg-[#FAF9F5] text-charcoal/70 border-[#DED5C6] hover:text-charcoal'
                  }`}
                >
                  {Z('filter_pill_suisse', 'Suisse')}
                </button>
                <button
                  onClick={() => setActiveDestFilter('portugal')}
                  className={`px-3 py-1 rounded-sm text-xs uppercase tracking-wider transition-colors border ${
                    activeDestFilter === 'portugal'
                      ? 'bg-mahogany text-[#FAF9F5] border-mahogany'
                      : 'bg-[#FAF9F5] text-charcoal/70 border-[#DED5C6] hover:text-charcoal'
                  }`}
                >
                  {Z('filter_pill_portugal', 'Portugal')}
                </button>
              </div>
              <Link
                href="/atlas"
                className="text-xs text-mahogany font-medium hover:underline inline-flex items-center gap-1 shrink-0"
              >
                <span>{Z('filter_atlas_link', 'Voir l\'Atlas interactif')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. QUI SOMMES-NOUS ? L'HISTOIRE DU DUO & MANIFESTE ───────── */}
      <section className="w-full py-16 md:py-24 bg-[#FAF7F2] border-b border-[#DED5C6]">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Gauche : Portraits du duo sans visage */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-4" data-reveal="left">
              <div className="flex flex-col gap-4">
                <div className="aspect-[3/4] rounded-sm overflow-hidden border border-[#DED5C6] bg-[#241D1A] relative">
                  <Image
                    src="https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/madere/achadas_da_cruz.jpg"
                    alt=""
                    fill
                    sizes="250px"
                    className="object-cover"
                  />
                </div>
                <div className="p-4 bg-[#FAF9F5] border border-[#DED5C6] rounded-sm">
                  <p className="font-serif text-lg text-mahogany mb-1">{Z('duo_elle_name', '« Elle »')}</p>
                  <p className="text-xs text-charcoal/75 leading-relaxed">
                    {Z(
                      'duo_elle_desc',
                      'Normandie & Paris. L\'œil graphique, le flair pour dénicher la table confidentielle et les marchés de quartier à l\'aube.'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4 pt-6">
                <div className="p-4 bg-[#FAF9F5] border border-[#DED5C6] rounded-sm">
                  <p className="font-serif text-lg text-mahogany mb-1">{Z('duo_lui_name', '« Lui »')}</p>
                  <p className="text-xs text-charcoal/75 leading-relaxed">
                    {Z(
                      'duo_lui_desc',
                      'Né à Madère. L\'instinct de l\'océan, des falaises sauvages et des sentiers oubliés par les cartes touristiques.'
                    )}
                  </p>
                </div>
                <div className="aspect-[3/4] rounded-sm overflow-hidden border border-[#DED5C6] bg-[#241D1A] relative">
                  <Image
                    src="https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/madere/seixal.jpg"
                    alt=""
                    fill
                    sizes="250px"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Droite : Manifeste */}
            <div className="lg:col-span-7 flex flex-col gap-5 lg:pl-6" data-reveal="right">
              <div className="inline-flex items-center gap-1.5 text-mahogany text-xs uppercase tracking-widest font-semibold">
                <Compass className="w-4 h-4 text-terracotta" />
                <span>{Z('section_manifest_badge', 'L\'esprit Heldonica')}</span>
              </div>

              <h2 className="text-2xl md:text-4xl font-serif text-mahogany leading-tight">
                {Z('section_manifest_title_1', 'Nous ne vendons pas des catalogues d’agences.')}
                <br />
                <em className="text-terracotta not-italic font-serif">
                  {Z('section_manifest_title_2', 'Nous partageons notre carnet intime.')}
                </em>
              </h2>

              <p className="text-sm md:text-base text-charcoal/80 leading-relaxed">
                {Z(
                  'section_manifest_desc_1',
                  'Après avoir habité dans 12 pays et arpenté plus de 40 territoires, notre constat est sans appel : le tourisme de masse détruit la poésie de la découverte et standardise l\'expérience humaine.',
                  'block',
                  'textarea'
                )}
              </p>

              <p className="text-xs md:text-sm text-charcoal/75 leading-relaxed">
                {Z(
                  'section_manifest_desc_2',
                  'Heldonica est né d’un besoin viscéral : celui de voyager lentement, de prendre un café avec le pêcheur local à 7h du matin, de dormir dans une bâtisse restaurée par une famille plutôt que dans une chaîne sans âme, et de rapporter des souvenirs qui ne s\'achètent pas en boutique de souvenirs.',
                  'block',
                  'textarea'
                )}
              </p>

              {/* 3 Règles d'Or */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-[#FAF9F5] border border-[#DED5C6] rounded-sm">
                  <span className="text-[10px] uppercase tracking-wider text-terracotta font-bold block mb-1">
                    {Z('rule_1_badge', '01. Règle d\'or')}
                  </span>
                  <span className="font-serif text-sm text-mahogany block mb-1">
                    {Z('rule_1_title', 'Testé sur nos pas')}
                  </span>
                  <p className="text-[11px] text-charcoal/70 leading-relaxed">
                    {Z('rule_1_desc', 'Aucune suggestion tirée de blogs sponsorisés. Tout est vécu, payé et vérifié par nous deux.')}
                  </p>
                </div>

                <div className="p-3 bg-[#FAF9F5] border border-[#DED5C6] rounded-sm">
                  <span className="text-[10px] uppercase tracking-wider text-terracotta font-bold block mb-1">
                    {Z('rule_2_badge', '02. Respect des lieux')}
                  </span>
                  <span className="font-serif text-sm text-mahogany block mb-1">
                    {Z('rule_2_title', 'Économie locale')}
                  </span>
                  <p className="text-[11px] text-charcoal/70 leading-relaxed">
                    {Z('rule_2_desc', 'Soutien direct aux petites structures indépendantes, vignerons et artisans du cru.')}
                  </p>
                </div>

                <div className="p-3 bg-[#FAF9F5] border border-[#DED5C6] rounded-sm">
                  <span className="text-[10px] uppercase tracking-wider text-terracotta font-bold block mb-1">
                    {Z('rule_3_badge', '03. Rythme juste')}
                  </span>
                  <span className="font-serif text-sm text-mahogany block mb-1">
                    {Z('rule_3_title', 'Anti-boulimie')}
                  </span>
                  <p className="text-[11px] text-charcoal/70 leading-relaxed">
                    {Z('rule_3_desc', 'Moins de kilomètres, plus de saveurs. On s\'arrête, on respire, on contemple.')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. BANNIÈRE ATELIER ATLAS CARTOGRAPHIQUE ─────────────────── */}
      <section className="w-full py-12 bg-mahogany text-[#FAF9F5] border-b border-[#DED5C6]">
        <div className="max-w-6xl mx-auto px-6 md:px-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF9F5]/10 text-[#FAF9F5] text-xs uppercase tracking-widest font-semibold mb-2">
              <Compass className="w-3.5 h-3.5 text-terracotta-light" />
              <span>{Z('atlas_teaser_badge', 'Nouveauté Cartographique')}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif leading-tight">
              {Z('atlas_teaser_title', 'L\'Atlas Heldonica : 24 Pépites & Tracés Interactifs')}
            </h2>
            <p className="text-xs md:text-sm text-[#FAF9F5]/80 mt-1 leading-relaxed">
              {Z(
                'atlas_teaser_desc',
                'Explorez nos tracés de terrain géolocalisés, les accès véhicules détaillés, les citations de route et le comparatif de nos camps de base vérifiés.'
              )}
            </p>
          </div>
          <Link
            href="/atlas"
            className="px-6 py-3 rounded-sm bg-[#FAF9F5] hover:bg-[#FAF7F2] text-mahogany text-xs font-medium uppercase tracking-wider transition-colors inline-flex items-center gap-2 shrink-0"
          >
            <span>{Z('atlas_teaser_cta', 'Ouvrir la grande carte')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── 4. DESTINATIONS & CARNETS VÉCUS (Style Magazine) ─────────── */}
      <section className="w-full py-16 md:py-24 bg-[#FAF9F5] border-b border-[#DED5C6]" id="destinations">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-terracotta font-bold block mb-1">
                {Z('section_destinations_badge', 'Terrains de jeu arpentés')}
              </span>
              <h2 className="text-2xl md:text-4xl font-serif text-mahogany">
                {Z('section_destinations_title', 'Carnets vécus & itinéraires testés')}
              </h2>
              <p className="text-xs md:text-sm text-charcoal/70 mt-1 max-w-xl leading-relaxed">
                {Z(
                  'section_destinations_desc',
                  'Nos repères de terrain sans filtre : les horaires précis des ferries, la taverne sans carte imprimée et la crique accessible uniquement à pied.'
                )}
              </p>
            </div>
            <Link
              href="/destinations"
              className="text-xs text-mahogany font-medium border-b border-mahogany/40 pb-0.5 hover:text-terracotta hover:border-terracotta transition-colors self-start md:self-auto"
            >
              {Z('section_destinations_all_cta', 'Voir toutes les destinations')}
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredDestinations.slice(0, 4).map((dest: any) => {
              const slug = dest.destination_slug || dest.slug || ''
              const imgUrl = dest.custom_image_url || dest.hero_unsplash_url || HELDONICA_BADGE_FALLBACK
              return (
                <article
                  key={slug}
                  className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm overflow-hidden flex flex-col group hover:border-mahogany/50 transition-colors"
                >
                  <div className="relative w-full aspect-[16/10] overflow-hidden bg-[#241D1A]">
                    <Image
                      src={imgUrl}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="bg-[#FAF9F5]/90 backdrop-blur-sm text-charcoal text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-sm">
                        {dest.country || 'Europe'}
                      </span>
                      <span className="bg-mahogany text-[#FAF9F5] text-[10px] font-semibold px-2.5 py-0.5 rounded-sm">
                        {Z('dest_verified_badge', 'Terrain vérifié')}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                    <div>
                      <h3 className="font-serif text-xl text-mahogany group-hover:text-terracotta transition-colors">
                        {dest.title}
                      </h3>
                      {dest.tagline && (
                        <p className="text-xs text-charcoal/75 mt-1.5 leading-relaxed">
                          {dest.tagline}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#DED5C6] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <span className="text-[11px] text-charcoal/60">
                        {Z('dest_card_question', 'Envie de cet itinéraire sans passer 20h de recherche ?')}
                      </span>
                      <Link
                        href="/travel-planning#formulaire"
                        className="px-3 py-1.5 rounded-sm bg-mahogany hover:bg-mahogany/90 text-[#FAF9F5] text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-colors"
                      >
                        {Z('dest_card_btn', 'Adapter pour moi')}
                      </Link>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── 5. OFFRE TRAVEL PLANNING MONÉTISÉE & TRANSPARENTE ────────── */}
      <section className="w-full py-16 md:py-24 bg-[#FAF7F2] border-b border-[#DED5C6]" id="travel-planning">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="bg-mahogany/10 text-mahogany px-4 py-1 rounded-full text-xs uppercase tracking-widest font-semibold">
              {Z('tp_badge', 'Service Signature Heldonica')}
            </span>
            <h2 className="text-3xl md:text-5xl font-serif text-mahogany mt-3 leading-tight">
              {Z('tp_title_1', '« On ne fait pas des itinéraires.')}
              <br />
              <em className="text-terracotta not-italic font-serif">
                {Z('tp_title_2', 'On fait le vôtre. »')}
              </em>
            </h2>
            <p className="text-xs md:text-sm text-charcoal/75 mt-2 leading-relaxed">
              {Z(
                'tp_desc',
                'Vous manquez de temps pour éplucher 50 blogs contradictoires ? Confiez-nous votre voyage. Nous créons votre séjour sur-mesure au millimètre, optimisé pour votre rythme et sans perte de temps.'
              )}
            </p>
          </div>

          {/* 3 Étapes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-[#FAF9F5] p-5 rounded-sm border border-[#DED5C6] flex flex-col gap-3">
              <div className="w-8 h-8 rounded-full bg-mahogany text-[#FAF9F5] flex items-center justify-center font-serif font-bold text-sm">
                1
              </div>
              <h3 className="font-serif text-lg text-mahogany">{Z('tp_step_1_title', 'Échange & Contraintes réelles')}</h3>
              <p className="text-xs text-charcoal/75 leading-relaxed">
                {Z(
                  'tp_step_1_desc',
                  'Un questionnaire fluide de 2 minutes : vos envies, budget d\'hébergement, rythme désiré et ce que vous évitez absolument.'
                )}
              </p>
              <div className="mt-auto pt-2 text-[11px] text-terracotta font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{Z('tp_step_1_tag', '0 prise de tête')}</span>
              </div>
            </div>

            <div className="bg-[#FAF9F5] p-5 rounded-sm border border-[#DED5C6] flex flex-col gap-3">
              <div className="w-8 h-8 rounded-full bg-mahogany text-[#FAF9F5] flex items-center justify-center font-serif font-bold text-sm">
                2
              </div>
              <h3 className="font-serif text-lg text-mahogany">{Z('tp_step_2_title', 'Feuille de route optimisée')}</h3>
              <p className="text-xs text-charcoal/75 leading-relaxed">
                {Z(
                  'tp_step_2_desc',
                  'Nous construisons l\'enchaînement logique sur le terrain pour éviter les allers-retours inutiles. Sélection d\'adresses secrètes vérifiées.'
                )}
              </p>
              <div className="mt-auto pt-2 text-[11px] text-terracotta font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{Z('tp_step_2_tag', '100% vérifié de visu')}</span>
              </div>
            </div>

            <div className="bg-[#FAF9F5] p-5 rounded-sm border border-[#DED5C6] flex flex-col gap-3">
              <div className="w-8 h-8 rounded-full bg-mahogany text-[#FAF9F5] flex items-center justify-center font-serif font-bold text-sm">
                3
              </div>
              <h3 className="font-serif text-lg text-mahogany">{Z('tp_step_3_title', 'Carnet secret & Support direct')}</h3>
              <p className="text-xs text-charcoal/75 leading-relaxed">
                {Z(
                  'tp_step_3_desc',
                  'Votre carnet interactif sur smartphone, les liens directs de réservation, une carte synchronisée et notre assistance par message sur place.'
                )}
              </p>
              <div className="mt-auto pt-2 text-[11px] text-terracotta font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{Z('tp_step_3_tag', 'Sérénité absolue')}</span>
              </div>
            </div>
          </div>

          {/* Grille Tarifs Transparents */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Formule 1 */}
            <div className="bg-[#FAF9F5] p-6 md:p-8 rounded-sm border border-[#DED5C6] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#DED5C6]">
                  <span className="text-xs uppercase tracking-wider font-semibold text-charcoal/60">
                    {Z('plan_1_name', 'Formule Escapade')}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-sm bg-[#EFECE6] text-xs font-medium text-charcoal/70">
                    {Z('plan_1_dur', '3 à 5 jours')}
                  </span>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-serif font-bold text-mahogany">180 €</span>
                  <span className="text-xs text-charcoal/60">{Z('plan_1_price_unit', '/ voyage entier')}</span>
                </div>
                <p className="text-xs text-charcoal/70 mt-2 leading-relaxed">
                  {Z('plan_1_desc', 'Idéal pour un week-end prolongé intense ou une pause ressourçante sans charge mentale.')}
                </p>
                <ul className="flex flex-col gap-2 mt-5 text-xs text-charcoal/80">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-terracotta shrink-0" />
                    <span>{Z('plan_1_f1', 'Itinéraire personnalisé jour par jour')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-terracotta shrink-0" />
                    <span>{Z('plan_1_f2', 'Jusqu\'à 15 adresses exclusives testées')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-terracotta shrink-0" />
                    <span>{Z('plan_1_f3', 'Carte interactive synchronisée')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-terracotta shrink-0" />
                    <span>{Z('plan_1_f4', 'Livraison sous 5 jours ouvrés')}</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/travel-planning#formulaire"
                className="mt-6 w-full py-3 rounded-sm bg-[#FAF7F2] hover:bg-[#EFECE6] border border-[#DED5C6] text-charcoal font-medium text-xs text-center uppercase tracking-wider transition-colors"
              >
                {Z('plan_1_btn', 'Commander cette formule')}
              </Link>
            </div>

            {/* Formule 2 (Mise en avant) */}
            <div className="bg-[#FAF9F5] p-6 md:p-8 rounded-sm border-2 border-mahogany flex flex-col justify-between relative shadow-sm">
              <div className="absolute -top-3 right-6 bg-mahogany text-[#FAF9F5] px-3 py-0.5 rounded-sm text-[10px] font-semibold uppercase tracking-wider">
                {Z('plan_2_badge', 'Le plus populaire')}
              </div>
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#DED5C6]">
                  <span className="text-xs uppercase tracking-wider font-semibold text-mahogany">
                    {Z('plan_2_name', 'Formule Grand Tour')}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-sm bg-mahogany/10 text-xs font-semibold text-mahogany">
                    {Z('plan_2_dur', '7 à 14 jours')}
                  </span>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-serif font-bold text-mahogany">340 €</span>
                  <span className="text-xs text-charcoal/60">{Z('plan_2_price_unit', '/ voyage entier')}</span>
                </div>
                <p className="text-xs text-charcoal/70 mt-2 leading-relaxed">
                  {Z('plan_2_desc', 'L\'immersion totale. Un road-trip équilibré, sans fatigue, combinant nature brute et tables inoubliables.')}
                </p>
                <ul className="flex flex-col gap-2 mt-5 text-xs text-charcoal/80">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-terracotta shrink-0" />
                    <span>{Z('plan_2_f1', 'Feuille de route complète 7 à 14 jours')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-terracotta shrink-0" />
                    <span>{Z('plan_2_f2', 'Sélection de logements d\'exception selon budget')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-terracotta shrink-0" />
                    <span>{Z('plan_2_f3', 'Assistance directe par message durant le séjour')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-terracotta shrink-0" />
                    <span>{Z('plan_2_f4', 'Alternative météo & repères secrets exclusifs')}</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/travel-planning#formulaire"
                className="mt-6 w-full py-3 rounded-sm bg-mahogany hover:bg-mahogany/90 text-[#FAF9F5] font-medium text-xs text-center uppercase tracking-wider transition-colors"
              >
                {Z('plan_2_btn', 'Réserver mon Grand Tour')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. DIAGNOSTIC RAPIDE (« Trouve ton profil en 2 minutes ») ──── */}
      <section className="w-full py-16 md:py-24 bg-[#FAF9F5] border-b border-[#DED5C6]">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="p-6 md:p-10 rounded-sm bg-[#FAF7F2] border border-[#DED5C6]">
            <div className="max-w-2xl mb-8">
              <span className="text-[11px] uppercase tracking-wider text-terracotta font-bold block mb-1">
                {Z('quiz_badge', 'Diagnostic Rapide')}
              </span>
              <h2 className="text-2xl md:text-3xl font-serif text-mahogany">
                {Z('quiz_title', 'Quel voyageur Heldonica êtes-vous ?')}
              </h2>
              <p className="text-xs md:text-sm text-charcoal/70 mt-1 leading-relaxed">
                {Z('quiz_desc', 'Sélectionnez votre sensibilité dominante pour découvrir instantanément la destination qui résonne avec votre rythme actuel.')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => setSelectedQuizProfile('aventure')}
                className={`p-4 rounded-sm text-left transition-colors flex flex-col justify-between h-48 border ${
                  selectedQuizProfile === 'aventure'
                    ? 'bg-[#FAF9F5] border-mahogany shadow-sm'
                    : 'bg-[#FAF9F5] border-[#DED5C6] hover:border-mahogany/40'
                }`}
              >
                <div>
                  <div className="w-8 h-8 rounded-full bg-mahogany/10 text-mahogany flex items-center justify-center mb-2">
                    <Mountain className="w-4 h-4" />
                  </div>
                  <h3 className="font-serif text-base text-mahogany">{Z('quiz_c1_title', 'Aventure & Reliefs')}</h3>
                  <p className="text-[11px] text-charcoal/70 mt-1 leading-relaxed">{Z('quiz_c1_desc', 'Sentiers escarpés, mer agitée, adrénaline douce et panoramas vertigineux.')}</p>
                </div>
                <span className="text-[11px] text-terracotta font-semibold">
                  {Z('quiz_c1_recom', 'Recommandé : Madère & Stoos')}
                </span>
              </button>

              <button
                onClick={() => setSelectedQuizProfile('culture')}
                className={`p-4 rounded-sm text-left transition-colors flex flex-col justify-between h-48 border ${
                  selectedQuizProfile === 'culture'
                    ? 'bg-[#FAF9F5] border-mahogany shadow-sm'
                    : 'bg-[#FAF9F5] border-[#DED5C6] hover:border-mahogany/40'
                }`}
              >
                <div>
                  <div className="w-8 h-8 rounded-full bg-mahogany/10 text-mahogany flex items-center justify-center mb-2">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <h3 className="font-serif text-base text-mahogany">{Z('quiz_c2_title', 'Histoire & Cités')}</h3>
                  <p className="text-[11px] text-charcoal/70 mt-1 leading-relaxed">{Z('quiz_c2_desc', 'Pierres chargées de mémoire, cités fortifiées oubliées, poésie architecturale.')}</p>
                </div>
                <span className="text-[11px] text-terracotta font-semibold">
                  {Z('quiz_c2_recom', 'Recommandé : Roumanie & Óbidos')}
                </span>
              </button>

              <button
                onClick={() => setSelectedQuizProfile('nature')}
                className={`p-4 rounded-sm text-left transition-colors flex flex-col justify-between h-48 border ${
                  selectedQuizProfile === 'nature'
                    ? 'bg-[#FAF9F5] border-mahogany shadow-sm'
                    : 'bg-[#FAF9F5] border-[#DED5C6] hover:border-mahogany/40'
                }`}
              >
                <div>
                  <div className="w-8 h-8 rounded-full bg-mahogany/10 text-mahogany flex items-center justify-center mb-2">
                    <Waves className="w-4 h-4" />
                  </div>
                  <h3 className="font-serif text-base text-mahogany">{Z('quiz_c3_title', 'Criques & Silence')}</h3>
                  <p className="text-[11px] text-charcoal/70 mt-1 leading-relaxed">{Z('quiz_c3_desc', 'Eaux translucides sans musique de plage, pins parasols et calme marin.')}</p>
                </div>
                <span className="text-[11px] text-terracotta font-semibold">
                  {Z('quiz_c3_recom', 'Recommandé : Monténégro & Sintra')}
                </span>
              </button>

              <button
                onClick={() => setSelectedQuizProfile('terroir')}
                className={`p-4 rounded-sm text-left transition-colors flex flex-col justify-between h-48 border ${
                  selectedQuizProfile === 'terroir'
                    ? 'bg-[#FAF9F5] border-mahogany shadow-sm'
                    : 'bg-[#FAF9F5] border-[#DED5C6] hover:border-mahogany/40'
                }`}
              >
                <div>
                  <div className="w-8 h-8 rounded-full bg-mahogany/10 text-mahogany flex items-center justify-center mb-2">
                    <UtensilsCrossed className="w-4 h-4" />
                  </div>
                  <h3 className="font-serif text-base text-mahogany">{Z('quiz_c4_title', 'Slow Dolce Vita')}</h3>
                  <p className="text-[11px] text-charcoal/70 mt-1 leading-relaxed">{Z('quiz_c4_desc', 'Vins de petits producteurs, trattorias authentiques et siestes d\'été.')}</p>
                </div>
                <span className="text-[11px] text-terracotta font-semibold">
                  {Z('quiz_c4_recom', 'Recommandé : Sicile & Pouilles')}
                </span>
              </button>
            </div>

            <div className="mt-8 pt-4 border-t border-[#DED5C6] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-charcoal/70">
              <span>{Z('quiz_footer_hint', 'Vous hésitez encore ? Dites-nous ce qui vous trotte dans la tête.')}</span>
              <Link
                href="/quiz"
                className="px-5 py-2.5 rounded-sm bg-mahogany hover:bg-mahogany/90 text-[#FAF9F5] font-medium text-xs uppercase tracking-wider whitespace-nowrap transition-colors"
              >
                {Z('quiz_footer_cta', 'Faire le questionnaire complet (2 min)')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. ESPACE HÉBERGEURS & HÔTELIERS DE CHARME (B2B) ─────────── */}
      <section className="w-full py-16 md:py-20 bg-[#FAF7F2] border-b border-[#DED5C6]">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="p-6 md:p-10 rounded-sm bg-[#FAF9F5] border border-[#DED5C6]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 flex flex-col gap-3">
                <div className="inline-flex items-center gap-1.5 text-mahogany text-xs uppercase tracking-widest font-semibold">
                  <Hotel className="w-4 h-4 text-terracotta" />
                  <span>{Z('b2b_badge', 'Propriétaires & Hôtes d\'exception')}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-serif text-mahogany">
                  {Z('b2b_title', 'Vous tenez une maison singulière, un gîte de charme ou un refuge intime ?')}
                </h2>
                <p className="text-xs md:text-sm text-charcoal/75 leading-relaxed">
                  {Z(
                    'b2b_desc',
                    'Nous refusons le modèle des plateformes anonymes de réservation de masse. Heldonica met directement en relation des voyageurs respectueux avec des hôtes qui soignent leur art de recevoir. Marge directe préservée, clientèle sélectionnée pour son respect des lieux.'
                  )}
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-charcoal">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-eucalyptus" />
                    <span>{Z('b2b_point_1', '0% commission de réservation')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-eucalyptus" />
                    <span>{Z('b2b_point_2', 'Visite & vérification de visu')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-eucalyptus" />
                    <span>{Z('b2b_point_3', 'Mise en avant éditoriale dédiée')}</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-center">
                <Link
                  href="/expert-hotelier"
                  className="px-6 py-3 rounded-sm bg-mahogany hover:bg-mahogany/90 text-[#FAF9F5] font-medium text-xs uppercase tracking-wider transition-colors w-full lg:w-auto text-center"
                >
                  {Z('b2b_cta', 'Proposer mon hébergement')}
                </Link>
                <span className="text-[11px] text-charcoal/50 mt-2 text-center w-full lg:text-right">
                  {Z('b2b_response_time', 'Réponse assurée sous 48h par le duo')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. NEWSLETTER « LETTRE DE ROUTE » ──────────────────────────── */}
      <section className="w-full py-16 md:py-20 bg-[#FAF9F5] border-b border-[#DED5C6]">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="p-8 md:p-12 rounded-sm bg-mahogany text-[#FAF9F5] flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="px-3 py-1 rounded-full bg-[#FAF9F5]/10 text-[#FAF9F5] text-xs uppercase tracking-widest font-semibold mb-2 inline-block">
                {Z('news_badge', 'La Lettre de Route Heldonica')}
              </span>
              <h2 className="text-2xl md:text-3xl font-serif mt-1 leading-tight">
                {Z('news_title', 'Une pépite confidentielle chaque dimanche matin.')}
              </h2>
              <p className="text-xs md:text-sm text-[#FAF9F5]/80 mt-2 leading-relaxed">
                {Z(
                  'news_desc',
                  'Un village oublié, une table paysanne, une crique sans coordonnées GPS publiques. Pas de spam, aucun partenariat non déclaré.'
                )}
              </p>
            </div>
            <div className="w-full md:w-auto shrink-0">
              <NewsletterForm />
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. INSTAGRAM FEED ─────────────────────────────────────────── */}
      <InstagramFeed />

      <Footer />
    </>
  )
}

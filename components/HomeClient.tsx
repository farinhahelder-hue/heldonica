'use client'

import { useEffect, useRef, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import type { BlogPost } from '@/lib/blog-supabase'
import InstagramEmbed from '@/components/InstagramEmbed'

const HELDONICA_BADGE_FALLBACK = '/images/badges-heldonica.svg'

// ─── Images de secours par slug ──────────────────────────────────────────────
const SLUG_IMAGES: Record<string, string> = {
  'madere-slow-travel-guide':                     'https://heldonica.fr/wp-content/uploads/2026/03/madere-foret-1024x683.jpg',
  'urbex-paris-safe':                             'https://heldonica.fr/wp-content/uploads/2025/09/paris-petite-ceinture-2-683x1024.jpg',
  'guide-pratique-comment-debuter-le-slow-travel-en-duo': 'https://heldonica.fr/wp-content/uploads/2025/08/randonnee-montagne-1024x683.jpg',
  'madere-quand-partir-sur-lile-de-leternel-printemps':   'https://heldonica.fr/wp-content/uploads/2026/03/madere-cascade-1024x683.jpg',
  'pepites-mystiques-de-madere':                  'https://heldonica.fr/wp-content/uploads/2026/03/madere-foret-1024x683.jpg',
  'prego-no-bolo-do-caco':                        'https://heldonica.fr/wp-content/uploads/2025/10/prego-bolo-caco-683x1024.jpg',
  'flotter-sur-la-limmat-a-zurich-notre-aventure-dete':   'https://heldonica.fr/wp-content/uploads/2025/09/zurich-limmat-ete-3-1024x681.jpg',
}
// ─── Images de secours par catégorie ─────────────────────────────────────────
/*
const CAT_IMAGES_LEGACY: Record<string, string> = {
  'Carnets Voyage':      'https://heldonica.fr/wp-content/uploads/2025/08/PXL_20250712_190916811.RAW-01.COVER-EDIT-1024x771.jpg',
  'Découvertes Locales': 'https://heldonica.fr/wp-content/uploads/2025/09/timisoara-ville-3-1024x683.jpg',
  'Expert Hôtelier':     'https://heldonica.fr/wp-content/uploads/2025/09/zurich-brasserie-2-683x1024.jpg',
  'Découvertes Locales': 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=900&q=80',
  'Guides Pratiques':    'https://heldonica.fr/wp-content/uploads/2025/08/randonnee-montagne-1024x683.jpg',
  'Expert Hôtelier':     'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=900&q=80',
  'Travel':              'https://heldonica.fr/wp-content/uploads/2025/08/zurich-panorama-2-1024x679.jpg',
  'Food & Lifestyle':    'https://heldonica.fr/wp-content/uploads/2025/10/bacalhau-lagareiro-3-683x1024.jpg',
  'Découvertes Locales': 'https://heldonica.fr/wp-content/uploads/2025/09/timisoara-ville-3-1024x683.jpg',
  'Expert Hôtelier': 'https://heldonica.fr/wp-content/uploads/2025/09/zurich-brasserie-2-683x1024.jpg',
  'DÃ©couvertes Locales': 'https://heldonica.fr/wp-content/uploads/2025/09/timisoara-ville-3-1024x683.jpg',
  'Expert HÃ´telier': 'https://heldonica.fr/wp-content/uploads/2025/09/zurich-brasserie-2-683x1024.jpg',
}
*/

const CAT_IMAGES: Record<string, string> = {
  'Carnets Voyage': 'https://heldonica.fr/wp-content/uploads/2025/08/PXL_20250712_190916811.RAW-01.COVER-EDIT-1024x771.jpg',
  'Découvertes Locales': 'https://heldonica.fr/wp-content/uploads/2025/09/timisoara-ville-3-1024x683.jpg',
  'Guides Pratiques': 'https://heldonica.fr/wp-content/uploads/2025/08/randonnee-montagne-1024x683.jpg',
  'Expert Hôtelier': 'https://heldonica.fr/wp-content/uploads/2025/09/zurich-brasserie-2-683x1024.jpg',
  Travel: 'https://heldonica.fr/wp-content/uploads/2025/08/zurich-panorama-2-1024x679.jpg',
  'Food & Lifestyle': 'https://heldonica.fr/wp-content/uploads/2025/10/bacalhau-lagareiro-3-683x1024.jpg',
  'DÃ©couvertes Locales': 'https://heldonica.fr/wp-content/uploads/2025/09/timisoara-ville-3-1024x683.jpg',
  'Expert HÃ´telier': 'https://heldonica.fr/wp-content/uploads/2025/09/zurich-brasserie-2-683x1024.jpg',
  'DÃƒÂ©couvertes Locales': 'https://heldonica.fr/wp-content/uploads/2025/09/timisoara-ville-3-1024x683.jpg',
  'Expert HÃƒÂ´telier': 'https://heldonica.fr/wp-content/uploads/2025/09/zurich-brasserie-2-683x1024.jpg',
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
    <div ref={ref} className="border-t-2 border-amber-800 pt-4 group hover:-translate-y-1 transition-transform duration-300">
      <p className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-1">
        {isNum ? (started ? count + suffix : '0' + suffix) : nb}
      </p>
      <p className="text-xs text-stone-500 leading-snug">{label}</p>
    </div>
  )
}

// ─── Card article ─────────────────────────────────────────────────────────────
function ArticleCard({ post, size = 'md' }: { post: BlogPost & { formattedDate: string }; size?: 'sm' | 'md' | 'lg' }) {
  const img = postImage(post)
  const [imgSrc, setImgSrc] = useState(img)
  const h = size === 'lg' ? 'h-80' : size === 'md' ? 'h-60' : 'h-44'

  useEffect(() => {
    setImgSrc(img)
  }, [img])

  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <article className="relative rounded-2xl overflow-hidden bg-stone-800 shadow-md hover:shadow-xl transition-all duration-400 h-full flex flex-col">
        <div className={`relative ${h} overflow-hidden`}>
          <img src={imgSrc} alt={post.title} width={600} height={400}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-90 group-hover:scale-105 transition-all duration-600"
            loading="lazy"
            onError={() => setImgSrc(HELDONICA_BADGE_FALLBACK)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
          <div className="absolute top-3 left-3">
            <span className="bg-amber-600/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {post.category}
            </span>
          </div>
          {post.read_time && (
            <span className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-sm text-white/80 text-xs px-2 py-0.5 rounded-full">
              {post.read_time} min
            </span>
          )}
        </div>
        <div className="p-4 flex flex-col flex-1 bg-white">
          <h3 className="font-semibold text-stone-900 text-sm leading-snug mb-1.5 group-hover:text-amber-700 transition-colors line-clamp-2">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-stone-500 text-xs leading-relaxed line-clamp-2 flex-1 mb-2">{post.excerpt}</p>
          )}
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-stone-100">
            <span className="text-xs text-stone-400">
              {post.destination ? `📍 ${post.destination}` : post.formattedDate}
            </span>
            <span className="text-xs text-amber-700 font-semibold group-hover:translate-x-1 transition-transform">Lire →</span>
          </div>
        </div>
      </article>
    </Link>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface HomeProps {
  featured: (BlogPost & { formattedDate: string }) | null
  travelPosts: (BlogPost & { formattedDate: string })[]
  foodPosts: (BlogPost & { formattedDate: string })[]
  latestPosts: (BlogPost & { formattedDate: string })[]
  totalPosts: number
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomeClient({ featured, travelPosts, foodPosts, latestPosts, totalPosts }: HomeProps) {
  useScrollReveal()
  const featImg = featured ? postImage(featured) : null
  const publishedArticles = totalPosts > 0 ? totalPosts : 17
  const coveredCountries = 6

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
        <video autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-45"
          src="https://d2xsxph8kpxj0f.cloudfront.net/310519663470606636/jAd3LynLbumRRtRSgGxysF/Heldonica_11053b9d.mp4"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
        <div className="relative z-20 px-5 md:px-16 pb-12 md:pb-24 max-w-4xl">
          <p className="text-amber-300 text-xs font-semibold tracking-[0.2em] uppercase mb-5"
             style={{ animation: 'wordIn 0.6s 0.2s cubic-bezier(0.16,1,0.3,1) forwards', opacity: 0 }}>
            Slow Travel · Hors des sentiers battus · Paris
          </p>
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-serif font-light text-white leading-[1.15] mb-4 md:mb-6">
            <span className="hero-word" style={{ animationDelay: '0.3s' }}>Explorateurs </span>
            <span className="hero-word" style={{ animationDelay: '0.4s' }}>émerveillés,</span>
            <br />
            <em>
              <span className="hero-word" style={{ animationDelay: '0.7s' }}>dénicheurs </span>
              <span className="hero-word" style={{ animationDelay: '0.8s' }}>de </span>
              <span className="hero-word" style={{ animationDelay: '0.9s' }}>pépites.</span>
            </em>
          </h1>
          <p className="text-sm md:text-lg text-gray-300 leading-relaxed mb-6 md:mb-8 max-w-xl"
             style={{ animation: 'wordIn 0.7s 1.1s cubic-bezier(0.16,1,0.3,1) forwards', opacity: 0 }}>
            L&apos;aventure ne se trouve pas seulement au bout du monde — elle se cache dans une ruelle oubliée, un café discret, un sentier silencieux qui révèle l&apos;âme d&apos;un lieu.
          </p>
          <div className="flex flex-wrap gap-3"
               style={{ animation: 'wordIn 0.7s 1.3s cubic-bezier(0.16,1,0.3,1) forwards', opacity: 0 }}>
            <Link href="/blog" className="px-5 md:px-6 py-2.5 md:py-3 bg-amber-800 hover:bg-amber-700 text-white rounded-full font-semibold text-sm tracking-wide transition">
              Nos carnets de voyage
            </Link>
            <Link href="/travel-planning" className="px-5 md:px-6 py-2.5 md:py-3 border border-white/50 hover:border-white text-white hover:bg-white/10 rounded-full font-semibold text-sm tracking-wide transition">
              Conception sur mesure
            </Link>
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
              <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-4">Notre histoire</p>
              <h2 className="text-3xl md:text-5xl font-serif font-light text-stone-900 leading-tight mb-6">
                Un art du voyage
                <span className="block italic text-amber-800">autrement</span>
              </h2>
              <p className="text-base text-stone-600 leading-relaxed mb-4">
                On est deux, et on se complète à la perfection. Elle, Roumaine — une enfance entre les Carpates et l&apos;Europe entière, sept pays habités, sept façons d&apos;apprendre à lire le monde — lit une ville comme un poème.
              </p>
              <p className="text-base text-stone-600 leading-relaxed mb-4">
                Lui, insulaire de Madère dans l&apos;âme — né entre l&apos;Atlantique et les falaises vertigineuses — part à l&apos;aventure là où les cartes s&apos;arrêtent, traquant les paysages que les guides ne montrent pas encore.
              </p>
              <p className="text-base text-stone-600 leading-relaxed mb-8">
                C&apos;est à Paris qu&apos;on s&apos;est trouvés. Ce qu&apos;on partage : un voyage plus lent, plus sensoriel, plus vivant — là où chaque détail devient une raison de rester un peu plus longtemps.
              </p>
              <Link href="/blog" className="inline-flex items-center gap-2 text-amber-800 font-semibold text-sm hover:gap-3 transition-all">
                Lire nos carnets de voyage →
              </Link>
            </div>
            <div className="md:col-span-2 grid grid-cols-2 gap-6" data-reveal="right">
              <AnimatedStat nb={publishedArticles} suffix="" label="Articles publies" />
              <AnimatedStat nb="100%" label="Adresses testées sur le terrain" />
              <AnimatedStat nb={coveredCountries} label="Pays couverts" />
              <AnimatedStat nb="2015" label="Première aventure commune" />
              <div className="col-span-2 mt-2">
                <p className="text-xs text-stone-400 leading-relaxed">
                  <span className="font-semibold text-stone-600">Terrains de jeu :</span><br />
                  Paris · Madère · Normandie · Le Havre · Timișoara · Malte · Sicile · Sardaigne · Tanzanie · Colombie · Afrique du Sud
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── À LA UNE : dernier article ──────────────────────────────────── */}
      {featured && (
        <section className="py-0 bg-stone-900">
          <Link href={`/blog/${featured.slug}`} className="group block">
            <article className="relative h-[50vh] md:h-[60vh] w-full overflow-hidden flex items-end">
              {featImg && (
                <img src={featImg} alt={featured.title} width={1400} height={700}
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-70 group-hover:scale-105 transition-all duration-700"
                  loading="lazy" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="relative z-10 p-8 md:p-16 max-w-3xl">
                <p className="text-amber-300 text-xs font-bold tracking-[0.2em] uppercase mb-3">✦ À la une</p>
                <span className="inline-block bg-amber-600 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
                  {featured.category}
                </span>
                <h2 className="text-2xl md:text-4xl font-serif font-light text-white leading-snug mb-3 group-hover:text-amber-200 transition-colors">
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p className="text-white/65 text-sm md:text-base leading-relaxed line-clamp-2 mb-4 max-w-xl">{featured.excerpt}</p>
                )}
                <span className="inline-flex items-center gap-2 text-amber-400 font-semibold text-sm group-hover:gap-3 transition-all">
                  Lire l&apos;article →
                </span>
              </div>
            </article>
          </Link>
        </section>
      )}

      {/* ── CARNETS DE VOYAGE ──────────────────────────────────────────── */}
      {travelPosts.length > 0 && (
        <section className="py-20 md:py-28 bg-stone-50">
          <div className="max-w-6xl mx-auto px-6 md:px-10">
            <div className="flex items-end justify-between mb-10 flex-wrap gap-4" data-reveal>
              <div>
                <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-2">✦ Carnets de voyage</p>
                <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900">Nos itinéraires vécus</h2>
              </div>
              <Link href="/blog" className="text-sm text-amber-800 font-semibold hover:underline">Voir tous les articles →</Link>
            </div>
            {travelPosts.length >= 1 && (
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <Link href={`/blog/${travelPosts[0].slug}`} className="card-lift group relative rounded-2xl overflow-hidden bg-stone-800 aspect-[4/3] md:row-span-2" data-reveal="left">
                  <img src={postImage(travelPosts[0])} alt={travelPosts[0].title}
                    className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700"
                    loading="lazy" width={800} height={600} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6">
                    <span className="inline-block bg-amber-700 text-white text-xs font-bold px-2.5 py-1 rounded-full mb-3">
                      {travelPosts[0].destination ?? travelPosts[0].category}
                    </span>
                    <h3 className="text-white text-2xl md:text-3xl font-serif font-light leading-tight group-hover:text-amber-200 transition-colors">
                      {travelPosts[0].title}
                    </h3>
                    {travelPosts[0].excerpt && (
                      <p className="text-gray-300 text-sm mt-2 line-clamp-2">{travelPosts[0].excerpt}</p>
                    )}
                  </div>
                </Link>
                <div className="grid grid-rows-2 gap-6">
                  {travelPosts.slice(1, 3).map((p, i) => (
                    <Link key={p.slug} href={`/blog/${p.slug}`}
                      className="group relative rounded-2xl overflow-hidden bg-stone-800"
                      data-reveal data-delay={String((i + 1) * 150)}>
                      <img src={postImage(p)} alt={p.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-65 group-hover:opacity-75 group-hover:scale-105 transition-all duration-700"
                        loading="lazy" width={600} height={300} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <div className="relative p-5 h-44 flex flex-col justify-end">
                        <h3 className="text-white text-lg font-serif font-light group-hover:text-amber-200 transition-colors line-clamp-2">
                          {p.title}
                        </h3>
                        <p className="text-gray-300 text-xs mt-1">{p.destination ?? p.formattedDate}</p>
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
                <img src={postImage(foodPosts[0])}
                  alt={foodPosts[0].title}
                  className="rounded-2xl w-full aspect-[4/3] object-cover shadow-lg" loading="lazy" width={700} height={525} />
                <div className="absolute -bottom-4 -right-4 bg-amber-800 text-white px-5 py-3 rounded-xl shadow-lg hidden md:block">
                  <p className="text-xs font-bold tracking-wider uppercase">Adresses testées</p>
                  <p className="text-2xl font-serif font-light mt-0.5">100%</p>
                </div>
              </div>
              <div data-reveal="right">
                <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-4">Food &amp; Lifestyle</p>
                <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 leading-tight mb-4">Inspirations gourmandes</h2>
                <p className="text-base text-stone-600 leading-relaxed mb-6">
                  On ne voyage pas seulement pour voir — on voyage pour goûter. Chaque destination révèle ses saveurs authentiques : les recettes portugaises transmises de génération en génération, les brasseries parisiennes que personne ne connaît encore.
                </p>
                <div className="space-y-4 mb-8">
                  {foodPosts.slice(0, 3).map((p) => (
                    <Link key={p.slug} href={`/blog/${p.slug}`}
                      className="flex items-start gap-3 group hover:bg-amber-50 rounded-xl p-2 -mx-2 transition-colors">
                      <img src={postImage(p)} alt={p.title} width={60} height={60}
                        className="w-14 h-14 rounded-lg object-cover flex-shrink-0" loading="lazy" />
                      <div>
                        <p className="font-semibold text-stone-800 text-sm group-hover:text-amber-700 transition-colors line-clamp-1">{p.title}</p>
                        {p.excerpt && <p className="text-stone-500 text-xs line-clamp-2 mt-0.5">{p.excerpt}</p>}
                      </div>
                    </Link>
                  ))}
                </div>
                <Link href="/blog" className="inline-flex items-center gap-2 text-amber-800 font-semibold text-sm hover:gap-3 transition-all">
                  Découvrir toutes les recettes →
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── DERNIERS ARTICLES ─────────────────────────────────────────── */}
      {latestPosts.length > 0 && (
        <section className="py-20 bg-[#f7f6f2]">
          <div className="max-w-6xl mx-auto px-6 md:px-10">
            <div className="flex items-end justify-between mb-10 flex-wrap gap-4" data-reveal>
              <div>
                <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-2">✦ Fraîchement publié</p>
                <h2 className="text-2xl md:text-3xl font-serif font-light text-stone-900">Les dernières pépites</h2>
              </div>
              <Link href="/blog" className="text-sm text-amber-800 font-semibold hover:underline">Tout voir →</Link>
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

      {/* ── CTA TRAVEL PLANNING ───────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-stone-900 text-white">
        <div className="max-w-5xl mx-auto px-6 md:px-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div data-reveal="left">
              <p className="text-amber-400 text-xs font-bold tracking-[0.2em] uppercase mb-4">Travel Planning sur mesure</p>
              <h2 className="text-3xl md:text-5xl font-serif font-light leading-tight mb-6">
                Votre aventure,<br />
                <em className="text-amber-400">conçue sur mesure</em>
              </h2>
              <p className="text-stone-400 leading-relaxed mb-4">
                Seul·e, en duo, en famille ou entre amis — on imagine et construit l&apos;itinéraire qui vous ressemble vraiment. Pas un template, pas un copier-coller : un voyage pensé pour vous, avec des adresses qu&apos;on a testées, pas récupérées sur un listicle.
              </p>
              <p className="text-stone-500 text-sm leading-relaxed mb-8">
                De l&apos;escapade parisienne d&apos;un week-end au grand tour de plusieurs semaines, chaque projet est unique.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/travel-planning" className="px-6 py-3 bg-amber-700 hover:bg-amber-600 text-white rounded font-semibold text-sm transition">
                  Découvrir le service
                </Link>
                <Link href="/travel-planning-form" className="px-6 py-3 border border-white/30 hover:border-white/60 text-white rounded font-semibold text-sm transition">
                  Démarrer un projet
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4" data-reveal="right">
              {[
                { t: 'Pour tous les voyageurs', d: "Solo, duo amoureux, amis complices, famille curieuse — chaque itinéraire s'adapte à votre groupe, votre rythme, vos envies." },
                { t: 'Adresses vécues, pas inventées', d: 'Hôtels de charme, restaurants cachés, expériences de terrain — chaque recommandation est vérifiée sur place.' },
                { t: 'Carnet de voyage complet', d: 'Cartes, conseils pratiques, adresses et inspirations pour chaque étape de votre aventure.' },
              ].map((item) => (
                <div key={item.t} className="border border-white/10 rounded-xl p-5 hover:border-amber-400/30 transition">
                  <h3 className="font-semibold text-white text-sm mb-1">{item.t}</h3>
                  <p className="text-stone-400 text-sm leading-relaxed">{item.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CONSULTING HÔTELIER — IAification & Digitalisation ────────── */}
      <section className="py-20 md:py-24 bg-stone-100">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div className="order-2 md:order-1" data-reveal="left">
              <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-4">Consulting B2B · Hôtellerie</p>
              <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 leading-tight mb-6">
                IAification &amp; digitalisation
                <span className="block italic text-stone-600">des établissements hôteliers</span>
              </h2>
              <p className="text-base text-stone-600 leading-relaxed mb-4">
                On accompagne les hôtels indépendants dans leur transformation numérique : intégration de l&apos;IA dans les opérations, automatisation des process, refonte de la présence digitale — pour gagner en efficacité sans perdre l&apos;âme de l&apos;établissement.
              </p>
              <p className="text-sm text-stone-500 leading-relaxed mb-6">
                Du diagnostic initial au déploiement concret, on co-construit une feuille de route réaliste, adaptée à votre structure et vos équipes.
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {['IA générative', 'Automatisation', 'Digitalisation', 'Expérience client', 'Formation équipes', 'ROI mesurable'].map((tag) => (
                  <span key={tag} className="bg-white border border-stone-300 text-stone-700 text-xs font-semibold px-3 py-1 rounded-full">{tag}</span>
                ))}
              </div>
              <Link href="/hotel-consulting" className="inline-flex items-center gap-2 text-amber-800 font-semibold text-sm hover:gap-3 transition-all">
                Découvrir l&apos;offre consulting →
              </Link>
            </div>
            <div className="order-1 md:order-2 grid grid-cols-1 gap-4" data-reveal="right">
              {[
                {
                  icon: '⚡',
                  t: 'Audit IA & digital',
                  d: "Cartographie des processus existants, identification des leviers d'automatisation à fort ROI."
                },
                {
                  icon: '🤖',
                  t: "Déploiement d'outils IA",
                  d: "Sélection et intégration d'outils adaptés : chatbots, yield management intelligent, personnalisation guest journey."
                },
                {
                  icon: '📈',
                  t: 'Formation & accompagnement',
                  d: 'Montée en compétences des équipes pour adopter les nouveaux outils durablement, sans résistance au changement.'
                },
              ].map((item) => (
                <div key={item.t} className="bg-white rounded-xl p-5 shadow-sm border border-stone-200 hover:border-amber-300 transition">
                  <div className="text-2xl mb-3">{item.icon}</div>
                  <h3 className="font-semibold text-stone-900 text-sm mb-1">{item.t}</h3>
                  <p className="text-stone-500 text-sm leading-relaxed">{item.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Instagram Feed Section */}
      <section className="py-16 bg-stone-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-serif text-stone-900 text-center mb-8">
            Suivez nos aventures
          </h2>
          <InstagramEmbed limit={6} />
        </div>
      </section>

      <Footer />
    </>
  )
}

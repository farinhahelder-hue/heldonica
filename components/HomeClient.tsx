'use client'

import { useEffect, useRef, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import type { BlogPost } from '@/lib/blog-supabase'

// ─── Images de secours par slug ──────────────────────────────────────────────
const SLUG_IMAGES: Record<string, string> = {
  'madere-slow-travel-guide':                     'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=900&q=80',
  'urbex-paris-safe':                             'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=900&q=80',
  'guide-pratique-comment-debuter-le-slow-travel-en-duo': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=900&q=80',
  'madere-quand-partir-sur-lile-de-leternel-printemps':   'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80',
  'pepites-mystiques-de-madere':                  'https://images.unsplash.com/photo-1559628376-f3fe5f782a2e?w=900&q=80',
  'prego-no-bolo-do-caco':                        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80',
}
// ─── Images de secours par catégorie ─────────────────────────────────────────
const CAT_IMAGES: Record<string, string> = {
  'Carnets Voyage':      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=900&q=80',
  'Découvertes Locales': 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=900&q=80',
  'Guides Pratiques':    'https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?w=900&q=80',
  'Expert Hôtelier':     'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=900&q=80',
  'Travel':              'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=900&q=80',
  'Food & Lifestyle':    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80',
}
const CAT_BG: Record<string, string> = {
  'Travel': 'from-teal-900 via-stone-800 to-emerald-900',
  'Food & Lifestyle': 'from-amber-900 via-orange-900 to-stone-800',
  'Expertise Hôtelière': 'from-slate-900 via-stone-800 to-zinc-900',
}
function postImage(p: BlogPost): string {
  if (p.featured_image) return p.featured_image
  if (p.slug && SLUG_IMAGES[p.slug]) return SLUG_IMAGES[p.slug]
  if (p.category && CAT_IMAGES[p.category]) return CAT_IMAGES[p.category]
  return 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=900&q=80'
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
  const h = size === 'lg' ? 'h-80' : size === 'md' ? 'h-60' : 'h-44'
  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <article className="relative rounded-2xl overflow-hidden bg-stone-800 shadow-md hover:shadow-xl transition-all duration-400 h-full flex flex-col">
        <div className={`relative ${h} overflow-hidden`}>
          <img src={img} alt={post.title} width={600} height={400}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-90 group-hover:scale-105 transition-all duration-600"
            loading="lazy" />
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
        .hero-word{display:inline-block;opacity:0;transform:translateY(20px);animation:wordIn 0.6s cubic-bezier(0.16,1,0.3,1) forwards}
        @keyframes wordIn{to{opacity:1;transform:none}}
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
            Slow Travel · Voyages en couple · Paris
          </p>
          <h1 className="text-3xl md:text-5xl lg:text-7xl font-serif font-light text-white leading-[1.15] mb-4 md:mb-6">
            {'Explorateurs émerveillés,'.split(' ').map((w, i) => (
              <span key={i} className="hero-word" style={{ animationDelay: `${0.3 + i * 0.1}s` }}>{w}{' '}</span>
            ))}
            <br />
            <em>{'dénicheurs de pépites.'.split(' ').map((w, i) => (
              <span key={i} className="hero-word" style={{ animationDelay: `${0.7 + i * 0.1}s` }}>{w}{' '}</span>
            ))}</em>
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
              <AnimatedStat nb={totalPosts} suffix="" label="Articles publiés" />
              <AnimatedStat nb="100%" label="Adresses testées sur le terrain" />
              <AnimatedStat nb={7} label="Pays habités entre nous" />
              <AnimatedStat nb={2015} label="Première aventure commune" />
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
              <p className="text-amber-400 text-xs font-bold tracking-[0.2em] uppercase mb-4">Travel Planning</p>
              <h2 className="text-3xl md:text-5xl font-serif font-light leading-tight mb-6">
                Votre aventure,<br />
                <em className="text-amber-400">conçue sur mesure</em>
              </h2>
              <p className="text-stone-400 leading-relaxed mb-8">
                Confiez-nous les clés de votre prochaine escapade. On imagine, on construit, on documente — un itinéraire qui vous ressemble, avec des adresses qu&apos;on a testées, pas récupérées sur un listicle.
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
                { t: 'Itinéraires personnalisés', d: 'Basés sur vos envies, votre rythme, vos contraintes. Aucun voyage ne se ressemble.' },
                { t: 'Adresses vécues, pas inventées', d: 'Hôtels de charme, restaurants cachés, expériences de terrain — chaque recommandation est vérifiée.' },
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

      {/* ── CONSULTING HÔTELIER ───────────────────────────────────────── */}
      <section className="py-20 md:py-24 bg-stone-100">
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div className="order-2 md:order-1" data-reveal="left">
              <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-4">Consulting B2B</p>
              <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 leading-tight mb-6">
                Expertise hôtelière
                <span className="block italic text-stone-600">au service de vos résultats</span>
              </h2>
              <p className="text-base text-stone-600 leading-relaxed mb-4">
                Revenue Management, SEO local, expérience client — on accompagne les établissements indépendants qui veulent piloter leur activité avec rigueur et ambition.
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {['Revenue Management', 'SEO Local', 'Expérience client', 'Mix canaux', 'ROI'].map((tag) => (
                  <span key={tag} className="bg-white border border-stone-300 text-stone-700 text-xs font-semibold px-3 py-1 rounded-full">{tag}</span>
                ))}
              </div>
              <Link href="/hotel-consulting" className="inline-flex items-center gap-2 text-amber-800 font-semibold text-sm hover:gap-3 transition-all">
                Découvrir l&apos;offre consulting →
              </Link>
            </div>
            <div className="order-1 md:order-2" data-reveal="right">
              <img src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=700&q=85"
                alt="Hôtel — lobby élégant" className="rounded-2xl w-full aspect-[4/3] object-cover shadow-lg"
                loading="lazy" width={700} height={525} />
            </div>
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-amber-900">
        <div className="max-w-2xl mx-auto px-6 text-center" data-reveal="scale">
          <p className="text-amber-200 text-xs font-bold tracking-[0.2em] uppercase mb-4">✦ Newsletter</p>
          <h2 className="text-2xl md:text-3xl font-serif font-light text-white mb-3">
            Les pépites dénichées,<br /> directement dans ta boîte mail
          </h2>
          <p className="text-amber-200 text-sm mb-8">Adresses secrètes, carnets de route, conseils de terrain — 2× par mois, sans spam.</p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="ton@email.com"
              className="flex-1 px-4 py-3 rounded-lg text-stone-900 text-sm placeholder:text-stone-400 outline-none focus:ring-2 focus:ring-amber-400" />
            <button type="submit" className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-semibold text-sm transition whitespace-nowrap">
              S&apos;abonner
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </>
  )
}


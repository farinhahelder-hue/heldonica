'use client'

import Image from 'next/image'
import Link from 'next/link'

export interface SubDestinationHighlight {
  title: string
  description: string
  emoji: string
}

export interface SubDestinationProps {
  name: string
  parentName: string
  parentSlug: string
  heroImage: string
  introText: string
  highlights: SubDestinationHighlight[]
  localTip: string
  relatedArticles?: Array<{
    slug: string
    title: string
    excerpt?: string
    featured_image?: string
    readTime?: number
  }>
}

export default function SubDestinationTemplate({
  name,
  parentName,
  parentSlug,
  heroImage,
  introText,
  highlights,
  localTip,
  relatedArticles = [],
}: SubDestinationProps) {
  return (
    <main className="min-h-screen bg-cloud-dancer font-sans">
      {/* ── HERO ── */}
      <section className="relative h-[45vh] md:h-[55vh] flex items-end bg-stone-950 overflow-hidden">
        <Image
          src={heroImage}
          alt={`Voyage slow travel à ${name}`}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent z-10" />
        <div className="relative z-20 max-w-4xl mx-auto px-6 pb-12 w-full">
          <nav className="flex items-center gap-2 text-teal text-xs font-bold tracking-widest uppercase mb-3">
            <Link href="/destinations" className="hover:underline">
              Destinations
            </Link>
            <span>·</span>
            <Link href={`/destinations/${parentSlug}`} className="hover:underline">
              {parentName}
            </Link>
          </nav>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light text-white leading-tight">
            {name}
          </h1>
        </div>
      </section>

      {/* ── INTRO ── */}
      <section className="py-16 bg-white border-b border-stone-200/60">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-stone-500 text-xs font-bold uppercase tracking-[0.2em] mb-4">
            L'esprit du lieu
          </p>
          <p className="text-lg md:text-xl text-stone-800 font-serif font-light leading-relaxed mb-8">
            {introText}
          </p>

          <div className="p-5 rounded-2xl bg-[#F8F5F0] border border-stone-200/50 flex items-start gap-4">
            <span className="text-2xl shrink-0">💡</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-mahogany mb-1">
                Le conseil d'Hélder & Elena
              </p>
              <p className="text-sm text-stone-600 leading-relaxed">{localTip}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── HIGHLIGHTS / PÉPITES ── */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-serif font-light text-stone-900 mb-2 text-center">
            Pépites dénichées à {name}
          </h2>
          <p className="text-xs text-stone-500 tracking-wider text-center uppercase mb-12">
            Testé et vécu, loin de l'agitation
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {highlights.map((h, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-stone-200/60 hover:shadow-md transition-shadow flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 rounded-full bg-teal/10 flex items-center justify-center text-2xl mb-4">
                  {h.emoji}
                </div>
                <h3 className="font-serif font-bold text-stone-800 text-lg mb-2">
                  {h.title}
                </h3>
                <p className="text-stone-600 text-xs leading-relaxed">{h.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ARTICLES DE BLOG CONNEXES ── */}
      {relatedArticles.length > 0 && (
        <section className="py-16 bg-white border-t border-stone-200/60">
          <div className="max-w-4xl mx-auto px-6">
            <h3 className="text-xl font-serif font-light text-stone-900 mb-8">
              Dans la même veine : nos carnets {parentName}
            </h3>
            <div className="grid sm:grid-cols-2 gap-6">
              {relatedArticles.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex gap-4 items-center p-3 rounded-xl border border-stone-100 hover:border-teal/20 transition-all bg-[#F8F5F0]/20"
                >
                  <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden">
                    <Image
                      src={
                        post.featured_image ||
                        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=80'
                      }
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-stone-800 text-sm group-hover:text-eucalyptus transition-colors line-clamp-2">
                      {post.title}
                    </h4>
                    {post.excerpt && (
                      <p className="text-stone-500 text-[11px] mt-1 line-clamp-1">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── B2C CTA TRAVEL PLANNING ── */}
      <section className="py-20 bg-stone-900 text-white text-center">
        <div className="max-w-2xl mx-auto px-6">
          <span className="text-teal text-xs font-bold tracking-[0.2em] uppercase mb-4 block">
            Ton itinéraire sur mesure
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-light mb-6">
            Tu prépares un voyage en {parentName} ?
          </h2>
          <p className="text-stone-400 text-sm md:text-base leading-relaxed mb-8 max-w-lg mx-auto">
            On s'occupe de concevoir ton carnet de route complet à partir de tes contraintes et de nos adresses vécues.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/travel-planning"
              className="px-8 py-3.5 bg-teal text-white rounded-full font-semibold text-sm hover:brightness-110 transition shadow-lg"
            >
              Planifier mon voyage
            </Link>
            <Link
              href={`/destinations/${parentSlug}`}
              className="px-8 py-3.5 border border-stone-600 text-stone-300 hover:text-white rounded-full font-semibold text-sm hover:border-white transition"
            >
              Voir le guide {parentName}
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

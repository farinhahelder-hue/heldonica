'use client'

import Image from 'next/image'
import Link from 'next/link'
import EditableZone from '@/components/inline-edit/EditableZone'

export interface SubDestinationHighlight {
  title: string
  description: string
  emoji: string
}

export interface SubDestinationProps {
  /**
   * Namespace des zones CMS (ex: `destinations-madere-funchal`). Chaque champ
   * est piloté par `cms_editable_zones`, les props servant de fallback
   * technique.
   *
   * Obligatoire : les 41 pages qui montent ce gabarit le fournissent toutes.
   * Tant qu'il était optionnel, chaque zone devait s'écrire en ternaire, ce qui
   * poussait à passer par un accesseur — et un accesseur rend les clés
   * *globales* aux yeux de `check-cms-zones.mjs`, qui cesse alors de signaler
   * les mêmes clés orphelines sur les autres pages.
   */
  page: string
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
  page,
  name,
  parentName,
  parentSlug,
  heroImage,
  introText,
  highlights,
  localTip,
  relatedArticles = [],
}: SubDestinationProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name,
    description: introText,
    image: heroImage,
    url: `https://www.heldonica.fr/destinations/${parentSlug}/${name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-')}`,
    containedInPlace: {
      '@type': 'TouristDestination',
      name: parentName,
      url: `https://www.heldonica.fr/destinations/${parentSlug}`,
    },
  }

  return (
    <main className="min-h-screen bg-cloud-dancer font-sans">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {/* ── HERO ── */}
      <section className="relative h-[45vh] md:h-[55vh] flex items-end bg-stone-950 overflow-hidden">
        <div className="absolute inset-0">
          <EditableZone
            page={page}
            zone="hero_image"
            type="image"
            fallback={heroImage}
            className="w-full h-full object-cover opacity-60"
          />
        </div>
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
            <EditableZone page={page} zone="intro_kicker" fallback="L'esprit du lieu" />
          </p>
          <p className="text-lg md:text-xl text-stone-800 font-serif font-light leading-relaxed mb-8">
            {/* Pas de `as="p"` : le parent est déjà un <p>, et un <p> imbriqué
                fait échouer l'hydratation (erreur console à chaque rendu). */}
            <EditableZone page={page} zone="intro_text" type="textarea" fallback={introText} />
          </p>

          <div className="p-5 rounded-2xl bg-[#F8F5F0] border border-stone-200/50 flex items-start gap-4">
            <span className="text-2xl shrink-0">💡</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-mahogany mb-1">
                <EditableZone page={page} zone="local_tip_kicker" fallback="Notre conseil" />
              </p>
              <p className="text-sm text-stone-600 leading-relaxed">
                <EditableZone page={page} zone="local_tip" type="textarea" fallback={localTip} />
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── HIGHLIGHTS / PÉPITES ── */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-serif font-light text-stone-900 mb-2 text-center">
            <EditableZone page={page} zone="highlights_title_prefix" fallback="Pépites dénichées à" />{' '}
            {name}
          </h2>
          <p className="text-xs text-stone-500 tracking-wider text-center uppercase mb-12">
            <EditableZone
              page={page}
              zone="highlights_subtitle"
              fallback="Testé et vécu, loin de l'agitation"
            />
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {highlights.map((h, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-stone-200/60 hover:shadow-md transition-shadow flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 rounded-full bg-teal/10 flex items-center justify-center text-2xl mb-4">
                  <EditableZone page={page} zone={`highlight_${i + 1}_emoji`} fallback={h.emoji} />
                </div>
                <h3 className="font-serif font-bold text-stone-800 text-lg mb-2">
                  <EditableZone
                    page={page}
                    zone={`highlight_${i + 1}_title`}
                    fallback={h.title}
                    as="span"
                  />
                </h3>
                <p className="text-stone-600 text-xs leading-relaxed">
                  <EditableZone
                    page={page}
                    zone={`highlight_${i + 1}_description`}
                    type="textarea"
                    fallback={h.description}
                    as="span"
                  />
                </p>
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
              <EditableZone
                page={page}
                zone="related_title"
                fallback={`Dans la même veine : nos carnets ${parentName}`}
              />
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
                        '/og-default.jpg'
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
            <EditableZone page={page} zone="cta_kicker" fallback="Ton itinéraire sur mesure" />
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-light mb-6">
            <EditableZone
              page={page}
              zone="cta_title"
              fallback={`Tu prépares un voyage en ${parentName} ?`}
            />
          </h2>
          <p className="text-stone-400 text-sm md:text-base leading-relaxed mb-8 max-w-lg mx-auto">
            <EditableZone
              page={page}
              zone="cta_text"
              type="textarea"
              fallback="On s'occupe de concevoir ton carnet de route complet à partir de tes contraintes et de nos adresses vécues."
            />
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/travel-planning"
              className="px-8 py-3.5 bg-teal text-white rounded-full font-semibold text-sm hover:brightness-110 transition shadow-lg"
            >
              <EditableZone page={page} zone="cta_button_1" fallback="Planifier mon voyage" />
            </Link>
            <Link
              href={`/destinations/${parentSlug}`}
              className="px-8 py-3.5 border border-stone-600 text-stone-300 hover:text-white rounded-full font-semibold text-sm hover:border-white transition"
            >
              <EditableZone
                page={page}
                zone="cta_button_2"
                fallback={`Voir le guide ${parentName}`}
              />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

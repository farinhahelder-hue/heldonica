'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Compass, Lightbulb } from 'lucide-react'
import EditableZone from '@/components/inline-edit/EditableZone'
import NewsletterForm from '@/components/NewsletterForm'
import { getStyleLabel } from '@/lib/travel-styles'
import { isUnpublishedCmsPage } from '@/lib/unpublished-pages'

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
  /**
   * Style de voyage (`slow-culture`, `slow-nature`…), facultatif. Utilisé par la
   * page « Bientôt » servie pour les pages au contenu non publiable : il alimente
   * la carte « Style » via `getStyleLabel`.
   */
  travelStyle?: string
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
  travelStyle,
  relatedArticles = [],
}: SubDestinationProps) {
  // Contenu non publiable (cf. lib/unpublished-pages.ts) : le brouillon en base
  // (« Grec. », « Incredible. ») est remplacé par une page « Bientôt » — l'état de
  // non-publication déjà utilisé par /destinations/grece. Publier une page de ce
  // gabarit, c'est rédiger son contenu puis retirer son entrée de cette liste.
  //
  // Les zones sont écrites en toutes lettres, avec `page={page}` et une clé
  // littérale, et non confiées à un composant : c'est le seul motif que
  // `check-cms-zones.mjs` relie à la page appelante. Passer par un composant
  // intermédiaire les rendrait orphelines sur les 43 pages qui montent ce gabarit.
  if (isUnpublishedCmsPage(page)) {
    const styleLabel = getStyleLabel(travelStyle)

    return (
      <main className="bg-[#F7F3EC] text-[#241D1A]">
        <section className="relative min-h-[55vh] flex items-end overflow-hidden bg-[#241D1A] border-b border-[#DED5C6]">
          <EditableZone page={page} zone="hero_image" type="image" fallback={heroImage} className="object-cover opacity-45 absolute inset-0 w-full h-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1512]/85 via-[#1A1512]/35 to-transparent" />
          <div className="relative container py-16 md:py-24">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#E6DEC8]/80 mb-4 font-medium">
              <EditableZone page={page} zone="hero_eyebrow" fallback={`${parentName} — Bientôt`} />
            </p>
            <h1 className="text-4xl md:text-6xl font-serif font-normal text-[#FAF7F2] max-w-3xl mb-5 leading-tight">
              <EditableZone page={page} zone="hero_title" fallback={name} />
            </h1>
          </div>
        </section>

        {styleLabel && (
          <section className="bg-[#EFE9DF] py-10 border-b border-[#DED5C6]">
            <div className="container max-w-4xl">
              <div className="rounded-sm border border-[#DED5C6] bg-[#FAF7F2] p-5">
                <p className="text-[11px] uppercase tracking-[0.18em] text-eucalyptus font-medium mb-1.5">Style</p>
                <p className="text-mahogany font-serif text-lg">
                  <EditableZone page={page} zone="style_label" fallback={styleLabel} />
                </p>
              </div>
            </div>
          </section>
        )}

        <section className="bg-[#F7F3EC] py-20 md:py-28">
          <div className="container max-w-2xl text-center">
            <div className="w-12 h-12 rounded-sm border border-[#DED5C6] bg-[#FAF7F2] flex items-center justify-center mx-auto mb-6">
              <Compass className="w-5 h-5 text-eucalyptus" strokeWidth={1.25} aria-hidden="true" />
            </div>
            <h2 className="text-3xl font-serif font-normal text-mahogany mb-4">
              {/* Le nom tel quel : en minuscules, il donnait « le guide funchal et environs ». */}
              <EditableZone page={page} zone="section_title" fallback={`On prépare le guide ${name} — à notre façon.`} />
            </h2>
            <p className="text-charcoal/75 mb-8 max-w-lg mx-auto leading-relaxed">
              <EditableZone page={page} zone="section_text" type="textarea" fallback="On arpente les ruelles, on teste les adresses, on sélectionne ce qu'on referait vraiment. Laisse-nous ton email et tu seras le premier averti — avant qu'on publie quoi que ce soit ailleurs." />
            </p>
            <div className="max-w-md mx-auto mb-8">
              <NewsletterForm variant="inline" />
            </div>
            <Link
              href="/destinations"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-mahogany font-medium border-b border-mahogany/40 pb-1 hover:border-mahogany transition-colors"
            >
              <EditableZone page={page} zone="back_link" fallback="← Voir toutes nos destinations" />
            </Link>
          </div>
        </section>
      </main>
    )
  }

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
    <main className="min-h-screen bg-[#F7F3EC] text-[#241D1A] font-sans">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {/* ── HERO ── */}
      <section className="relative h-[45vh] md:h-[55vh] flex items-end bg-[#241D1A] overflow-hidden border-b border-[#DED5C6]">
        <div className="absolute inset-0">
          <EditableZone
            page={page}
            zone="hero_image"
            type="image"
            fallback={heroImage}
            className="w-full h-full object-cover opacity-55"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1512]/85 via-[#1A1512]/30 to-transparent z-10" />
        <div className="relative z-20 max-w-4xl mx-auto px-6 pb-12 w-full">
          <nav className="flex items-center gap-2 text-[#E6DEC8]/85 text-[11px] font-medium tracking-[0.2em] uppercase mb-3">
            <Link href="/destinations" className="hover:underline">
              Destinations
            </Link>
            <span>·</span>
            <Link href={`/destinations/${parentSlug}`} className="hover:underline">
              {parentName}
            </Link>
          </nav>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-normal text-[#FAF7F2] leading-tight">
            {name}
          </h1>
        </div>
      </section>

      {/* ── INTRO ── */}
      <section className="py-16 bg-[#F7F3EC] border-b border-[#DED5C6]">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-eucalyptus text-[11px] font-medium uppercase tracking-[0.2em] mb-4">
            <EditableZone page={page} zone="intro_kicker" fallback="L'esprit du lieu" />
          </p>
          <p className="text-lg md:text-xl text-mahogany font-serif font-normal leading-relaxed mb-8">
            <EditableZone page={page} zone="intro_text" type="textarea" fallback={introText} />
          </p>

          <div className="p-5 rounded-sm bg-[#FAF7F2] border border-[#DED5C6] flex items-start gap-4">
            <div className="w-9 h-9 rounded-sm border border-[#DED5C6] bg-[#EFE9DF] flex items-center justify-center shrink-0 mt-0.5">
              <Lightbulb className="w-4 h-4 text-eucalyptus" strokeWidth={1.25} aria-hidden="true" />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-mahogany mb-1">
                <EditableZone page={page} zone="local_tip_kicker" fallback="Notre conseil" />
              </p>
              <p className="text-sm text-charcoal/80 leading-relaxed">
                <EditableZone page={page} zone="local_tip" type="textarea" fallback={localTip} />
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── HIGHLIGHTS / PÉPITES ── */}
      <section className="py-20 bg-[#EFE9DF] border-b border-[#DED5C6]">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-serif font-normal text-mahogany mb-2 text-center">
            <EditableZone page={page} zone="highlights_title_prefix" fallback="Pépites dénichées à" />{' '}
            {name}
          </h2>
          <p className="text-[11px] text-charcoal/65 tracking-[0.18em] text-center uppercase mb-12">
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
                className="bg-[#FAF7F2] rounded-sm p-6 border border-[#DED5C6] hover:border-mahogany/40 transition-colors flex flex-col items-start"
              >
                <div className="w-10 h-10 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center mb-4">
                  <EditableZone page={page} zone={`highlight_${i + 1}_emoji`} fallback={h.emoji} className="w-5 h-5 text-eucalyptus" />
                </div>
                <h3 className="font-serif font-normal text-mahogany text-lg mb-2">
                  <EditableZone
                    page={page}
                    zone={`highlight_${i + 1}_title`}
                    fallback={h.title}
                    as="span"
                  />
                </h3>
                <p className="text-charcoal/75 text-xs leading-relaxed">
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
        <section className="py-16 bg-[#F7F3EC] border-b border-[#DED5C6]">
          <div className="max-w-4xl mx-auto px-6">
            <h3 className="text-xl font-serif font-normal text-mahogany mb-8">
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
                  className="group flex gap-4 items-center p-3 rounded-sm border border-[#DED5C6] hover:border-mahogany/40 transition-colors bg-[#FAF7F2]"
                >
                  <div className="relative w-20 h-20 shrink-0 rounded-sm overflow-hidden border border-[#DED5C6]">
                    <Image
                      src={post.featured_image || '/og-default.jpg'}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div>
                    <h4 className="font-serif font-normal text-mahogany text-sm group-hover:text-eucalyptus transition-colors line-clamp-2">
                      {post.title}
                    </h4>
                    {post.excerpt && (
                      <p className="text-charcoal/65 text-[11px] mt-1 line-clamp-1">
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
      <section className="py-20 bg-[#2A1D18] text-[#F7F3EC] text-center">
        <div className="max-w-2xl mx-auto px-6">
          <span className="text-[#E6DEC8]/80 text-[11px] font-medium tracking-[0.2em] uppercase mb-4 block">
            <EditableZone page={page} zone="cta_kicker" fallback="Ton itinéraire sur mesure" />
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-normal mb-6">
            <EditableZone
              page={page}
              zone="cta_title"
              fallback={`Tu prépares un voyage en ${parentName} ?`}
            />
          </h2>
          <p className="text-[#E6DEC8]/75 text-sm md:text-base leading-relaxed mb-8 max-w-lg mx-auto">
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
              className="px-7 py-3 bg-action text-[#FAF7F2] rounded-sm font-medium text-xs uppercase tracking-[0.16em] hover:bg-action-fonce transition-colors"
            >
              <EditableZone page={page} zone="cta_button_1" fallback="Préparer un voyage" />
            </Link>
            <Link
              href={`/destinations/${parentSlug}`}
              className="px-7 py-3 border border-[#E6DEC8]/35 text-[#E6DEC8] hover:text-[#FAF7F2] rounded-sm font-medium text-xs uppercase tracking-[0.16em] hover:border-[#FAF7F2] transition-colors"
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

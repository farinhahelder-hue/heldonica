/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import Image from 'next/image'
import Link from 'next/link'
import Script from 'next/script'
import { Calendar, Coins, Leaf, Lightbulb, Check, Star } from 'lucide-react'
import CmsIcon from '@/components/CmsIcon'
import DestinationJsonLd from '@/components/seo/DestinationJsonLd'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import NewsletterForm from '@/components/NewsletterForm'
import GuideDownloadButton from '@/components/GuideDownloadButton'
import LeadMagnetBlock from '@/components/LeadMagnetBlock'
import TestedByHeldonica from '@/components/TestedByHeldonica'
import DestinationVerdict from '@/components/DestinationVerdict'
import QuickAnswersBlock from '@/components/QuickAnswersBlock'
import DestinationMapEmbed from '@/components/DestinationMapEmbed'
import SeasonalTable from '@/components/SeasonalTable'
import type { SeasonInfo } from '@/lib/pillar-data'
import AffiliateLink from '@/components/AffiliateLink'
import { AFFILIATE_DISCLOSURE, bookingSearchUrl, getYourGuideSearchUrl } from '@/lib/affiliates'
import type { PillarData } from '@/lib/pillar-types'
import { SITE_URL } from '@/lib/seo'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import EditableZone from '@/components/inline-edit/EditableZone'
import { SubDestinationInfo } from '@/lib/pillar-data'


export default function DestinationPillar({
  data, relatedArticles, initialZones, subDestinations = [], seasons = [],
}: {
  data: PillarData
  relatedArticles: { slug: string; title: string; excerpt: string; image_url?: string; featured_image?: string; read_time?: number }[]
  /** Zones CMS de la page 'destinations', préchargées par la page serveur. */
  initialZones?: Record<string, string>
  subDestinations?: SubDestinationInfo[]
  /** Saisons détaillées (cms_seasons) ; vide tant que la donnée n'est pas complète pour la destination. */
  seasons?: SeasonInfo[]
}) {
  return (
    <InlineEditProvider page="destinations" initialZones={initialZones}>
      <DestinationJsonLd
        name={data.name}
        description={data.tagline}
        url={`${SITE_URL}/destinations/${data.slug}`}
        country={data.country}
      />
      <Script id="pillar-faq" type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: data.faq.map((f) => ({
            '@type': 'Question', name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }),
      }} />
      <Script id="pillar-breadcrumb" type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
            { '@type': 'ListItem', position: 2, name: 'Destinations', item: `${SITE_URL}/destinations` },
            { '@type': 'ListItem', position: 3, name: data.name, item: `${SITE_URL}/destinations/${data.slug}` },
          ],
        }),
      }} />

      <Header />
      <main className="bg-[#F7F3EC] text-[#241D1A]">
        {/* Hero */}
        <section className="relative min-h-[68vh] flex items-end overflow-hidden bg-[#241D1A] border-b border-[#DED5C6]">
          <Image src={data.hero} alt={`${data.name} slow travel en couple`} fill className="object-cover opacity-55" priority sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1512]/85 via-[#1A1512]/35 to-transparent" />
          <div className="relative container py-16 md:py-24">
            <p className="text-xs uppercase tracking-[0.22em] text-[#E6DEC8]/85 mb-4 font-medium">{data.country || data.name}</p>
            <h1 className="text-4xl md:text-6xl font-serif font-normal text-[#FAF7F2] max-w-3xl mb-4 leading-tight">{data.name} en couple — notre guide slow travel</h1>
            {data.heroSubtitle && (
              <p className="text-[#E6DEC8] max-w-2xl text-lg leading-relaxed mb-4 font-medium">{data.heroSubtitle}</p>
            )}
            <p className="text-[#E6DEC8]/80 max-w-2xl text-lg leading-relaxed mb-6">{data.tagline}</p>
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="inline-flex items-center gap-1.5 rounded-sm bg-[#241D1A]/70 text-[#E6DEC8] text-xs uppercase tracking-[0.14em] font-medium px-3 py-1.5 border border-[#E6DEC8]/30">
                <Calendar className="w-3.5 h-3.5 text-eucalyptus" strokeWidth={1.25} aria-hidden="true" />
                {data.season}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-sm bg-[#241D1A]/70 text-[#E6DEC8] text-xs uppercase tracking-[0.14em] font-medium px-3 py-1.5 border border-[#E6DEC8]/30">
                <Coins className="w-3.5 h-3.5 text-eucalyptus" strokeWidth={1.25} aria-hidden="true" />
                ~{data.budget}€/sem/couple
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-sm bg-[#241D1A]/70 text-[#E6DEC8] text-xs uppercase tracking-[0.14em] font-medium px-3 py-1.5 border border-[#E6DEC8]/30">
                <Leaf className="w-3.5 h-3.5 text-eucalyptus" strokeWidth={1.25} aria-hidden="true" />
                Slow travel
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              <GuideDownloadButton slug={data.slug} title={data.name} />
              <Link href={`/travel-planning-form?destination=${data.slug}`}
                className="inline-flex items-center gap-2 rounded-sm bg-action px-6 py-3 text-xs uppercase tracking-[0.16em] font-medium text-[#FAF7F2] hover:bg-action-fonce transition-colors"
                onClick={() => { if (typeof window !== 'undefined' && (window as any).gtag) (window as any).gtag('event', 'cta_travel_planning_clique', { source: 'page_pilier', destination: data.slug }) }}>
                Demander mon voyage sur mesure →
              </Link>
            </div>
          </div>
        </section>

        {/* Info pratique GEO */}
        <section className="bg-[#EFE9DF] py-12 border-b border-[#DED5C6]">
          <div className="container max-w-5xl">
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-3">
              {data.infoTable.map((row) => (
                <div key={row.label} className="rounded-sm border border-[#DED5C6] bg-[#FAF7F2] p-4 text-center">
                  <p className="text-xs uppercase tracking-[0.16em] text-eucalyptus font-medium mb-1">{row.label}</p>
                  <p className="text-sm font-serif text-mahogany">{row.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Intro narrative */}
        <section className="bg-[#F7F3EC] py-16 md:py-20 border-b border-[#DED5C6]">
          <div className="container max-w-3xl">
            <h2 className="text-3xl font-serif font-normal text-mahogany mb-6">
              <EditableZone page="destinations" zone="intro_title" fallback="Pourquoi" className="inline" /> {data.name} <EditableZone page="destinations" zone="intro_title_suffix" fallback="pour un couple slow travel ?" className="inline" />
            </h2>
            {data.intro.map((p, i) => (
              <p key={i} className="text-charcoal/80 leading-relaxed mb-4 last:mb-0">{p}</p>
            ))}
          </div>
        </section>

        {/* Saisons détaillées — n'apparaît que si la donnée cms_seasons est complète */}
        {seasons.length > 0 && (
          <section className="bg-[#EFE9DF] py-16 border-b border-[#DED5C6]">
            <div className="container max-w-5xl">
              <h2 className="text-3xl font-serif font-normal text-mahogany mb-2">
                <EditableZone page="destinations" zone="seasons_title_prefix" fallback="Quand partir à" className="inline" /> {data.name} ?
              </h2>
              <p className="text-charcoal/65 text-sm mb-8 max-w-2xl">
                <EditableZone page="destinations" zone="seasons_intro" type="textarea" fallback="On a testé plusieurs saisons sur place. Voici comment on les vit, entre météo, affluence et budget." />
              </p>
              <SeasonalTable destination={data.name} seasons={seasons} />
            </div>
          </section>
        )}

        {/* Villes & pépites de la région */}
        {(() => {
          const subDests = subDestinations
          if (subDests.length === 0) return null
          return (
            <section className="bg-[#F7F3EC] py-16 border-b border-[#DED5C6]">
              <div className="container max-w-5xl">
                <h2 className="text-3xl font-serif font-normal text-mahogany mb-2 text-center">
                  <EditableZone page="destinations" zone="subdests_title" fallback="Explorer les pépites de la région" />
                </h2>
                <p className="text-charcoal/65 text-sm text-center mb-10">
                  <EditableZone page="destinations" zone="subdests_subtitle" type="textarea" fallback="Nos guides détaillés de terrain par ville et site d'intérêt." />
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {subDests.map((sub) => (
                    <Link
                      key={sub.slug}
                      href={`/destinations/${data.slug}/${sub.slug}`}
                      className="group p-6 rounded-sm bg-[#FAF7F2] border border-[#DED5C6] hover:border-mahogany/40 transition-colors flex flex-col h-full"
                    >
                      <div className="w-10 h-10 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center mb-4">
                        <CmsIcon name={sub.emoji} className="w-5 h-5 text-eucalyptus" />
                      </div>
                      <h3 className="font-serif font-normal text-lg text-mahogany group-hover:text-eucalyptus transition-colors mb-2">
                        {sub.title}
                      </h3>
                      <p className="text-xs text-charcoal/70 leading-relaxed line-clamp-2 flex-1">
                        {sub.teaser}
                      </p>
                      <span className="text-xs uppercase tracking-[0.16em] font-medium text-eucalyptus mt-4 inline-block">
                        <EditableZone page="destinations" zone="subdests_cta" fallback="Voir le guide →" />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )
        })()}

        {/* Quick Answers — GEO friendly */}
        <QuickAnswersBlock
          destinationName={data.name}
          budget={data.budget}
          bestSeason={data.season}
          flightTime={data.flight}
          language={data.language}
          currency={data.currency}
          visa={data.visa}
        />

        {/* TestedByHeldonica */}
        {data.testedByHeldonica && (
          <TestedByHeldonica
            when={data.testedByHeldonica.when}
            duration={data.testedByHeldonica.duration}
            withWho={data.testedByHeldonica.withWho}
            highlights={data.testedByHeldonica.highlights}
            keyInsight={data.testedByHeldonica.keyInsight}
            destinationName={data.name}
          />
        )}

        {/* Itinéraire 7 jours */}
        <section className="bg-[#F7F3EC] py-16 md:py-20 border-b border-[#DED5C6]">
          <div className="container max-w-5xl">
            <h2 className="text-3xl font-serif font-normal text-mahogany mb-2">
              <EditableZone page="destinations" zone="itinerary_title_prefix" fallback="Comment organiser 7 jours à" className="inline" /> {data.name} ?
            </h2>
            <p className="text-charcoal/65 text-sm mb-8 max-w-2xl">
              <EditableZone page="destinations" zone="itinerary_subtitle" type="textarea" fallback="Un rythme slow, testé sur le terrain. Adaptable selon tes envies." />
            </p>
            <div className="space-y-4">
              {data.itinerary.map((day) => (
                <div key={day.day} className="flex gap-5 bg-[#FAF7F2] rounded-sm p-5 border border-[#DED5C6]">
                  <div className="flex-shrink-0 w-12 h-12 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center">
                    <span className="text-mahogany font-serif text-base">J{day.day}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-serif font-normal text-mahogany mb-2">{day.title}</h3>
                    <ul className="space-y-1 mb-2">
                      {day.activities.map((a, i) => <li key={i} className="text-sm text-charcoal/75 flex items-start gap-2 before:content-['•'] before:text-eucalyptus before:font-bold"> {a}</li>)}
                    </ul>
                    {day.tip && (
                      <p className="text-xs text-eucalyptus italic flex items-center gap-1.5 mt-2">
                        <Lightbulb className="w-3.5 h-3.5 shrink-0" strokeWidth={1.25} aria-hidden="true" />
                        On a testé : {day.tip}
                      </p>
                    )}
                    {day.articleSlug && (
                      <Link href={`/blog/${day.articleSlug}`} className="text-xs font-medium text-mahogany hover:underline mt-2 inline-block">
                        → Lire le carnet associé
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Où dormir — hébergements + liens partenaires */}
        <section className="bg-[#EFE9DF] py-16 md:py-20 border-b border-[#DED5C6]">
          <div className="container max-w-5xl">
            <h2 className="text-3xl font-serif font-normal text-mahogany mb-2">
              Où dormir à {data.name} ?
            </h2>
            <p className="text-charcoal/75 text-base mb-8 max-w-2xl leading-relaxed">
              On dort rarement au même endroit toute la semaine : à {data.name}, changer
              de base une ou deux fois évite des heures de route inutiles.
            </p>

            {data.accommodations.length > 0 && (
              <div className="grid md:grid-cols-3 gap-5 mb-8">
                {data.accommodations.map((acc) => {
                  const query = acc.searchQuery || data.name
                  return (
                    <div key={`${acc.type}-${acc.label}`} className="rounded-sm border border-[#DED5C6] bg-[#FAF7F2] p-5 flex flex-col">
                      <h3 className="font-serif font-normal text-lg text-mahogany mb-2">{acc.label}</h3>
                      <p className="text-sm text-charcoal/75 leading-relaxed flex-1">{acc.description}</p>
                      <AffiliateLink
                        href={bookingSearchUrl(query)}
                        partner="booking"
                        destination={data.slug}
                        className="text-xs uppercase tracking-[0.14em] font-medium text-eucalyptus hover:underline mt-4 inline-block"
                      >
                        Voir les disponibilités à {query} →
                      </AffiliateLink>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <AffiliateLink
                href={bookingSearchUrl(data.name)}
                partner="booking"
                destination={data.slug}
                className="inline-flex items-center gap-2 rounded-sm bg-action px-6 py-3 text-xs uppercase tracking-[0.16em] font-medium text-[#FAF7F2] hover:bg-action-fonce transition-colors"
              >
                Chercher un hébergement à {data.name}
              </AffiliateLink>
              {(() => {
                const gygUrl = getYourGuideSearchUrl(data.name)
                if (!gygUrl) return null
                return (
                  <AffiliateLink
                    href={gygUrl}
                    partner="getyourguide"
                    destination={data.slug}
                    className="inline-flex items-center gap-2 rounded-sm border border-mahogany/40 px-6 py-3 text-xs uppercase tracking-[0.16em] font-medium text-mahogany hover:bg-[#FAF7F2] transition-colors"
                  >
                    Réserver une activité à {data.name}
                  </AffiliateLink>
                )
              })()}
            </div>

            <p className="text-xs text-charcoal/60 mt-4 max-w-2xl">
              {AFFILIATE_DISCLOSURE}{' '}
              <Link href="/politique-affiliation" className="underline hover:text-eucalyptus">
                Notre politique d&apos;affiliation
              </Link>
            </p>
          </div>
        </section>

        {/* Carte interactive */}
        <section className="bg-[#F7F3EC] py-16 md:py-20 border-b border-[#DED5C6]">
          <div className="container max-w-5xl">
            <h2 className="text-3xl font-serif font-normal text-mahogany mb-2">
              <EditableZone page="destinations" zone="map_title_prefix" fallback="Où se situe" className="inline" /> {data.name} ?
            </h2>
            <p className="text-charcoal/75 text-base mb-8 max-w-2xl leading-relaxed">
              Repère les étapes de l&apos;itinéraire avant de partir : les distances
              paraissent courtes sur le papier, beaucoup moins une fois sur les routes.
            </p>
            <DestinationMapEmbed
              query={data.country && data.country !== data.name ? `${data.name}, ${data.country}` : data.name}
              label={data.name}
              destination={data.slug}
            />
          </div>
        </section>

        {/* Budget détaillé */}
        <section className="bg-[#EFE9DF] py-16 md:py-20 border-b border-[#DED5C6]">
          <div className="container max-w-3xl">
            <h2 className="text-3xl font-serif font-normal text-mahogany mb-4">
              <EditableZone page="destinations" zone="budget_title_prefix" fallback="Quel budget prévoir pour" className="inline" /> {data.name} ?
            </h2>
            <p className="text-charcoal/75 text-base mb-6 leading-relaxed">
              <strong><EditableZone page="destinations" zone="budget_quick_answer" fallback="Réponse rapide :" className="inline" /></strong> <EditableZone page="destinations" zone="budget_estimate_1" fallback="comptez environ" className="inline" /> {data.budget}€/semaine <EditableZone page="destinations" zone="budget_estimate_2" fallback="pour deux en slow travel." className="inline" /> 
              <br/><EditableZone page="destinations" zone="budget_estimate_3" fallback="Ce budget inclut vol, hébergement confortable, repas et transports locaux." className="inline block mt-1" />
            </p>
            <div className="space-y-4 mb-6">
              {data.budgetBreakdown.map((b) => (
                <div key={b.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-charcoal">{b.label}</span>
                    <span className="font-medium text-eucalyptus">~{b.amount}€</span>
                  </div>
                  <div className="h-1.5 rounded-sm bg-[#DED5C6] overflow-hidden">
                    <div className="h-full bg-mahogany transition-all" style={{ width: `${b.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center p-4 rounded-sm bg-[#FAF7F2] border border-[#DED5C6]">
              <span className="font-serif text-mahogany">TOTAL estimé / semaine / couple</span>
              <span className="font-serif text-lg text-eucalyptus">~{data.budget}€</span>
            </div>

            {/* Points pratiques clés */}
            <div className="mt-8 p-5 rounded-sm bg-[#FAF7F2] border border-[#DED5C6]">
              <h3 className="font-serif font-normal text-lg text-mahogany mb-4">
                <EditableZone page="destinations" zone="budget_reality_title" fallback="Ce qu'on a vraiment payé sur place" />
              </h3>
              <ul className="space-y-2 text-sm text-charcoal/80">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-eucalyptus shrink-0 mt-0.5" strokeWidth={1.5} aria-hidden="true" />
                  <span>Vols : variable selon saison ({data.season} = moins cher)</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-eucalyptus shrink-0 mt-0.5" strokeWidth={1.5} aria-hidden="true" />
                  <span>Hébergement : 60-120€/nuit selon confort</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-eucalyptus shrink-0 mt-0.5" strokeWidth={1.5} aria-hidden="true" />
                  <span>Restaurant : 20-40€/repas pour deux</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-eucalyptus shrink-0 mt-0.5" strokeWidth={1.5} aria-hidden="true" />
                  <span>Activités : souvent moins cher que prévu</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Lead Magnet Block */}
        <LeadMagnetBlock destinationSlug={data.slug} destinationName={data.name} />

        {/* Articles liés */}
        {relatedArticles.length > 0 && (
          <section className="bg-[#F7F3EC] py-16 border-b border-[#DED5C6]">
            <div className="container max-w-5xl">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-eucalyptus mb-3">Nos carnets</p>
              <h2 className="text-2xl font-serif font-normal text-mahogany mb-6">Articles sur {data.name}</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {relatedArticles.map((a) => (
                  <Link key={a.slug} href={`/blog/${a.slug}`} className="group block rounded-sm border border-[#DED5C6] bg-[#FAF7F2] p-5 hover:border-mahogany/40 transition-colors">
                    <h3 className="font-serif font-normal text-lg text-mahogany group-hover:text-eucalyptus transition-colors">{a.title}</h3>
                    <p className="text-sm text-charcoal/70 mt-2 line-clamp-2">{a.excerpt}</p>
                    {a.read_time && <p className="text-xs text-charcoal/55 mt-2">{a.read_time} min de lecture</p>}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* DestinationVerdict */}
        {data.verdict && (
          <DestinationVerdict
            score={data.verdict.score}
            forWho={data.verdict.forWho}
            strengths={data.verdict.strengths}
            considerations={data.verdict.considerations}
            finalWord={data.verdict.finalWord}
            destinationName={data.name}
          />
        )}

        {/* FAQ */}
        <section className="bg-[#EFE9DF] py-16 border-b border-[#DED5C6]">
          <div className="container max-w-3xl">
            <h2 className="text-3xl font-serif font-normal text-mahogany mb-8 text-center">
              <EditableZone page="destinations" zone="faq_title" fallback="Questions fréquentes" />
            </h2>

            {/* Tableau saison / affluence */}
            <div className="mb-8 overflow-x-auto rounded-sm border border-[#DED5C6] bg-[#FAF7F2] p-5">
              <h3 className="text-xs uppercase tracking-[0.18em] font-medium text-charcoal/65 mb-4">
                <EditableZone page="destinations" zone="season_table_title" fallback="Meilleure période pour" className="inline" /> {data.name}
              </h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#DED5C6]">
                    <th className="text-left py-3 pr-4 font-medium text-mahogany">Période</th>
                    <th className="text-center py-3 px-2 font-medium text-mahogany">Temps</th>
                    <th className="text-center py-3 px-2 font-medium text-mahogany">Affluence</th>
                    <th className="text-center py-3 pl-4 font-medium text-mahogany">Notre avis</th>
                  </tr>
                </thead>
                <tbody className="text-charcoal/75">
                  <tr className="border-b border-[#DED5C6] bg-[#EFE9DF]/60">
                    <td className="py-3 pr-4 font-medium text-eucalyptus">{data.season}</td>
                    <td className="py-3 px-2 text-center text-mahogany tracking-widest">★★★★★</td>
                    <td className="py-3 px-2 text-center">Modérée</td>
                    <td className="py-3 pl-4 text-eucalyptus font-medium">Idéal</td>
                  </tr>
                  <tr className="border-b border-[#DED5C6]">
                    <td className="py-3 pr-4 font-medium">Juillet–août</td>
                    <td className="py-3 px-2 text-center text-mahogany/75 tracking-widest">★★★★</td>
                    <td className="py-3 px-2 text-center text-mahogany">Forte</td>
                    <td className="py-3 pl-4">À éviter pour slow travel</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-medium">Nov–mars</td>
                    <td className="py-3 px-2 text-center text-mahogany/60 tracking-widest">★★</td>
                    <td className="py-3 px-2 text-center">Faible</td>
                    <td className="py-3 pl-4">Court séjour possible</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="space-y-3">
              {data.faq.map((f) => (
                <details key={f.q} className="bg-[#FAF7F2] rounded-sm border border-[#DED5C6]">
                  <summary className="font-medium text-mahogany p-5 cursor-pointer list-none marker:content-none flex items-center justify-between">
                    {f.q}
                    <span className="text-eucalyptus text-xl leading-none ml-4">+</span>
                  </summary>
                  <p className="px-5 pb-5 text-sm text-charcoal/75 leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Travel Planning */}
        <section className="bg-[#2A1D18] text-[#F7F3EC] py-20">
          <div className="container text-center max-w-3xl">
            <p className="text-xs uppercase tracking-[0.2em] text-[#E6DEC8]/80 mb-3">
              <EditableZone page="destinations" zone="cta_surmesure_subtitle" fallback="Voyage sur mesure" />
            </p>
            <h2 className="text-3xl md:text-4xl font-serif font-normal mb-4">
              <EditableZone page="destinations" zone="cta_surmesure_title" fallback="Prêt à découvrir" className="inline" /> {data.name} <EditableZone page="destinations" zone="cta_surmesure_title_suffix" fallback="à ton rythme ?" className="inline" />
            </h2>
            <p className="text-[#E6DEC8]/75 mb-8">
              <EditableZone page="destinations" type="textarea" zone="cta_surmesure_text" fallback="On peut concevoir ton séjour sur mesure, avec nos adresses testées et notre rythme slow." />
            </p>
            <Link href={`/travel-planning-form?destination=${data.slug}`}
              className="inline-flex px-7 py-3 rounded-sm bg-action text-[#FAF7F2] text-xs uppercase tracking-[0.16em] font-medium hover:bg-action-fonce transition-colors"
              onClick={() => { if (typeof window !== 'undefined' && (window as any).gtag) (window as any).gtag('event', 'cta_travel_planning_clique', { source: 'page_pilier', destination: data.slug }) }}>
              Demander mon voyage sur mesure →
            </Link>
          </div>
        </section>

        {/* Newsletter */}
        <section className="bg-[#F7F3EC] py-16">
          <div className="container max-w-md text-center">
            <p className="text-sm text-charcoal/70 mb-4">
              {data.name} et nos autres guides slow — reçois les prochains en avant-première.
            </p>
            <NewsletterForm variant="article" />
          </div>
        </section>
      </main>
      <Footer />
    </InlineEditProvider>
  )
}

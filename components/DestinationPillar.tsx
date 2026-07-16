'use client'

import Image from 'next/image'
import Link from 'next/link'
import Script from 'next/script'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import NewsletterForm from '@/components/NewsletterForm'
import GuideDownloadButton from '@/components/GuideDownloadButton'
import LeadMagnetBlock from '@/components/LeadMagnetBlock'
import TestedByHeldonica from '@/components/TestedByHeldonica'
import DestinationVerdict from '@/components/DestinationVerdict'
import QuickAnswersBlock from '@/components/QuickAnswersBlock'
import type { PillarData } from '@/lib/pillar-types'
import { SITE_URL } from '@/lib/seo'
import { SUB_DESTINATIONS } from '@/lib/sub-destinations'


export default function DestinationPillar({
  data, relatedArticles,
}: {
  data: PillarData
  relatedArticles: { slug: string; title: string; excerpt: string; image_url?: string; read_time?: number }[]
}) {
  return (
    <>
      <Script id="pillar-tourist-destination" type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'TouristDestination',
          name: data.name,
          description: data.tagline,
          url: `${SITE_URL}/destinations/${data.slug}`,
          touristType: 'Couple slow travel',
          hasMap: `https://maps.google.com/?q=${encodeURIComponent(data.name)}`,
        }),
      }} />
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
      <main>
        {/* Hero */}
        <section className="relative min-h-[70vh] flex items-end overflow-hidden bg-stone-900">
          <Image src={data.hero} alt={`${data.name} slow travel en couple`} fill className="object-cover opacity-60" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="relative container py-16 md:py-24">
            <p className="text-xs uppercase tracking-[0.2em] text-teal mb-4 font-semibold">{data.flag} {data.name}</p>
            <h1 className="text-4xl md:text-6xl font-serif text-white max-w-3xl mb-4 leading-tight">{data.name} en couple — notre guide slow travel</h1>
            {data.heroSubtitle && (
              <p className="text-white/90 max-w-2xl text-lg leading-relaxed mb-4 font-medium">{data.heroSubtitle}</p>
            )}
            <p className="text-white/80 max-w-2xl text-lg leading-relaxed mb-6">{data.tagline}</p>
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="rounded-full bg-eucalyptus/20 text-eucalyptus text-xs font-semibold px-3 py-1.5 border border-eucalyptus/30">📅 {data.season}</span>
              <span className="rounded-full bg-teal/20 text-teal text-xs font-semibold px-3 py-1.5 border border-teal/30">💰 ~{data.budget}€/sem/couple</span>
              <span className="rounded-full bg-teal/20 text-teal text-xs font-semibold px-3 py-1.5 border border-teal/30">🌿 Slow travel</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <GuideDownloadButton slug={data.slug} title={data.name} />
              <Link href={`/travel-planning-form?destination=${data.slug}`}
                className="inline-flex items-center gap-2 rounded-full bg-eucalyptus px-6 py-3 text-sm font-semibold text-white hover:bg-eucalyptus/90 transition-all shadow-md"
                onClick={() => { if (typeof window !== 'undefined' && (window as any).gtag) (window as any).gtag('event', 'cta_travel_planning_clique', { source: 'page_pilier', destination: data.slug }) }}>
                Demander mon voyage sur mesure →
              </Link>
            </div>
          </div>
        </section>

        {/* Info pratique GEO */}
        <section className="bg-white py-12">
          <div className="container max-w-5xl">
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-3">
              {data.infoTable.map((row) => (
                <div key={row.label} className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-center">
                  <p className="text-[10px] uppercase tracking-[0.14em] text-eucalyptus font-semibold mb-1">{row.label}</p>
                  <p className="text-sm font-semibold text-charcoal">{row.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Intro narrative */}
        <section className="bg-cloud-dancer py-16 md:py-20">
          <div className="container max-w-3xl">
            <h2 className="text-3xl font-serif text-mahogany mb-6">Pourquoi {data.name} pour un couple slow travel ?</h2>
            {data.intro.map((p, i) => (
              <p key={i} className="text-charcoal/80 leading-relaxed mb-4 last:mb-0">{p}</p>
            ))}
          </div>
        </section>

        {/* Villes & pépites de la région */}
        {(() => {
          const subDests = SUB_DESTINATIONS[data.slug] || []
          if (subDests.length === 0) return null
          return (
            <section className="bg-white py-16 border-b border-stone-200/60">
              <div className="container max-w-5xl">
                <h2 className="text-3xl font-serif text-mahogany mb-2 text-center">
                  Explorer les pépites de la région
                </h2>
                <p className="text-charcoal/60 text-sm text-center mb-10">
                  Nos guides détaillés de terrain par ville et site d&apos;intérêt.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {subDests.map((sub) => (
                    <Link
                      key={sub.slug}
                      href={`/destinations/${data.slug}/${sub.slug}`}
                      className="group p-5 rounded-2xl bg-stone-50 border border-stone-100 hover:border-eucalyptus/30 hover:bg-eucalyptus/5 transition-all duration-300 flex flex-col h-full"
                    >
                      <span className="text-3xl mb-3 block">{sub.emoji}</span>
                      <h3 className="font-serif font-bold text-stone-900 group-hover:text-eucalyptus transition-colors mb-2">
                        {sub.title}
                      </h3>
                      <p className="text-xs text-charcoal/60 leading-relaxed line-clamp-2 flex-1">
                        {sub.teaser}
                      </p>
                      <span className="text-xs font-semibold text-eucalyptus mt-3 inline-block group-hover:translate-x-1 transition-transform">
                        Voir le guide →
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
        <section className="bg-white py-16 md:py-20">
          <div className="container max-w-5xl">
            <h2 className="text-3xl font-serif text-mahogany mb-2">Comment organiser 7 jours à {data.name} ?</h2>
            <p className="text-charcoal/60 text-sm mb-8 max-w-2xl">Un rythme slow, testé sur le terrain. Adaptable selon tes envies.</p>
            <div className="space-y-4">
              {data.itinerary.map((day) => (
                <div key={day.day} className="flex gap-5 bg-stone-50 rounded-xl p-5 border border-stone-100">
                  <div className="flex-shrink-0 w-14 h-14 rounded-full bg-teal/10 flex items-center justify-center">
                    <span className="text-teal font-bold text-lg">J{day.day}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-mahogany mb-2">{day.title}</h3>
                    <ul className="space-y-1 mb-2">
                      {day.activities.map((a, i) => <li key={i} className="text-sm text-charcoal/70 flex items-start gap-2 before:content-['•'] before:text-teal before:font-bold"> {a}</li>)}
                    </ul>
                    {day.tip && <p className="text-xs text-eucalyptus italic">💡 On a testé : {day.tip}</p>}
                    {day.articleSlug && (
                      <Link href={`/blog/${day.articleSlug}`} className="text-xs font-semibold text-teal hover:underline mt-1 inline-block">
                        → Lire le carnet associé
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Budget détaillé */}
        <section className="bg-cloud-dancer py-16 md:py-20">
          <div className="container max-w-3xl">
            <h2 className="text-3xl font-serif text-mahogany mb-4">Quel budget prévoir pour {data.name} ?</h2>
            <p className="text-charcoal/70 text-base mb-6 leading-relaxed">
              <strong>Réponse rapide :</strong> comptez environ {data.budget}€/semaine pour deux en slow travel. 
              Ce budget inclut vol, hébergement confortable, repas et transports locaux.
            </p>
            <div className="space-y-4 mb-6">
              {data.budgetBreakdown.map((b) => (
                <div key={b.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-charcoal">{b.label}</span>
                    <span className="font-semibold text-eucalyptus">~{b.amount}€</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-stone-200 overflow-hidden">
                    <div className="h-full rounded-full bg-eucalyptus transition-all" style={{ width: `${b.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center p-4 rounded-xl bg-eucalyptus/10 border border-eucalyptus/20">
              <span className="font-bold text-mahogany">TOTAL estimé / semaine / couple</span>
              <span className="font-bold text-lg text-eucalyptus">~{data.budget}€</span>
            </div>

            {/* Points pratiques clés */}
            <div className="mt-8 p-5 rounded-xl bg-white border border-stone-200">
              <h3 className="font-semibold text-mahogany mb-4">Ce qu'on a vraiment payé sur place</h3>
              <ul className="space-y-2 text-sm text-charcoal/80">
                <li className="flex items-start gap-2 before:content-['✓'] before:text-eucalyptus before:font-bold">
                  Vols : variable selon saison ({data.season} = moins cher)
                </li>
                <li className="flex items-start gap-2 before:content-['✓'] before:text-eucalyptus before:font-bold">
                  Hébergement : 60-120€/nuit selon confort
                </li>
                <li className="flex items-start gap-2 before:content-['✓'] before:text-eucalyptus before:font-bold">
                  Restaurant : 20-40€/repas pour deux
                </li>
                <li className="flex items-start gap-2 before:content-['✓'] before:text-eucalyptus before:font-bold">
                  Activités : souvent moins cher que prévu
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Lead Magnet Block */}
        <LeadMagnetBlock destinationSlug={data.slug} destinationName={data.name} />

        {/* Articles liés */}
        {relatedArticles.length > 0 && (
          <section className="bg-white py-16">
            <div className="container max-w-5xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-eucalyptus mb-3">Nos carnets</p>
              <h2 className="text-2xl font-serif text-mahogany mb-6">Articles sur {data.name}</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {relatedArticles.map((a) => (
                  <Link key={a.slug} href={`/blog/${a.slug}`} className="group block rounded-xl border border-stone-200 bg-stone-50 p-5 hover:bg-white hover:shadow-sm transition-all">
                    <h3 className="font-semibold text-mahogany group-hover:text-eucalyptus transition-colors">{a.title}</h3>
                    <p className="text-sm text-charcoal/60 mt-2 line-clamp-2">{a.excerpt}</p>
                    {a.read_time && <p className="text-xs text-stone-500 mt-2">{a.read_time} min de lecture</p>}
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
        <section className="bg-cloud-dancer py-16">
          <div className="container max-w-3xl">
            <h2 className="text-3xl font-serif text-mahogany mb-8 text-center">Questions fréquentes</h2>

            {/* Tableau saison / affluence */}
            <div className="mb-8 overflow-x-auto">
              <h3 className="text-sm font-semibold text-charcoal/60 mb-4">Meilleure période pour {data.name}</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200">
                    <th className="text-left py-3 pr-4 font-semibold text-charcoal">Période</th>
                    <th className="text-center py-3 px-2 font-semibold text-charcoal">Temps</th>
                    <th className="text-center py-3 px-2 font-semibold text-charcoal">Affluence</th>
                    <th className="text-center py-3 pl-4 font-semibold text-charcoal">Notre avis</th>
                  </tr>
                </thead>
                <tbody className="text-charcoal/70">
                  <tr className="border-b border-stone-100 bg-eucalyptus/5">
                    <td className="py-3 pr-4 font-medium text-eucalyptus">{data.season}</td>
                    <td className="py-3 px-2 text-center">⭐⭐⭐⭐⭐</td>
                    <td className="py-3 px-2 text-center">Modérée</td>
                    <td className="py-3 pl-4 text-eucalyptus font-medium">✓ Idéal</td>
                  </tr>
                  <tr className="border-b border-stone-100">
                    <td className="py-3 pr-4 font-medium">Juillet–août</td>
                    <td className="py-3 px-2 text-center">⭐⭐⭐⭐</td>
                    <td className="py-3 px-2 text-center text-red-400">Forte</td>
                    <td className="py-3 pl-4">À éviter pour slow travel</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-medium">Nov–mars</td>
                    <td className="py-3 px-2 text-center">⭐⭐</td>
                    <td className="py-3 px-2 text-center">Faible</td>
                    <td className="py-3 pl-4">Court séjour possible</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="space-y-3">
              {data.faq.map((f) => (
                <details key={f.q} className="bg-white rounded-xl border border-stone-200 [&[open]]:shadow-sm">
                  <summary className="font-semibold text-mahogany p-5 cursor-pointer list-none marker:content-none flex items-center justify-between">
                    {f.q}
                    <span className="text-eucalyptus text-xl leading-none ml-4">+</span>
                  </summary>
                  <p className="px-5 pb-5 text-sm text-charcoal/70 leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Travel Planning */}
        <section className="bg-mahogany text-white py-20">
          <div className="container text-center max-w-3xl">
            <p className="text-sm uppercase tracking-[0.16em] text-teal mb-3">Voyage sur mesure</p>
            <h2 className="text-3xl md:text-4xl font-serif mb-4">Prêt à découvrir {data.name} à ton rythme ?</h2>
            <p className="text-white/80 mb-8">On peut concevoir ton séjour sur mesure, avec nos adresses testées et notre rythme slow.</p>
            <Link href={`/travel-planning-form?destination=${data.slug}`}
              className="inline-flex px-7 py-3 rounded-lg bg-teal text-charcoal font-semibold hover:bg-teal/90 transition-colors"
              onClick={() => { if (typeof window !== 'undefined' && (window as any).gtag) (window as any).gtag('event', 'cta_travel_planning_clique', { source: 'page_pilier', destination: data.slug }) }}>
              Demander mon voyage sur mesure →
            </Link>
          </div>
        </section>

        {/* Newsletter */}
        <section className="bg-white py-16">
          <div className="container max-w-md text-center">
            <p className="text-sm text-charcoal/60 mb-4">
              {data.name} et nos autres guides slow — reçois les prochains en avant-première.
            </p>
            <NewsletterForm variant="article" />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

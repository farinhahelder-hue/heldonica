'use client'

import Image from 'next/image'
import Link from 'next/link'
import Script from 'next/script'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import NewsletterForm from '@/components/NewsletterForm'
import GuideDownloadButton from '@/components/GuideDownloadButton'
import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo'

export interface PillarData {
  slug: string
  name: string
  country: string
  flag: string
  hero: string
  tagline: string
  budget: number
  season: string
  flight: string
  visa: string
  currency: string
  language: string
  seoTitle: string
  seoDesc: string
  intro: string[]
  infoTable: { label: string; value: string }[]
  itinerary: { day: number; title: string; activities: string[]; tip?: string; articleSlug?: string }[]
  budgetBreakdown: { label: string; pct: number; amount: number }[]
  faq: { q: string; a: string }[]
}

export function buildPillarMetadata(d: PillarData): Metadata {
  return {
    title: d.seoTitle,
    description: d.seoDesc,
    alternates: { canonical: `${SITE_URL}/destinations/${d.slug}` },
    openGraph: {
      title: d.seoTitle,
      description: d.seoDesc,
      url: `${SITE_URL}/destinations/${d.slug}`,
      images: [{ url: d.hero, width: 1200, height: 630, alt: `${d.name} slow travel — Heldonica` }],
      locale: 'fr_FR', type: 'website',
    },
  }
}

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
            <p className="text-white/80 max-w-2xl text-lg leading-relaxed mb-6">{data.tagline}</p>
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="rounded-full bg-eucalyptus/20 text-eucalyptus text-xs font-semibold px-3 py-1.5 border border-eucalyptus/30">📅 {data.season}</span>
              <span className="rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold px-3 py-1.5 border border-amber-400/30">💰 ~{data.budget}€/sem/couple</span>
              <span className="rounded-full bg-teal/20 text-teal text-xs font-semibold px-3 py-1.5 border border-teal/30">🌿 Slow travel</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <GuideDownloadButton slug={data.slug} title={data.name} />
              <Link href={`/travel-planning-form?destination=${data.slug}`}
                className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-white hover:bg-amber-400 transition-all"
                onClick={() => { if (typeof window !== 'undefined' && (window as any).gtag) (window as any).gtag('event', 'cta_travel_planning_click', { source: 'page_pilier', destination: data.slug }) }}>
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

        {/* Itinéraire 7 jours */}
        <section className="bg-white py-16 md:py-20">
          <div className="container max-w-5xl">
            <h2 className="text-3xl font-serif text-mahogany mb-2">Notre itinéraire {data.name} — 7 jours</h2>
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
            <h2 className="text-3xl font-serif text-mahogany mb-4">Budget {data.name} pour un couple</h2>
            <p className="text-charcoal/60 text-sm mb-6">Estimation basée sur notre séjour — hors saison, confort slow.</p>
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
          </div>
        </section>

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
                    {a.read_time && <p className="text-xs text-stone-400 mt-2">{a.read_time} min de lecture</p>}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQ */}
        <section className="bg-cloud-dancer py-16">
          <div className="container max-w-3xl">
            <h2 className="text-3xl font-serif text-mahogany mb-8 text-center">Questions fréquentes</h2>
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
            <h2 className="text-3xl md:text-4xl font-serif mb-4">On a exploré {data.name} en profondeur.</h2>
            <p className="text-white/80 mb-8">On peut concevoir ton séjour sur mesure, avec nos adresses testées et notre rythme slow.</p>
            <Link href={`/travel-planning-form?destination=${data.slug}`}
              className="inline-flex px-7 py-3 rounded-lg bg-teal text-charcoal font-semibold hover:bg-teal/90 transition-colors"
              onClick={() => { if (typeof window !== 'undefined' && (window as any).gtag) (window as any).gtag('event', 'cta_travel_planning_click', { source: 'page_pilier', destination: data.slug }) }}>
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

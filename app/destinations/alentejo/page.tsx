import Image from 'next/image'
import type { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SlowTravelQuiz from '@/components/SlowTravelQuiz'

const SITE_URL = 'https://heldonica.fr'

const schemaTouristDestination = {
  '@context': 'https://schema.org',
  '@type': 'TouristDestination',
  name: 'Alentejo',
  description: "Région du sud du Portugal entre le Tage et l’Algarve. Plains, vignobles, liège et villages de pierre. Destination slow travel idéale pour lovers de terroir et de silence.",
  url: `${SITE_URL}/destinations/alentejo`,
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'PT',
    addressRegion: 'Alentejo',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 38.5667,
    longitude: -7.9,
  },
  touristType: ['Gourmet', 'Nature lover', 'Slow traveler'],
  bestSeasonToVisit: ['March', 'April', 'May', 'September', 'October', 'November'],
}

const alentejoLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Quand partir dans l\'Alentejo pour le slow travel ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Les meilleures périodes sont mars-mai et septembre-novembre. Températures agréables (20-28°C), vignobles en fleur ou vendanges, hors des circuits habituels.',
      },
    },
    {
      '@type': 'Question',
      name: 'Combien de jours pour découvrir l\'Alentejo ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Comptez minimum 4-5 jours pour faire Évoramonsaraz. 7-10 jours permettent d\'explorer la Rota das Aldeias Históricas et les vignobles du sud.',
      },
    },
    {
      '@type': 'Question',
      name: 'Comment se déplacer dans l\'Alentejo ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Location de voiture indispensable. Les distances sont grandes et les transports en commun rares. Les routes sont bonnes, le trafic faible — idéal pour un road trip lent.',
      },
    },
    {
      '@type': 'Question',
      name: 'Budget moyen par jour dans l\'Alentejo ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Comptez 70-120€/jour en milieu de gamme (hébergement + repas + activités). L\'Alentejo est moins cher que le littoral Algarve.',
      },
    },
  ],
}

export const metadata: Metadata = {
  title: 'Alentejo : Guide Slow Travel Complet | Heldonica',
  description:
    "Guide pilier Alentejo : quand partir, où dormir, vignobles, villages de pierre et itinéraire slow. 2 séjours vécus par le duo Heldonica.",
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/alentejo',
  },
  openGraph: {
    title: 'Alentejo : Guide Slow Travel Complet | Heldonica',
    description: "L’Alentejo en slow travel : plains, vignobles et villages de pierre. Notre guide terrain.",
    images: [
      {
        url: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'Alentejo — vignobles et plains dorées',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
}

export default function AlentejoPage() {
  return (
    <>
      <Script
        id="tourist-destination-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaTouristDestination) }}
      />
      <Script
        id="faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(alentejoLd) }}
      />
      <Header />
      <Script id="ga4-destination-view" strategy="lazyOnload">{`
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'destination_view', { destination: 'alentejo' });
        }
      `}</Script>
      <main>
        {/* ── HERO ── */}
        <section className="relative min-h-[66vh] flex items-end overflow-hidden bg-stone-900">
          <Image
            src="https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1600&q=85"
            alt="Alentejo — vignobles dorés sous le soleil portugais"
            fill
            className="object-cover opacity-65"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
          
          {/* Badge testage */}
          <div className="absolute left-4 top-4 md:left-8 md:top-8">
            <span className="inline-block rounded-full bg-amber-500/90 px-4 py-2 text-xs font-bold text-white shadow-lg backdrop-blur-sm">
              <span aria-hidden="true">✦ </span>Testé par Heldonica · 2 séjours · 2023-2024
            </span>
          </div>

          <div className="relative z-10 px-6 md:px-16 pb-12 md:pb-20 max-w-4xl">
            <p className="text-amber-400 text-xs font-bold tracking-[0.2em] uppercase mb-3">
              Destination Portugal
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light text-white mb-4 leading-tight">
              Alentejo : le slow travel absolu<br />
              <span className="text-amber-300 italic">au cœur du Portugal</span>
            </h1>
            <p className="text-stone-300 text-base md:text-lg leading-relaxed max-w-2xl">
              Plaines infinies, vignobles à perte de vue, villages de pierre figés dans le temps.
              L’Alentejo, c’est le Portugal qu’on cherche quand on veut échapper aux foules.
            </p>
          </div>
        </section>

        {/* ── INTRODUCTION E-E-A-T ── */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-4">Notre retour terrain</p>
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-8">
              Pourquoi l’Alentejo nous a conquis
            </h2>
            <div className="prose prose-lg max-w-none prose-stone">
              <p className="text-stone-700 leading-relaxed text-lg">
                <strong className="text-stone-900">La première fois</strong>, on a traversé l’Alentejo en vitesse, direction l’Algarve. Grosse erreur. On a traversé des siècles d’histoire, des plains qui donnaient le vertige, des villages où le temps semblait s’être arrêté — et on n’y a même pas posé pied.
              </p>
              <p className="text-stone-700 leading-relaxed">
                <strong className="text-stone-900">La deuxième fois</strong>, on a pris 5 jours. Juste l’Alentejo central. Évoramonsaraz, les vignobles de Vidigueira, les routes sans autre voiture à l’horizon. C’est là qu’on a compris : l’Alentejo, c’est le Portugal <em>vraiment</em>.
              </p>
              <p className="text-stone-700 leading-relaxed">
                Ce qu’on y a trouvé : du bon vin à 3€, des restaurants de village où le patron cooking tout lui-même, des champs de liège à perte de vue, et ce silence qu’on cherche tous sans jamais oser le dire.
              </p>
            </div>
          </div>
        </section>

        {/* ── INFOS PRATIQUES ── */}
        <section className="py-12 bg-stone-50 border-y border-stone-200">
          <div className="max-w-5xl mx-auto px-6">
            <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-6 text-center">Bon à savoir</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Meilleure période</p>
                <p className="text-lg font-serif text-stone-900">Mars–Juin<br /><span className="text-amber-700">Sept–Nov</span></p>
              </div>
              <div className="text-center">
                <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Durée idéale</p>
                <p className="text-lg font-serif text-stone-900">5–7 jours</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Budget/jour</p>
                <p className="text-lg font-serif text-stone-900">80–130€</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Langue</p>
                <p className="text-lg font-serif text-stone-900">Portugais<br /><span className="text-amber-700">+ français</span></p>
              </div>
            </div>
          </div>
        </section>

        {/* ── NOS PÉPITES ── */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-5xl mx-auto px-6">
            <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-4 text-center">Ce qu’on a vécu</p>
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-12 text-center">
              Nos pépites dénichées
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Évora */}
              <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <span className="text-2xl">🏛️</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-serif text-stone-900 mb-1">Évora</h3>
                    <p className="text-sm text-amber-700 font-medium">La ville UNESCO à taille humaine</p>
                  </div>
                </div>
                <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  Capitale de l’Alentejo, classed UNESCO. On a aimé déambuler dans les ruelles avant 9h, visiter la chapelle des Ossements à la première heure (quasi déserte), et manger une açorda alentejana dans une tasca de la place principale.
                </p>
                <p className="text-xs text-stone-400 italic">
                  ⭐ Verdict Heldonica : À faire le matin, avant les bus de tourists.
                </p>
              </div>

              {/* Monsaraz */}
              <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <span className="text-2xl">🏰</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-serif text-stone-900 mb-1">Monsaraz</h3>
                    <p className="text-sm text-amber-700 font-medium">Le village perché sur la plaine</p>
                  </div>
                </div>
                <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  Un des plus beaux villages d Portugal. Ruelles étroites, château en ruine avec vue sur l’Estrémadure espagnole, et ce silence le soir quand les derniers tourists repartent.
                </p>
                <p className="text-xs text-stone-400 italic">
                  ⭐ Verdict Heldonica : Restez y dormir, pas qu’une journée.
                </p>
              </div>

              {/* Vignobles */}
              <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <span className="text-2xl">🍷</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-serif text-stone-900 mb-1">Rota dos Vinhos</h3>
                    <p className="text-sm text-amber-700 font-medium">La route des vignobles</p>
                  </div>
                </div>
                <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  On a fait la rota entre Vidigueira et Redondo. Dégustations dans des quintas familiales, vin à 4€ la bouteille sur place, et des hôtes qui te racontent trois générations de tradition viticole.
                </p>
                <p className="text-xs text-stone-400 italic">
                  ⭐ Verdict Heldonica : Prévoyez un driver ou un copilote.
                </p>
              </div>

              {/* Praias Fluviais */}
              <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <span className="text-2xl">🏊</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-serif text-stone-900 mb-1">Praia Fluvial de頼</h3>
                    <p className="text-sm text-amber-700 font-medium">Les plages rivières secrètes</p>
                  </div>
                </div>
                <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  L’Alentejo inland a des beaches fluviaux incredibles. On a trouvé notre spot préféré près de Granja — une plage sur la rivière avec des eaux claires, des gens du coin, et aucun tourist.
                </p>
                <p className="text-xs text-stone-400 italic">
                  ⭐ Verdict Heldonica : Demandez aux locaux, ils indiquent les meilleurs spots.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── OÙ DORMIR ── */}
        <section className="py-16 md:py-24 bg-stone-50">
          <div className="max-w-5xl mx-auto px-6">
            <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-4 text-center">Hébergement</p>
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-4 text-center">
              Où dormir selon ton style
            </h2>
            <p className="text-stone-600 text-center mb-12 max-w-xl mx-auto">
              L’Alentejo offre des options pour tous les budgets. Nous, on a testé ces trois-là.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                <div className="w-12 h-12 rounded-full bg-teal/10 flex items-center justify-center mb-4">
                  <span className="text-2xl">🌿</span>
                </div>
                <h3 className="text-lg font-serif text-stone-900 mb-2">Montes Alentejanos</h3>
                <p className="text-sm text-stone-600 mb-4">
                  Pour ceux qui veulent être au milieu de la plain. On a dormi dans un monte rénové près de Monsaraz — oliviers, piscine, silence total.
                </p>
                <p className="text-xs text-stone-400">
                  💡 Notre conseil : bookezminimum 3 nuits, le temps de décompresser.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                <div className="w-12 h-12 rounded-full bg-teal/10 flex items-center justify-center mb-4">
                  <span className="text-2xl">🏘️</span>
                </div>
                <h3 className="text-lg font-serif text-stone-900 mb-2">Hôtel de village</h3>
                <p className="text-sm text-stone-600 mb-4">
                  À Évora ou à Monsaraz même. Pratique pour explorer à pied, et souvent dans des bâtiments historiques restaurés avec goût.
                </p>
                <p className="text-xs text-stone-400">
                  💡 Notre conseil : privilégiez les establecimientos avec petit-déjeuner inclus.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                <div className="w-12 h-12 rounded-full bg-teal/10 flex items-center justify-center mb-4">
                  <span className="text-2xl">🍇</span>
                </div>
                <h3 className="text-lg font-serif text-stone-900 mb-2">Quintas viticoles</h3>
                <p className="text-sm text-stone-600 mb-4">
                  Dormir chez le viticulteur, c’est possible. On a testé une quinta près de Vidigueira avec degustation privée incluse dans le prix de la chambre.
                </p>
                <p className="text-xs text-stone-400">
                  💡 Notre conseil : contactez directement pour les meilleurs tarifs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── COMMENT SE DÉPLACER ── */}
        <section className="py-16 md:py-24 bg-white border-t border-stone-100">
          <div className="max-w-4xl mx-auto px-6">
            <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-4 text-center">Logistique</p>
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-8 text-center">
              Comment se déplacer
            </h2>

            <div className="space-y-6">
              <div className="flex gap-4 p-6 bg-stone-50 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <span className="text-xl">🚗</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-stone-900 mb-2">Location de voiture</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">
                    <strong>Indispensable.</strong> Les distances sont grandes (Évora → Monsaraz = 1h30), les taxis rares, les bus limités. Louez une petite citadine : les routes sont bonnes, le traffic quasi nul.
                  </p>
                  <p className="text-xs text-stone-400 mt-2">
                    💡 Notre conseil : reservez depuis Lisbonne airport, compter 30-40€/jour.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-6 bg-stone-50 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <span className="text-xl">🚌</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-stone-900 mb-2">Bus régionaux</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">
                    Sans voiture, les Rede Expressos relient les grandes villes. Mais pour les villages, c’est compliqué.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA TRAVEL PLANNING ── */}
        <section className="py-16 md:py-24" style={{ backgroundColor: '#01696f' }}>
          <div className="max-w-3xl mx-auto px-6 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-serif font-light mb-4">
              Tu veux qu’on conçoive ton séjour dans l’Alentejo sur mesure ?
            </h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              On te construit un itinerary basé sur nos séjours réels. Vignobles, villages, plages rivières — selon ton rythme.
            </p>
            <Link
              href="/travel-planning"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-teal transition-all hover:bg-white/90"
            >
              Dis-nous ton projet →
            </Link>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-16 md:py-24 bg-stone-50">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-serif font-light text-stone-900 mb-8 text-center">
              Questions fréquentes
            </h2>
            <div className="space-y-4">
              {alentejoLd.mainEntity.map((item, i) => (
                <details key={i} className="bg-white rounded-xl p-5 border border-stone-100 group">
                  <summary className="font-semibold text-stone-900 cursor-pointer list-none flex justify-between items-center">
                    <span>{item.name}</span>
                    <span className="text-amber-600 group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="mt-3 text-stone-600 text-sm leading-relaxed">
                    {item.acceptedAnswer.text}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── RELATED ARTICLES ── */}
        <section className="py-16 md:py-24 bg-white border-t border-stone-100">
          <div className="max-w-5xl mx-auto px-6">
            <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-4 text-center">Pour aller plus loin</p>
            <h2 className="text-2xl md:text-3xl font-serif font-light text-stone-900 mb-8 text-center">
              Nos carnets liés
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/blog" className="group block bg-stone-50 rounded-2xl overflow-hidden border border-stone-100 hover:shadow-md transition-shadow">
                <div className="relative h-40 bg-stone-200">
                  <Image
                    src="https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=600&q=70"
                    alt="Vignobles de l’Alentejo"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-5">
                  <p className="text-xs text-amber-700 font-semibold mb-1">Portugal</p>
                  <h3 className="font-serif text-stone-900 group-hover:text-amber-700 transition-colors">
                    Routard dans l’Alentejo : notre journal de bord
                  </h3>
                </div>
              </Link>
              <Link href="/blog" className="group block bg-stone-50 rounded-2xl overflow-hidden border border-stone-100 hover:shadow-md transition-shadow">
                <div className="relative h-40 bg-stone-200">
                  <Image
                    src="https://images.unsplash.com/photo-1519955266818-c78a3d4b4c82?w=600&q=70"
                    alt="Évora"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-5">
                  <p className="text-xs text-amber-700 font-semibold mb-1">Découvertes Locales</p>
                  <h3 className="font-serif text-stone-900 group-hover:text-amber-700 transition-colors">
                    Évora : 48h dans la ville UNESCO
                  </h3>
                </div>
              </Link>
              <Link href="/blog" className="group block bg-stone-50 rounded-2xl overflow-hidden border border-stone-100 hover:shadow-md transition-shadow">
                <div className="relative h-40 bg-stone-200">
                  <Image
                    src="https://images.unsplash.com/photo-1560719887-fe3105fa1e55?w=600&q=70"
                    alt="Vins portugais"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-5">
                  <p className="text-xs text-amber-700 font-semibold mb-1">Food & Lifestyle</p>
                  <h3 className="font-serif text-stone-900 group-hover:text-amber-700 transition-colors">
                    Le vin portugais qu’on ramène à chaque fois
                  </h3>
                </div>
              </Link>
            </div>
            <div className="mt-8 text-center">
              <Link href="/blog" className="text-amber-700 font-semibold hover:text-amber-800">
                Voir tous nos carnets →
              </Link>
            </div>
          </div>
        </section>

        <SlowTravelQuiz />
      </main>
      <Footer />
    </>
  )
}
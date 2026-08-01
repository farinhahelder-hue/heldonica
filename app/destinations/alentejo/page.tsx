import Image from 'next/image'
import type { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SlowTravelQuiz from '@/components/SlowTravelQuiz'
import { getPageZones } from '@/lib/cms-zones'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import EditableZone from '@/components/inline-edit/EditableZone'
import { buildPageMetadata } from '@/lib/page-metadata'

const PAGE = "destinations-alentejo";
const FAQS: { q: string; a: string }[] = [
  { q: "Quand partir dans l'Alentejo pour le slow travel ?", a: "Les meilleures périodes sont mars-mai et septembre-novembre. Températures agréables (20-28°C), vignobles en fleur ou vendanges, hors des circuits habituels." },
  { q: "Combien de jours pour découvrir l'Alentejo ?", a: "Comptez minimum 4-5 jours pour faire Évoramonsaraz. 7-10 jours permettent d'explorer la Rota das Aldeias Históricas et les vignobles du sud." },
  { q: "Comment se déplacer dans l'Alentejo ?", a: "Location de voiture indispensable. Les distances sont grandes et les transports en commun rares. Les routes sont bonnes, le trafic faible — idéal pour un road trip lent." },
  { q: "Budget moyen par jour dans l'Alentejo ?", a: "Comptez 70-120€/jour en milieu de gamme (hébergement + repas + activités). L'Alentejo est moins cher que le littoral Algarve." },
];

const metadata: Metadata = {
  title: "Alentejo : Guide Slow Travel Complet | Heldonica",
  description: "Guide pilier Alentejo : quand partir, où dormir, vignobles, villages de pierre et itinéraire slow. 2 séjours vécus par le duo Heldonica.",
  alternates: {
    canonical: "https://www.heldonica.fr/destinations/alentejo",
  },
  openGraph: {
    title: "Alentejo : Guide Slow Travel Complet | Heldonica",
    description: "L’Alentejo en slow travel : plains, vignobles et villages de pierre. Notre guide terrain.",
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: "Alentejo — vignobles et plains dorées",
      },
    ],
    locale: 'fr_FR',
    type: "website",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('destinations-alentejo', metadata)
}


export default async function AlentejoPage() {
  const zones = await getPageZones(PAGE)

  const Z = (zone: string, type: 'text' | 'textarea' | 'html', fallback: string, className?: string, as?: any) => (
    <EditableZone page={PAGE} zone={zone} type={type} fallback={fallback} className={className} as={as} />
  )

  return (
    <InlineEditProvider page={PAGE} initialZones={zones}>
      <Script
        id="tourist-destination-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: "{\"@context\":\"https://schema.org\",\"@type\":\"TouristDestination\",\"name\":\"Alentejo\",\"description\":\"Région du sud du Portugal entre le Tage et l’Algarve. Plains, vignobles, liège et villages de pierre. Destination slow travel idéale pour lovers de terroir et de silence.\",\"url\":\"https://www.heldonica.fr/destinations/alentejo\",\"address\":{\"@type\":\"PostalAddress\",\"addressCountry\":\"PT\",\"addressRegion\":\"Alentejo\"},\"geo\":{\"@type\":\"GeoCoordinates\",\"latitude\":38.5667,\"longitude\":-7.9},\"touristType\":[\"Gourmet\",\"Nature lover\",\"Slow traveler\"],\"bestSeasonToVisit\":[\"March\",\"April\",\"May\",\"September\",\"October\",\"November\"]}" }}
      />
      <Script
        id="faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQS.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          }),
        }}
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
            src="/og-default.jpg"
            alt="Alentejo — vignobles dorés sous le soleil portugais"
            fill
            className="object-cover opacity-65"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />

          <div className="absolute left-4 top-4 md:left-8 md:top-8">
            <span className="inline-block rounded-full bg-eucalyptus/90 px-4 py-2 text-xs font-bold text-white shadow-lg backdrop-blur-sm">
              {Z('hero_badge', 'text', "✦", undefined, 'span')}
            </span>
          </div>

          <div className="relative z-10 px-6 md:px-16 pb-12 md:pb-20 max-w-4xl">
            <p className="text-teal text-xs font-bold tracking-[0.2em] uppercase mb-3">
              {Z('hero_label', 'text', "Destination Portugal", undefined, 'span')}
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light text-white mb-4 leading-tight">
              {Z('hero_title', 'text', "Alentejo : le slow travel absolu", undefined, 'span')}
              <br />
              <span className="text-teal/80 italic">{Z('hero_subtitle', 'text', "au cœur du Portugal", undefined, 'span')}</span>
            </h1>
            <p className="text-stone-300 text-base md:text-lg leading-relaxed max-w-2xl">
              {Z('hero_description', 'textarea', "Plaines infinies, vignobles à perte de vue, villages de pierre figés dans le temps. L’Alentejo, c’est le Portugal qu’on cherche quand on veut échapper aux foules.", undefined, 'span')}
            </p>
          </div>
        </section>

        {/* ── INTRODUCTION E-E-A-T ── */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <p className="text-eucalyptus text-xs font-bold tracking-[0.2em] uppercase mb-4">
              {Z('intro_label', 'text', "", undefined, 'span')}
            </p>
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-8">
              {Z('intro_title', 'text', "Pourquoi l’Alentejo nous a conquis", undefined, 'span')}
            </h2>
            <div className="prose prose-lg max-w-none prose-stone">
              <p className="text-stone-700 leading-relaxed text-lg">
                {Z('intro_1', 'html', "<strong className=\"text-stone-900\">La première fois</strong>, on a traversé l’Alentejo en vitesse, direction l’Algarve. Grosse erreur. On a traversé des siècles d’histoire, des plains qui donnaient le vertige, des villages où le temps semblait s’être arrêté — et on n’y a même pas posé pied.", undefined, 'span')}
              </p>
              <p className="text-stone-700 leading-relaxed">
                {Z('intro_2', 'html', "<strong className=\"text-stone-900\">La deuxième fois</strong>, on a pris 5 jours. Juste l’Alentejo central. Évoramonsaraz, les vignobles de Vidigueira, les routes sans autre voiture à l’horizon. C’est là qu’on a compris : l’Alentejo, c’est le Portugal <em>vraiment</em>.", undefined, 'span')}
              </p>
              <p className="text-stone-700 leading-relaxed">
                {Z('intro_3', 'html', "Ce qu’on y a trouvé : du bon vin à 3€, des restaurants de village où le patron cooking tout lui-même, des champs de liège à perte de vue, et ce silence qu’on cherche tous sans jamais oser le dire.", undefined, 'span')}
              </p>
            </div>
          </div>
        </section>

        {/* ── INFOS PRATIQUES ── */}
        <section className="py-12 bg-stone-50 border-y border-stone-200">
          <div className="max-w-5xl mx-auto px-6">
            <p className="text-eucalyptus text-xs font-bold tracking-[0.2em] uppercase mb-6 text-center">Bon à savoir</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">
                  {Z('quick_1_label', 'text', "Meilleure période", undefined, 'span')}
                </p>
                <p className="text-lg font-serif text-stone-900">
                  {Z('quick_1_value', 'html', "Mars–Juin<br /><span className=\"text-eucalyptus\">Sept–Nov</span>", undefined, 'span')}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">
                  {Z('quick_2_label', 'text', "Durée idéale", undefined, 'span')}
                </p>
                <p className="text-lg font-serif text-stone-900">
                  {Z('quick_2_value', 'html', "5–7 jours", undefined, 'span')}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">
                  {Z('quick_3_label', 'text', "Budget/jour", undefined, 'span')}
                </p>
                <p className="text-lg font-serif text-stone-900">
                  {Z('quick_3_value', 'html', "80–130€", undefined, 'span')}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">
                  {Z('quick_4_label', 'text', "Langue", undefined, 'span')}
                </p>
                <p className="text-lg font-serif text-stone-900">
                  {Z('quick_4_value', 'html', "Portugais<br /><span className=\"text-eucalyptus\">+ français</span>", undefined, 'span')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── NOS PÉPITES ── */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-5xl mx-auto px-6">
            <p className="text-eucalyptus text-xs font-bold tracking-[0.2em] uppercase mb-4 text-center">Ce qu'on a vécu</p>
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-12 text-center">
              Nos pépites dénichées
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-eucalyptus/10 flex items-center justify-center shrink-0">
                    <span className="text-2xl">{Z('pepite_1_emoji', 'text', "🏛️", undefined, 'span')}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-serif text-stone-900 mb-1">
                      {Z('pepite_1_title', 'text', "Évora", undefined, 'span')}
                    </h3>
                    <p className="text-sm text-eucalyptus/80 font-medium">
                      {Z('pepite_1_subtitle', 'text', "La ville UNESCO à taille humaine", undefined, 'span')}
                    </p>
                  </div>
                </div>
                <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  {Z('pepite_1_desc', 'textarea', "Capitale de l’Alentejo, classed UNESCO. On a aimé déambuler dans les ruelles avant 9h, visiter la chapelle des Ossements à la première heure (quasi déserte), et manger une açorda alentejana dans une tasca de la place principale.", undefined, 'span')}
                </p>
                <p className="text-xs text-stone-500 italic">
                  {Z('pepite_1_verdict', 'textarea', "⭐ Verdict Heldonica : À faire le matin, avant les bus de tourists.", undefined, 'span')}
                </p>
              </div>
              <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-eucalyptus/10 flex items-center justify-center shrink-0">
                    <span className="text-2xl">{Z('pepite_2_emoji', 'text', "🏰", undefined, 'span')}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-serif text-stone-900 mb-1">
                      {Z('pepite_2_title', 'text', "Monsaraz", undefined, 'span')}
                    </h3>
                    <p className="text-sm text-eucalyptus/80 font-medium">
                      {Z('pepite_2_subtitle', 'text', "Le village perché sur la plaine", undefined, 'span')}
                    </p>
                  </div>
                </div>
                <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  {Z('pepite_2_desc', 'textarea', "Un des plus beaux villages du Portugal. Ruelles étroites, château en ruine avec vue sur l’Estrémadure espagnole, et ce silence le soir quand les derniers touristes repartent.", undefined, 'span')}
                </p>
                <p className="text-xs text-stone-500 italic">
                  {Z('pepite_2_verdict', 'textarea', "⭐ Verdict Heldonica : Restez y dormir, pas qu’une journée.", undefined, 'span')}
                </p>
              </div>
              <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-eucalyptus/10 flex items-center justify-center shrink-0">
                    <span className="text-2xl">{Z('pepite_3_emoji', 'text', "🍷", undefined, 'span')}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-serif text-stone-900 mb-1">
                      {Z('pepite_3_title', 'text', "Rota dos Vinhos", undefined, 'span')}
                    </h3>
                    <p className="text-sm text-eucalyptus/80 font-medium">
                      {Z('pepite_3_subtitle', 'text', "La route des vignobles", undefined, 'span')}
                    </p>
                  </div>
                </div>
                <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  {Z('pepite_3_desc', 'textarea', "On a fait la rota entre Vidigueira et Redondo. Dégustations dans des quintas familiales, vin à 4€ la bouteille sur place, et des hôtes qui te racontent trois générations de tradition viticole.", undefined, 'span')}
                </p>
                <p className="text-xs text-stone-500 italic">
                  {Z('pepite_3_verdict', 'textarea', "⭐ Verdict Heldonica : Prévoyez un driver ou un copilote.", undefined, 'span')}
                </p>
              </div>
              <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-eucalyptus/10 flex items-center justify-center shrink-0">
                    <span className="text-2xl">{Z('pepite_4_emoji', 'text', "🏊", undefined, 'span')}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-serif text-stone-900 mb-1">
                      {Z('pepite_4_title', 'text', "Praia Fluvial de Granja", undefined, 'span')}
                    </h3>
                    <p className="text-sm text-eucalyptus/80 font-medium">
                      {Z('pepite_4_subtitle', 'text', "Les plages rivières secrètes", undefined, 'span')}
                    </p>
                  </div>
                </div>
                <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  {Z('pepite_4_desc', 'textarea', "L’Alentejo intérieur a des plages fluviales incroyables. On a trouvé notre spot préféré près de Granja — une plage sur la rivière avec des eaux claires, des gens du coin, et aucun touriste.", undefined, 'span')}
                </p>
                <p className="text-xs text-stone-500 italic">
                  {Z('pepite_4_verdict', 'textarea', "⭐ Verdict Heldonica : Demandez aux locaux, ils indiquent les meilleurs spots.", undefined, 'span')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── OÙ DORMIR ── */}
        <section className="py-16 md:py-24 bg-stone-50">
          <div className="max-w-5xl mx-auto px-6">
            <p className="text-eucalyptus text-xs font-bold tracking-[0.2em] uppercase mb-4 text-center">Hébergement</p>
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-4 text-center">
              Où dormir selon ton style
            </h2>
            <p className="text-stone-600 text-center mb-12 max-w-xl mx-auto">
              L'Alentejo offre des options pour tous les budgets. Nous, on a testé ces trois-là.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                <div className="w-12 h-12 rounded-full bg-teal/10 flex items-center justify-center mb-4">
                  <span className="text-2xl">{Z('accom_1_emoji', 'text', "🌿", undefined, 'span')}</span>
                </div>
                <h3 className="text-lg font-serif text-stone-900 mb-2">
                  {Z('accom_1_title', 'text', "Montes Alentejanos", undefined, 'span')}
                </h3>
                <p className="text-sm text-stone-600 mb-4">
                  {Z('accom_1_desc', 'textarea', "Pour ceux qui veulent être au milieu de la plain. On a dormi dans un monte rénové près de Monsaraz — oliviers, piscine, silence total.", undefined, 'span')}
                </p>
                <p className="text-xs text-stone-500">
                  {Z('accom_1_tip', 'textarea', "💡 Notre conseil : bookezminimum 3 nuits, le temps de décompresser.", undefined, 'span')}
                </p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                <div className="w-12 h-12 rounded-full bg-teal/10 flex items-center justify-center mb-4">
                  <span className="text-2xl">{Z('accom_2_emoji', 'text', "🏘️", undefined, 'span')}</span>
                </div>
                <h3 className="text-lg font-serif text-stone-900 mb-2">
                  {Z('accom_2_title', 'text', "Hôtel de village", undefined, 'span')}
                </h3>
                <p className="text-sm text-stone-600 mb-4">
                  {Z('accom_2_desc', 'textarea', "À Évora ou à Monsaraz même. Pratique pour explorer à pied, et souvent dans des bâtiments historiques restaurés avec goût.", undefined, 'span')}
                </p>
                <p className="text-xs text-stone-500">
                  {Z('accom_2_tip', 'textarea', "💡 Notre conseil : privilégiez les establecimientos avec petit-déjeuner inclus.", undefined, 'span')}
                </p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                <div className="w-12 h-12 rounded-full bg-teal/10 flex items-center justify-center mb-4">
                  <span className="text-2xl">{Z('accom_3_emoji', 'text', "🍇", undefined, 'span')}</span>
                </div>
                <h3 className="text-lg font-serif text-stone-900 mb-2">
                  {Z('accom_3_title', 'text', "Quintas viticoles", undefined, 'span')}
                </h3>
                <p className="text-sm text-stone-600 mb-4">
                  {Z('accom_3_desc', 'textarea', "Dormir chez le viticulteur, c’est possible. On a testé une quinta près de Vidigueira avec degustation privée incluse dans le prix de la chambre.", undefined, 'span')}
                </p>
                <p className="text-xs text-stone-500">
                  {Z('accom_3_tip', 'textarea', "💡 Notre conseil : contactez directement pour les meilleurs tarifs.", undefined, 'span')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── COMMENT SE DÉPLACER ── */}
        <section className="py-16 md:py-24 bg-white border-t border-stone-100">
          <div className="max-w-4xl mx-auto px-6">
            <p className="text-eucalyptus text-xs font-bold tracking-[0.2em] uppercase mb-4 text-center">Logistique</p>
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-8 text-center">
              Comment se déplacer
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4 p-6 bg-stone-50 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-eucalyptus/10 flex items-center justify-center shrink-0">
                  <span className="text-xl">{Z('transport_1_emoji', 'text', "🚗", undefined, 'span')}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-stone-900 mb-2">
                    {Z('transport_1_title', 'text', "Location de voiture", undefined, 'span')}
                  </h3>
                  <p className="text-stone-600 text-sm leading-relaxed">
                    {Z('transport_1_desc', 'html', "<strong>Indispensable.</strong> Les distances sont grandes (Évora → Monsaraz = 1h30), les taxis rares, les bus limités. Louez une petite citadine : les routes sont bonnes, le traffic quasi nul.", undefined, 'span')}
                  </p>
                  <p className="text-xs text-stone-500 mt-2">
                    {Z('transport_1_tip', 'textarea', "💡 Notre conseil : reservez depuis Lisbonne airport, compter 30-40€/jour.", undefined, 'span')}
                  </p>
                </div>
              </div>
              <div className="flex gap-4 p-6 bg-stone-50 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-eucalyptus/10 flex items-center justify-center shrink-0">
                  <span className="text-xl">{Z('transport_2_emoji', 'text', "🚌", undefined, 'span')}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-stone-900 mb-2">
                    {Z('transport_2_title', 'text', "Bus régionaux", undefined, 'span')}
                  </h3>
                  <p className="text-stone-600 text-sm leading-relaxed">
                    {Z('transport_2_desc', 'html', "Sans voiture, les Rede Expressos relient les grandes villes. Mais pour les villages, c’est compliqué.", undefined, 'span')}
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
              {Z('cta_title', 'text', "Tu veux qu’on conçoive ton séjour dans l’Alentejo sur mesure ?", undefined, 'span')}
            </h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              {Z('cta_text', 'textarea', "On te construit un itinerary basé sur nos séjours réels. Vignobles, villages, plages rivières — selon ton rythme.", undefined, 'span')}
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
                <details key={0} className="bg-white rounded-xl p-5 border border-stone-100 group">
                  <summary className="font-semibold text-stone-900 cursor-pointer list-none flex justify-between items-center">
                    <span>{Z('faq_1_q', 'text', "Quand partir dans l'Alentejo pour le slow travel ?", undefined, 'span')}</span>
                    <span className="text-eucalyptus group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="mt-3 text-stone-600 text-sm leading-relaxed">
                    {Z('faq_1_a', 'textarea', "Les meilleures périodes sont mars-mai et septembre-novembre. Températures agréables (20-28°C), vignobles en fleur ou vendanges, hors des circuits habituels.", undefined, 'span')}
                  </p>
                </details>
                <details key={1} className="bg-white rounded-xl p-5 border border-stone-100 group">
                  <summary className="font-semibold text-stone-900 cursor-pointer list-none flex justify-between items-center">
                    <span>{Z('faq_2_q', 'text', "Combien de jours pour découvrir l'Alentejo ?", undefined, 'span')}</span>
                    <span className="text-eucalyptus group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="mt-3 text-stone-600 text-sm leading-relaxed">
                    {Z('faq_2_a', 'textarea', "Comptez minimum 4-5 jours pour faire Évoramonsaraz. 7-10 jours permettent d'explorer la Rota das Aldeias Históricas et les vignobles du sud.", undefined, 'span')}
                  </p>
                </details>
                <details key={2} className="bg-white rounded-xl p-5 border border-stone-100 group">
                  <summary className="font-semibold text-stone-900 cursor-pointer list-none flex justify-between items-center">
                    <span>{Z('faq_3_q', 'text', "Comment se déplacer dans l'Alentejo ?", undefined, 'span')}</span>
                    <span className="text-eucalyptus group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="mt-3 text-stone-600 text-sm leading-relaxed">
                    {Z('faq_3_a', 'textarea', "Location de voiture indispensable. Les distances sont grandes et les transports en commun rares. Les routes sont bonnes, le trafic faible — idéal pour un road trip lent.", undefined, 'span')}
                  </p>
                </details>
                <details key={3} className="bg-white rounded-xl p-5 border border-stone-100 group">
                  <summary className="font-semibold text-stone-900 cursor-pointer list-none flex justify-between items-center">
                    <span>{Z('faq_4_q', 'text', "Budget moyen par jour dans l'Alentejo ?", undefined, 'span')}</span>
                    <span className="text-eucalyptus group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="mt-3 text-stone-600 text-sm leading-relaxed">
                    {Z('faq_4_a', 'textarea', "Comptez 70-120€/jour en milieu de gamme (hébergement + repas + activités). L'Alentejo est moins cher que le littoral Algarve.", undefined, 'span')}
                  </p>
                </details>
            </div>
          </div>
        </section>

        {/* ── RELATED ARTICLES ── */}
        <section className="py-16 md:py-24 bg-white border-t border-stone-100">
          <div className="max-w-5xl mx-auto px-6">
            <p className="text-eucalyptus text-xs font-bold tracking-[0.2em] uppercase mb-4 text-center">Pour aller plus loin</p>
            <h2 className="text-2xl md:text-3xl font-serif font-light text-stone-900 mb-8 text-center">
              Nos carnets liés
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/blog" className="group block bg-stone-50 rounded-2xl overflow-hidden border border-stone-100 hover:shadow-md transition-shadow">
                <div className="relative h-40 bg-stone-200">
                  <Image
                    src="/og-default.jpg"
                    alt={Z('article_1_alt', 'text', "Vignobles de l’Alentejo", undefined, 'span') as any}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="p-5">
                  <p className="text-xs text-eucalyptus font-semibold mb-1">
                    {Z('article_1_label', 'text', "Portugal", undefined, 'span')}
                  </p>
                  <h3 className="font-serif text-stone-900 group-hover:text-eucalyptus transition-colors">
                    {Z('article_1_title', 'text', "Routard dans l’Alentejo : notre journal de bord", undefined, 'span')}
                  </h3>
                </div>
              </Link>
              <Link href="/blog" className="group block bg-stone-50 rounded-2xl overflow-hidden border border-stone-100 hover:shadow-md transition-shadow">
                <div className="relative h-40 bg-stone-200">
                  <Image
                    src="/og-default.jpg"
                    alt={Z('article_2_alt', 'text', "Évora", undefined, 'span') as any}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="p-5">
                  <p className="text-xs text-eucalyptus font-semibold mb-1">
                    {Z('article_2_label', 'text', "Découvertes Locales", undefined, 'span')}
                  </p>
                  <h3 className="font-serif text-stone-900 group-hover:text-eucalyptus transition-colors">
                    {Z('article_2_title', 'text', "Évora : 48h dans la ville UNESCO", undefined, 'span')}
                  </h3>
                </div>
              </Link>
              <Link href="/blog" className="group block bg-stone-50 rounded-2xl overflow-hidden border border-stone-100 hover:shadow-md transition-shadow">
                <div className="relative h-40 bg-stone-200">
                  <Image
                    src="/og-default.jpg"
                    alt={Z('article_3_alt', 'text', "Vins portugais", undefined, 'span') as any}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="p-5">
                  <p className="text-xs text-eucalyptus font-semibold mb-1">
                    {Z('article_3_label', 'text', "Food & Lifestyle", undefined, 'span')}
                  </p>
                  <h3 className="font-serif text-stone-900 group-hover:text-eucalyptus transition-colors">
                    {Z('article_3_title', 'text', "Le vin portugais qu’on ramène à chaque fois", undefined, 'span')}
                  </h3>
                </div>
              </Link>
            </div>
            <div className="mt-8 text-center">
              <Link href="/blog" className="text-eucalyptus font-semibold hover:text-eucalyptus/80">
                Voir tous nos carnets →
              </Link>
            </div>
          </div>
        </section>

        <SlowTravelQuiz />
      </main>
      <Footer />
    </InlineEditProvider>
  )
}

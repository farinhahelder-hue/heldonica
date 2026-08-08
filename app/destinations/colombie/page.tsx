import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getPageZones } from '@/lib/cms-zones';
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider';
import EditableZone from '@/components/inline-edit/EditableZone';
import { buildPageMetadata } from '@/lib/page-metadata'

const PAGE = "destinations-colombie";
const SUBNav = [
  { label: "Bogotá", href: "/destinations/colombie/bogota" },
  { label: "Medellín", href: "/destinations/colombie/medellin" },
  { label: "Cali", href: "/destinations/colombie/cali" },
  { label: "Cartago", href: "/destinations/colombie/cartago" },
];
const FAQS: { q: string; a: string }[] = [
  { q: "Quand aller en Colombie ?", a: "Décembre à avril : saison sèche, idéale pour Bogotá et Medellín. Juillet-août également sec et festif (Feria de Cali)." },
  { q: "La Colombie est-elle sûre pour les voyageurs ?", a: "Les zones touristiques de Bogotá, Medellín, Cali et la région caféière sont sécurisées. Les précautions habituelles s'appliquent en milieu urbain." },
  { q: "Quel est le budget pour un voyage en Colombie ?", a: "Destination abordable : compter 50–80€/jour en couple hors vol. Les hébergements et restaurants de qualité restent très accessibles." },
];
const HERO_SUBTITLE = "le pays qui a changé plus vite que sa réputation";

const metadata: Metadata = {
  title: "Colombie slow travel | Guide Heldonica",
  description: "Guide slow travel Colombie : Bogotá, Medellín, Cali et la région du café. Adresses dénichées, itinéraires testés et conseils terrain par Heldonica.",
  alternates: {
    canonical: "https://www.heldonica.fr/destinations/colombie",
  },
  openGraph: {
    title: "Colombie slow travel | Guide Heldonica",
    description: "Guide slow travel Colombie : Bogotá, Medellín, Cali et la région du café. Adresses dénichées, itinéraires testés et conseils terrain par Heldonica.",
    url: "https://www.heldonica.fr/destinations/colombie",
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: "Colombie — Bogotá et la région du café",
      },
    ],
    locale: 'fr_FR',
    type: "website",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('destinations-colombie', metadata)
}


export default async function ColombiePage() {
  const zones = await getPageZones(PAGE)

  const Z = (zone: string, type: 'text' | 'textarea' | 'html', fallback: string, className?: string, as?: any) => (
    <EditableZone page={PAGE} zone={zone} type={type} fallback={fallback} className={className} as={as} />
  )

  return (
    <InlineEditProvider page={PAGE} initialZones={zones}>
      <script
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
      <main className="min-h-screen bg-stone-50">
        {/* Hero */}
        <section className="relative bg-stone-900 py-20 md:py-24 overflow-hidden">
          <div className="max-w-4xl mx-auto px-4">
            <span className="inline-block text-teal text-sm font-medium mb-4 uppercase tracking-widest">
              {Z('hero_badge', 'text', "Destination testée", undefined, 'span')}
            </span>
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-6 leading-tight">
              {Z('hero_title', 'text', "Colombie", undefined, 'span')}
              {HERO_SUBTITLE ? (
                <span className="block text-teal italic text-3xl md:text-4xl mt-2">
                  {Z('hero_subtitle', 'text', HERO_SUBTITLE, undefined, 'span')}
                </span>
              ) : null}
            </h1>
            <p className="text-lg md:text-xl text-stone-300 max-w-2xl leading-relaxed">
              {Z('hero_description', 'textarea', "Café, salsa, émeraudes. Medellín métamorphosée, Bogotá qui déborde de culture, et les routes du café qui n'ont pas d'équivalent.", undefined, 'span')}
            </p>
          </div>
        </section>

        {/* Sub navigation */}
        <nav className="bg-white border-b border-stone-200 sticky top-16 z-40" aria-label="Sous-destinations">
          <div className="max-w-4xl mx-auto px-4 py-3 flex gap-6 overflow-x-auto no-scrollbar">
            {SUBNav.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-stone-600 hover:text-eucalyptus whitespace-nowrap text-sm font-medium transition-colors"
              >
                {Z(`subnav_${i + 1}_label`, 'text', item.label, undefined, 'span')}
              </Link>
            ))}
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Intro */}
          <section className="mb-12">

              <p className="text-lg text-stone-700 leading-relaxed">
                {Z('intro_1', 'html', "La Colombie, c'est le retour. Le retour d'une destination qui a mis des années à se défaire de sa réputation, et qui s'est transformée plus vite que les voyageurs n'ont pu le réaliser.\n              Bogotá la culturelle, Medellín la résiliente, Cali la sensuelle — et entre les deux, les routes du café, où l'on s'arrête dans les fincas pour comprendre ce qui pousse dans ces collines vertes.", undefined, 'span')}
              </p>
              <p className="text-lg text-stone-700 leading-relaxed mb-4">
                {Z('intro_2', 'html', "Ce qu'on préfère ? La façon dont les gens parlent de leur pays. Avec une fierté calme, une envie de te montrer ce qui a changé. C'est ça, la vraie Colombie lente.", undefined, 'span')}
              </p>
          </section>

          {/* Cards grid */}
          <section className="mb-12">
            <h2 className="text-2xl font-serif text-stone-900 mb-6">
              {Z('cards_title', 'text', "Nos villes favorites", undefined, 'span')}
            </h2>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="bg-white p-6 rounded-xl border border-stone-200 hover:border-eucalyptus/40 hover:shadow-md transition-all group">
                <h3 className="font-serif text-lg text-stone-900 mb-2 group-hover:text-eucalyptus transition-colors">
                  {Z('card_1_title', 'text', "Bogotá", undefined, 'span')}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {Z('card_1_desc', 'textarea', "Capitale à 2 600 m. Musées de classe mondiale, street food, graffitis engagés.", undefined, 'span')}
                </p>
                <span className="text-xs text-eucalyptus font-semibold mt-3 inline-block group-hover:translate-x-1 transition-transform">{Z('cards_cta', 'text', "Voir le guide →", undefined, 'span')}</span>
              </div>
              <div className="bg-white p-6 rounded-xl border border-stone-200 hover:border-eucalyptus/40 hover:shadow-md transition-all group">
                <h3 className="font-serif text-lg text-stone-900 mb-2 group-hover:text-eucalyptus transition-colors">
                  {Z('card_2_title', 'text', "Medellín", undefined, 'span')}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {Z('card_2_desc', 'textarea', "La ville de l'éternel printemps. Innovation urbaine, quartier El Poblado, tramway.", undefined, 'span')}
                </p>
                <span className="text-xs text-eucalyptus font-semibold mt-3 inline-block group-hover:translate-x-1 transition-transform">{Z('cards_cta', 'text', "Voir le guide →", undefined, 'span')}</span>
              </div>
              <div className="bg-white p-6 rounded-xl border border-stone-200 hover:border-eucalyptus/40 hover:shadow-md transition-all group">
                <h3 className="font-serif text-lg text-stone-900 mb-2 group-hover:text-eucalyptus transition-colors">
                  {Z('card_3_title', 'text', "Cali", undefined, 'span')}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {Z('card_3_desc', 'textarea', "Reine de la salsa. Valle del Cauca, ambiance décalée, feria en décembre.", undefined, 'span')}
                </p>
                <span className="text-xs text-eucalyptus font-semibold mt-3 inline-block group-hover:translate-x-1 transition-transform">{Z('cards_cta', 'text', "Voir le guide →", undefined, 'span')}</span>
              </div>
              <div className="bg-white p-6 rounded-xl border border-stone-200 hover:border-eucalyptus/40 hover:shadow-md transition-all group">
                <h3 className="font-serif text-lg text-stone-900 mb-2 group-hover:text-eucalyptus transition-colors">
                  {Z('card_4_title', 'text', "Cartago & la région café", undefined, 'span')}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {Z('card_4_desc', 'textarea', "UNESCO. Fincas caféières, paysages ondulés, haciendas coloniales.", undefined, 'span')}
                </p>
                <span className="text-xs text-eucalyptus font-semibold mt-3 inline-block group-hover:translate-x-1 transition-transform">{Z('cards_cta', 'text', "Voir le guide →", undefined, 'span')}</span>
              </div>
            </div>
          </section>

          {/* Infos pratiques */}
          <section className="mb-12">
            
            <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl border border-stone-200">
              <h3 className="font-serif text-lg text-stone-900 mb-4">
                {Z('info_1_title', 'text', "Meilleure période", undefined, 'span')}
              </h3>
              <ul className="space-y-3 text-stone-600 text-sm">
                <li className="flex items-start gap-2">
                  <span>{Z('info_1_item_1', 'html', "✓ Décembre – Avril : saison sèche, idéale", undefined, 'span')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>{Z('info_1_item_2', 'html', "✓ Juillet – Août : festivals, Feria de Cali", undefined, 'span')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>{Z('info_1_item_3', 'html', "⚠ Mai – Juin : saison des pluies", undefined, 'span')}</span>
                </li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-xl border border-stone-200">
              <h3 className="font-serif text-lg text-stone-900 mb-4">
                {Z('info_2_title', 'text', "Budget indicatif (duo/semaine)", undefined, 'span')}
              </h3>
              <ul className="space-y-3 text-stone-600 text-sm">
                <li className="flex items-start gap-2">
                  <span>{Z('info_2_item_1', 'html', "Hébergement : 50–120€/nuit", undefined, 'span')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>{Z('info_2_item_2', 'html', "Repas au restaurant : 20–40€/jour", undefined, 'span')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>{Z('info_2_item_3', 'html', "Vol Paris–Bogotá : ~600–900€ A/R", undefined, 'span')}</span>
                </li>
              </ul>
            </div>
            </div>
          </section>


          <div className="pt-4 border-t border-stone-200">
            <Link href="/destinations" className="text-sm text-eucalyptus font-semibold hover:underline">
              {Z('back_link', 'text', "← Toutes les destinations", undefined, 'span')}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </InlineEditProvider>
  );
}

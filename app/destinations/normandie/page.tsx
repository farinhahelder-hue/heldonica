import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getPageZones } from '@/lib/cms-zones';
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider';
import EditableZone from '@/components/inline-edit/EditableZone';

const PAGE = "destinations-normandie";
const SUBNav = [
  { label: "Le Havre", href: "/destinations/normandie/le-havre" },
  { label: "Côte d'Albâtre", href: "/destinations/normandie/cote-albatre" },
  { label: "Pays d'Auge", href: "/destinations/normandie/pays-dauge" },
];
const FAQS: { q: string; a: string }[] = [
  { q: "Quand aller en Normandie ?", a: "Mai-juin pour la météo douce et les foules maîtrisées. Juin idéal pour les commémorations avec moins de monde qu'en juillet. Éviter les week-ends de juillet-août sur la Côte d'Albâtre." },
  { q: "Comment aller en Normandie depuis Paris ?", a: "Train depuis Paris-Saint-Lazare jusqu'au Havre (2h15) ou Caen (2h). Voiture indispensable pour explorer la Côte d'Albâtre, le Pays d'Auge et les plages du Débarquement. Location possible à l'arrivée en gare." },
  { q: "Que voir en Normandie hors des sentiers battus ?", a: "Le centre Auguste Perret du Havre (UNESCO), les petits ports de la Côte d'Albâtre entre Étretat et Fécamp, les vallons du Pays d'Auge loin des routes touristiques, les producteurs de Calvados en direct." },
];
const HERO_SUBTITLE = "";

export const metadata: Metadata = {
  title: "Normandie slow travel | Guide Heldonica",
  description: "Guide pilier Normandie: Le Havre, Honfleur, Bayeux et les environs. Quand partir, budget réel, où dormir, et choses à faire.",
  alternates: {
    canonical: "https://www.heldonica.fr/destinations/normandie",
  },
  openGraph: {
    title: "Normandie slow travel | Guide Heldonica",
    description: "Guide pilier Normandie: Le Havre, Honfleur, Bayeux et les environs. Quand partir, budget réel, où dormir, et choses à faire.",
    url: "https://www.heldonica.fr/destinations/normandie",
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: "Normandie slow travel — Falaises d'Étretat",
      },
    ],
    locale: 'fr_FR',
    type: "article",
  },
};

export default async function NormandiePage() {
  const zones = await getPageZones(PAGE)

  const Z = (zone: string, type: 'text' | 'textarea' | 'html', fallback: string, className?: string, as?: any) => (
    <EditableZone page={PAGE} zone={zone} type={type} fallback={fallback} className={className} as={as} />
  )

  return (
    <InlineEditProvider page={PAGE} initialZones={zones}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: "{\"@context\":\"https://schema.org\",\"@type\":\"TouristDestination\",\"name\":\"Normandie\",\"description\":\"Région française riche en histoire et en paysages côtiers. Le Havre, Honfleur, Bayeux et les plages du débarquement. Destination slow travel idéale pour les amateurs d'histoire et de bord de mer.\",\"url\":\"https://www.heldonica.fr/destinations/normandie\",\"address\":{\"@type\":\"PostalAddress\",\"addressCountry\":\"FR\",\"addressRegion\":\"Normandie\"},\"geo\":{\"@type\":\"GeoCoordinates\",\"latitude\":49.2829,\"longitude\":-0.5011},\"touristType\":[\"History buff\",\"Beach lover\",\"Slow traveler\"],\"bestSeasonToVisit\":[\"May\",\"June\",\"July\",\"August\",\"September\"]}" }}
      />
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
              {Z('hero_badge', 'text', "Destinations", undefined, 'span')}
            </span>
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-6 leading-tight">
              {Z('hero_title', 'text', "Normandie", undefined, 'span')}
              {HERO_SUBTITLE ? (
                <span className="block text-teal italic text-3xl md:text-4xl mt-2">
                  {Z('hero_subtitle', 'text', HERO_SUBTITLE, undefined, 'span')}
                </span>
              ) : null}
            </h1>
            <p className="text-lg md:text-xl text-stone-300 max-w-2xl leading-relaxed">
              {Z('hero_description', 'textarea', "Falaises de craie blanche, ports de pêche authentique, histoire par chaque rue. La Normandie qu'on aime — entre mer et patrimoine.", undefined, 'span')}
            </p>
          </div>
        </section>

        {/* Sub navigation */}
        <nav className="bg-white border-b border-stone-200 sticky top-16 z-40" aria-label="Sous-destinations">
          <div className="max-w-4xl mx-auto px-4 py-3 flex gap-6 overflow-x-auto no-scrollbar">
            {SUBNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-stone-600 hover:text-eucalyptus whitespace-nowrap text-sm font-medium transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Intro */}
          <section className="mb-12">

              <p className="text-lg text-stone-700 leading-relaxed">
                {Z('intro_1', 'html', "Quand on pense Normandie, on imagine les plages du Débarquement, les falaises d'Étretat, Honfleur.\n              Mais entre les sentiers battus, il y a une Normandie plus secrète : les petits ports de pêche, les vallons du Pays d'Auge,\n              l'architecture Art Déco du Havre. <strong>C'est celle-là qu'on est allés chercher.</strong>", undefined, 'span')}
              </p>
          </section>

          {/* Cards grid */}
          <section className="mb-12">
            <h2 className="text-2xl font-serif text-stone-900 mb-6">
              Nos régions
            </h2>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="bg-white p-6 rounded-xl border border-stone-200 hover:border-eucalyptus/40 hover:shadow-md transition-all group">
                <h3 className="font-serif text-lg text-stone-900 mb-2 group-hover:text-eucalyptus transition-colors">
                  {Z('card_1_title', 'text', "Le Havre et environs", undefined, 'span')}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {Z('card_1_desc', 'textarea', "Deuxième port de France, patrimoine UNESCO d'Auguste Perret. Ville reconstruite, fascinante.", undefined, 'span')}
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-stone-200 hover:border-eucalyptus/40 hover:shadow-md transition-all group">
                <h3 className="font-serif text-lg text-stone-900 mb-2 group-hover:text-eucalyptus transition-colors">
                  {Z('card_2_title', 'text', "Côte d'Albâtre", undefined, 'span')}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {Z('card_2_desc', 'textarea', "Les falaises de craie blanche d'Étretat aux caps. La Normandie qui coupe le souffle.", undefined, 'span')}
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-stone-200 hover:border-eucalyptus/40 hover:shadow-md transition-all group">
                <h3 className="font-serif text-lg text-stone-900 mb-2 group-hover:text-eucalyptus transition-colors">
                  {Z('card_3_title', 'text', "Pays d'Auge", undefined, 'span')}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {Z('card_3_desc', 'textarea', "Bocage normand, Calvados en direct, villages pittoresques et camembert fermier.", undefined, 'span')}
                </p>
              </div>
            </div>
          </section>

          {/* Infos pratiques */}
          <section className="mb-12">
            
            <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl border border-stone-200">
              <h3 className="font-serif text-lg text-stone-900 mb-4">
                {Z('info_1_title', 'text', "Quand y aller", undefined, 'span')}
              </h3>
              <ul className="space-y-3 text-stone-600 text-sm">
                <li className="flex items-start gap-2">
                  <span>{Z('info_1_item_1', 'html', "<strong>Mai - Juin:</strong> Ideal, moins de monde", undefined, 'span')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>{Z('info_1_item_2', 'html', "<strong>Septembre:</strong> Fin de saison, tarifs ok", undefined, 'span')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>{Z('info_1_item_3', 'html', "<strong>Juillet - Aout:</strong> Peak estival, prevoyez", undefined, 'span')}</span>
                </li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-xl border border-stone-200">
              <h3 className="font-serif text-lg text-stone-900 mb-4">
                {Z('info_2_title', 'text', "Budget couple", undefined, 'span')}
              </h3>
              <ul className="space-y-3 text-stone-600 text-sm">
                <li className="flex items-start gap-2">
                  <span>{Z('info_2_item_1', 'html', "<strong>Confort:</strong> 120-180€ /nuit", undefined, 'span')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>{Z('info_2_item_2', 'html', "<strong>Repas:</strong> 40-60€", undefined, 'span')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>{Z('info_2_item_3', 'html', "<strong>Carburant:</strong>~80€ pour le roadtrip", undefined, 'span')}</span>
                </li>
              </ul>
            </div>
            </div>
          </section>


          <section className="mb-12">
            <h2 className="text-2xl font-serif text-stone-900 mb-6">
              En voir plus
            </h2>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/destinations/normandie/le-havre"
                className="px-6 py-3 bg-mahogany text-white rounded-lg hover:bg-mahogany/90 transition-colors"
              >
                Le Havre et environs →
              </Link>
              <Link
                href="/blog"
                className="px-6 py-3 border border-stone-300 text-stone-700 rounded-lg hover:border-eucalyptus/40 transition-colors"
              >
                Articles Normandie →
              </Link>
            </div>
          </section>
          <div className="pt-4 border-t border-stone-200">
            <Link href="/destinations" className="text-sm text-eucalyptus font-semibold hover:underline">
              ← Toutes les destinations
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </InlineEditProvider>
  );
}

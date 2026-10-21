import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getPageZones } from '@/lib/cms-zones';
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider';
import EditableZone from '@/components/inline-edit/EditableZone';
import { buildPageMetadata } from '@/lib/page-metadata'
import ComingSoonDestination from '@/components/ComingSoonDestination'
import { isUnpublishedCmsPage } from '@/lib/unpublished-pages'

const SITE_URL = 'https://www.heldonica.fr';
const PAGE = "destinations-madere-itineraire-7-jours";

const metadata: Metadata = {
  title: 'Itinéraire Madère 7 jours | Heldonica',
  description:
    'Itinéraire slow travel Madère sur 7 jours : rythme, points de vue, levadas et adresses locales.',
  alternates: {
    canonical: `${SITE_URL}/destinations/madere/itineraire-7-jours`,
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('destinations-madere-itineraire-7-jours', metadata)
}


export default async function MadereItineraryPage() {
  // MVP : page sans photo vérifiée, « Bientôt » tant qu'elle figure dans lib/unpublished-pages.ts.
  if (isUnpublishedCmsPage('destinations-madere-itineraire-7-jours')) {
    return (
      <ComingSoonDestination
        slug="madere-itineraire-7-jours"
        title="Madère en 7 jours"
        country="Portugal"
        hero_unsplash_url="/og-default.jpg"
        zones={await getPageZones('destinations-madere-itineraire-7-jours')}
      />
    )
  }
  const zones = await getPageZones(PAGE)

  const Z = (zone: string, type: 'text' | 'textarea' | 'html', fallback: string, className?: string, as?: any) => (
    <EditableZone page={PAGE} zone={zone} type={type} fallback={fallback} className={className} as={as} />
  )

  return (
    <InlineEditProvider page={PAGE} initialZones={zones}>
      <Header />
      <main>
        <section className="bg-[#EFE9DF] border-b border-[#DED5C6] py-20 md:py-28">
          <div className="container">
            <p className="text-xs uppercase tracking-[0.2em] text-eucalyptus font-semibold mb-4">
              {Z('hero_badge', 'text', "Madère - Itinéraire", undefined, 'span')}
            </p>
            <h1 className="text-4xl md:text-6xl font-serif text-mahogany mb-6">
              {Z('hero_title', 'text', "Itinéraire Madère 7 jours", undefined, 'span')}
            </h1>
            <p className="text-charcoal/80 text-lg max-w-3xl leading-relaxed">
              {Z('hero_description', 'textarea', "Un plan fait pour respirer : moins de zigzags, plus de cohérence entre\n              paysages, adresses et énergie du duo.", undefined, 'span')}
            </p>
          </div>
        </section>

        <section className="bg-[#F7F3EC] section-spacing">
          <div className="container max-w-4xl">
            <div className="space-y-5">
                <article
                  key={1}
                  className="rounded-sm border border-[#DED5C6] bg-[#FAF7F2] p-6 md:p-7"
                >
                  <h2 className="text-2xl font-serif text-mahogany mb-2">{Z('day_1_title', 'text', "Jour 1 - Atterrissage doux à Funchal", undefined, 'span')}</h2>
                  <p className="text-charcoal/80 leading-relaxed">{Z('day_1_content', 'textarea', "Installation, marché des lavradores, front de mer, dîner local sans pression horaire.", undefined, 'span')}</p>
                </article>
                <article
                  key={2}
                  className="rounded-sm border border-[#DED5C6] bg-[#FAF7F2] p-6 md:p-7"
                >
                  <h2 className="text-2xl font-serif text-mahogany mb-2">{Z('day_2_title', 'text', "Jour 2 - Ponta de São Lourenço", undefined, 'span')}</h2>
                  <p className="text-charcoal/80 leading-relaxed">{Z('day_2_content', 'textarea', "Départ matinal, rando côte est, pause longue face aux reliefs puis retour lent.", undefined, 'span')}</p>
                </article>
                <article
                  key={3}
                  className="rounded-sm border border-[#DED5C6] bg-[#FAF7F2] p-6 md:p-7"
                >
                  <h2 className="text-2xl font-serif text-mahogany mb-2">{Z('day_3_title', 'text', "Jour 3 - Levadas et forêts", undefined, 'span')}</h2>
                  <p className="text-charcoal/80 leading-relaxed">{Z('day_3_content', 'textarea', "Section de levada adaptée à ton niveau, pause pique-nique et fin de journée en village.", undefined, 'span')}</p>
                </article>
                <article
                  key={4}
                  className="rounded-sm border border-[#DED5C6] bg-[#FAF7F2] p-6 md:p-7"
                >
                  <h2 className="text-2xl font-serif text-mahogany mb-2">{Z('day_4_title', 'text', "Jour 4 - Nord volcanique", undefined, 'span')}</h2>
                  <p className="text-charcoal/80 leading-relaxed">{Z('day_4_content', 'textarea', "Route panoramique, piscines naturelles, session photo et table locale en bord de mer.", undefined, 'span')}</p>
                </article>
                <article
                  key={5}
                  className="rounded-sm border border-[#DED5C6] bg-[#FAF7F2] p-6 md:p-7"
                >
                  <h2 className="text-2xl font-serif text-mahogany mb-2">{Z('day_5_title', 'text', "Jour 5 - Villages suspendus", undefined, 'span')}</h2>
                  <p className="text-charcoal/80 leading-relaxed">{Z('day_5_content', 'textarea', "Jardins, belvédères et cafés de hauteur. Journée idéale pour ralentir sans se couper du paysage.", undefined, 'span')}</p>
                </article>
                <article
                  key={6}
                  className="rounded-sm border border-[#DED5C6] bg-[#FAF7F2] p-6 md:p-7"
                >
                  <h2 className="text-2xl font-serif text-mahogany mb-2">{Z('day_6_title', 'text', "Jour 6 - Journée modulable", undefined, 'span')}</h2>
                  <p className="text-charcoal/80 leading-relaxed">{Z('day_6_content', 'textarea', "Option mer, option montagne ou option repos complet selon météo et niveau d'énergie.", undefined, 'span')}</p>
                </article>
                <article
                  key={7}
                  className="rounded-sm border border-[#DED5C6] bg-[#FAF7F2] p-6 md:p-7"
                >
                  <h2 className="text-2xl font-serif text-mahogany mb-2">{Z('day_7_title', 'text', "Jour 7 - Clôture sensorielle", undefined, 'span')}</h2>
                  <p className="text-charcoal/80 leading-relaxed">{Z('day_7_content', 'textarea', "Dernier panorama, achats utiles, retour à Funchal et départ sans course de fin de voyage.", undefined, 'span')}</p>
                </article>
            </div>
          </div>
        </section>

        <section className="bg-[#EFE9DF] section-spacing border-y border-[#DED5C6]">
          <div className="container max-w-4xl grid md:grid-cols-2 gap-5">
            <article className="rounded-sm border border-[#DED5C6] p-6 bg-[#FAF7F2]">
              <p className="text-xs uppercase tracking-[0.15em] text-eucalyptus font-semibold mb-2">
                {Z('conseil_1_title', 'text', "Conseil rythme", undefined, 'span')}
              </p>
              <p className="text-charcoal/80">
                {Z('conseil_1_text', 'textarea', "Ne surcharge pas les jours 2 à 4. Madère fatigue vite si on empile\n                trop de dénivelé et de route.", undefined, 'span')}
              </p>
            </article>
            <article className="rounded-sm border border-[#DED5C6] p-6 bg-[#FAF7F2]">
              <p className="text-xs uppercase tracking-[0.15em] text-eucalyptus font-semibold mb-2">
                {Z('conseil_2_title', 'text', "Conseil budget", undefined, 'span')}
              </p>
              <p className="text-charcoal/80">
                {Z('conseil_2_text', 'textarea', "Garde une marge pour la météo : parfois on décale une activité et on\n                gagne en qualité d'expérience.", undefined, 'span')}
              </p>
            </article>
          </div>
        </section>

        <section className="bg-[#2A1D18] text-[#F7F3EC] section-spacing">
          <div className="container max-w-3xl text-center">
            <h2 className="text-3xl md:text-4xl font-serif mb-4">
              {Z('cta_title', 'text', "Besoin de la version sur mesure de cet itinéraire ?", undefined, 'span')}
            </h2>
            <p className="text-white/80 mb-8">
              {Z('cta_text', 'textarea', "On ajuste ce cadre à ton budget, ta saison et ton énergie réelle.", undefined, 'span')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/travel-planning-form?destination=madere"
                className="px-7 py-3 rounded-sm bg-eucalyptus text-[#FAF7F2] text-xs uppercase tracking-[0.16em] font-medium hover:bg-eucalyptus/90 transition-colors"
              >
                Construire mon itinéraire
              </Link>
              <Link
                href="/destinations/madere/budget"
                className="px-7 py-3 rounded-sm border border-[#E6DEC8]/40 text-xs uppercase tracking-[0.16em] font-medium hover:border-[#FAF7F2] transition-colors"
              >
                Voir le budget
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </InlineEditProvider>
  );
}

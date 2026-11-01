import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Compass, Eye } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getPageZones } from '@/lib/cms-zones';
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider';
import EditableZone from '@/components/inline-edit/EditableZone';
import { buildPageMetadata } from '@/lib/page-metadata';
import ComingSoonDestination from '@/components/ComingSoonDestination';
import { isUnpublishedCmsPage } from '@/lib/unpublished-pages';

const SITE_URL = 'https://www.heldonica.fr';
const PAGE = 'destinations-madere-itineraire-7-jours';

const metadata: Metadata = {
  title: 'Itinéraire Madère 7 jours | Heldonica',
  description:
    'Itinéraire slow travel Madère sur 7 jours : rythme, points de vue, levadas et adresses locales.',
  alternates: {
    canonical: `${SITE_URL}/destinations/madere/itineraire-7-jours`,
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('destinations-madere-itineraire-7-jours', metadata);
}

interface Props {
  searchParams?: Promise<{ preview?: string }>;
}

export default async function MadereItineraryPage({ searchParams }: Props) {
  const sp = searchParams ? await searchParams : {};
  const isPreview = sp.preview === 'draft' || sp.preview === 'true';

  // Mode brouillon sécurisé : tant que la page figure dans lib/unpublished-pages.ts,
  // le visiteur public voit la page « Bientôt ». L'accès aperçu se fait via ?preview=draft.
  if (!isPreview && isUnpublishedCmsPage(PAGE)) {
    const defaultComingSoonTitle = 'Madère en 7 jours';
    return (
      <ComingSoonDestination
        slug="madere-itineraire-7-jours"
        title={defaultComingSoonTitle}
        country="Portugal"
        hero_unsplash_url="/og-default.jpg"
        zones={await getPageZones(PAGE)}
      />
    );
  }

  const zones = await getPageZones(PAGE);

  const Z = (
    zone: string,
    type: 'text' | 'textarea' | 'html',
    fallback: string,
    className?: string,
    as?: any
  ) => (
    <EditableZone
      page={PAGE}
      zone={zone}
      type={type}
      fallback={fallback}
      className={className}
      as={as}
    />
  );

  return (
    <InlineEditProvider page={PAGE} initialZones={zones}>
      <Header />
      <main>
        {/* Bandeau indicateur de mode brouillon */}
        {isPreview && (
          <div className="bg-amber-100/90 border-b border-amber-300 text-amber-900 px-4 py-2.5 text-xs flex items-center justify-center gap-2">
            <Eye className="w-4 h-4 text-amber-700" />
            <span className="font-medium">
              {Z('draft_badge_title', 'text', 'Mode Brouillon actif :', undefined, 'span')}
            </span>
            <span>
              {Z(
                'draft_badge_desc',
                'text',
                'Aperçu interne avec photographies de terrain et coordonnées GPS réelles (non indexé).',
                undefined,
                'span'
              )}
            </span>
          </div>
        )}

        {/* Section Héro */}
        <section className="bg-[#EFE9DF] border-b border-[#DED5C6] py-16 md:py-24">
          <div className="container max-w-4xl">
            <p className="text-xs uppercase tracking-[0.2em] text-eucalyptus font-semibold mb-3">
              {Z('hero_badge', 'text', 'Madère — Itinéraire slow travel', undefined, 'span')}
            </p>
            <h1 className="text-4xl md:text-5xl font-serif text-mahogany mb-5">
              {Z('hero_title', 'text', 'Itinéraire Madère 7 jours : entre falaises et villages côtiers', undefined, 'span')}
            </h1>
            <p className="text-charcoal/80 text-lg leading-relaxed mb-6">
              {Z(
                'hero_description',
                'textarea',
                "Un rythme pensé pour respirer : moins d'allers-retours, plus de cohérence entre paysages volcaniques, haltes de terroir et énergie du duo.",
                undefined,
                'span'
              )}
            </p>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-charcoal/70 bg-[#FAF7F2] border border-[#DED5C6] px-4 py-2 rounded-sm">
              <Compass className="w-4 h-4 text-eucalyptus" />
              <span>
                {Z(
                  'hero_meta_badge',
                  'text',
                  '7 étapes vérifiées · 100% terrain · Coordonnées GPS réelles',
                  undefined,
                  'span'
                )}
              </span>
            </div>
          </div>
        </section>

        {/* Liste des étapes */}
        <section className="bg-[#F7F3EC] py-12 md:py-20">
          <div className="container max-w-4xl space-y-10">
            {/* Étape 1 */}
            <article className="rounded-sm border border-[#DED5C6] bg-[#FAF7F2] overflow-hidden shadow-sm hover:border-charcoal/30 transition-colors">
              <div className="relative aspect-[16/10] w-full bg-[#EFE9DF] border-b border-[#DED5C6]">
                <Image
                  src="/images/destinations/madere/itinerary/etape4_funchal_bananeraies.jpg"
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 896px"
                  className="object-cover"
                  priority
                />
                <div className="absolute bottom-3 left-3 bg-[#1A1512]/80 backdrop-blur-sm text-[#FAF7F2] px-3 py-1.5 rounded-sm text-xs flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                  <span className="font-mono tracking-tight">{Z('day_1_gps', 'text', '32.6549° N, 16.9648° O', undefined, 'span')}</span>
                </div>
                <div className="absolute top-3 right-3 bg-[#FAF7F2]/90 backdrop-blur-sm text-charcoal px-2.5 py-1 rounded-sm text-[11px] font-medium border border-[#DED5C6]">
                  {Z('day_1_meta', 'text', 'Funchal (coteaux ouest) · Janvier 2023', undefined, 'span')}
                </div>
              </div>
              <div className="p-6 md:p-8">
                <div className="text-xs uppercase tracking-[0.18em] text-eucalyptus font-semibold mb-2">
                  {Z('day_1_badge', 'text', 'Étape 01', undefined, 'span')}
                </div>
                <h2 className="text-2xl font-serif text-mahogany mb-3">
                  {Z('day_1_title', 'text', 'Jour 1 — Funchal et les bananeraies en terrasses', undefined, 'span')}
                </h2>
                <p className="text-charcoal/80 leading-relaxed text-base">
                  {Z(
                    'day_1_content',
                    'textarea',
                    "Arrivée à Funchal et prise en main du véhicule. On s'éloigne de la voie rapide pour gravir les flancs ouest : les bananeraies s'étagent en terrasses sous les viaducs suspendus. Première halte sans hâte pour s'imprégner de l'air atlantique et du relief escarpé de l'île.",
                    undefined,
                    'span'
                  )}
                </p>
              </div>
            </article>

            {/* Étape 2 */}
            <article className="rounded-sm border border-[#DED5C6] bg-[#FAF7F2] overflow-hidden shadow-sm hover:border-charcoal/30 transition-colors">
              <div className="relative aspect-[16/10] w-full bg-[#EFE9DF] border-b border-[#DED5C6]">
                <Image
                  src="/images/destinations/madere/itinerary/etape5_monte_flore.jpg"
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 896px"
                  className="object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-[#1A1512]/80 backdrop-blur-sm text-[#FAF7F2] px-3 py-1.5 rounded-sm text-xs flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                  <span className="font-mono tracking-tight">{Z('day_2_gps', 'text', '32.6502° N, 16.9643° O', undefined, 'span')}</span>
                </div>
                <div className="absolute top-3 right-3 bg-[#FAF7F2]/90 backdrop-blur-sm text-charcoal px-2.5 py-1 rounded-sm text-[11px] font-medium border border-[#DED5C6]">
                  {Z('day_2_meta', 'text', 'Monte / Hauteurs de Funchal · Janvier 2023', undefined, 'span')}
                </div>
              </div>
              <div className="p-6 md:p-8">
                <div className="text-xs uppercase tracking-[0.18em] text-eucalyptus font-semibold mb-2">
                  {Z('day_2_badge', 'text', 'Étape 02', undefined, 'span')}
                </div>
                <h2 className="text-2xl font-serif text-mahogany mb-3">
                  {Z('day_2_title', 'text', "Jour 2 — Jardins d'altitude et flore subtropicale à Monte", undefined, 'span')}
                </h2>
                <p className="text-charcoal/80 leading-relaxed text-base">
                  {Z(
                    'day_2_content',
                    'textarea',
                    "Montée vers les hauteurs de Monte. Loin des cabines de téléphérique, on arpente les sentiers de fougères arborescentes et d'essences subtropicales. Les cœurs d'ananas et de protées s'épanouissent à ciel ouvert dans l'humus volcanique noir et humide.",
                    undefined,
                    'span'
                  )}
                </p>
              </div>
            </article>

            {/* Étape 3 */}
            <article className="rounded-sm border border-[#DED5C6] bg-[#FAF7F2] overflow-hidden shadow-sm hover:border-charcoal/30 transition-colors">
              <div className="relative aspect-[16/10] w-full bg-[#EFE9DF] border-b border-[#DED5C6]">
                <Image
                  src="/images/destinations/madere/itinerary/etape1_ponta_lourenco.jpg"
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 896px"
                  className="object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-[#1A1512]/80 backdrop-blur-sm text-[#FAF7F2] px-3 py-1.5 rounded-sm text-xs flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                  <span className="font-mono tracking-tight">{Z('day_3_gps', 'text', '32.7437° N, 16.7164° O', undefined, 'span')}</span>
                </div>
                <div className="absolute top-3 right-3 bg-[#FAF7F2]/90 backdrop-blur-sm text-charcoal px-2.5 py-1 rounded-sm text-[11px] font-medium border border-[#DED5C6]">
                  {Z('day_3_meta', 'text', 'Ponta de São Lourenço / Caniçal · Janvier 2023', undefined, 'span')}
                </div>
              </div>
              <div className="p-6 md:p-8">
                <div className="text-xs uppercase tracking-[0.18em] text-eucalyptus font-semibold mb-2">
                  {Z('day_3_badge', 'text', 'Étape 03', undefined, 'span')}
                </div>
                <h2 className="text-2xl font-serif text-mahogany mb-3">
                  {Z('day_3_title', 'text', 'Jour 3 — Crête basaltique de Ponta de São Lourenço & Caniçal', undefined, 'span')}
                </h2>
                <p className="text-charcoal/80 leading-relaxed text-base">
                  {Z(
                    'day_3_content',
                    'textarea',
                    "À l'extrémité orientale de Madère, les forêts touffues cèdent la place à une terre rouge semi-aride sculptée par les vagues. On part de bonne heure pour parcourir la crête minérale avant le lever des vents. La roche volcanique plonge à pic dans une eau d'une pureté saisissante.",
                    undefined,
                    'span'
                  )}
                </p>
              </div>
            </article>

            {/* Étape 4 */}
            <article className="rounded-sm border border-[#DED5C6] bg-[#FAF7F2] overflow-hidden shadow-sm hover:border-charcoal/30 transition-colors">
              <div className="relative aspect-[16/10] w-full bg-[#EFE9DF] border-b border-[#DED5C6]">
                <Image
                  src="/images/destinations/madere/itinerary/etape2_canico_terrasses.jpg"
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 896px"
                  className="object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-[#1A1512]/80 backdrop-blur-sm text-[#FAF7F2] px-3 py-1.5 rounded-sm text-xs flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                  <span className="font-mono tracking-tight">{Z('day_4_gps', 'text', '32.6436° N, 16.8319° O', undefined, 'span')}</span>
                </div>
                <div className="absolute top-3 right-3 bg-[#FAF7F2]/90 backdrop-blur-sm text-charcoal px-2.5 py-1 rounded-sm text-[11px] font-medium border border-[#DED5C6]">
                  {Z('day_4_meta', 'text', 'Caniço de Baixo · Janvier 2023', undefined, 'span')}
                </div>
              </div>
              <div className="p-6 md:p-8">
                <div className="text-xs uppercase tracking-[0.18em] text-eucalyptus font-semibold mb-2">
                  {Z('day_4_badge', 'text', 'Étape 04', undefined, 'span')}
                </div>
                <h2 className="text-2xl font-serif text-mahogany mb-3">
                  {Z('day_4_title', 'text', 'Jour 4 — Caniço de Baixo et côte sud en gradins', undefined, 'span')}
                </h2>
                <p className="text-charcoal/80 leading-relaxed text-base">
                  {Z(
                    'day_4_content',
                    'textarea',
                    "Descente par les lacets vers Caniço de Baixo. Les maisons blanches aux tuiles patinées épousent la pente jusqu'aux rochers noirs. On s'installe face au large pour écouter le ressac, à l'écart des grands complexes de villégiature.",
                    undefined,
                    'span'
                  )}
                </p>
              </div>
            </article>

            {/* Étape 5 */}
            <article className="rounded-sm border border-[#DED5C6] bg-[#FAF7F2] overflow-hidden shadow-sm hover:border-charcoal/30 transition-colors">
              <div className="relative aspect-[16/10] w-full bg-[#EFE9DF] border-b border-[#DED5C6]">
                <Image
                  src="/images/destinations/madere/itinerary/etape3_terroir_canico.jpg"
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 896px"
                  className="object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-[#1A1512]/80 backdrop-blur-sm text-[#FAF7F2] px-3 py-1.5 rounded-sm text-xs flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                  <span className="font-mono tracking-tight">{Z('day_5_gps', 'text', '32.6514° N, 16.8475° O', undefined, 'span')}</span>
                </div>
                <div className="absolute top-3 right-3 bg-[#FAF7F2]/90 backdrop-blur-sm text-charcoal px-2.5 py-1 rounded-sm text-[11px] font-medium border border-[#DED5C6]">
                  {Z('day_5_meta', 'text', 'Caniço / Terroir local · Janvier 2023', undefined, 'span')}
                </div>
              </div>
              <div className="p-6 md:p-8">
                <div className="text-xs uppercase tracking-[0.18em] text-eucalyptus font-semibold mb-2">
                  {Z('day_5_badge', 'text', 'Étape 05', undefined, 'span')}
                </div>
                <h2 className="text-2xl font-serif text-mahogany mb-3">
                  {Z('day_5_title', 'text', 'Jour 5 — Terroir madérien et cuisine paysanne', undefined, 'span')}
                </h2>
                <p className="text-charcoal/80 leading-relaxed text-base">
                  {Z(
                    'day_5_content',
                    'textarea',
                    "Halte de midi dans une table de village. On partage la traditionnelle carne de vinha d'alhos marinée au vin et à l'ail, mijotée en pot de terre cuite, servie avec des cubes dorés de milho frito. Une cuisine paysanne franche, généreuse et sans apprêt.",
                    undefined,
                    'span'
                  )}
                </p>
              </div>
            </article>

            {/* Étape 6 */}
            <article className="rounded-sm border border-[#DED5C6] bg-[#FAF7F2] overflow-hidden shadow-sm hover:border-charcoal/30 transition-colors">
              <div className="relative aspect-[16/10] w-full bg-[#EFE9DF] border-b border-[#DED5C6]">
                <Image
                  src="/images/destinations/madere/itinerary/etape6_santa_cruz_ruelles.jpg"
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 896px"
                  className="object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-[#1A1512]/80 backdrop-blur-sm text-[#FAF7F2] px-3 py-1.5 rounded-sm text-xs flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                  <span className="font-mono tracking-tight">{Z('day_6_gps', 'text', '32.6435° N, 16.8317° O', undefined, 'span')}</span>
                </div>
                <div className="absolute top-3 right-3 bg-[#FAF7F2]/90 backdrop-blur-sm text-charcoal px-2.5 py-1 rounded-sm text-[11px] font-medium border border-[#DED5C6]">
                  {Z('day_6_meta', 'text', 'Santa Cruz · Janvier 2023', undefined, 'span')}
                </div>
              </div>
              <div className="p-6 md:p-8">
                <div className="text-xs uppercase tracking-[0.18em] text-eucalyptus font-semibold mb-2">
                  {Z('day_6_badge', 'text', 'Étape 06', undefined, 'span')}
                </div>
                <h2 className="text-2xl font-serif text-mahogany mb-3">
                  {Z('day_6_title', 'text', 'Jour 6 — Santa Cruz et douceur des ruelles côtières', undefined, 'span')}
                </h2>
                <p className="text-charcoal/80 leading-relaxed text-base">
                  {Z(
                    'day_6_content',
                    'textarea',
                    "Ruelles pavées bordées d'agaves géants et de façades blanches et bleues. On prend le temps d'une promenade lente vers le rivage de galets de Santa Cruz avant de regarder les barques de pêche rentrer au mouillage.",
                    undefined,
                    'span'
                  )}
                </p>
              </div>
            </article>

            {/* Étape 7 */}
            <article className="rounded-sm border border-[#DED5C6] bg-[#FAF7F2] overflow-hidden shadow-sm hover:border-charcoal/30 transition-colors">
              <div className="relative aspect-[16/10] w-full bg-[#EFE9DF] border-b border-[#DED5C6]">
                <Image
                  src="/images/destinations/madere/itinerary/etape7_cabo_girao_faja.jpg"
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 896px"
                  className="object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-[#1A1512]/80 backdrop-blur-sm text-[#FAF7F2] px-3 py-1.5 rounded-sm text-xs flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                  <span className="font-mono tracking-tight">{Z('day_7_gps', 'text', '32.6567° N, 17.0216° O', undefined, 'span')}</span>
                </div>
                <div className="absolute top-3 right-3 bg-[#FAF7F2]/90 backdrop-blur-sm text-charcoal px-2.5 py-1 rounded-sm text-[11px] font-medium border border-[#DED5C6]">
                  {Z('day_7_meta', 'text', 'Cabo Girão / Fajã dos Padres · Juin 2019', undefined, 'span')}
                </div>
              </div>
              <div className="p-6 md:p-8">
                <div className="text-xs uppercase tracking-[0.18em] text-eucalyptus font-semibold mb-2">
                  {Z('day_7_badge', 'text', 'Étape 07', undefined, 'span')}
                </div>
                <h2 className="text-2xl font-serif text-mahogany mb-3">
                  {Z('day_7_title', 'text', 'Jour 7 — Falaises de Cabo Girão & Fajã dos Padres vers Ribeira Brava', undefined, 'span')}
                </h2>
                <p className="text-charcoal/80 leading-relaxed text-base">
                  {Z(
                    'day_7_content',
                    'textarea',
                    "Dénouement vertical sur la côte sud-ouest : le promontoire vertigineux s'enfonce à plus de 500 mètres vers les lopins cultivés de la Fajã dos Padres, desservis uniquement par câble ou par mer. Un point final saisissant pour ce carnet d'itinéraire.",
                    undefined,
                    'span'
                  )}
                </p>
              </div>
            </article>
          </div>
        </section>

        {/* Conseils de terrain */}
        <section className="bg-[#EFE9DF] py-14 border-y border-[#DED5C6]">
          <div className="container max-w-4xl grid md:grid-cols-2 gap-6">
            <article className="rounded-sm border border-[#DED5C6] p-6 bg-[#FAF7F2]">
              <p className="text-xs uppercase tracking-[0.15em] text-eucalyptus font-semibold mb-2">
                {Z('conseil_1_title', 'text', 'Conseil rythme', undefined, 'span')}
              </p>
              <p className="text-charcoal/80 leading-relaxed">
                {Z(
                  'conseil_1_text',
                  'textarea',
                  "Ne surcharge pas les premières journées. Les dénivelés et les routes en lacets de Madère demandent de l'attention : deux haltes choisies par jour suffisent largement.",
                  undefined,
                  'span'
                )}
              </p>
            </article>
            <article className="rounded-sm border border-[#DED5C6] p-6 bg-[#FAF7F2]">
              <p className="text-xs uppercase tracking-[0.15em] text-eucalyptus font-semibold mb-2">
                {Z('conseil_2_title', 'text', 'Conseil météo & souplesse', undefined, 'span')}
              </p>
              <p className="text-charcoal/80 leading-relaxed">
                {Z(
                  'conseil_2_text',
                  'textarea',
                  "Madère abrite des dizaines de microclimats. Si les nuages couvrent le relief central ou les hauteurs de Monte, inverse la journée vers la côte sud ou Ponta de São Lourenço où le ciel reste dégagé.",
                  undefined,
                  'span'
                )}
              </p>
            </article>
          </div>
        </section>

        {/* Bloc d'appel sur-mesure */}
        <section className="bg-[#2A1D18] text-[#F7F3EC] py-16">
          <div className="container max-w-3xl text-center">
            <h2 className="text-3xl md:text-4xl font-serif mb-4 text-[#FAF7F2]">
              {Z('cta_title', 'text', 'Besoin de la version sur mesure de cet itinéraire ?', undefined, 'span')}
            </h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto leading-relaxed">
              {Z(
                'cta_text',
                'textarea',
                'On ajuste ce cadre selon ta saison, ton véhicule et le rythme de ton séjour.',
                undefined,
                'span'
              )}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/travel-planning-form?destination=madere"
                className="px-7 py-3 rounded-sm bg-action text-[#FAF7F2] text-xs uppercase tracking-[0.16em] font-medium hover:bg-action-fonce transition-colors"
              >
                {Z('cta_btn_itinerary', 'text', 'Construire mon itinéraire', undefined, 'span')}
              </Link>
              <Link
                href="/destinations/madere"
                className="px-7 py-3 rounded-sm border border-[#E6DEC8]/40 text-xs uppercase tracking-[0.16em] font-medium hover:border-[#FAF7F2] transition-colors"
              >
                {Z('cta_btn_guide', 'text', '← Retour au guide Madère', undefined, 'span')}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </InlineEditProvider>
  );
}

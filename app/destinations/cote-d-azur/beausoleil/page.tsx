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
const PAGE = 'destinations-cote-d-azur-beausoleil';

const metadata: Metadata = {
  title: 'Beausoleil & la Riviera en couple : notre itinéraire slow travel | Heldonica',
  description:
    'Des ruelles en escalier de Beausoleil aux criques paisibles du littoral : notre itinéraire slow travel testé en couple. Balcons Belle Époque, points de vue et coordonnées GPS réelles.',
  alternates: {
    canonical: `${SITE_URL}/destinations/cote-d-azur/beausoleil`,
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('destinations-cote-d-azur-beausoleil', metadata);
}

interface Props {
  searchParams?: Promise<{ preview?: string }>;
}

export default async function BeausoleilPage({ searchParams }: Props) {
  const sp = searchParams ? await searchParams : {};
  const isPreview = sp.preview === 'draft' || sp.preview === 'true';
  const zones = await getPageZones(PAGE);

  // Mode brouillon sécurisé : tant que la page figure dans lib/unpublished-pages.ts,
  // le visiteur public voit la page « Bientôt ». L'accès aperçu se fait via ?preview=draft.
  if (!isPreview && isUnpublishedCmsPage(PAGE)) {
    return (
      <ComingSoonDestination
        slug="cote-d-azur-beausoleil"
        title={zones.title || 'Beausoleil'}
        country="France"
        hero_unsplash_url="/og-default.jpg"
        zones={zones}
      />
    );
  }

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

      <main className="bg-[#FAF7F2] text-charcoal">
        {/* Bandeau d'avertissement mode brouillon */}
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

        {/* Hero */}
        <section className="relative py-20 md:py-28 bg-[#F4EFE6] border-b border-[#DED5C6]">
          <div className="container max-w-4xl">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-eucalyptus font-semibold mb-4">
              <Compass className="w-4 h-4" />
              {Z('hero_kicker', 'text', "Côte d'Azur · Alpes-Maritimes · Slow Travel", undefined, 'span')}
            </div>

            <h1 className="text-4xl md:text-6xl font-serif text-mahogany font-normal leading-[1.1] mb-6">
              {Z(
                'hero_title',
                'text',
                'Beausoleil en balcon sur la Méditerranée',
                undefined,
                'span'
              )}
            </h1>

            <p className="text-lg md:text-xl text-charcoal/85 leading-relaxed font-sans max-w-2xl mb-8">
              {Z(
                'hero_chapo',
                'textarea',
                "Accrochée aux pentes escarpées du mont des Mules, Beausoleil surplombe le tumulte côtier. On y vient pour ses escaliers étroits, ses façades Belle Époque baignées de lumière matinale et ses sentiers secrets menant vers la mer.",
                undefined,
                'span'
              )}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-xs text-charcoal/70 border-t border-[#DED5C6] pt-6">
              <div>
                <span className="font-semibold text-charcoal">
                  {Z('meta_duration_label', 'text', 'Durée suggérée :', undefined, 'span')}
                </span>{' '}
                {Z('meta_duration', 'text', '2 à 3 jours à pied', undefined, 'span')}
              </div>
              <div>
                <span className="font-semibold text-charcoal">
                  {Z('meta_season_label', 'text', 'Période vécue :', undefined, 'span')}
                </span>{' '}
                {Z('meta_season', 'text', 'Novembre (douceur & ruelles calmes)', undefined, 'span')}
              </div>
              <div>
                <span className="font-semibold text-charcoal">
                  {Z('meta_rythme_label', 'text', 'Rythme :', undefined, 'span')}
                </span>{' '}
                {Z('meta_rythme', 'text', 'Escaliers, belvédères & brise marine', undefined, 'span')}
              </div>
            </div>
          </div>
        </section>

        {/* Repères terrain */}
        <section className="py-12 bg-[#FAF7F2] border-b border-[#DED5C6]">
          <div className="container max-w-4xl">
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="p-5 rounded-sm bg-[#F4EFE6] border border-[#E6DEC8]">
                <p className="font-serif text-base text-mahogany mb-1 font-semibold">
                  {Z('repaire_1_title', 'text', 'Dénivelé piéton', undefined, 'span')}
                </p>
                <p className="text-charcoal/80 text-xs leading-relaxed">
                  {Z(
                    'repaire_1_desc',
                    'textarea',
                    "Entre la haute ville et le niveau de la mer, des centaines de marches et plusieurs ascenseurs publics gratuits permettent de circuler sans voiture.",
                    undefined,
                    'span'
                  )}
                </p>
              </div>

              <div className="p-5 rounded-sm bg-[#F4EFE6] border border-[#E6DEC8]">
                <p className="font-serif text-base text-mahogany mb-1 font-semibold">
                  {Z('repaire_2_title', 'text', 'Microclimat abrité', undefined, 'span')}
                </p>
                <p className="text-charcoal/80 text-xs leading-relaxed">
                  {Z(
                    'repaire_2_desc',
                    'textarea',
                    'Protégée des vents du nord par le massif de La Turbie, la colline conserve une douceur remarquable même au cœur du mois de novembre.',
                    undefined,
                    'span'
                  )}
                </p>
              </div>

              <div className="p-5 rounded-sm bg-[#F4EFE6] border border-[#E6DEC8]">
                <p className="font-serif text-base text-mahogany mb-1 font-semibold">
                  {Z('repaire_3_title', 'text', 'Patrimoine architectural', undefined, 'span')}
                </p>
                <p className="text-charcoal/80 text-xs leading-relaxed">
                  {Z(
                    'repaire_3_desc',
                    'textarea',
                    'Villas Riviera Palace, verrières Gustave Eiffel et orangers de plein vent forment un décor préservé du tourisme de masse.',
                    undefined,
                    'span'
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Les 6 Étapes de l'itinéraire */}
        <section className="py-16 md:py-24">
          <div className="container max-w-4xl space-y-20">
            {/* Étape 1 */}
            <article className="bg-[#FAF7F2] rounded-sm border border-[#DED5C6] overflow-hidden">
              <div className="relative aspect-[4/3] md:aspect-[16/10] w-full bg-[#EFE9DF]">
                <Image
                  src="/images/destinations/cote-d-azur/beausoleil/etape1_beausoleil_oranger.jpg"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 896px"
                />
                <div className="absolute bottom-3 left-3 bg-[#2A1D18]/85 text-[#F7F3EC] px-3 py-1.5 rounded-sm text-xs font-mono flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                  <span>
                    {Z('stage_1_gps', 'text', '43.7471° N, 7.4302° E · Beausoleil', undefined, 'span')}
                  </span>
                </div>
              </div>
              <div className="p-6 md:p-8">
                <div className="text-xs uppercase tracking-[0.18em] text-eucalyptus font-semibold mb-2">
                  {Z('stage_1_badge', 'text', 'Étape 01', undefined, 'span')}
                </div>
                <h2 className="text-2xl font-serif text-mahogany mb-3">
                  {Z(
                    'stage_1_title',
                    'text',
                    'Les ruelles hautes & les orangers de Beausoleil',
                    undefined,
                    'span'
                  )}
                </h2>
                <p className="text-charcoal/80 leading-relaxed text-base">
                  {Z(
                    'stage_1_content',
                    'textarea',
                    "Au petit matin, quand la lumière effleure les façades ocre et pastel, Beausoleil s'éveille sans hâte. Les orangers sauvages chargés de fruits ponctuent les artères calmes. Loin du tumulte du littoral, on prend le temps de remonter les traverses piétonnes bordées de ferronneries ouvragées.",
                    undefined,
                    'span'
                  )}
                </p>
              </div>
            </article>

            {/* Étape 2 */}
            <article className="bg-[#FAF7F2] rounded-sm border border-[#DED5C6] overflow-hidden">
              <div className="relative aspect-[4/3] md:aspect-[16/10] w-full bg-[#EFE9DF]">
                <Image
                  src="/images/destinations/cote-d-azur/beausoleil/etape2_larvotto_terrasse.jpg"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 896px"
                />
                <div className="absolute bottom-3 left-3 bg-[#2A1D18]/85 text-[#F7F3EC] px-3 py-1.5 rounded-sm text-xs font-mono flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                  <span>
                    {Z('stage_2_gps', 'text', '43.7459° N, 7.4325° E · Terrasses du littoral', undefined, 'span')}
                  </span>
                </div>
              </div>
              <div className="p-6 md:p-8">
                <div className="text-xs uppercase tracking-[0.18em] text-eucalyptus font-semibold mb-2">
                  {Z('stage_2_badge', 'text', 'Étape 02', undefined, 'span')}
                </div>
                <h2 className="text-2xl font-serif text-mahogany mb-3">
                  {Z(
                    'stage_2_title',
                    'text',
                    'Descente vers la crique entre pins et eucalyptus',
                    undefined,
                    'span'
                  )}
                </h2>
                <p className="text-charcoal/80 leading-relaxed text-base">
                  {Z(
                    'stage_2_content',
                    'textarea',
                    "En descendant par les rampes végétalisées qui relient la commune à la mer, le parfum des eucalyptus et des pins maritimes prend le dessus. L'eau translucide de la baie se révèle entre les branchages, paisible et d'un bleu franc sous la clarté d'automne.",
                    undefined,
                    'span'
                  )}
                </p>
              </div>
            </article>

            {/* Étape 3 */}
            <article className="bg-[#FAF7F2] rounded-sm border border-[#DED5C6] overflow-hidden">
              <div className="relative aspect-[4/3] md:aspect-[16/10] w-full bg-[#EFE9DF]">
                <Image
                  src="/images/destinations/cote-d-azur/beausoleil/etape3_larvotto_crepuscule.jpg"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 896px"
                />
                <div className="absolute bottom-3 left-3 bg-[#2A1D18]/85 text-[#F7F3EC] px-3 py-1.5 rounded-sm text-xs font-mono flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                  <span>
                    {Z('stage_3_gps', 'text', '43.7463° N, 7.4324° E · Anse du Larvotto', undefined, 'span')}
                  </span>
                </div>
              </div>
              <div className="p-6 md:p-8">
                <div className="text-xs uppercase tracking-[0.18em] text-eucalyptus font-semibold mb-2">
                  {Z('stage_3_badge', 'text', 'Étape 03', undefined, 'span')}
                </div>
                <h2 className="text-2xl font-serif text-mahogany mb-3">
                  {Z(
                    'stage_3_title',
                    'text',
                    'La plage déserte & le ressac sous la falaise',
                    undefined,
                    'span'
                  )}
                </h2>
                <p className="text-charcoal/80 leading-relaxed text-base">
                  {Z(
                    'stage_3_content',
                    'textarea',
                    "Hors de la saison estivale, l'anse retrouve sa quiétude minérale. Les transats ont disparu, laissant la grève au seul va-et-vient des vagues. Les falaises calcaires en arrière-plan arrêtent les rafales et renvoient la tiédeur accumulée durant le jour.",
                    undefined,
                    'span'
                  )}
                </p>
              </div>
            </article>

            {/* Étape 4 */}
            <article className="bg-[#FAF7F2] rounded-sm border border-[#DED5C6] overflow-hidden">
              <div className="relative aspect-[4/3] md:aspect-[16/10] w-full bg-[#EFE9DF]">
                <Image
                  src="/images/destinations/cote-d-azur/beausoleil/etape4_cote_sunset.jpg"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 896px"
                />
                <div className="absolute bottom-3 left-3 bg-[#2A1D18]/85 text-[#F7F3EC] px-3 py-1.5 rounded-sm text-xs font-mono flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                  <span>
                    {Z('stage_4_gps', 'text', '43.7475° N, 7.4353° E · Sentier du littoral', undefined, 'span')}
                  </span>
                </div>
              </div>
              <div className="p-6 md:p-8">
                <div className="text-xs uppercase tracking-[0.18em] text-eucalyptus font-semibold mb-2">
                  {Z('stage_4_badge', 'text', 'Étape 04', undefined, 'span')}
                </div>
                <h2 className="text-2xl font-serif text-mahogany mb-3">
                  {Z(
                    'stage_4_title',
                    'text',
                    'Crépuscule pourpre le long de la digue',
                    undefined,
                    'span'
                  )}
                </h2>
                <p className="text-charcoal/80 leading-relaxed text-base">
                  {Z(
                    'stage_4_content',
                    'textarea',
                    "Le ciel bascule dans des nuances de violet et de rose profond. Le long de la digue marine, les silhouettes contemporaines et les rampes éclairées dessinent des lignes épurées qui contrastent avec l'immensité sombre de la Méditerranée.",
                    undefined,
                    'span'
                  )}
                </p>
              </div>
            </article>

            {/* Étape 5 */}
            <article className="bg-[#FAF7F2] rounded-sm border border-[#DED5C6] overflow-hidden">
              <div className="relative aspect-[3/4] md:aspect-[16/10] w-full bg-[#EFE9DF]">
                <Image
                  src="/images/destinations/cote-d-azur/beausoleil/etape5_monaco_palmiers.jpg"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 896px"
                />
                <div className="absolute bottom-3 left-3 bg-[#2A1D18]/85 text-[#F7F3EC] px-3 py-1.5 rounded-sm text-xs font-mono flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                  <span>
                    {Z('stage_5_gps', 'text', '43.7394° N, 7.4275° E · Place du Casino', undefined, 'span')}
                  </span>
                </div>
              </div>
              <div className="p-6 md:p-8">
                <div className="text-xs uppercase tracking-[0.18em] text-eucalyptus font-semibold mb-2">
                  {Z('stage_5_badge', 'text', 'Étape 05', undefined, 'span')}
                </div>
                <h2 className="text-2xl font-serif text-mahogany mb-3">
                  {Z(
                    'stage_5_title',
                    'text',
                    'Lueurs nocturnes sous les palmiers de la place',
                    undefined,
                    'span'
                  )}
                </h2>
                <p className="text-charcoal/80 leading-relaxed text-base">
                  {Z(
                    'stage_5_content',
                    'textarea',
                    "À la nuit tombée, les grandes terrasses sous les palmiers s'illuminent d'une douce lueur dorée. L'agitation de la journée retombe, laissant place à une atmosphère feutrée propice à la marche lente le long des parterres exotiques.",
                    undefined,
                    'span'
                  )}
                </p>
              </div>
            </article>

            {/* Étape 6 */}
            <article className="bg-[#FAF7F2] rounded-sm border border-[#DED5C6] overflow-hidden">
              <div className="relative aspect-[4/3] md:aspect-[16/10] w-full bg-[#EFE9DF]">
                <Image
                  src="/images/destinations/cote-d-azur/beausoleil/etape6_port_reflets.jpg"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 896px"
                />
                <div className="absolute bottom-3 left-3 bg-[#2A1D18]/85 text-[#F7F3EC] px-3 py-1.5 rounded-sm text-xs font-mono flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                  <span>
                    {Z('stage_6_gps', 'text', '43.7370° N, 7.4247° E · Port Hercule', undefined, 'span')}
                  </span>
                </div>
              </div>
              <div className="p-6 md:p-8">
                <div className="text-xs uppercase tracking-[0.18em] text-eucalyptus font-semibold mb-2">
                  {Z('stage_6_badge', 'text', 'Étape 06', undefined, 'span')}
                </div>
                <h2 className="text-2xl font-serif text-mahogany mb-3">
                  {Z(
                    'stage_6_title',
                    'text',
                    'Nuit sur le port & clapotis des amarres',
                    undefined,
                    'span'
                  )}
                </h2>
                <p className="text-charcoal/80 leading-relaxed text-base">
                  {Z(
                    'stage_6_content',
                    'textarea',
                    "La marche se termine sur le quai paisible. L'eau noire du bassin reflète les collines illuminées et les feux de navigation. Dans l'air frais marin, seul le tintement discret des haubans accompagne la fin de soirée.",
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
                {Z('conseil_1_title', 'text', 'Mobilité douce & escaliers', undefined, 'span')}
              </p>
              <p className="text-charcoal/80 leading-relaxed">
                {Z(
                  'conseil_1_text',
                  'textarea',
                  "Oublie la voiture : le stationnement est complexe et les liaisons piétonnes sont remarquables. Emprunte les escaliers de traverse et les ascenseurs publics pour circuler facilement de haut en bas.",
                  undefined,
                  'span'
                )}
              </p>
            </article>
            <article className="rounded-sm border border-[#DED5C6] p-6 bg-[#FAF7F2]">
              <p className="text-xs uppercase tracking-[0.15em] text-eucalyptus font-semibold mb-2">
                {Z('conseil_2_title', 'text', 'Horaires & lumière dorée', undefined, 'span')}
              </p>
              <p className="text-charcoal/80 leading-relaxed">
                {Z(
                  'conseil_2_text',
                  'textarea',
                  "La fin d'après-midi en automne offre une luminosité rasante exceptionnelle sur les façades pastel. C'est le meilleur moment pour descendre vers la mer sans souffrir de la chaleur.",
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
              {Z(
                'cta_title',
                'text',
                'Envie de découvrir la Riviera hors saison ?',
                undefined,
                'span'
              )}
            </h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto leading-relaxed">
              {Z(
                'cta_text',
                'textarea',
                "On t'aide à concevoir un séjour doux entre belvédères secrets, villages perchés et sentiers côtiers préservés.",
                undefined,
                'span'
              )}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/travel-planning-form?destination=cote-d-azur"
                className="px-7 py-3 rounded-sm bg-action text-[#FAF7F2] text-xs uppercase tracking-[0.16em] font-medium hover:bg-action-fonce transition-colors"
              >
                {Z('cta_btn_planning', 'text', 'Construire mon itinéraire', undefined, 'span')}
              </Link>
              <Link
                href="/destinations"
                className="px-7 py-3 rounded-sm border border-[#E6DEC8]/40 text-xs uppercase tracking-[0.16em] font-medium hover:border-[#FAF7F2] transition-colors"
              >
                {Z('cta_btn_destinations', 'text', '← Toutes les destinations', undefined, 'span')}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </InlineEditProvider>
  );
}

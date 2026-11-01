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
const PAGE = 'destinations-savoie-aillon-le-jeune';

const metadata: Metadata = {
  title: 'Aillon-le-Jeune & les Bauges en couple : notre itinéraire slow travel | Heldonica',
  description:
    'Au cœur du massif des Bauges sous la neige : notre carnet slow travel testé en couple. Toits de tavaillons, forêts de sapins du Margériaz et coordonnées GPS réelles.',
  alternates: {
    canonical: `${SITE_URL}/destinations/savoie/aillon-le-jeune`,
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('destinations-savoie-aillon-le-jeune', metadata);
}

interface Props {
  searchParams?: Promise<{ preview?: string }>;
}

export default async function AillonLeJeunePage({ searchParams }: Props) {
  const sp = searchParams ? await searchParams : {};
  const isPreview = sp.preview === 'draft' || sp.preview === 'true';
  const zones = await getPageZones(PAGE);

  // Mode brouillon sécurisé : tant que la page figure dans lib/unpublished-pages.ts,
  // le visiteur public voit la page « Bientôt ». L'accès aperçu se fait via ?preview=draft.
  if (!isPreview && isUnpublishedCmsPage(PAGE)) {
    return (
      <ComingSoonDestination
        slug="savoie-aillon-le-jeune"
        title={zones.title || 'Aillon-le-Jeune'}
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
              {Z('hero_kicker', 'text', 'Savoie · Massif des Bauges · Slow Travel Hivernal', undefined, 'span')}
            </div>

            <h1 className="text-4xl md:text-6xl font-serif text-mahogany font-normal leading-[1.1] mb-6">
              {Z(
                'hero_title',
                'text',
                'Aillon-le-Jeune : le silence ouaté des Bauges',
                undefined,
                'span'
              )}
            </h1>

            <p className="text-lg md:text-xl text-charcoal/85 leading-relaxed font-sans max-w-2xl mb-8">
              {Z(
                'hero_chapo',
                'textarea',
                "Niché dans le vallon préservé des Bauges, Aillon-le-Jeune offre une parenthèse loin des usines à ski. Ici, la neige étouffe les bruits, le clocher rythme la journée et les forêts d'épicéas montent à l'assaut du Margériaz.",
                undefined,
                'span'
              )}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-xs text-charcoal/70 border-t border-[#DED5C6] pt-6">
              <div>
                <span className="font-semibold text-charcoal">
                  {Z('meta_duration_label', 'text', 'Durée suggérée :', undefined, 'span')}
                </span>{' '}
                {Z('meta_duration', 'text', '3 à 4 jours en hiver', undefined, 'span')}
              </div>
              <div>
                <span className="font-semibold text-charcoal">
                  {Z('meta_season_label', 'text', 'Période vécue :', undefined, 'span')}
                </span>{' '}
                {Z('meta_season', 'text', 'Février (manteau neigeux & calme)', undefined, 'span')}
              </div>
              <div>
                <span className="font-semibold text-charcoal">
                  {Z('meta_rythme_label', 'text', 'Rythme :', undefined, 'span')}
                </span>{' '}
                {Z('meta_rythme', 'text', 'Raquettes, feu de bois & contemplation', undefined, 'span')}
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
                  {Z('repaire_1_title', 'text', 'Vallon préservé', undefined, 'span')}
                </p>
                <p className="text-charcoal/80 text-xs leading-relaxed">
                  {Z(
                    'repaire_1_desc',
                    'textarea',
                    "Enclave naturelle au cœur du parc naturel régional des Bauges, le village a su préserver son bâti paysan traditionnel et sa fromagerie de tome.",
                    undefined,
                    'span'
                  )}
                </p>
              </div>

              <div className="p-5 rounded-sm bg-[#F4EFE6] border border-[#E6DEC8]">
                <p className="font-serif text-base text-mahogany mb-1 font-semibold">
                  {Z('repaire_2_title', 'text', 'Neige & microclimat', undefined, 'span')}
                </p>
                <p className="text-charcoal/80 text-xs leading-relaxed">
                  {Z(
                    'repaire_2_desc',
                    'textarea',
                    "Le relief calcaire retient l'air froid dans le vallon, assurant une belle couche de neige fraîche propice aux sorties raquettes en lisière.",
                    undefined,
                    'span'
                  )}
                </p>
              </div>

              <div className="p-5 rounded-sm bg-[#F4EFE6] border border-[#E6DEC8]">
                <p className="font-serif text-base text-mahogany mb-1 font-semibold">
                  {Z('repaire_3_title', 'text', 'Artisanat & bois', undefined, 'span')}
                </p>
                <p className="text-charcoal/80 text-xs leading-relaxed">
                  {Z(
                    'repaire_3_desc',
                    'textarea',
                    "Chaque ferme conserve son bûcher d'affouage méticuleusement empilé pour l'hiver, symbole d'une vie montagnarde sobre et enracinée.",
                    undefined,
                    'span'
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Les 4 Étapes de l'itinéraire */}
        <section className="py-16 md:py-24">
          <div className="container max-w-4xl space-y-20">
            {/* Étape 1 */}
            <article className="bg-[#FAF7F2] rounded-sm border border-[#DED5C6] overflow-hidden">
              <div className="relative aspect-[16/10] w-full bg-[#EFE9DF]">
                <Image
                  src="/images/destinations/savoie/bauges/etape1_aillon_clocher.jpg"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 896px"
                />
                <div className="absolute bottom-3 left-3 bg-[#2A1D18]/85 text-[#F7F3EC] px-3 py-1.5 rounded-sm text-xs font-mono flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                  <span>
                    {Z('stage_1_gps', 'text', '45.6184° N, 6.0814° E · Aillon-le-Jeune', undefined, 'span')}
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
                    'Le bourg sous la neige & la silhouette de l’église',
                    undefined,
                    'span'
                  )}
                </h2>
                <p className="text-charcoal/80 leading-relaxed text-base">
                  {Z(
                    'stage_1_content',
                    'textarea',
                    "Le clocher élancé de l'église d'Aillon émerge au-dessus des toitures blanchies par la nuit. Dans la brume matinale, le silence n'est rompu que par le crissement des pas sur le chemin glacé. Un décor hivernal intemporel où le temps semble s'être arrêté.",
                    undefined,
                    'span'
                  )}
                </p>
              </div>
            </article>

            {/* Étape 2 */}
            <article className="bg-[#FAF7F2] rounded-sm border border-[#DED5C6] overflow-hidden">
              <div className="relative aspect-[16/10] w-full bg-[#EFE9DF]">
                <Image
                  src="/images/destinations/savoie/bauges/etape2_aillon_bois.jpg"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 896px"
                />
                <div className="absolute bottom-3 left-3 bg-[#2A1D18]/85 text-[#F7F3EC] px-3 py-1.5 rounded-sm text-xs font-mono flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                  <span>
                    {Z('stage_2_gps', 'text', '45.6184° N, 6.0814° E · Hameau d’Aillon', undefined, 'span')}
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
                    'L’abri à bois d’affouage & la mémoire paysanne',
                    undefined,
                    'span'
                  )}
                </h2>
                <p className="text-charcoal/80 leading-relaxed text-base">
                  {Z(
                    'stage_2_content',
                    'textarea',
                    "Dans chaque hameau du vallon, le bois de hêtre et d'épicéa est refendu et empilé sous de longs auvents protecteurs. Cette odeur âcre et réconfortante de résine et de feu de cheminée accompagne la traversée des ruelles jusqu'aux granges séculaires.",
                    undefined,
                    'span'
                  )}
                </p>
              </div>
            </article>

            {/* Étape 3 */}
            <article className="bg-[#FAF7F2] rounded-sm border border-[#DED5C6] overflow-hidden">
              <div className="relative aspect-[16/10] w-full bg-[#EFE9DF]">
                <Image
                  src="/images/destinations/savoie/bauges/etape3_aillon_fermes.jpg"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 896px"
                />
                <div className="absolute bottom-3 left-3 bg-[#2A1D18]/85 text-[#F7F3EC] px-3 py-1.5 rounded-sm text-xs font-mono flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                  <span>
                    {Z('stage_3_gps', 'text', '45.6184° N, 6.0814° E · Fermes des Bauges', undefined, 'span')}
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
                    'Vergers endormis & fermes traditionnelles',
                    undefined,
                    'span'
                  )}
                </h2>
                <p className="text-charcoal/80 leading-relaxed text-base">
                  {Z(
                    'stage_3_content',
                    'textarea',
                    "Entre les corps de ferme en tavaillons et les vergers de pommiers ployant sous la poudreuse, le paysage dessine des courbes douces. Loin de l'agitation des grands domaines, on redécouvre la montagne à son rythme naturel.",
                    undefined,
                    'span'
                  )}
                </p>
              </div>
            </article>

            {/* Étape 4 */}
            <article className="bg-[#FAF7F2] rounded-sm border border-[#DED5C6] overflow-hidden">
              <div className="relative aspect-[16/10] w-full bg-[#EFE9DF]">
                <Image
                  src="/images/destinations/savoie/bauges/etape4_margeriaz_foret.jpg"
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 896px"
                />
                <div className="absolute bottom-3 left-3 bg-[#2A1D18]/85 text-[#F7F3EC] px-3 py-1.5 rounded-sm text-xs font-mono flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                  <span>
                    {Z('stage_4_gps', 'text', '45.6080° N, 6.1017° E · Le Margériaz', undefined, 'span')}
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
                    'La forêt de sapins du Margériaz dans la brume',
                    undefined,
                    'span'
                  )}
                </h2>
                <p className="text-charcoal/80 leading-relaxed text-base">
                  {Z(
                    'stage_4_content',
                    'textarea',
                    "En grimpant vers le plateau du Margériaz, les pentes boisées se fondent dans les nuages bas. Les branches lourdes de neige filtrent la lumière. On chemine entre les troncs centenaires dans une atmosphère feutrée et sauvage.",
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
                {Z('conseil_1_title', 'text', 'Équipement & mobilité', undefined, 'span')}
              </p>
              <p className="text-charcoal/80 leading-relaxed">
                {Z(
                  'conseil_1_text',
                  'textarea',
                  "Prévois de bonnes chaussures d'hiver montantes et des raquettes pour explorer les combes sans glisser. La route d'accès depuis Chambéry nécessite des pneus neige obligatoires.",
                  undefined,
                  'span'
                )}
              </p>
            </article>
            <article className="rounded-sm border border-[#DED5C6] p-6 bg-[#FAF7F2]">
              <p className="text-xs uppercase tracking-[0.15em] text-eucalyptus font-semibold mb-2">
                {Z('conseil_2_title', 'text', 'Halte gourmande locale', undefined, 'span')}
              </p>
              <p className="text-charcoal/80 leading-relaxed">
                {Z(
                  'conseil_2_text',
                  'textarea',
                  "Fais un détour par la fruitière d'Aillon pour goûter la Tome des Bauges AOP fermière au lait cru, affinée sur place dans les caves fraîches du village.",
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
                'Envie de vivre la montagne au calme des Bauges ?',
                undefined,
                'span'
              )}
            </h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto leading-relaxed">
              {Z(
                'cta_text',
                'textarea',
                "On t'aide à concevoir un séjour hivernal chaleureux, entre fermes de caractère, randonnées à l'écart des foules et terroirs savoyards.",
                undefined,
                'span'
              )}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/travel-planning-form?destination=savoie"
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

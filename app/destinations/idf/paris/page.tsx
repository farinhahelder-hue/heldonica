import type { Metadata } from 'next';
import Link from 'next/link';
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
const PAGE = 'destinations-idf-paris';

const metadata: Metadata = {
  title: 'Paris secret & le 14e en couple : notre itinéraire slow travel | Heldonica',
  description:
    'Loin des foules de la tour Eiffel : la Petite Ceinture sud, le parc Montsouris, les villas pavées et ruelles d’artistes d’Alésia. Notre itinéraire slow travel testé en couple.',
  alternates: {
    canonical: `${SITE_URL}/destinations/idf/paris`,
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata(PAGE, metadata);
}

interface Props {
  searchParams?: Promise<{ preview?: string }>;
}

export default async function ParisPage({ searchParams }: Props) {
  const sp = searchParams ? await searchParams : {};
  const isPreview = sp.preview === 'draft' || sp.preview === 'true';
  const zones = await getPageZones(PAGE);

  // Mode brouillon sécurisé : tant que la page figure dans lib/unpublished-pages.ts,
  // le visiteur public voit la page « Bientôt ». L'accès aperçu se fait via ?preview=draft.
  if (!isPreview && isUnpublishedCmsPage(PAGE)) {
    return (
      <ComingSoonDestination
        slug="idf-paris"
        title={zones.title || 'Paris'}
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
                'Aperçu interne avec itinéraire de terrain et coordonnées GPS réelles (non indexé).',
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
              {Z('hero_kicker', 'text', 'Paris · 14e Arrondissement & Rive Gauche · Slow Travel', undefined, 'span')}
            </div>

            <h1 className="text-4xl md:text-6xl font-serif text-mahogany font-normal leading-[1.1] mb-6">
              {Z(
                'hero_title',
                'text',
                'Paris autrement : les impasses fleuries & la Petite Ceinture',
                undefined,
                'span'
              )}
            </h1>

            <p className="text-lg md:text-xl text-charcoal/85 leading-relaxed font-sans max-w-2xl mb-8">
              {Z(
                'hero_chapo',
                'textarea',
                "Paris se découvre vraiment quand on s'éloigne des axes majeurs. Dans le sud de la capitale, entre Alésia et Montsouris, les anciennes voies ferrées envahies de lierre, les cours pavées d'artistes et les marchés piétons offrent un refuge apaisant.",
                undefined,
                'span'
              )}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-xs text-charcoal/70 border-t border-[#DED5C6] pt-6">
              <div>
                <span className="font-semibold text-charcoal">
                  {Z('meta_duration_label', 'text', 'Durée suggérée :', undefined, 'span')}
                </span>{' '}
                {Z('meta_duration', 'text', '1 à 2 jours à pied', undefined, 'span')}
              </div>
              <div>
                <span className="font-semibold text-charcoal">
                  {Z('meta_season_label', 'text', 'Période idéale :', undefined, 'span')}
                </span>{' '}
                {Z('meta_season', 'text', 'Automne ou printemps (ruelles calmes)', undefined, 'span')}
              </div>
              <div>
                <span className="font-semibold text-charcoal">
                  {Z('meta_rythme_label', 'text', 'Rythme :', undefined, 'span')}
                </span>{' '}
                {Z('meta_rythme', 'text', 'Flânerie, café de quartier & passages cachés', undefined, 'span')}
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
                  {Z('repaire_1_title', 'text', 'Impasses & villas', undefined, 'span')}
                </p>
                <p className="text-charcoal/80 text-xs leading-relaxed">
                  {Z(
                    'repaire_1_desc',
                    'textarea',
                    "La Villa Hallé, la Cité fleurie et les impasses autour de la rue Didot conservent des maisons ouvrières pavées préservées de la circulation.",
                    undefined,
                    'span'
                  )}
                </p>
              </div>

              <div className="p-5 rounded-sm bg-[#F4EFE6] border border-[#E6DEC8]">
                <p className="font-serif text-base text-mahogany mb-1 font-semibold">
                  {Z('repaire_2_title', 'text', 'Coulée ferroviaire', undefined, 'span')}
                </p>
                <p className="text-charcoal/80 text-xs leading-relaxed">
                  {Z(
                    'repaire_2_desc',
                    'textarea',
                    "La tranchée de la Petite Ceinture du 14e est devenue un corridor écologique où la nature sauvage a repris ses droits sur les rails.",
                    undefined,
                    'span'
                  )}
                </p>
              </div>

              <div className="p-5 rounded-sm bg-[#F4EFE6] border border-[#E6DEC8]">
                <p className="font-serif text-base text-mahogany mb-1 font-semibold">
                  {Z('repaire_3_title', 'text', 'Commerces de bouche', undefined, 'span')}
                </p>
                <p className="text-charcoal/80 text-xs leading-relaxed">
                  {Z(
                    'repaire_3_desc',
                    'textarea',
                    "La rue Daguerre, piétonne et gourmande, regroupe artisans fromagers, boulangeries au levain et bistrots d'habitués.",
                    undefined,
                    'span'
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Les Étapes de l'itinéraire */}
        <section className="py-16 md:py-24">
          <div className="container max-w-4xl space-y-16">
            {/* Étape 1 */}
            <article className="bg-[#FAF7F2] rounded-sm border border-[#DED5C6] p-6 md:p-8">
              <div className="flex items-center justify-between border-b border-[#DED5C6] pb-4 mb-4">
                <div className="text-xs uppercase tracking-[0.18em] text-eucalyptus font-semibold">
                  {Z('stage_1_badge', 'text', 'Étape 01', undefined, 'span')}
                </div>
                <div className="text-xs font-mono text-charcoal/70 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                  <span>{Z('stage_1_gps', 'text', '48.8189° N, 2.3379° E · Montsouris', undefined, 'span')}</span>
                </div>
              </div>
              <h2 className="text-2xl font-serif text-mahogany mb-3">
                {Z(
                  'stage_1_title',
                  'text',
                  'Le vallon anglais du parc Montsouris',
                  undefined,
                  'span'
                )}
              </h2>
              <p className="text-charcoal/80 leading-relaxed text-base">
                {Z(
                  'stage_1_content',
                  'textarea',
                  "Dessiné sous le Second Empire sur d'anciennes carrières, ce parc vallonné offre de grands arbres centenaires et un lac où nagent les hérons. En semaine, les pelouses en pente sont presque silencieuses, rythmées par le passage discret du tramway en lisière.",
                  undefined,
                  'span'
                )}
              </p>
            </article>

            {/* Étape 2 */}
            <article className="bg-[#FAF7F2] rounded-sm border border-[#DED5C6] p-6 md:p-8">
              <div className="flex items-center justify-between border-b border-[#DED5C6] pb-4 mb-4">
                <div className="text-xs uppercase tracking-[0.18em] text-eucalyptus font-semibold">
                  {Z('stage_2_badge', 'text', 'Étape 02', undefined, 'span')}
                </div>
                <div className="text-xs font-mono text-charcoal/70 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                  <span>{Z('stage_2_gps', 'text', '48.8236° N, 2.3251° E · Alésia / Didot', undefined, 'span')}</span>
                </div>
              </div>
              <h2 className="text-2xl font-serif text-mahogany mb-3">
                {Z(
                  'stage_2_title',
                  'text',
                  'Les cours pavées & la mémoire ouvrière d’Alésia',
                  undefined,
                  'span'
                )}
              </h2>
              <p className="text-charcoal/80 leading-relaxed text-base">
                {Z(
                  'stage_2_content',
                  'textarea',
                  "En s'enfonçant dans les petites voies privées perpendiculaires à la rue Didot, les pavés remplacent le goudron. Des glycines grimpent sur de petits pavillons bas aux volets de bois. Un Paris villageois qui témoigne de l'époque où artisans et ouvriers vivaient dans ces enclaves tranquilles.",
                  undefined,
                  'span'
                )}
              </p>
            </article>

            {/* Étape 3 */}
            <article className="bg-[#FAF7F2] rounded-sm border border-[#DED5C6] p-6 md:p-8">
              <div className="flex items-center justify-between border-b border-[#DED5C6] pb-4 mb-4">
                <div className="text-xs uppercase tracking-[0.18em] text-eucalyptus font-semibold">
                  {Z('stage_3_badge', 'text', 'Étape 03', undefined, 'span')}
                </div>
                <div className="text-xs font-mono text-charcoal/70 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                  <span>{Z('stage_3_gps', 'text', '48.8273° N, 2.3064° E · Petite Ceinture', undefined, 'span')}</span>
                </div>
              </div>
              <h2 className="text-2xl font-serif text-mahogany mb-3">
                {Z(
                  'stage_3_title',
                  'text',
                  'La Petite Ceinture ferroviaire et sa canopée sauvage',
                  undefined,
                  'span'
                )}
              </h2>
              <p className="text-charcoal/80 leading-relaxed text-base">
                {Z(
                  'stage_3_content',
                  'textarea',
                  "Accessible depuis des escaliers discrets, le tracé de l'ancienne voie de chemin de fer circulaire s'enfonce sous la ville. Entre les traverses de bois et le ballast moussu, robiniers et fougères ont créé un refuge de biodiversité où le bruit de la ville s'évanouit.",
                  undefined,
                  'span'
                )}
              </p>
            </article>

            {/* Étape 4 */}
            <article className="bg-[#FAF7F2] rounded-sm border border-[#DED5C6] p-6 md:p-8">
              <div className="flex items-center justify-between border-b border-[#DED5C6] pb-4 mb-4">
                <div className="text-xs uppercase tracking-[0.18em] text-eucalyptus font-semibold">
                  {Z('stage_4_badge', 'text', 'Étape 04', undefined, 'span')}
                </div>
                <div className="text-xs font-mono text-charcoal/70 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                  <span>{Z('stage_4_gps', 'text', '48.8308° N, 2.3257° E · Rue Daguerre', undefined, 'span')}</span>
                </div>
              </div>
              <h2 className="text-2xl font-serif text-mahogany mb-3">
                {Z(
                  'stage_4_title',
                  'text',
                  'Pause gourmande & vie de quartier rue Daguerre',
                  undefined,
                  'span'
                )}
              </h2>
              <p className="text-charcoal/80 leading-relaxed text-base">
                {Z(
                  'stage_4_content',
                  'textarea',
                  "Chère à Agnès Varda, cette artère piétonne concentre l'art de vivre parisien à petite échelle. On y achète un morceau de comté affiné, un pain de campagne et l'on s'assoit au comptoir d'un café pour regarder défiler les habitués du quartier.",
                  undefined,
                  'span'
                )}
              </p>
            </article>
          </div>
        </section>

        {/* Conseils de terrain */}
        <section className="bg-[#EFE9DF] py-14 border-y border-[#DED5C6]">
          <div className="container max-w-4xl grid md:grid-cols-2 gap-6">
            <article className="rounded-sm border border-[#DED5C6] p-6 bg-[#FAF7F2]">
              <p className="text-xs uppercase tracking-[0.15em] text-eucalyptus font-semibold mb-2">
                {Z('conseil_1_title', 'text', 'Le bon timing', undefined, 'span')}
              </p>
              <p className="text-charcoal/80 leading-relaxed">
                {Z(
                  'conseil_1_text',
                  'textarea',
                  "Privilégie les matinées de semaine pour arpenter Montsouris et les impasses privées dans le calme le plus complet, loin de l'affluence du week-end.",
                  undefined,
                  'span'
                )}
              </p>
            </article>
            <article className="rounded-sm border border-[#DED5C6] p-6 bg-[#FAF7F2]">
              <p className="text-xs uppercase tracking-[0.15em] text-eucalyptus font-semibold mb-2">
                {Z('conseil_2_title', 'text', 'Mobilité douce', undefined, 'span')}
              </p>
              <p className="text-charcoal/80 leading-relaxed">
                {Z(
                  'conseil_2_text',
                  'textarea',
                  "Tout cet itinéraire se parcourt facilement à pied ou en Vélib'. Le RER B (Cité Universitaire) et la ligne 4 (Alésia) assurent des liaisons directes.",
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
                'Envie de découvrir Paris hors des sentiers battus ?',
                undefined,
                'span'
              )}
            </h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto leading-relaxed">
              {Z(
                'cta_text',
                'textarea',
                "On t'aide à concevoir une escapade ralentie dans la capitale : passages secrets, micro-quartiers et adresses artisanales indépendantes.",
                undefined,
                'span'
              )}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/travel-planning-form?destination=paris"
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

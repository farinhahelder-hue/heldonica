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
const PAGE = 'destinations-colombie-cartago';

const metadata: Metadata = {
  title: 'Cartago & l’Eje Cafetero en couple : notre itinéraire slow travel | Heldonica',
  description:
    'De Cartago à Salento : notre itinéraire slow travel testé en couple. Haltes de terroir, fincas de café, paysages andins et coordonnées GPS réelles.',
  alternates: {
    canonical: `${SITE_URL}/destinations/colombie/cartago`,
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('destinations-colombie-cartago', metadata);
}

interface Props {
  searchParams?: Promise<{ preview?: string }>;
}

export default async function CartagoPage({ searchParams }: Props) {
  const sp = searchParams ? await searchParams : {};
  const isPreview = sp.preview === 'draft' || sp.preview === 'true';
  const zones = await getPageZones(PAGE);

  // Mode brouillon sécurisé : tant que la page figure dans lib/unpublished-pages.ts,
  // le visiteur public voit la page « Bientôt ». L'accès aperçu se fait via ?preview=draft.
  if (!isPreview && isUnpublishedCmsPage(PAGE)) {
    return (
      <ComingSoonDestination
        slug="colombie-cartago"
        title={zones.title || 'Cartago'}
        country="Colombie"
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
              {Z('hero_badge', 'text', 'Colombie — Région du Café & Valle del Cauca', undefined, 'span')}
            </p>
            <h1 className="text-4xl md:text-5xl font-serif text-mahogany mb-5">
              {Z(
                'hero_title',
                'text',
                'Cartago & l’Eje Cafetero : itinéraire slow travel au rythme des fincas',
                undefined,
                'span'
              )}
            </h1>
            <p className="text-charcoal/80 text-lg leading-relaxed mb-6">
              {Z(
                'hero_description',
                'textarea',
                "De la chaleur du Valle del Cauca aux contreforts brumeux du Quindío : un itinéraire pensé sans précipitation, adossé aux tables de village, aux traversées de rivières et aux plantations d'altitude.",
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
                  '6 étapes vérifiées · 100% terrain · Coordonnées GPS réelles',
                  undefined,
                  'span'
                )}
              </span>
            </div>
          </div>
        </section>

        {/* Liste des étapes de l'itinéraire */}
        <section className="bg-[#F7F3EC] py-12 md:py-20">
          <div className="container max-w-4xl space-y-10">
            {/* Étape 1 : Cartago */}
            <article className="rounded-sm border border-[#DED5C6] bg-[#FAF7F2] overflow-hidden shadow-sm hover:border-charcoal/30 transition-colors">
              <div className="relative aspect-[16/10] w-full bg-[#EFE9DF] border-b border-[#DED5C6]">
                <Image
                  src="/images/destinations/colombie/cartago/etape1_cartago_terroir.jpg"
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 896px"
                  className="object-cover"
                  priority
                />
                <div className="absolute bottom-3 left-3 bg-[#1A1512]/80 backdrop-blur-sm text-[#FAF7F2] px-3 py-1.5 rounded-sm text-xs flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                  <span className="font-mono tracking-tight">
                    {Z('stage_1_gps', 'text', '4.7395° N, 75.9107° O', undefined, 'span')}
                  </span>
                </div>
                <div className="absolute top-3 right-3 bg-[#FAF7F2]/90 backdrop-blur-sm text-charcoal px-2.5 py-1 rounded-sm text-[11px] font-medium border border-[#DED5C6]">
                  {Z('stage_1_meta', 'text', 'Cartago · Valle del Cauca · Décembre 2019', undefined, 'span')}
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
                    'Cartago — Réveil matinal et table paysanne',
                    undefined,
                    'span'
                  )}
                </h2>
                <p className="text-charcoal/80 leading-relaxed text-base">
                  {Z(
                    'stage_1_content',
                    'textarea',
                    "Cartago s'éveille tôt avant la chaleur du milieu de journée. Sur la table du petit-déjeuner, on partage les fromages traditionnels (Queso Paipa affiné et Siete Cueros frais) accompagnés de pan de bono tout chauds et d'arepas blanches. Un ancrage direct dans les saveurs terriennes du Valle del Cauca.",
                    undefined,
                    'span'
                  )}
                </p>
              </div>
            </article>

            {/* Étape 2 : Piedra de Moler */}
            <article className="rounded-sm border border-[#DED5C6] bg-[#FAF7F2] overflow-hidden shadow-sm hover:border-charcoal/30 transition-colors">
              <div className="relative aspect-[16/10] w-full bg-[#EFE9DF] border-b border-[#DED5C6]">
                <Image
                  src="/images/destinations/colombie/cartago/etape2_rio_lavieja.jpg"
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 896px"
                  className="object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-[#1A1512]/80 backdrop-blur-sm text-[#FAF7F2] px-3 py-1.5 rounded-sm text-xs flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                  <span className="font-mono tracking-tight">
                    {Z('stage_2_gps', 'text', '4.7086° N, 75.8570° O', undefined, 'span')}
                  </span>
                </div>
                <div className="absolute top-3 right-3 bg-[#FAF7F2]/90 backdrop-blur-sm text-charcoal px-2.5 py-1 rounded-sm text-[11px] font-medium border border-[#DED5C6]">
                  {Z('stage_2_meta', 'text', 'Piedra de Moler · Río La Vieja · Décembre 2019', undefined, 'span')}
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
                    'Piedra de Moler — Traversée du Río La Vieja',
                    undefined,
                    'span'
                  )}
                </h2>
                <p className="text-charcoal/80 leading-relaxed text-base">
                  {Z(
                    'stage_2_content',
                    'textarea',
                    "En quittant Cartago vers les collines du café, on franchit le pont métallique de Piedra de Moler. Le cours d'eau puissant est bordé de rideaux denses de bambous géants (guadua). La frontière naturelle entre la plaine sucrière et les premiers reliefs caféiers se ressent dès les premiers virages.",
                    undefined,
                    'span'
                  )}
                </p>
              </div>
            </article>

            {/* Étape 3 : Quimbaya */}
            <article className="rounded-sm border border-[#DED5C6] bg-[#FAF7F2] overflow-hidden shadow-sm hover:border-charcoal/30 transition-colors">
              <div className="relative aspect-[16/10] w-full bg-[#EFE9DF] border-b border-[#DED5C6]">
                <Image
                  src="/images/destinations/colombie/cartago/etape3_quimbaya_cafe.jpg"
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 896px"
                  className="object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-[#1A1512]/80 backdrop-blur-sm text-[#FAF7F2] px-3 py-1.5 rounded-sm text-xs flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                  <span className="font-mono tracking-tight">
                    {Z('stage_3_gps', 'text', '4.6239° N, 75.7681° O', undefined, 'span')}
                  </span>
                </div>
                <div className="absolute top-3 right-3 bg-[#FAF7F2]/90 backdrop-blur-sm text-charcoal px-2.5 py-1 rounded-sm text-[11px] font-medium border border-[#DED5C6]">
                  {Z('stage_3_meta', 'text', 'Quimbaya · Quindío · Décembre 2019', undefined, 'span')}
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
                    'Quimbaya — Le café de village au comptoir',
                    undefined,
                    'span'
                  )}
                </h2>
                <p className="text-charcoal/80 leading-relaxed text-base">
                  {Z(
                    'stage_3_content',
                    'textarea',
                    "Arrivée à Quimbaya. On s'arrête dans une petite cafetaria locale ouverte sur la rue. L'ardoise affiche les prix du cru : café court, aromática aux herbes fraîches et pastel de nata. C'est ici que bat le cœur de la vie rurale, où les caféiculteurs se retrouvent pour discuter de la récolte sans filtre publicitaire.",
                    undefined,
                    'span'
                  )}
                </p>
              </div>
            </article>

            {/* Étape 4 : El Roble */}
            <article className="rounded-sm border border-[#DED5C6] bg-[#FAF7F2] overflow-hidden shadow-sm hover:border-charcoal/30 transition-colors">
              <div className="relative aspect-[16/10] w-full bg-[#EFE9DF] border-b border-[#DED5C6]">
                <Image
                  src="/images/destinations/colombie/cartago/etape4_elroble_arepas.jpg"
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 896px"
                  className="object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-[#1A1512]/80 backdrop-blur-sm text-[#FAF7F2] px-3 py-1.5 rounded-sm text-xs flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                  <span className="font-mono tracking-tight">
                    {Z('stage_4_gps', 'text', '4.6627° N, 75.5964° O', undefined, 'span')}
                  </span>
                </div>
                <div className="absolute top-3 right-3 bg-[#FAF7F2]/90 backdrop-blur-sm text-charcoal px-2.5 py-1 rounded-sm text-[11px] font-medium border border-[#DED5C6]">
                  {Z('stage_4_meta', 'text', 'Autopista del Café · El Roble · Décembre 2019', undefined, 'span')}
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
                    'El Roble — Halte gourmande sur la route des crêtes',
                    undefined,
                    'span'
                  )}
                </h2>
                <p className="text-charcoal/80 leading-relaxed text-base">
                  {Z(
                    'stage_4_content',
                    'textarea',
                    "Sur l'axe panoramique entre Armenia et Pereira, l'étape au restaurant El Roble s'impose pour goûter le queso campesino tout frais moulé, servi avec une corbeille d'arepas de maïs tout juste sorties de la braise. Une pause simple et nourrissante face aux collines verdoyantes.",
                    undefined,
                    'span'
                  )}
                </p>
              </div>
            </article>

            {/* Étape 5 : Boquía */}
            <article className="rounded-sm border border-[#DED5C6] bg-[#FAF7F2] overflow-hidden shadow-sm hover:border-charcoal/30 transition-colors">
              <div className="relative aspect-[16/10] w-full bg-[#EFE9DF] border-b border-[#DED5C6]">
                <Image
                  src="/images/destinations/colombie/cartago/etape5_salento_cordillere.jpg"
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 896px"
                  className="object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-[#1A1512]/80 backdrop-blur-sm text-[#FAF7F2] px-3 py-1.5 rounded-sm text-xs flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                  <span className="font-mono tracking-tight">
                    {Z('stage_5_gps', 'text', '4.6392° N, 75.5659° O', undefined, 'span')}
                  </span>
                </div>
                <div className="absolute top-3 right-3 bg-[#FAF7F2]/90 backdrop-blur-sm text-charcoal px-2.5 py-1 rounded-sm text-[11px] font-medium border border-[#DED5C6]">
                  {Z('stage_5_meta', 'text', 'Boquía · Contreforts de Salento · Décembre 2019', undefined, 'span')}
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
                    'Boquía — Crépuscule sur les forêts andines',
                    undefined,
                    'span'
                  )}
                </h2>
                <p className="text-charcoal/80 leading-relaxed text-base">
                  {Z(
                    'stage_5_content',
                    'textarea',
                    "Aux abords de Boquía, la route s'élève vers les vallées d'altitude. Au coucher du soleil, la lumière rosée souligne les silhouettes des crêtes et la végétation touffue de la cordillère centrale. On prend le temps de couper le contact pour écouter le chant des insectes et la fraîcheur qui tombe.",
                    undefined,
                    'span'
                  )}
                </p>
              </div>
            </article>

            {/* Étape 6 : Salento */}
            <article className="rounded-sm border border-[#DED5C6] bg-[#FAF7F2] overflow-hidden shadow-sm hover:border-charcoal/30 transition-colors">
              <div className="relative aspect-[16/10] w-full bg-[#EFE9DF] border-b border-[#DED5C6]">
                <Image
                  src="/images/destinations/colombie/cartago/etape6_salento_plaza.jpg"
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 896px"
                  className="object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-[#1A1512]/80 backdrop-blur-sm text-[#FAF7F2] px-3 py-1.5 rounded-sm text-xs flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                  <span className="font-mono tracking-tight">
                    {Z('stage_6_gps', 'text', '4.6371° N, 75.5694° O', undefined, 'span')}
                  </span>
                </div>
                <div className="absolute top-3 right-3 bg-[#FAF7F2]/90 backdrop-blur-sm text-charcoal px-2.5 py-1 rounded-sm text-[11px] font-medium border border-[#DED5C6]">
                  {Z('stage_6_meta', 'text', 'Salento · Plaza de Bolívar · Décembre 2019', undefined, 'span')}
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
                    'Salento — Nuit calme sur la Plaza de Bolívar',
                    undefined,
                    'span'
                  )}
                </h2>
                <p className="text-charcoal/80 leading-relaxed text-base">
                  {Z(
                    'stage_6_content',
                    'textarea',
                    "Arrivée nocturne sur la grande place pavée de Salento. Le clocher de la Parroquia Nuestra Señora del Carmen se découpe dans la nuit, éclairé par les réverbères chaleureux. Loin des bus de touristes de la journée, les petites échoppes d'artisanat et les cafés sous les arcades offrent un calme bienvenu.",
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
                {Z('conseil_1_title', 'text', 'Conseil horaire & climat', undefined, 'span')}
              </p>
              <p className="text-charcoal/80 leading-relaxed">
                {Z(
                  'conseil_1_text',
                  'textarea',
                  "Partir de Cartago dès l'aube permet de profiter de la fraîcheur matinale pour rouler et d'arriver dans les villages du Quindío avant les averses de fin d'après-midi fréquentes en montagne.",
                  undefined,
                  'span'
                )}
              </p>
            </article>
            <article className="rounded-sm border border-[#DED5C6] p-6 bg-[#FAF7F2]">
              <p className="text-xs uppercase tracking-[0.15em] text-eucalyptus font-semibold mb-2">
                {Z('conseil_2_title', 'text', 'Conseil transport & halte', undefined, 'span')}
              </p>
              <p className="text-charcoal/80 leading-relaxed">
                {Z(
                  'conseil_2_text',
                  'textarea',
                  "Ne te précipite pas directement vers Salento sans faire d'étapes. Les bourgs de Quimbaya et les tables paysannes le long de l'ancienne route offrent un aperçu bien plus authentique du quotidien colombien.",
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
                'Envie de parcourir la Colombie en slow travel ?',
                undefined,
                'span'
              )}
            </h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto leading-relaxed">
              {Z(
                'cta_text',
                'textarea',
                "On t'aide à construire un itinéraire fluide entre le Valle del Cauca et les fincas du Quindío, selon ton rythme et tes envies.",
                undefined,
                'span'
              )}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/travel-planning-form?destination=colombie"
                className="px-7 py-3 rounded-sm bg-action text-[#FAF7F2] text-xs uppercase tracking-[0.16em] font-medium hover:bg-action-fonce transition-colors"
              >
                {Z('cta_btn_planning', 'text', 'Construire mon itinéraire', undefined, 'span')}
              </Link>
              <Link
                href="/destinations/colombie"
                className="px-7 py-3 rounded-sm border border-[#E6DEC8]/40 text-xs uppercase tracking-[0.16em] font-medium hover:border-[#FAF7F2] transition-colors"
              >
                {Z('cta_btn_colombie', 'text', '← Guide Colombie', undefined, 'span')}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </InlineEditProvider>
  );
}

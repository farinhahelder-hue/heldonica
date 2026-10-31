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
const PAGE = 'destinations-portugal-obidos';

const metadata: Metadata = {
  title: 'Óbidos à pied : la cité fortifiée au crépuscule | Heldonica',
  description:
    'Notre itinéraire slow travel à Óbidos : chemin de ronde sur les remparts crénelés, ruelles chaulées de blanc et belvédères sur la plaine de l Estrémadure.',
  alternates: {
    canonical: `${SITE_URL}/destinations/portugal/obidos`,
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('destinations-portugal-obidos', metadata);
}

interface Props {
  searchParams?: Promise<{ preview?: string }>;
}

export default async function ObidosPage({ searchParams }: Props) {
  const sp = searchParams ? await searchParams : {};
  const isPreview = sp.preview === 'draft' || sp.preview === 'true';
  const zones = await getPageZones(PAGE);

  // Mode brouillon sécurisé : tant que la page figure dans lib/unpublished-pages.ts,
  // le visiteur public voit la page « Bientôt ». L'accès aperçu se fait via ?preview=draft.
  if (!isPreview && isUnpublishedCmsPage(PAGE)) {
    return (
      <ComingSoonDestination
        slug="portugal-obidos"
        title={zones.title || 'Óbidos'}
        country="Portugal"
        hero_unsplash_url="/images/destinations/portugal/obidos/etape1_obidos_castelo.jpg"
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

      <main className="min-h-screen bg-[#FDFBF7] text-[#2C2416]">
        {isPreview && (
          <aside
            aria-label="Mode brouillon"
            className="bg-amber-100/90 border-b border-amber-300 text-amber-950 px-4 py-2.5 text-xs text-center font-medium sticky top-0 z-50 flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4 text-amber-800 shrink-0" aria-hidden="true" />
            <span>
              {Z(
                'draft_banner_text',
                'text',
                'Aperçu brouillon privé — cette destination reste masquée aux visiteurs publics (écran Bientôt).'
              )}
            </span>
          </aside>
        )}

        {/* HERO SECTION */}
        <section className="relative h-[65vh] min-h-[480px] max-h-[680px] w-full overflow-hidden flex items-end">
          <Image
            src="/images/destinations/portugal/obidos/etape1_obidos_castelo.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/20" />

          <div className="relative max-w-4xl mx-auto px-6 pb-12 w-full text-white">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#E8C547] font-semibold mb-3">
              <Link href="/destinations" className="hover:underline">
                {Z('breadcrumb_destinations', 'text', 'Destinations')}
              </Link>
              <span>/</span>
              <Link href="/destinations/portugal" className="hover:underline">
                {Z('breadcrumb_country', 'text', 'Portugal')}
              </Link>
              <span>/</span>
              <span>{Z('breadcrumb_current', 'text', 'Óbidos')}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white mb-4 leading-[1.15]">
              {Z(
                'hero_title',
                'text',
                'Óbidos : la cité médiévale et le chemin de ronde'
              )}
            </h1>

            <p className="text-white/90 text-sm sm:text-base max-w-2xl font-light leading-relaxed mb-6">
              {Z(
                'hero_subtitle',
                'textarea',
                'Ceinte de remparts crénelés du XIIe siècle, Óbidos révèle son visage le plus serein en fin d après-midi, quand les pavés chaulés retrouvent leur calme.'
              )}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-white/80 border-t border-white/20 pt-4">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#E8C547]" />
                {Z('hero_meta_loc', 'text', 'Óbidos, Région Ouest, Portugal')}
              </span>
              <span className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#E8C547]" />
                {Z('hero_meta_duration', 'text', '1 à 2 jours')}
              </span>
              <span className="bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded text-[11px] font-medium text-white">
                {Z('hero_meta_badge', 'text', 'Testé sur le terrain')}
              </span>
            </div>
          </div>
        </section>

        {/* INTRO CARTOUCHE */}
        <section className="max-w-3xl mx-auto px-6 py-12">
          <div className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm p-6 sm:p-8">
            <h2 className="font-serif text-xl sm:text-2xl text-[#2C2416] font-normal mb-3">
              {Z('intro_title', 'text', 'Marcher sur la crête des murailles')}
            </h2>
            <div className="prose prose-stone text-sm sm:text-base leading-relaxed text-[#5A5043] space-y-3">
              <p>
                {Z(
                  'intro_p1',
                  'textarea',
                  'Offerte autrefois par les rois de Portugal à leurs reines, Óbidos est un lacis de venelles blanchies à la chaux, ourlées de bleu cobalt et de jaune ocre. Sa particularité tient à son enceinte continue, encore intacte sur plus d un kilomètre et demi.'
                )}
              </p>
              <p>
                {Z(
                  'intro_p2',
                  'textarea',
                  'Loin de la rue centrale commerçante, le chemin de ronde offre une lecture vivante du relief de l Estrémadure, entre moulins à vent lointains et vignobles environnants.'
                )}
              </p>
            </div>
          </div>
        </section>

        {/* ITINERAIRE SECTION */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center mb-10">
            <span className="text-xs uppercase tracking-[0.2em] text-[#8B6E32] font-semibold">
              {Z('itinerary_label', 'text', 'Parcours Pas à Pas')}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#2C2416] font-normal mt-1">
              {Z(
                'itinerary_title',
                'text',
                'Notre itinéraire à pied : 3 repères fortifiés'
              )}
            </h2>
            <p className="text-xs sm:text-sm text-[#7D7365] mt-2 max-w-xl mx-auto">
              {Z(
                'itinerary_subtitle',
                'text',
                'Relevés de terrain et coordonnées GPS enregistrés le long des murailles médiévales.'
              )}
            </p>
          </div>

          <div className="space-y-12">
            {/* ETAPE 1 */}
            <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div className="relative h-64 md:h-auto min-h-[260px]">
                  <Image
                    src="/images/destinations/portugal/obidos/etape1_obidos_castelo.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#8B6E32] font-semibold uppercase tracking-wider mb-2">
                      <span>{Z('step1_num', 'text', 'Étape 1 • Castelo d Óbidos')}</span>
                      <span className="flex items-center gap-1 font-mono text-[11px] text-[#7D7365]">
                        <MapPin className="w-3 h-3 text-[#8B6E32]" />
                        {Z('step1_gps', 'text', '39.3637° N, 9.1574° W')}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg sm:text-xl font-medium text-[#2C2416] mb-2">
                      {Z('step1_title', 'text', 'Le château médiéval et les courtines')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5A5043] leading-relaxed mb-4">
                      {Z(
                        'step1_desc',
                        'textarea',
                        'Bâtie sur un promontoire calcaire, la forteresse combine éléments romans et gothiques. Les créneaux taillés dans la roche calcaire se dressent fièrement au-dessus de la plaine agricole.'
                      )}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#F0EBE1] text-xs text-[#7D7365] flex items-center justify-between">
                    <span>{Z('step1_tip_label', 'text', 'Point d intérêt :')}</span>
                    <span className="font-medium text-[#2C2416]">
                      {Z('step1_tip_val', 'text', 'Courtines crénelées et tour de guet')}
                    </span>
                  </div>
                </div>
              </div>
            </article>

            {/* ETAPE 2 */}
            <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div className="relative h-64 md:h-auto min-h-[260px] md:order-2">
                  <Image
                    src="/images/destinations/portugal/obidos/etape2_obidos_panorama.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 sm:p-8 flex flex-col justify-between md:order-1">
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#8B6E32] font-semibold uppercase tracking-wider mb-2">
                      <span>{Z('step2_num', 'text', 'Étape 2 • Le belvédère des murailles')}</span>
                      <span className="flex items-center gap-1 font-mono text-[11px] text-[#7D7365]">
                        <MapPin className="w-3 h-3 text-[#8B6E32]" />
                        {Z('step2_gps', 'text', '39.3645° N, 9.1575° W')}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg sm:text-xl font-medium text-[#2C2416] mb-2">
                      {Z('step2_title', 'text', 'Vue ouverte sur la vallée et l aqueduc')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5A5043] leading-relaxed mb-4">
                      {Z(
                        'step2_desc',
                        'textarea',
                        'Depuis la tour nord, le regard embrasse toute la cuvette vallonnée. On distingue nettement l aqueduc d Usseira qui alimentait jadis les fontaines du bourg fortifié.'
                      )}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#F0EBE1] text-xs text-[#7D7365] flex items-center justify-between">
                    <span>{Z('step2_tip_label', 'text', 'Prudence :')}</span>
                    <span className="font-medium text-[#2C2416]">
                      {Z('step2_tip_val', 'text', 'Chemin de ronde étroit sans garde-corps')}
                    </span>
                  </div>
                </div>
              </div>
            </article>

            {/* ETAPE 3 */}
            <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div className="relative h-64 md:h-auto min-h-[260px]">
                  <Image
                    src="/images/destinations/portugal/obidos/etape3_obidos_bourg.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#8B6E32] font-semibold uppercase tracking-wider mb-2">
                      <span>{Z('step3_num', 'text', 'Étape 3 • Les venelles intérieures')}</span>
                      <span className="flex items-center gap-1 font-mono text-[11px] text-[#7D7365]">
                        <MapPin className="w-3 h-3 text-[#8B6E32]" />
                        {Z('step3_gps', 'text', '39.3644° N, 9.1501° W')}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg sm:text-xl font-medium text-[#2C2416] mb-2">
                      {Z('step3_title', 'text', 'Toits de tuiles brunes et façades à la chaux')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5A5043] leading-relaxed mb-4">
                      {Z(
                        'step3_desc',
                        'textarea',
                        'En redescendant vers l église Santa Maria, les ruelles s entrelacent sous les treilles de bougainvilliers. Les façades immaculées reflètent la lumière dorée du soir.'
                      )}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#F0EBE1] text-xs text-[#7D7365] flex items-center justify-between">
                    <span>{Z('step3_tip_label', 'text', 'Dégustation :')}</span>
                    <span className="font-medium text-[#2C2416]">
                      {Z('step3_tip_val', 'text', 'Ginjinha servie dans une tasse en chocolat')}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* CARNET PRATIQUE */}
        <section className="max-w-3xl mx-auto px-6 py-12">
          <div className="bg-[#F4EFE6] border border-[#E3DACB] rounded-sm p-6 sm:p-8">
            <h2 className="font-serif text-xl sm:text-2xl text-[#2C2416] font-normal mb-4">
              {Z('carnet_title', 'text', 'Nos repères terrain pour Óbidos')}
            </h2>
            <ul className="space-y-3 text-xs sm:text-sm text-[#5A5043]">
              <li className="flex items-start gap-2">
                <span className="text-[#8B6E32] font-bold">•</span>
                <span>
                  <strong>{Z('carnet_point1_strong', 'text', 'Le bon créneau horaire :')}</strong>{' '}
                  {Z(
                    'carnet_point1_text',
                    'text',
                    'Visiter avant 10h le matin ou après 17h. La cité se vide alors des flux de passage et retrouve sa quiétude médiévale.'
                  )}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#8B6E32] font-bold">•</span>
                <span>
                  <strong>{Z('carnet_point2_strong', 'text', 'Chaussures adaptées :')}</strong>{' '}
                  {Z(
                    'carnet_point2_text',
                    'text',
                    'Les dalles de calcaire sur les remparts sont polies par le temps et peuvent être glissantes par temps humide.'
                  )}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#8B6E32] font-bold">•</span>
                <span>
                  <strong>{Z('carnet_point3_strong', 'text', 'Porta da Vila :')}</strong>{' '}
                  {Z(
                    'carnet_point3_text',
                    'text',
                    'L entrée principale abrite un oratoire baroque orné d azulejos du XVIIIe siècle représentant la Passion du Christ.'
                  )}
                </span>
              </li>
            </ul>
          </div>
        </section>
      </main>

      <Footer />
    </InlineEditProvider>
  );
}

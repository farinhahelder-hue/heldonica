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
const PAGE = 'destinations-portugal-coimbra';

const metadata: Metadata = {
  title: 'Coimbra à pied : collines, ruelles et clochers sur le Mondego | Heldonica',
  description:
    'Notre carnet slow travel à Coimbra : de l église Santa Cruz à l ancienne porte maure d Almedina, entre ruelles pavées et vue plongeante sur le Mondego.',
  alternates: {
    canonical: `${SITE_URL}/destinations/portugal/coimbra`,
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('destinations-portugal-coimbra', metadata);
}

interface Props {
  searchParams?: Promise<{ preview?: string }>;
}

export default async function CoimbraPage({ searchParams }: Props) {
  const sp = searchParams ? await searchParams : {};
  const isPreview = sp.preview === 'draft' || sp.preview === 'true';
  const zones = await getPageZones(PAGE);

  // Mode brouillon sécurisé : tant que la page figure dans lib/unpublished-pages.ts,
  // le visiteur public voit la page « Bientôt ». L'accès aperçu se fait via ?preview=draft.
  if (!isPreview && isUnpublishedCmsPage(PAGE)) {
    return (
      <ComingSoonDestination
        slug="portugal-coimbra"
        title={zones.title || 'Coimbra'}
        country="Portugal"
        hero_unsplash_url="/images/destinations/portugal/coimbra/etape1_coimbra_santacruz.jpg"
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
            src="/images/destinations/portugal/coimbra/etape1_coimbra_santacruz.jpg"
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
              <span>{Z('breadcrumb_current', 'text', 'Coimbra')}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white mb-4 leading-[1.15]">
              {Z(
                'hero_title',
                'text',
                'Coimbra à pied : de la ville basse aux clochers de l université'
              )}
            </h1>

            <p className="text-white/90 text-sm sm:text-base max-w-2xl font-light leading-relaxed mb-6">
              {Z(
                'hero_subtitle',
                'textarea',
                'Ancienne capitale médiévale du royaume, Coimbra s étire en terrasses escarpées le long du fleuve Mondego. Un parcours lent au fil des ruelles médiévales et des cloîtres silencieux.'
              )}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-white/80 border-t border-white/20 pt-4">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#E8C547]" />
                {Z('hero_meta_loc', 'text', 'Coimbra, Région Centre, Portugal')}
              </span>
              <span className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#E8C547]" />
                {Z('hero_meta_duration', 'text', '2 jours')}
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
              {Z('intro_title', 'text', 'Prendre le temps d arpenter la colline')}
            </h2>
            <div className="prose prose-stone text-sm sm:text-base leading-relaxed text-[#5A5043] space-y-3">
              <p>
                {Z(
                  'intro_p1',
                  'textarea',
                  'Coimbra ne se livre pas d un bloc : elle exige de gravir patiemment ses raidillons pavés, de franchir l ancienne porte mauresque et d écouter l écho lointain du fado résonner contre les façades de calcaire.'
                )}
              </p>
              <p>
                {Z(
                  'intro_p2',
                  'textarea',
                  'Des tombeaux royaux de l église Santa Cruz jusqu au sommet de la colline où trône l université fondée au XIIIe siècle, chaque quartier conserve sa propre cadence.'
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
                'Notre itinéraire à pied : 3 paliers d histoire'
              )}
            </h2>
            <p className="text-xs sm:text-sm text-[#7D7365] mt-2 max-w-xl mx-auto">
              {Z(
                'itinerary_subtitle',
                'text',
                'Relevés de terrain et coordonnées GPS enregistrés de la Baixa vers l Alcáçova.'
              )}
            </p>
          </div>

          <div className="space-y-12">
            {/* ETAPE 1 */}
            <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div className="relative h-64 md:h-auto min-h-[260px]">
                  <Image
                    src="/images/destinations/portugal/coimbra/etape1_coimbra_santacruz.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#8B6E32] font-semibold uppercase tracking-wider mb-2">
                      <span>{Z('step1_num', 'text', 'Étape 1 • La Baixa : Igreja de Santa Cruz')}</span>
                      <span className="flex items-center gap-1 font-mono text-[11px] text-[#7D7365]">
                        <MapPin className="w-3 h-3 text-[#8B6E32]" />
                        {Z('step1_gps', 'text', '40.2089° N, 8.4250° W')}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg sm:text-xl font-medium text-[#2C2416] mb-2">
                      {Z('step1_title', 'text', 'Le panthéon des premiers rois')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5A5043] leading-relaxed mb-4">
                      {Z(
                        'step1_desc',
                        'textarea',
                        'Fondée au XIIe siècle, cette église abrite les tombeaux d Alphonse Henriques et de Sancho Ier. Son portail Renaissance orné de statues et ses carrelages d azulejos bleus et blancs créent un contraste saisissant.'
                      )}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#F0EBE1] text-xs text-[#7D7365] flex items-center justify-between">
                    <span>{Z('step1_tip_label', 'text', 'Élément remarquable :')}</span>
                    <span className="font-medium text-[#2C2416]">
                      {Z('step1_tip_val', 'text', 'Orgue baroque doré et stalles sculptées')}
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
                    src="/images/destinations/portugal/coimbra/etape2_coimbra_almedina.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 sm:p-8 flex flex-col justify-between md:order-1">
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#8B6E32] font-semibold uppercase tracking-wider mb-2">
                      <span>{Z('step2_num', 'text', 'Étape 2 • Arco de Almedina & Quebra Costas')}</span>
                      <span className="flex items-center gap-1 font-mono text-[11px] text-[#7D7365]">
                        <MapPin className="w-3 h-3 text-[#8B6E32]" />
                        {Z('step2_gps', 'text', '40.2089° N, 8.4289° W')}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg sm:text-xl font-medium text-[#2C2416] mb-2">
                      {Z('step2_title', 'text', 'La porte médiévale et l escalier des dos brisés')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5A5043] leading-relaxed mb-4">
                      {Z(
                        'step2_desc',
                        'textarea',
                        'L arche d Almedina marquait l entrée de la médina maure fortifiée. Juste derrière s élève la fameuse ruelle en pente raide Quebra-Costas qui relie la ville basse marchande à la ville haute estudiantine.'
                      )}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#F0EBE1] text-xs text-[#7D7365] flex items-center justify-between">
                    <span>{Z('step2_tip_label', 'text', 'À écouter :')}</span>
                    <span className="font-medium text-[#2C2416]">
                      {Z('step2_tip_val', 'text', 'Les accords de guitare de Coimbra au crépuscule')}
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
                    src="/images/destinations/portugal/coimbra/etape3_coimbra_toitures.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#8B6E32] font-semibold uppercase tracking-wider mb-2">
                      <span>{Z('step3_num', 'text', 'Étape 3 • Belvédère de l Université')}</span>
                      <span className="flex items-center gap-1 font-mono text-[11px] text-[#7D7365]">
                        <MapPin className="w-3 h-3 text-[#8B6E32]" />
                        {Z('step3_gps', 'text', '40.2118° N, 8.4328° W')}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg sm:text-xl font-medium text-[#2C2416] mb-2">
                      {Z('step3_title', 'text', 'Plongée sur les toits d argile et le fleuve')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5A5043] leading-relaxed mb-4">
                      {Z(
                        'step3_desc',
                        'textarea',
                        'Depuis le sommet de la colline universitaire, la vue s étend sur l entrelacs des toitures rouges et le cours paisible du Mondego. La tour de l horloge rythme les heures d une voix grave.'
                      )}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#F0EBE1] text-xs text-[#7D7365] flex items-center justify-between">
                    <span>{Z('step3_tip_label', 'text', 'Vue panoramique :')}</span>
                    <span className="font-medium text-[#2C2416]">
                      {Z('step3_tip_val', 'text', 'Méandre du fleuve et couvent Santa Clara en face')}
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
              {Z('carnet_title', 'text', 'Nos repères terrain pour Coimbra')}
            </h2>
            <ul className="space-y-3 text-xs sm:text-sm text-[#5A5043]">
              <li className="flex items-start gap-2">
                <span className="text-[#8B6E32] font-bold">•</span>
                <span>
                  <strong>{Z('carnet_point1_strong', 'text', 'Pente et pavage :')}</strong>{' '}
                  {Z(
                    'carnet_point1_text',
                    'text',
                    'La montée vers l université est très raide sur la calçada portugaise. Prévoir de bonnes semelles en caoutchouc adhérentes.'
                  )}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#8B6E32] font-bold">•</span>
                <span>
                  <strong>{Z('carnet_point2_strong', 'text', 'La rive gauche du Mondego :')}</strong>{' '}
                  {Z(
                    'carnet_point2_text',
                    'text',
                    'Traverser le pont piétonnier Pedro e Inês en fin de journée pour voir le soleil se coucher sur la silhouette étagée de la vieille ville.'
                  )}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#8B6E32] font-bold">•</span>
                <span>
                  <strong>{Z('carnet_point3_strong', 'text', 'Fado de Coimbra :')}</strong>{' '}
                  {Z(
                    'carnet_point3_text',
                    'text',
                    'Distinct du fado de Lisbonne, il est traditionnellement chanté par les étudiants en cape noire avec un accompagnement de guitare portugaise accordée plus bas.'
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

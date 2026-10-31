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
const PAGE = 'destinations-suisse-stoos';

const metadata: Metadata = {
  title: 'Stoos & l arête de Fronalpstock : notre itinéraire slow travel en Suisse | Heldonica',
  description:
    'Notre itinéraire de randonnée alpine sur l arête de Fronalpstock à Stoos : mobilité douce, sentier de crête au crépuscule et coordonnées GPS réelles.',
  alternates: {
    canonical: `${SITE_URL}/destinations/suisse/stoos`,
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('destinations-suisse-stoos', metadata);
}

interface Props {
  searchParams?: Promise<{ preview?: string }>;
}

export default async function StoosPage({ searchParams }: Props) {
  const sp = searchParams ? await searchParams : {};
  const isPreview = sp.preview === 'draft' || sp.preview === 'true';
  const zones = await getPageZones(PAGE);

  // Mode brouillon sécurisé : tant que la page figure dans lib/unpublished-pages.ts,
  // le visiteur public voit la page « Bientôt ». L'accès aperçu se fait via ?preview=draft.
  if (!isPreview && isUnpublishedCmsPage(PAGE)) {
    return (
      <ComingSoonDestination
        slug="suisse-stoos"
        title={zones.title || 'Stoos'}
        country="Suisse"
        hero_unsplash_url="/images/destinations/suisse/stoos/etape1_stoos_panorama_lac.jpg"
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
            src="/images/destinations/suisse/stoos/etape1_stoos_panorama_lac.jpg"
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
              <Link href="/destinations/suisse" className="hover:underline">
                {Z('breadcrumb_country', 'text', 'Suisse')}
              </Link>
              <span>/</span>
              <span>{Z('breadcrumb_current', 'text', 'Stoos')}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white mb-4 leading-[1.15]">
              {Z(
                'hero_title',
                'text',
                'Stoos & l arête du Fronalpstock : randonnée de crête sans moteur'
              )}
            </h1>

            <p className="text-white/90 text-sm sm:text-base max-w-2xl font-light leading-relaxed mb-6">
              {Z(
                'hero_subtitle',
                'textarea',
                'Perché à 1922 mètres d altitude au-dessus du lac des Quatre-Cantons, le village sans voiture de Stoos offre l une des plus pures traversées de crête des Alpes suisses.'
              )}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-white/80 border-t border-white/20 pt-4">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#E8C547]" />
                {Z('hero_meta_loc', 'text', 'Stoos & Fronalpstock, Canton de Schwyz, Suisse')}
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
              {Z('intro_title', 'text', 'L écologie acoustique des alpages suisses')}
            </h2>
            <div className="prose prose-stone text-sm sm:text-base leading-relaxed text-[#5A5043] space-y-3">
              <p>
                {Z(
                  'intro_p1',
                  'textarea',
                  'Stoos fait partie de ces rares territoires d altitude totalement préservés du trafic routier. Dès la sortie du funiculaire le plus raide du monde, aucun vrombissement de moteur ne vient troubler la quiétude des crêtes.'
                )}
              </p>
              <p>
                {Z(
                  'intro_p2',
                  'textarea',
                  'En partant sur le sentier de crête en fin d après-midi, après le départ des derniers randonneurs d excursion, la montagne retrouve son silence originel, simplement rythmé par le vent thermique et le tintement des cloches dans les alpages.'
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
                'Notre traversée : 6 étapes entre ciel et lac'
              )}
            </h2>
            <p className="text-xs sm:text-sm text-[#7D7365] mt-2 max-w-xl mx-auto">
              {Z(
                'itinerary_subtitle',
                'text',
                'Relevés de terrain et coordonnées GPS enregistrés le long du Stoos Ridge Trail.'
              )}
            </p>
          </div>

          <div className="space-y-12">
            {/* ETAPE 1 */}
            <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div className="relative h-64 md:h-auto min-h-[260px]">
                  <Image
                    src="/images/destinations/suisse/stoos/etape1_stoos_panorama_lac.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#8B6E32] font-semibold uppercase tracking-wider mb-2">
                      <span>{Z('step1_num', 'text', 'Étape 1 • Sommet du Fronalpstock')}</span>
                      <span className="flex items-center gap-1 font-mono text-[11px] text-[#7D7365]">
                        <MapPin className="w-3 h-3 text-[#8B6E32]" />
                        {Z('step1_gps', 'text', '46.9694° N, 8.6366° E')}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg sm:text-xl font-medium text-[#2C2416] mb-2">
                      {Z('step1_title', 'text', 'Plongée sur le lac des Quatre-Cantons')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5A5043] leading-relaxed mb-4">
                      {Z(
                        'step1_desc',
                        'textarea',
                        'Depuis le sommet à 1922 mètres, le regard plonge à pic sur les eaux turquoise du lac qui s enroulent autour des falaises calcaires. Au loin, les silhouettes du Rigi et du Pilatus émergent de la brume estivale.'
                      )}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#F0EBE1] text-xs text-[#7D7365] flex items-center justify-between">
                    <span>{Z('step1_tip_label', 'text', 'Altitude :')}</span>
                    <span className="font-medium text-[#2C2416]">
                      {Z('step1_tip_val', 'text', '1922 m — Belvédère panoramique')}
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
                    src="/images/destinations/suisse/stoos/etape2_stoos_cabane_eperon.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 sm:p-8 flex flex-col justify-between md:order-1">
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#8B6E32] font-semibold uppercase tracking-wider mb-2">
                      <span>{Z('step2_num', 'text', 'Étape 2 • L éperon rocheux')}</span>
                      <span className="flex items-center gap-1 font-mono text-[11px] text-[#7D7365]">
                        <MapPin className="w-3 h-3 text-[#8B6E32]" />
                        {Z('step2_gps', 'text', '46.9665° N, 8.6370° E')}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg sm:text-xl font-medium text-[#2C2416] mb-2">
                      {Z('step2_title', 'text', 'La cabane de bois face au couloir du lac d Uri')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5A5043] leading-relaxed mb-4">
                      {Z(
                        'step2_desc',
                        'textarea',
                        'Posée au bord du vide sur un aplomb herbeux, cette petite cabane en bardage de bois surplombe le couloir encaissé du lac d Uri. La roche calcaire grise se découpe contre le bleu profond des eaux.'
                      )}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#F0EBE1] text-xs text-[#7D7365] flex items-center justify-between">
                    <span>{Z('step2_tip_label', 'text', 'Atmosphère :')}</span>
                    <span className="font-medium text-[#2C2416]">
                      {Z('step2_tip_val', 'text', 'Vent d arête et abri en bois')}
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
                    src="/images/destinations/suisse/stoos/etape3_stoos_crete_foret.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#8B6E32] font-semibold uppercase tracking-wider mb-2">
                      <span>{Z('step3_num', 'text', 'Étape 3 • L arête médiane')}</span>
                      <span className="flex items-center gap-1 font-mono text-[11px] text-[#7D7365]">
                        <MapPin className="w-3 h-3 text-[#8B6E32]" />
                        {Z('step3_gps', 'text', '46.9625° N, 8.6454° E')}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg sm:text-xl font-medium text-[#2C2416] mb-2">
                      {Z('step3_title', 'text', 'Le sentier funambule entre herbe et gouffre')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5A5043] leading-relaxed mb-4">
                      {Z(
                        'step3_desc',
                        'textarea',
                        'Le sentier oscille le long de la ligne de crête. D un côté, les pentes vertigineuses dévalent vers la forêt de sapins ; de l autre, les crêtes alpines se succèdent jusqu aux glaciers des Alpes uranaises.'
                      )}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#F0EBE1] text-xs text-[#7D7365] flex items-center justify-between">
                    <span>{Z('step3_tip_label', 'text', 'Terrain :')}</span>
                    <span className="font-medium text-[#2C2416]">
                      {Z('step3_tip_val', 'text', 'Sentier bien tracé sécurisé par câbles')}
                    </span>
                  </div>
                </div>
              </div>
            </article>

            {/* ETAPE 4 */}
            <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div className="relative h-64 md:h-auto min-h-[260px] md:order-2">
                  <Image
                    src="/images/destinations/suisse/stoos/etape4_stoos_rayons_alpins.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 sm:p-8 flex flex-col justify-between md:order-1">
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#8B6E32] font-semibold uppercase tracking-wider mb-2">
                      <span>{Z('step4_num', 'text', 'Étape 4 • Versant sud')}</span>
                      <span className="flex items-center gap-1 font-mono text-[11px] text-[#7D7365]">
                        <MapPin className="w-3 h-3 text-[#8B6E32]" />
                        {Z('step4_gps', 'text', '46.9614° N, 8.6509° E')}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg sm:text-xl font-medium text-[#2C2416] mb-2">
                      {Z('step4_title', 'text', 'Rayons crépusculaires à travers la brume')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5A5043] leading-relaxed mb-4">
                      {Z(
                        'step4_desc',
                        'textarea',
                        'Aux alentours de 20 heures, le soleil descend derrière les crêtes glaronaises. Des rais de lumière oblique percent l atmosphère brumeuse de la vallée, illuminant les versants herbeux d une lueur mordorée.'
                      )}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#F0EBE1] text-xs text-[#7D7365] flex items-center justify-between">
                    <span>{Z('step4_tip_label', 'text', 'Horaire :')}</span>
                    <span className="font-medium text-[#2C2416]">
                      {Z('step4_tip_val', 'text', 'Lumière rasante entre 19h45 et 20h15')}
                    </span>
                  </div>
                </div>
              </div>
            </article>

            {/* ETAPE 5 */}
            <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div className="relative h-64 md:h-auto min-h-[260px]">
                  <Image
                    src="/images/destinations/suisse/stoos/etape5_stoos_heure_doree.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#8B6E32] font-semibold uppercase tracking-wider mb-2">
                      <span>{Z('step5_num', 'text', 'Étape 5 • Alpages du soir')}</span>
                      <span className="flex items-center gap-1 font-mono text-[11px] text-[#7D7365]">
                        <MapPin className="w-3 h-3 text-[#8B6E32]" />
                        {Z('step5_gps', 'text', '46.9614° N, 8.6534° E')}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg sm:text-xl font-medium text-[#2C2416] mb-2">
                      {Z('step5_title', 'text', 'L heure dorée sur les combes d herbe')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5A5043] leading-relaxed mb-4">
                      {Z(
                        'step5_desc',
                        'textarea',
                        'Alors que le vent d altitude fraîchit sensiblement, les ombres s étirent sur les combes. Les chalets d alpage disséminés dans la vallée semblent minuscules sous la masse des sommets.'
                      )}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#F0EBE1] text-xs text-[#7D7365] flex items-center justify-between">
                    <span>{Z('step5_tip_label', 'text', 'Prévoyance :')}</span>
                    <span className="font-medium text-[#2C2416]">
                      {Z('step5_tip_val', 'text', 'Coupe-vent indispensable dès le coucher')}
                    </span>
                  </div>
                </div>
              </div>
            </article>

            {/* ETAPE 6 */}
            <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div className="relative h-64 md:h-auto min-h-[260px] md:order-2">
                  <Image
                    src="/images/destinations/suisse/stoos/etape6_stoos_table_crepuscule.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 sm:p-8 flex flex-col justify-between md:order-1">
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#8B6E32] font-semibold uppercase tracking-wider mb-2">
                      <span>{Z('step6_num', 'text', 'Étape 6 • Le belvédère du soir')}</span>
                      <span className="flex items-center gap-1 font-mono text-[11px] text-[#7D7365]">
                        <MapPin className="w-3 h-3 text-[#8B6E32]" />
                        {Z('step6_gps', 'text', '46.9576° N, 8.6604° E')}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg sm:text-xl font-medium text-[#2C2416] mb-2">
                      {Z('step6_title', 'text', 'La table de bois face aux Alpes pourpres')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5A5043] leading-relaxed mb-4">
                      {Z(
                        'step6_desc',
                        'textarea',
                        'À la nuit tombante, la table de pique-nique solitaire sur le promontoire rocheux devient le poste d observation idéal. Le ciel prend des teintes rose et ambre, dans un silence total que seuls les échos lointains de cloches troublent encore.'
                      )}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#F0EBE1] text-xs text-[#7D7365] flex items-center justify-between">
                    <span>{Z('step6_tip_label', 'text', 'Descente :')}</span>
                    <span className="font-medium text-[#2C2416]">
                      {Z('step6_tip_val', 'text', 'Lampe frontale obligatoire pour le retour')}
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
              {Z('carnet_title', 'text', 'Nos repères terrain pour Stoos')}
            </h2>
            <ul className="space-y-3 text-xs sm:text-sm text-[#5A5043]">
              <li className="flex items-start gap-2">
                <span className="text-[#8B6E32] font-bold">•</span>
                <span>
                  <strong>{Z('carnet_point1_strong', 'text', 'Mobilité 100% douce :')}</strong>{' '}
                  {Z(
                    'carnet_point1_text',
                    'text',
                    'Train direct CFF jusqu à Schwyz, puis bus 501 jusqu au pied de la Stoosbahn. Le funiculaire le plus raide du monde (pente de 110%) vous monte directement dans le village sans voiture.'
                  )}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#8B6E32] font-bold">•</span>
                <span>
                  <strong>{Z('carnet_point2_strong', 'text', 'Décaler son horaire :')}</strong>{' '}
                  {Z(
                    'carnet_point2_text',
                    'text',
                    'Monter sur les crêtes après 16h30. Les touristes de la journée redescendent vers la plaine et le sentier devient désert pour le coucher de soleil.'
                  )}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#8B6E32] font-bold">•</span>
                <span>
                  <strong>{Z('carnet_point3_strong', 'text', 'Dormir au village :')}</strong>{' '}
                  {Z(
                    'carnet_point3_text',
                    'text',
                    'Passer la nuit dans l une des auberges traditionnelles de Stoos permet d assister au réveil brumeux des sommets avant l arrivée des premiers funiculaires.'
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

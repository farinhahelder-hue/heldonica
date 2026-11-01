import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Compass, Eye, Lightbulb } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getPageZones } from '@/lib/cms-zones';
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider';
import EditableZone from '@/components/inline-edit/EditableZone';
import EditableIcon from '@/components/inline-edit/EditableIcon';
import { buildPageMetadata } from '@/lib/page-metadata';
import ComingSoonDestination from '@/components/ComingSoonDestination';
import { isUnpublishedCmsPage } from '@/lib/unpublished-pages';

const SITE_URL = 'https://www.heldonica.fr';
const PAGE = 'destinations-madere-ponta-do-sol';

export const revalidate = 86400;

const metadata: Metadata = {
  title: 'Ponta do Sol & l arche de basalte au couchant : notre carnet slow travel | Heldonica',
  description:
    'Sur la côte sud la plus ensoleillée de Madère : le vieux débarcadère en arche de pierre de Ponta do Sol, les bananeraies en terrasses et la lumière dorée du soir. Notre carnet vécu en duo.',
  openGraph: {
    title: 'Ponta do Sol & l arche de basalte au couchant : notre carnet slow travel | Heldonica',
    description:
      'Le vieux débarcadère en arche de pierre de Ponta do Sol, les bananeraies en terrasses et la lumière dorée du soir à Madère.',
    type: 'website',
    images: [`${SITE_URL}/og-default.jpg`],
    locale: 'fr_FR',
    siteName: 'Heldonica',
  },
  alternates: {
    canonical: `${SITE_URL}/destinations/madere/ponta-do-sol`,
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('destinations-madere-ponta-do-sol', metadata);
}

interface Props {
  searchParams?: Promise<{ preview?: string }>;
}

export default async function PontadoSolPage({ searchParams }: Props) {
  const sp = searchParams ? await searchParams : {};
  const isPreview = sp.preview === 'draft' || sp.preview === 'true';
  const zones = await getPageZones(PAGE);

  // Mode brouillon sécurisé : tant que la page figure dans lib/unpublished-pages.ts,
  // le visiteur public voit la page « Bientôt ». L'accès aperçu se fait via ?preview=draft.
  if (!isPreview && isUnpublishedCmsPage(PAGE)) {
    return (
      <ComingSoonDestination
        slug="madere-ponta-do-sol"
        title={zones.title || 'Ponta-do-Sol'}
        country="Madère"
        hero_unsplash_url="/og-default.jpg"
        zones={zones}
      />
    );
  }

  const Z = (
    zone: string,
    type: 'text' | 'textarea' | 'html' | 'image',
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
        <section className="relative h-[65vh] min-h-[480px] max-h-[680px] w-full overflow-hidden flex items-end bg-[#1E1916]">
          <div className="absolute inset-0">
            {Z(
              'hero_image',
              'image',
              '/og-default.jpg',
              'w-full h-full object-cover object-center opacity-75'
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/20" />

          <div className="relative max-w-4xl mx-auto px-6 pb-12 w-full text-white">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#E8C547] font-semibold mb-3">
              <Link href="/destinations" className="hover:underline">
                {Z('breadcrumb_destinations', 'text', 'Destinations')}
              </Link>
              <span>{Z('breadcrumb_sep_1', 'text', '/')}</span>
              <Link href="/destinations/madere" className="hover:underline">
                {Z('breadcrumb_country', 'text', 'Madère')}
              </Link>
              <span>{Z('breadcrumb_sep_2', 'text', '/')}</span>
              <span>{Z('breadcrumb_current', 'text', 'Ponta do Sol')}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white mb-4 leading-[1.15]">
              {Z(
                'hero_title',
                'text',
                'Ponta do Sol : l arche de pierre et la lumière dorée du couchant'
              )}
            </h1>

            <p className="text-white/90 text-sm sm:text-base max-w-2xl font-light leading-relaxed mb-6">
              {Z(
                'hero_subtitle',
                'textarea',
                'Encaissé dans une faille volcanique de la côte sud-ouest, ce bourg aux façades pastel regarde le soleil descendre dans l Atlantique derrière les arches de son ancien débarcadère.'
              )}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-white/80 border-t border-white/20 pt-4">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#E8C547]" />
                {Z('hero_meta_loc', 'text', 'Ponta do Sol · Côte Sud-Ouest, Madère')}
              </span>
              <span className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#E8C547]" />
                {Z('hero_meta_duration', 'text', 'Fin d après-midi & soirée')}
              </span>
              <span className="bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded text-[11px] font-medium text-white">
                {Z('hero_meta_badge', 'text', 'Testé sur le terrain · Octobre 2024')}
              </span>
            </div>
          </div>
        </section>

        {/* INTRO & CONSEIL TERRAIN */}
        <section className="max-w-3xl mx-auto px-6 py-12">
          <div className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm p-6 sm:p-8">
            <p className="text-eucalyptus text-[11px] font-medium uppercase tracking-[0.2em] mb-3">
              {Z('intro_kicker', 'text', 'L esprit du lieu')}
            </p>
            <h2 className="font-serif text-xl sm:text-2xl text-[#2C2416] font-normal mb-4">
              {Z('intro_title', 'text', 'La chaleur résiduelle du basalte quand l île ralentit')}
            </h2>
            <div className="prose prose-stone text-sm sm:text-base leading-relaxed text-[#5A5043] space-y-3 mb-6">
              <p>
                {Z(
                  'intro_text',
                  'textarea',
                  'Ponta do Sol ne porte pas son nom par hasard : abritée des nuages d alizés par le haut plateau central, cette entaille de la côte sud-ouest conserve le ciel le plus dégagé de Madère. Les maisons aux toits de tuiles ocre se serrent entre deux parois de basalte tapissées de bananiers.'
                )}
              </p>
              <p>
                {Z(
                  'intro_p2',
                  'textarea',
                  'On s est assis en fin de journée sur la maçonnerie du vieux débarcadère du XIXe siècle (Cais da Ponta do Sol). Sous nos mains, la pierre noire gardait encore la tiédeur de l après-midi pendant que la lumière rasante traversait l arche au-dessus des vagues.'
                )}
              </p>
            </div>

            <div className="p-5 rounded-sm bg-[#F4EFE6] border border-[#DED5C6] flex items-start gap-4">
              <div className="w-9 h-9 rounded-sm border border-[#DED5C6] bg-[#FAF7F2] flex items-center justify-center shrink-0 mt-0.5">
                <Lightbulb className="w-4 h-4 text-eucalyptus" strokeWidth={1.25} aria-hidden="true" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#2C2416] mb-1">
                  {Z('local_tip_kicker', 'text', 'Notre repère de terrain')}
                </p>
                <p className="text-sm text-[#5A5043] leading-relaxed">
                  {Z(
                    'local_tip',
                    'textarea',
                    'Évite le milieu de journée en plein été où la réverbération sur les galets est forte. Arrive une heure avant le coucher du soleil, gare-toi à l entrée du tunnel côtier et rejoins le vieux pont de pierre à pied pour profiter de l heure dorée.'
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* TROIS PÉPITES / REPERES SENSORIELS */}
        <section className="py-12 bg-[#EFE9DF] border-y border-[#DED5C6]">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl font-serif font-normal text-[#2C2416] mb-2 text-center">
              {Z('highlights_title_prefix', 'text', 'Ce qu on retient de Ponta do Sol')}
            </h2>
            <p className="text-[11px] text-[#5A5043] tracking-[0.18em] text-center uppercase mb-10">
              {Z('highlights_subtitle', 'text', 'Trois repères vécus sur la côte ensoleillée')}
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-[#FAF7F2] rounded-sm p-6 border border-[#DED5C6]">
                <div className="w-10 h-10 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center mb-4">
                  <EditableIcon page="destinations-madere-ponta-do-sol" zone="highlight_1_emoji" fallback="Compass" className="w-5 h-5 text-eucalyptus" />
                </div>
                <h3 className="font-serif font-normal text-[#2C2416] text-lg mb-2">
                  {Z('highlight_1_title', 'text', 'Le Cais da Ponta do Sol', undefined, 'span')}
                </h3>
                <p className="text-[#5A5043] text-xs leading-relaxed">
                  {Z(
                    'highlight_1_description',
                    'textarea',
                    'Édifié entre 1848 et 1850 en pierre de taille volcanique pour relier un rocher isolé au rivage, ce pont en arche servait autrefois à embarquer le sucre et le vin vers Funchal.',
                    undefined,
                    'span'
                  )}
                </p>
              </div>

              <div className="bg-[#FAF7F2] rounded-sm p-6 border border-[#DED5C6]">
                <div className="w-10 h-10 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center mb-4">
                  <EditableIcon page="destinations-madere-ponta-do-sol" zone="highlight_2_emoji" fallback="Leaf" className="w-5 h-5 text-eucalyptus" />
                </div>
                <h3 className="font-serif font-normal text-[#2C2416] text-lg mb-2">
                  {Z('highlight_2_title', 'text', 'Les terrasses de bananiers', undefined, 'span')}
                </h3>
                <p className="text-[#5A5043] text-xs leading-relaxed">
                  {Z(
                    'highlight_2_description',
                    'textarea',
                    'Les versants abrupts qui encadrent le village sont découpés en poios — de minuscules terrasses irriguées par les levadas où mûrissent les petites bananes parfumées de Madère.',
                    undefined,
                    'span'
                  )}
                </p>
              </div>

              <div className="bg-[#FAF7F2] rounded-sm p-6 border border-[#DED5C6]">
                <div className="w-10 h-10 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center mb-4">
                  <EditableIcon page="destinations-madere-ponta-do-sol" zone="highlight_3_emoji" fallback="Sparkles" className="w-5 h-5 text-eucalyptus" />
                </div>
                <h3 className="font-serif font-normal text-[#2C2416] text-lg mb-2">
                  {Z('highlight_3_title', 'text', 'La Rua Príncipe Dom Luís', undefined, 'span')}
                </h3>
                <p className="text-[#5A5043] text-xs leading-relaxed">
                  {Z(
                    'highlight_3_description',
                    'textarea',
                    'Derrière la digue de galets, la rue principale pavée de calçada mène à l église Nossa Senhora da Luz et à ses plafonds peints de style mudéjar du XVe siècle.',
                    undefined,
                    'span'
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ITINERAIRE SECTION */}
        <section className="max-w-4xl mx-auto px-6 py-14">
          <div className="text-center mb-10">
            <span className="text-xs uppercase tracking-[0.2em] text-[#8B6E32] font-semibold">
              {Z('itinerary_label', 'text', 'Parcours Pas à Pas')}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#2C2416] font-normal mt-1">
              {Z(
                'itinerary_title',
                'text',
                'Notre itinéraire sur la côte sud-ouest : 3 étapes entre falaises et couchant'
              )}
            </h2>
            <p className="text-xs sm:text-sm text-[#7D7365] mt-2 max-w-xl mx-auto">
              {Z(
                'itinerary_subtitle',
                'text',
                'Relevés de terrain et coordonnées GPS enregistrés le long du littoral sud de Madère.'
              )}
            </p>
          </div>

          <div className="space-y-12">
            {/* ETAPE 1 */}
            <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div className="relative h-64 md:h-auto min-h-[260px]">
                  <Image
                    src="/images/destinations/madere/itinerary/etape7_cabo_girao_faja.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#8B6E32] font-semibold uppercase tracking-wider mb-2">
                      <span>{Z('step1_num', 'text', 'Étape 1 • En route depuis l Est')}</span>
                      <span className="flex items-center gap-1 font-mono text-[11px] text-[#7D7365]">
                        <MapPin className="w-3 h-3 text-[#8B6E32]" />
                        {Z('step1_gps', 'text', '32.6567° N, 17.0216° W')}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg sm:text-xl font-medium text-[#2C2416] mb-2">
                      {Z('step1_title', 'text', 'Les murailles volcaniques de Cabo Girão et Ribeira Brava')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5A5043] leading-relaxed mb-4">
                      {Z(
                        'step1_desc',
                        'textarea',
                        'Avant d atteindre Ponta do Sol, la côte sud déploie ses falaises géantes au-dessus de la Fajã dos Padres et de Ribeira Brava. On suit l ancienne route côtière là où elle reste ouverte pour saisir l échelle minérale de l île.'
                      )}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#F0EBE1] text-xs text-[#7D7365] flex items-center justify-between">
                    <span>{Z('step1_tip_label', 'text', 'Perspective :')}</span>
                    <span className="font-medium text-[#2C2416]">
                      {Z('step1_tip_val', 'text', 'Parois de plus de 500 m plongeant dans l Atlantique')}
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
                    src="/images/destinations/madere/itinerary/etape4_funchal_bananeraies.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 sm:p-8 flex flex-col justify-between md:order-1">
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#8B6E32] font-semibold uppercase tracking-wider mb-2">
                      <span>{Z('step2_num', 'text', 'Étape 2 • Coteaux agricoles')}</span>
                      <span className="flex items-center gap-1 font-mono text-[11px] text-[#7D7365]">
                        <MapPin className="w-3 h-3 text-[#8B6E32]" />
                        {Z('step2_gps', 'text', '32.6812° N, 17.1031° W')}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg sm:text-xl font-medium text-[#2C2416] mb-2">
                      {Z('step2_title', 'text', 'Les ruelles hautes et les terrasses de bananeraies')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5A5043] leading-relaxed mb-4">
                      {Z(
                        'step2_desc',
                        'textarea',
                        'En remontant à pied derrière l église paroissiale, on longe les canaux d irrigation qui alimentent les jardins suspendus. Le bruit de l eau courante dans les rigoles de pierre accompagne la descente vers le front de mer.'
                      )}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#F0EBE1] text-xs text-[#7D7365] flex items-center justify-between">
                    <span>{Z('step2_tip_label', 'text', 'Ambiance :')}</span>
                    <span className="font-medium text-[#2C2416]">
                      {Z('step2_tip_val', 'text', 'Feuilles de bananiers bruissantes et pierre chaude')}
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
                    src="/og-default.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#8B6E32] font-semibold uppercase tracking-wider mb-2">
                      <span>{Z('step3_num', 'text', 'Étape 3 • Le Débarcadère')}</span>
                      <span className="flex items-center gap-1 font-mono text-[11px] text-[#7D7365]">
                        <MapPin className="w-3 h-3 text-[#8B6E32]" />
                        {Z('step3_gps', 'text', '32.6791° N, 17.1044° W')}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg sm:text-xl font-medium text-[#2C2416] mb-2">
                      {Z('step3_title', 'text', 'Crépuscule sur l arche du Cais da Ponta do Sol')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5A5043] leading-relaxed mb-4">
                      {Z(
                        'step3_desc',
                        'textarea',
                        'À l heure où le soleil s approche de l horizon ouest, la voûte en plein cintre du vieux débarcadère encadre la houle dorée. C est ici qu on s est posés sans parler, simplement pour regarder l ombre de l arche s allonger sur les galets.'
                      )}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#F0EBE1] text-xs text-[#7D7365] flex items-center justify-between">
                    <span>{Z('step3_tip_label', 'text', 'Lumière :')}</span>
                    <span className="font-medium text-[#2C2416]">
                      {Z('step3_tip_val', 'text', 'Rayons rasants plein ouest en fin d après-midi')}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* CE QU'ON A MOINS AIMÉ & CONSEILS PRATIQUES */}
        <section className="max-w-3xl mx-auto px-6 pb-14">
          <div className="bg-[#F4EFE6] border border-[#E3DACB] rounded-sm p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl text-[#2C2416] font-normal mb-3">
                {Z('carnet_title', 'text', 'Ce qu on a moins aimé (et comment l anticiper)')}
              </h2>
              <p className="text-xs sm:text-sm text-[#5A5043] leading-relaxed">
                {Z(
                  'carnet_honesty',
                  'textarea',
                  'Le stationnement dans l entaille étroite du village est vite saturé en fin d après-midi, et la plage de gros galets ronds demande des sandales d eau si tu comptes te baigner.'
                )}
              </p>
            </div>

            <div className="border-t border-[#DED5C6] pt-5">
              <h3 className="font-serif text-lg text-[#2C2416] font-normal mb-3">
                {Z('carnet_tips_title', 'text', 'Nos repères pratiques pour Ponta do Sol')}
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-[#5A5043]">
                <li className="flex items-start gap-2">
                  <span className="text-[#8B6E32] font-bold">•</span>
                  <span>
                    <strong>{Z('carnet_point1_strong', 'text', 'La poncha au retour des levadas :')}</strong>{' '}
                    {Z(
                      'carnet_point1_text',
                      'text',
                      'En redescendant de la Levada do Moinho ou de Ribeira Brava, arrête-toi dans un petit bar de village pour goûter la poncha fraîchement battue au caralhinho.'
                    )}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#8B6E32] font-bold">•</span>
                  <span>
                    <strong>{Z('carnet_point2_strong', 'text', 'L ancienne route sous la falaise :')}</strong>{' '}
                    {Z(
                      'carnet_point2_text',
                      'text',
                      'La célèbre cascade des Anjos (Cascata dos Anjos) sur la vieille route ER101 à la sortie ouest est désormais très fréquentée et glissante : privilégie le calme du débarcadère en pierre.'
                    )}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#8B6E32] font-bold">•</span>
                  <span>
                    <strong>{Z('carnet_point3_strong', 'text', 'Repli météo :')}</strong>{' '}
                    {Z(
                      'carnet_point3_text',
                      'text',
                      'Quand le brouillard bouche Santana ou São Vicente au nord, Ponta do Sol reste presque toujours au sec et lumineuse.'
                    )}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* B2C CTA TRAVEL PLANNING */}
        <section className="py-16 bg-[#2A1D18] text-[#F7F3EC] text-center">
          <div className="max-w-2xl mx-auto px-6">
            <span className="text-[#E6DEC8]/80 text-[11px] font-medium tracking-[0.2em] uppercase mb-3 block">
              {Z('cta_kicker', 'text', 'Conception sur mesure')}
            </span>
            <h2 className="text-2xl md:text-3xl font-serif font-normal mb-4">
              {Z('cta_title', 'text', 'Tu prépares ton itinéraire à Madère ?')}
            </h2>
            <p className="text-[#E6DEC8]/80 text-sm leading-relaxed mb-8 max-w-lg mx-auto">
              {Z(
                'cta_text',
                'textarea',
                'On construit ton carnet de route jour par jour selon ton rythme, la météo des microclimats et nos adresses testées sur l île.'
              )}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/travel-planning"
                className="px-7 py-3 bg-action text-[#FAF7F2] rounded-sm font-medium text-xs uppercase tracking-[0.16em] hover:bg-action-fonce transition-colors"
              >
                {Z('cta_button_1', 'text', 'Préparer mon voyage')}
              </Link>
              <Link
                href="/destinations/madere"
                className="px-7 py-3 border border-[#E6DEC8]/35 text-[#E6DEC8] hover:text-[#FAF7F2] rounded-sm font-medium text-xs uppercase tracking-[0.16em] hover:border-[#FAF7F2] transition-colors"
              >
                {Z('cta_button_2', 'text', 'Retour au guide Madère')}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </InlineEditProvider>
  );
}

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
const PAGE = 'destinations-madere-achadas-da-cruz';

export const revalidate = 3600;

const metadata: Metadata = {
  title: 'Achadas da Cruz & la Fajã da Quebrada Nova : notre carnet slow travel | Heldonica',
  description:
    'Descente par le téléphérique agricole à 98 % de pente vers la fajã de galets marins d Achadas da Cruz à Madère. Notre itinéraire vécu en duo, coordonnées GPS et repères de marée.',
  openGraph: {
    title: 'Achadas da Cruz & la Fajã da Quebrada Nova : notre carnet slow travel | Heldonica',
    description:
      'Descente par le téléphérique agricole à 98 % de pente vers la fajã de galets marins d Achadas da Cruz à Madère. Notre itinéraire vécu en duo.',
    type: 'website',
    images: [`${SITE_URL}/images/destinations/madere/achadas_da_cruz.jpg`],
    locale: 'fr_FR',
    siteName: 'Heldonica',
  },
  alternates: {
    canonical: `${SITE_URL}/destinations/madere/achadas-da-cruz`,
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('destinations-madere-achadas-da-cruz', metadata);
}

interface Props {
  searchParams?: Promise<{ preview?: string }>;
}

export default async function AchadasdaCruzPage({ searchParams }: Props) {
  const sp = searchParams ? await searchParams : {};
  const isPreview = sp.preview === 'draft' || sp.preview === 'true';
  const zones = await getPageZones(PAGE);

  // Mode brouillon sécurisé : tant que la page figure dans lib/unpublished-pages.ts,
  // le visiteur public voit la page « Bientôt ». L'accès aperçu se fait via ?preview=draft.
  if (!isPreview && isUnpublishedCmsPage(PAGE)) {
    return (
      <ComingSoonDestination
        slug="madere-achadas-da-cruz"
        title={zones.title || 'Achadas-da-Cruz'}
        country="Madère"
        hero_unsplash_url="/images/destinations/madere/achadas_da_cruz.jpg"
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
              '/images/destinations/madere/achadas_da_cruz.jpg',
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
              <span>{Z('breadcrumb_current', 'text', 'Achadas da Cruz')}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white mb-4 leading-[1.15]">
              {Z(
                'hero_title',
                'text',
                'Achadas da Cruz : 450 mètres de vide vers la fajã de galets'
              )}
            </h1>

            <p className="text-white/90 text-sm sm:text-base max-w-2xl font-light leading-relaxed mb-6">
              {Z(
                'hero_subtitle',
                'textarea',
                'À la pointe nord-ouest de Madère, une cabine suspendue descend à 98 % de pente le long de la paroi volcanique. En bas, un hameau agricole isolé où l océan Atlantique roule les galets noirs.'
              )}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-white/80 border-t border-white/20 pt-4">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#E8C547]" />
                {Z('hero_meta_loc', 'text', 'Achadas da Cruz · Côte Nord-Ouest, Madère')}
              </span>
              <span className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#E8C547]" />
                {Z('hero_meta_duration', 'text', 'Demi-journée (3 à 4 heures)')}
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
              {Z('intro_title', 'text', 'Là où le plateau d altitude cède la place au fracas des vagues')}
            </h2>
            <div className="prose prose-stone text-sm sm:text-base leading-relaxed text-[#5A5043] space-y-3 mb-6">
              <p>
                {Z(
                  'intro_text',
                  'textarea',
                  'Quand on arrive sur le promontoire d Achadas da Cruz après avoir traversé le plateau d altitude, rien ne laisse deviner ce qui se cache 450 mètres plus bas. La falaise basaltique tombe presque à la verticale dans l Atlantique. Au pied de la muraille, une étroite bande de terre gagnée sur d anciens éboulis — la Fajã da Quebrada Nova — abrite des lopins de vigne, de patate douce et quelques cabanes de pierre sèche.'
                )}
              </p>
              <p>
                {Z(
                  'intro_p2',
                  'textarea',
                  'On a emprunté le téléphérique agricole qui relie le belvédère au rivage. Dès que la cabine bascule dans la pente à 98 %, le vent du plateau s efface et le grondement sourd des rouleaux sur les galets monte à mesure qu on approche de l écume.'
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
                    'Vérifie impérativement l heure de la dernière remontée auprès de l opérateur avant de descendre (généralement interrompu entre 12h et 13h, fermeture en fin d après-midi). Si le vent se lève fort, la cabine peut être arrêtée : le sentier pédestre de la Vereda du Calhau demande alors près d une heure trente de montée soutenue.'
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
              {Z('highlights_title_prefix', 'text', 'Ce qu on retient d Achadas da Cruz')}
            </h2>
            <p className="text-[11px] text-[#5A5043] tracking-[0.18em] text-center uppercase mb-10">
              {Z('highlights_subtitle', 'text', 'Trois repères vécus entre falaise et océan')}
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-[#FAF7F2] rounded-sm p-6 border border-[#DED5C6]">
                <div className="w-10 h-10 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center mb-4">
                  <EditableIcon page="destinations-madere-achadas-da-cruz" zone="highlight_1_emoji" fallback="Compass" className="w-5 h-5 text-eucalyptus" />
                </div>
                <h3 className="font-serif font-normal text-[#2C2416] text-lg mb-2">
                  {Z('highlight_1_title', 'text', 'La pente à 98 %', undefined, 'span')}
                </h3>
                <p className="text-[#5A5043] text-xs leading-relaxed">
                  {Z(
                    'highlight_1_description',
                    'textarea',
                    'Construit à l origine pour permettre aux agriculteurs de remonter leurs récoltes sans porter les charges à dos d homme sur la falaise, ce téléphérique offre cinq minutes de plongée silencieuse face à l océan.',
                    undefined,
                    'span'
                  )}
                </p>
              </div>

              <div className="bg-[#FAF7F2] rounded-sm p-6 border border-[#DED5C6]">
                <div className="w-10 h-10 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center mb-4">
                  <EditableIcon page="destinations-madere-achadas-da-cruz" zone="highlight_2_emoji" fallback="Leaf" className="w-5 h-5 text-eucalyptus" />
                </div>
                <h3 className="font-serif font-normal text-[#2C2416] text-lg mb-2">
                  {Z('highlight_2_title', 'text', 'Les jardins de pierres sèches', undefined, 'span')}
                </h3>
                <p className="text-[#5A5043] text-xs leading-relaxed">
                  {Z(
                    'highlight_2_description',
                    'textarea',
                    'En bas, le microclimat protégé des vents du nord par la paroi de 450 mètres réchauffe la terre : vignes basses, figuiers et cannes à sucre poussent à quelques mètres des embruns.',
                    undefined,
                    'span'
                  )}
                </p>
              </div>

              <div className="bg-[#FAF7F2] rounded-sm p-6 border border-[#DED5C6]">
                <div className="w-10 h-10 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center mb-4">
                  <EditableIcon page="destinations-madere-achadas-da-cruz" zone="highlight_3_emoji" fallback="Sparkles" className="w-5 h-5 text-eucalyptus" />
                </div>
                <h3 className="font-serif font-normal text-[#2C2416] text-lg mb-2">
                  {Z('highlight_3_title', 'text', 'L acoustique des galets', undefined, 'span')}
                </h3>
                <p className="text-[#5A5043] text-xs leading-relaxed">
                  {Z(
                    'highlight_3_description',
                    'textarea',
                    'Aucune voiture, aucun commerce en bas. Seul le roulement sourd des galets de basalte aspirés par le ressac atlantique accompagne la marche le long du sentier côtier.',
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
                'Notre boucle sur le flanc nord-ouest : 3 étapes entre fajã, brume et lave'
              )}
            </h2>
            <p className="text-xs sm:text-sm text-[#7D7365] mt-2 max-w-xl mx-auto">
              {Z(
                'itinerary_subtitle',
                'text',
                'Relevés de terrain et coordonnées GPS enregistrés lors de notre traversée d octobre 2024.'
              )}
            </p>
          </div>

          <div className="space-y-12">
            {/* ETAPE 1 */}
            <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div className="relative h-64 md:h-auto min-h-[260px]">
                  <Image
                    src="/images/destinations/madere/achadas_da_cruz.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#8B6E32] font-semibold uppercase tracking-wider mb-2">
                      <span>{Z('step1_num', 'text', 'Étape 1 • Fajã da Quebrada Nova')}</span>
                      <span className="flex items-center gap-1 font-mono text-[11px] text-[#7D7365]">
                        <MapPin className="w-3 h-3 text-[#8B6E32]" />
                        {Z('step1_gps', 'text', '32.8453° N, 17.2078° W')}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg sm:text-xl font-medium text-[#2C2416] mb-2">
                      {Z('step1_title', 'text', 'Descente par câble et marche le long du Calhau das Achadas')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5A5043] leading-relaxed mb-4">
                      {Z(
                        'step1_desc',
                        'textarea',
                        'En arrivant en bas, un chemin dallé de galets ronds longe la côte sur près d un kilomètre entre les murets agricoles et la grève noire. On a marché face au vent salé, le sel sur les lèvres, en regardant les rouleaux blancs se briser contre la digue naturelle.'
                      )}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#F0EBE1] text-xs text-[#7D7365] flex items-center justify-between">
                    <span>{Z('step1_tip_label', 'text', 'Dénivelé :')}</span>
                    <span className="font-medium text-[#2C2416]">
                      {Z('step1_tip_val', 'text', '451 m de paroi basaltique (pente 98 %)')}
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
                    src="/images/destinations/madere/fanal_foret.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 sm:p-8 flex flex-col justify-between md:order-1">
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#8B6E32] font-semibold uppercase tracking-wider mb-2">
                      <span>{Z('step2_num', 'text', 'Étape 2 • Plateau de Paul da Serra')}</span>
                      <span className="flex items-center gap-1 font-mono text-[11px] text-[#7D7365]">
                        <MapPin className="w-3 h-3 text-[#8B6E32]" />
                        {Z('step2_gps', 'text', '32.8091° N, 17.1419° W')}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg sm:text-xl font-medium text-[#2C2416] mb-2">
                      {Z('step2_title', 'text', 'Remontée vers la forêt primaire de Fanal')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5A5043] leading-relaxed mb-4">
                      {Z(
                        'step2_desc',
                        'textarea',
                        'À vingt minutes de route au-dessus d Achadas da Cruz, la route ER209 s enfonce dans les lauriers centenaires de Fanal. Le contraste est saisissant : on quitte la tiédeur salée de la fajã pour l humidité fraîche des arbres tordus par les alizés.'
                      )}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#F0EBE1] text-xs text-[#7D7365] flex items-center justify-between">
                    <span>{Z('step2_tip_label', 'text', 'Atmosphère :')}</span>
                    <span className="font-medium text-[#2C2416]">
                      {Z('step2_tip_val', 'text', 'Odeur de mousse humide et brume mouvante')}
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
                    src="/images/destinations/madere/porto_moniz.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#8B6E32] font-semibold uppercase tracking-wider mb-2">
                      <span>{Z('step3_num', 'text', 'Étape 3 • Pointe Nord-Ouest')}</span>
                      <span className="flex items-center gap-1 font-mono text-[11px] text-[#7D7365]">
                        <MapPin className="w-3 h-3 text-[#8B6E32]" />
                        {Z('step3_gps', 'text', '32.8668° N, 17.1667° W')}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg sm:text-xl font-medium text-[#2C2416] mb-2">
                      {Z('step3_title', 'text', 'Fin de journée aux bassins basaltiques de Porto Moniz')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5A5043] leading-relaxed mb-4">
                      {Z(
                        'step3_desc',
                        'textarea',
                        'En redescendant les lacets vers l est, la route plonge sur Porto Moniz. On rejoint les vasques de lave noire près du fort São João Baptista pour observer la houle remplir les bassins naturels à marée montante.'
                      )}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#F0EBE1] text-xs text-[#7D7365] flex items-center justify-between">
                    <span>{Z('step3_tip_label', 'text', 'Liaison :')}</span>
                    <span className="font-medium text-[#2C2416]">
                      {Z('step3_tip_val', 'text', '15 minutes par la route panoramique ER101')}
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
                  'Le téléphérique ne comporte que deux cabines de six places : en milieu de matinée, l attente au guichet du haut comme au retour en bas peut vite dépasser trente à quarante minutes. De plus, il n y a ni eau potable ni restauration ouverte en permanence dans la fajã.'
                )}
              </p>
            </div>

            <div className="border-t border-[#DED5C6] pt-5">
              <h3 className="font-serif text-lg text-[#2C2416] font-normal mb-3">
                {Z('carnet_tips_title', 'text', 'Nos repères pratiques avant de descendre')}
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-[#5A5043]">
                <li className="flex items-start gap-2">
                  <span className="text-[#8B6E32] font-bold">•</span>
                  <span>
                    <strong>{Z('carnet_point1_strong', 'text', 'Arriver dès l ouverture (8h30) :')}</strong>{' '}
                    {Z(
                      'carnet_point1_text',
                      'text',
                      'On descend avec les premiers agriculteurs, sans file d attente et dans la fraîcheur matinale.'
                    )}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#8B6E32] font-bold">•</span>
                  <span>
                    <strong>{Z('carnet_point2_strong', 'text', 'Prévoir de la monnaie :')}</strong>{' '}
                    {Z(
                      'carnet_point2_text',
                      'text',
                      'Le billet aller-retour (quelques euros par personne) se règle au petit guichet en haut de la falaise.'
                    )}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#8B6E32] font-bold">•</span>
                  <span>
                    <strong>{Z('carnet_point3_strong', 'text', 'Ne jamais s approcher du bord par forte houle :')}</strong>{' '}
                    {Z(
                      'carnet_point3_text',
                      'text',
                      'La côte nord-ouest reçoit de plein fouet la houle atlantique ; reste toujours sur le chemin dallé surélevé.'
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

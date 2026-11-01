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
const PAGE = 'destinations-portugal-porto';

const metadata: Metadata = {
  title: 'Porto & le Minho en couple : notre itinéraire slow travel | Heldonica',
  description:
    'Des quais du Douro aux collines de Guimarães : notre itinéraire slow travel testé en couple. Miradouros, azulejos historiques et coordonnées GPS réelles.',
  alternates: {
    canonical: `${SITE_URL}/destinations/portugal/porto`,
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('destinations-portugal-porto', metadata);
}

interface Props {
  searchParams?: Promise<{ preview?: string }>;
}

export default async function PortoPage({ searchParams }: Props) {
  const sp = searchParams ? await searchParams : {};
  const isPreview = sp.preview === 'draft' || sp.preview === 'true';
  const zones = await getPageZones(PAGE);

  // Mode brouillon sécurisé : tant que la page figure dans lib/unpublished-pages.ts,
  // le visiteur public voit la page « Bientôt ». L'accès aperçu se fait via ?preview=draft.
  if (!isPreview && isUnpublishedCmsPage(PAGE)) {
    return (
      <ComingSoonDestination
        slug="portugal-porto"
        title={zones.title || 'Porto'}
        country="Portugal"
        hero_unsplash_url="/images/destinations/portugal/porto/etape1_porto_virtudes.jpg"
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
            src="/images/destinations/portugal/porto/etape1_porto_virtudes.jpg"
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
              <span>{Z('breadcrumb_current', 'text', 'Porto & Minho')}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white mb-4 leading-[1.15]">
              {Z(
                'hero_title',
                'text',
                'Porto & le berceau du Minho : notre itinéraire slow travel'
              )}
            </h1>

            <p className="text-white/90 text-sm sm:text-base max-w-2xl font-light leading-relaxed mb-6">
              {Z(
                'hero_subtitle',
                'textarea',
                'Des miradouros dominant les toits du Douro aux ruelles pavées de Guimarães. Un voyage à pied testé en duo, entre façades d azulejos, douceurs de quartier et forteresses de granit.'
              )}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-white/80 border-t border-white/20 pt-4">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#E8C547]" />
                {Z('hero_meta_loc', 'text', 'Porto & Guimarães, Région Nord, Portugal')}
              </span>
              <span className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#E8C547]" />
                {Z('hero_meta_duration', 'text', '5 à 7 jours')}
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
              {Z('intro_title', 'text', 'Pourquoi ce coin de pays nous a touchés')}
            </h2>
            <div className="prose prose-stone text-sm sm:text-base leading-relaxed text-[#5A5043] space-y-3">
              <p>
                {Z(
                  'intro_p1',
                  'textarea',
                  'Porto ne s apprivoise pas au pas de course. La ville se vit en montant et descendant ses calçadas, en s arrêtant au crépuscule sur un muret de pierre au-dessus du Douro, ou en franchissant le porche silencieux d une église couverte d azulejos.'
                )}
              </p>
              <p>
                {Z(
                  'intro_p2',
                  'textarea',
                  'En poussant vers le nord jusqu à Guimarães, on touche à la racine historique du pays : les remparts de granit où résonne la mémoire portugaise, les places à arcades ombragées d oliviers centenaires et les tables de village où le temps semble s être suspendu.'
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
                'Notre itinéraire à pied : 6 étapes de charme'
              )}
            </h2>
            <p className="text-xs sm:text-sm text-[#7D7365] mt-2 max-w-xl mx-auto">
              {Z(
                'itinerary_subtitle',
                'text',
                'Toutes les étapes ci-dessous reposent sur nos observations réelles et nos relevés GPS enregistrés sur place.'
              )}
            </p>
          </div>

          <div className="space-y-12">
            {/* ETAPE 1 */}
            <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div className="relative h-64 md:h-auto min-h-[260px]">
                  <Image
                    src="/images/destinations/portugal/porto/etape1_porto_virtudes.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#8B6E32] font-semibold uppercase tracking-wider mb-2">
                      <span>{Z('step1_num', 'text', 'Étape 1 • Porto Ouest')}</span>
                      <span className="flex items-center gap-1 font-mono text-[11px] text-[#7D7365]">
                        <MapPin className="w-3 h-3 text-[#8B6E32]" />
                        {Z('step1_gps', 'text', '41.1434° N, 8.6104° W')}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg sm:text-xl font-medium text-[#2C2416] mb-2">
                      {Z('step1_title', 'text', 'Le Miradouro das Virtudes au coucher du soleil')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5A5043] leading-relaxed mb-4">
                      {Z(
                        'step1_desc',
                        'textarea',
                        'Sur les gradins herbeux de l ancien jardin des Virtudes, les habitants se retrouvent sans artifice au couchant. Le ciel passe du bleu profond à l orange cuivré sur les toitures étagées et les silhouettes des clochers du quartier historique.'
                      )}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#F0EBE1] text-xs text-[#7D7365] flex items-center justify-between">
                    <span>{Z('step1_tip_label', 'text', 'Ambiance :')}</span>
                    <span className="font-medium text-[#2C2416]">
                      {Z('step1_tip_val', 'text', 'Coucher de soleil, murets de pierre & quiétude')}
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
                    src="/images/destinations/portugal/porto/etape2_porto_saobento.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 sm:p-8 flex flex-col justify-between md:order-1">
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#8B6E32] font-semibold uppercase tracking-wider mb-2">
                      <span>{Z('step2_num', 'text', 'Étape 2 • Cœur Historique')}</span>
                      <span className="flex items-center gap-1 font-mono text-[11px] text-[#7D7365]">
                        <MapPin className="w-3 h-3 text-[#8B6E32]" />
                        {Z('step2_gps', 'text', '41.1450° N, 8.6111° W')}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg sm:text-xl font-medium text-[#2C2416] mb-2">
                      {Z('step2_title', 'text', 'La gare de São Bento à l heure bleue')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5A5043] leading-relaxed mb-4">
                      {Z(
                        'step2_desc',
                        'textarea',
                        'Édifiée sur les ruines d un couvent bénédictin, São Bento s illumine dès la nuit tombée. Passer le hall monumental au calme d une fin de journée permet d admirer les panneaux d azulejos historiques sans la foule des heures de pointe.'
                      )}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#F0EBE1] text-xs text-[#7D7365] flex items-center justify-between">
                    <span>{Z('step2_tip_label', 'text', 'Moment idéal :')}</span>
                    <span className="font-medium text-[#2C2416]">
                      {Z('step2_tip_val', 'text', 'Crépuscule, lumières chaudes de la façade')}
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
                    src="/images/destinations/portugal/porto/etape3_porto_congregados.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#8B6E32] font-semibold uppercase tracking-wider mb-2">
                      <span>{Z('step3_num', 'text', 'Étape 3 • Architecture sacrée')}</span>
                      <span className="flex items-center gap-1 font-mono text-[11px] text-[#7D7365]">
                        <MapPin className="w-3 h-3 text-[#8B6E32]" />
                        {Z('step3_gps', 'text', '41.1460° N, 8.6107° W')}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg sm:text-xl font-medium text-[#2C2416] mb-2">
                      {Z('step3_title', 'text', 'L Igreja dos Congregados & ses azulejos baroques')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5A5043] leading-relaxed mb-4">
                      {Z(
                        'step3_desc',
                        'textarea',
                        'À quelques pas des quais de gare, la façade de l église des Pères de la Congrégation offre un contraste saisissant entre le granit sombre et les scènes bibliques peintes en bleu et blanc. Un repère visuel précieux pour s orienter dans les ruelles hautes.'
                      )}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#F0EBE1] text-xs text-[#7D7365] flex items-center justify-between">
                    <span>{Z('step3_tip_label', 'text', 'Détail :')}</span>
                    <span className="font-medium text-[#2C2416]">
                      {Z('step3_tip_val', 'text', 'Façade baroque du XVIIe siècle')}
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
                    src="/images/destinations/portugal/porto/etape4_porto_francesinha.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 sm:p-8 flex flex-col justify-between md:order-1">
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#8B6E32] font-semibold uppercase tracking-wider mb-2">
                      <span>{Z('step4_num', 'text', 'Étape 4 • Terroir & Gastronomie')}</span>
                      <span className="flex items-center gap-1 font-mono text-[11px] text-[#7D7365]">
                        <MapPin className="w-3 h-3 text-[#8B6E32]" />
                        {Z('step4_gps', 'text', '41.1414° N, 8.6181° W')}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg sm:text-xl font-medium text-[#2C2416] mb-2">
                      {Z('step4_title', 'text', 'La Francesinha traditionnelle de São Nicolau')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5A5043] leading-relaxed mb-4">
                      {Z(
                        'step4_desc',
                        'textarea',
                        'Loin des adresses touristiques de façade, c est dans les petites tabernas de quartier que la Francesinha prend tout son sens : fromage fondant, sauce tomate épicée à la bière et pain croustillant préparé minute selon la recette du patron.'
                      )}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#F0EBE1] text-xs text-[#7D7365] flex items-center justify-between">
                    <span>{Z('step4_tip_label', 'text', 'Conseil :')}</span>
                    <span className="font-medium text-[#2C2416]">
                      {Z('step4_tip_val', 'text', 'Plat généreux, parfait après une longue marche')}
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
                    src="/images/destinations/portugal/porto/etape5_guimaraes_paco.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#8B6E32] font-semibold uppercase tracking-wider mb-2">
                      <span>{Z('step5_num', 'text', 'Étape 5 • Échappée Minho')}</span>
                      <span className="flex items-center gap-1 font-mono text-[11px] text-[#7D7365]">
                        <MapPin className="w-3 h-3 text-[#8B6E32]" />
                        {Z('step5_gps', 'text', '41.4429° N, 8.2930° W')}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg sm:text-xl font-medium text-[#2C2416] mb-2">
                      {Z('step5_title', 'text', 'Le Paço dos Duques de Bragança à Guimarães')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5A5043] leading-relaxed mb-4">
                      {Z(
                        'step5_desc',
                        'textarea',
                        'À une heure de train de Porto, le palais seigneurial du XVe siècle dresse ses cheminées cylindriques et ses créneaux au milieu d un parc boisé. L influence de l architecture bourguignonne et normande s y lit à chaque pierre.'
                      )}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#F0EBE1] text-xs text-[#7D7365] flex items-center justify-between">
                    <span>{Z('step5_tip_label', 'text', 'Accès :')}</span>
                    <span className="font-medium text-[#2C2416]">
                      {Z('step5_tip_val', 'text', 'Liaison directe en train régional (Comboios de Portugal)')}
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
                    src="/images/destinations/portugal/porto/etape6_guimaraes_oliveira.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 sm:p-8 flex flex-col justify-between md:order-1">
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#8B6E32] font-semibold uppercase tracking-wider mb-2">
                      <span>{Z('step6_num', 'text', 'Étape 6 • Racines du Portugal')}</span>
                      <span className="flex items-center gap-1 font-mono text-[11px] text-[#7D7365]">
                        <MapPin className="w-3 h-3 text-[#8B6E32]" />
                        {Z('step6_gps', 'text', '41.4429° N, 8.2929° W')}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg sm:text-xl font-medium text-[#2C2416] mb-2">
                      {Z('step6_title', 'text', 'Le Largo da Oliveira & le vieux bourg')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5A5043] leading-relaxed mb-4">
                      {Z(
                        'step6_desc',
                        'textarea',
                        'Le cœur battant de Guimarães : une place médiévale bordée de maisons à colombages, d arcades gothiques et d une vénérable église collégiale. S asseoir à l ombre des oliviers pour boire un café est l essence même du slow travel.'
                      )}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#F0EBE1] text-xs text-[#7D7365] flex items-center justify-between">
                    <span>{Z('step6_tip_label', 'text', 'Héritage :')}</span>
                    <span className="font-medium text-[#2C2416]">
                      {Z('step6_tip_val', 'text', 'Centre historique classé au patrimoine mondial')}
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
              {Z('carnet_title', 'text', 'Conseils pratiques pour ce voyage')}
            </h2>
            <ul className="space-y-3 text-xs sm:text-sm text-[#5A5043]">
              <li className="flex items-start gap-2">
                <span className="text-[#8B6E32] font-bold">•</span>
                <span>
                  <strong>{Z('carnet_point1_strong', 'text', 'Chaussures confortables impératives :')}</strong>{' '}
                  {Z(
                    'carnet_point1_text',
                    'text',
                    'Les calçadas de granit sont glissantes à la descente, surtout le matin par temps humide.'
                  )}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#8B6E32] font-bold">•</span>
                <span>
                  <strong>{Z('carnet_point2_strong', 'text', 'Prendre le train régional :')}</strong>{' '}
                  {Z(
                    'carnet_point2_text',
                    'text',
                    'La liaison ferroviaire entre São Bento et Guimarães coûte quelques euros et serpente à travers les collines verdoyantes du Minho.'
                  )}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#8B6E32] font-bold">•</span>
                <span>
                  <strong>{Z('carnet_point3_strong', 'text', 'Rythme ralenti :')}</strong>{' '}
                  {Z(
                    'carnet_point3_text',
                    'text',
                    'Réserver ses soirées pour flâner sur les miradouros du côté ouest de Porto plutôt que de multiplier les visites payantes.'
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

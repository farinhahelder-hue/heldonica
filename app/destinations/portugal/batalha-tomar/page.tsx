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
const PAGE = 'destinations-portugal-batalha-tomar';

const metadata: Metadata = {
  title: 'Batalha & Tomar : l héritage de pierre au Portugal | Heldonica',
  description:
    'Du cloître ciselé de Batalha aux collines de Tomar : itinéraire slow travel entre gothique flamboyant, dentelle manuéline et sanctuaires de colline.',
  alternates: {
    canonical: `${SITE_URL}/destinations/portugal/batalha-tomar`,
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('destinations-portugal-batalha-tomar', metadata);
}

interface Props {
  searchParams?: Promise<{ preview?: string }>;
}

export default async function BatalhaTomarPage({ searchParams }: Props) {
  const sp = searchParams ? await searchParams : {};
  const isPreview = sp.preview === 'draft' || sp.preview === 'true';
  const zones = await getPageZones(PAGE);

  // Mode brouillon sécurisé : tant que la page figure dans lib/unpublished-pages.ts,
  // le visiteur public voit la page « Bientôt ». L'accès aperçu se fait via ?preview=draft.
  if (!isPreview && isUnpublishedCmsPage(PAGE)) {
    return (
      <ComingSoonDestination
        slug="portugal-batalha-tomar"
        title={zones.title || 'Batalha'}
        country="Portugal"
        hero_unsplash_url="/images/destinations/portugal/batalha-tomar/etape1_batalha_cloitre.jpg"
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
            src="/images/destinations/portugal/batalha-tomar/etape1_batalha_cloitre.jpg"
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
              <span>{Z('breadcrumb_current', 'text', 'Batalha & Tomar')}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white mb-4 leading-[1.15]">
              {Z(
                'hero_title',
                'text',
                'Batalha & Tomar : l épopée de pierre des ordres chevaleresques'
              )}
            </h1>

            <p className="text-white/90 text-sm sm:text-base max-w-2xl font-light leading-relaxed mb-6">
              {Z(
                'hero_subtitle',
                'textarea',
                'Du gothique flamboyant de Santa Maria da Vitória aux collines templières du fleuve Nabão. Un itinéraire d histoire et de silence dans le centre du Portugal.'
              )}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-white/80 border-t border-white/20 pt-4">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#E8C547]" />
                {Z('hero_meta_loc', 'text', 'Batalha & Tomar, Région Centre, Portugal')}
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
              {Z('intro_title', 'text', 'La pierre blonde et la mémoire des ordres')}
            </h2>
            <div className="prose prose-stone text-sm sm:text-base leading-relaxed text-[#5A5043] space-y-3">
              <p>
                {Z(
                  'intro_p1',
                  'textarea',
                  'Édifié pour commémorer la victoire décisive d Aljubarrota en 1385, le monastère de Batalha présente un calcaire ocre qui s illumine au soleil couchant. Plus à l est, Tomar garde l empreinte des chevaliers de l Ordre du Christ.'
                )}
              </p>
              <p>
                {Z(
                  'intro_p2',
                  'textarea',
                  'Ce parcours relie les deux grands édifices par les routes secondaires bordées de pins et d oliviers, en prenant le temps d observer la finesse des sculptures et l atmosphère paisible des cloîtres.'
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
                'Notre itinéraire : 4 étapes entre cloîtres et sanctuaires'
              )}
            </h2>
            <p className="text-xs sm:text-sm text-[#7D7365] mt-2 max-w-xl mx-auto">
              {Z(
                'itinerary_subtitle',
                'text',
                'Relevés de terrain et coordonnées GPS enregistrés entre Batalha et Tomar.'
              )}
            </p>
          </div>

          <div className="space-y-12">
            {/* ETAPE 1 */}
            <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div className="relative h-64 md:h-auto min-h-[260px]">
                  <Image
                    src="/images/destinations/portugal/batalha-tomar/etape1_batalha_cloitre.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#8B6E32] font-semibold uppercase tracking-wider mb-2">
                      <span>{Z('step1_num', 'text', 'Étape 1 • Batalha : Cloître Royal')}</span>
                      <span className="flex items-center gap-1 font-mono text-[11px] text-[#7D7365]">
                        <MapPin className="w-3 h-3 text-[#8B6E32]" />
                        {Z('step1_gps', 'text', '39.6596° N, 8.8258° W')}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg sm:text-xl font-medium text-[#2C2416] mb-2">
                      {Z('step1_title', 'text', 'Dentelle manuéline et voûtes ogivales')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5A5043] leading-relaxed mb-4">
                      {Z(
                        'step1_desc',
                        'textarea',
                        'Le cloître de Jean Ier mêle la rigueur du gothique primitif aux remplages manuélins ajoutés plus tard. Chaque arcature déploie des motifs végétaux d une grande finesse taillés dans la pierre calcaire.'
                      )}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#F0EBE1] text-xs text-[#7D7365] flex items-center justify-between">
                    <span>{Z('step1_tip_label', 'text', 'Lumière :')}</span>
                    <span className="font-medium text-[#2C2416]">
                      {Z('step1_tip_val', 'text', 'Ombres projetées le matin à travers les remplages')}
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
                    src="/images/destinations/portugal/batalha-tomar/etape2_batalha_statue.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 sm:p-8 flex flex-col justify-between md:order-1">
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#8B6E32] font-semibold uppercase tracking-wider mb-2">
                      <span>{Z('step2_num', 'text', 'Étape 2 • Batalha : Parvis de pierre')}</span>
                      <span className="flex items-center gap-1 font-mono text-[11px] text-[#7D7365]">
                        <MapPin className="w-3 h-3 text-[#8B6E32]" />
                        {Z('step2_gps', 'text', '39.6583° N, 8.8261° W')}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg sm:text-xl font-medium text-[#2C2416] mb-2">
                      {Z('step2_title', 'text', 'La statue de Nuno Álvares et la façade sud')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5A5043] leading-relaxed mb-4">
                      {Z(
                        'step2_desc',
                        'textarea',
                        'Sur la vaste place minérale, la statue équestre du connétable veille sur le monument. Les pinacles, contreforts et gargouilles se dressent avec une élégance saisissante.'
                      )}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#F0EBE1] text-xs text-[#7D7365] flex items-center justify-between">
                    <span>{Z('step2_tip_label', 'text', 'Perspective :')}</span>
                    <span className="font-medium text-[#2C2416]">
                      {Z('step2_tip_val', 'text', 'Vue d ensemble sur la travée centrale')}
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
                    src="/images/destinations/portugal/batalha-tomar/etape3_batalha_tombes.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#8B6E32] font-semibold uppercase tracking-wider mb-2">
                      <span>{Z('step3_num', 'text', 'Étape 3 • Batalha : Capelas Imperfeitas')}</span>
                      <span className="flex items-center gap-1 font-mono text-[11px] text-[#7D7365]">
                        <MapPin className="w-3 h-3 text-[#8B6E32]" />
                        {Z('step3_gps', 'text', '39.6598° N, 8.8262° W')}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg sm:text-xl font-medium text-[#2C2416] mb-2">
                      {Z('step3_title', 'text', 'Les chapelles inachevées à ciel ouvert')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5A5043] leading-relaxed mb-4">
                      {Z(
                        'step3_desc',
                        'textarea',
                        'Cet octogone funéraire resté sans toit ouvre directement ses piliers sculptés vers le ciel bleu. Les motifs de cordages et de feuillages sculptés par Mateus Fernandes témoignent de la virtuosité des maîtres tailleurs de pierre.'
                      )}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#F0EBE1] text-xs text-[#7D7365] flex items-center justify-between">
                    <span>{Z('step3_tip_label', 'text', 'Atmosphère :')}</span>
                    <span className="font-medium text-[#2C2416]">
                      {Z('step3_tip_val', 'text', 'Ciel ouvert et pierre dorée')}
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
                    src="/images/destinations/portugal/batalha-tomar/etape4_tomar_ermida.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 sm:p-8 flex flex-col justify-between md:order-1">
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#8B6E32] font-semibold uppercase tracking-wider mb-2">
                      <span>{Z('step4_num', 'text', 'Étape 4 • Tomar : Ermida da Conceição')}</span>
                      <span className="flex items-center gap-1 font-mono text-[11px] text-[#7D7365]">
                        <MapPin className="w-3 h-3 text-[#8B6E32]" />
                        {Z('step4_gps', 'text', '39.6057° N, 8.4170° W')}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg sm:text-xl font-medium text-[#2C2416] mb-2">
                      {Z('step4_title', 'text', 'L ermitage Renaissance sur le coteau')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5A5043] leading-relaxed mb-4">
                      {Z(
                        'step4_desc',
                        'textarea',
                        'Nichée sur le flanc de colline sous le couvent du Christ, cette petite basilique conçue par João de Castilho est un chef-d œuvre de proportion classique et de paix loin de toute agitation.'
                      )}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#F0EBE1] text-xs text-[#7D7365] flex items-center justify-between">
                    <span>{Z('step4_tip_label', 'text', 'Sentier :')}</span>
                    <span className="font-medium text-[#2C2416]">
                      {Z('step4_tip_val', 'text', 'Chemin pavé ombragé montant depuis la vieille ville')}
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
              {Z('carnet_title', 'text', 'Nos repères terrain pour Batalha & Tomar')}
            </h2>
            <ul className="space-y-3 text-xs sm:text-sm text-[#5A5043]">
              <li className="flex items-start gap-2">
                <span className="text-[#8B6E32] font-bold">•</span>
                <span>
                  <strong>{Z('carnet_point1_strong', 'text', 'Billet combiné :')}</strong>{' '}
                  {Z(
                    'carnet_point1_text',
                    'text',
                    'Il existe un billet commun incluant Batalha, Alcobaça et le couvent du Christ à Tomar, valable plusieurs jours.'
                  )}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#8B6E32] font-bold">•</span>
                <span>
                  <strong>{Z('carnet_point2_strong', 'text', 'Pause au bord du Nabão :')}</strong>{' '}
                  {Z(
                    'carnet_point2_text',
                    'text',
                    'À Tomar, le parc Mouchão et sa roue à eau en bois offrent une halte paisible avant d entamer la montée vers la forteresse templière.'
                  )}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#8B6E32] font-bold">•</span>
                <span>
                  <strong>{Z('carnet_point3_strong', 'text', 'Route buissonnière :')}</strong>{' '}
                  {Z(
                    'carnet_point3_text',
                    'text',
                    'Privilégier la route N356 qui traverse le massif calcaire plutôt que les voies rapides afin d apprécier les paysages d oliveraies.'
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

import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Compass, Mountain, Train, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getPageZones } from '@/lib/cms-zones';
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider';
import EditableZone from '@/components/inline-edit/EditableZone';
import { buildPageMetadata } from '@/lib/page-metadata';

const PAGE = 'destinations-suisse';

const metadata: Metadata = {
  title: 'Suisse slow travel | Guide Heldonica — Alpes sans moteur & crêtes panoramiques',
  description:
    'Guide Suisse slow travel : Stoos, crête de Fronalpstock, funiculaire 110%, alpages et mobilité douce. Nos repères vérifiés sur le terrain en duo.',
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/suisse',
  },
  openGraph: {
    title: 'Suisse slow travel | Guide Heldonica — Alpes sans moteur',
    description:
      'Guide Suisse slow travel : Stoos, crête de Fronalpstock, funiculaire 110%, alpages et mobilité douce. Nos repères vérifiés sur le terrain en duo.',
    url: 'https://www.heldonica.fr/destinations/suisse',
    images: [
      {
        url: '/images/destinations/suisse/stoos/etape1_stoos_panorama_lac.jpg',
        width: 1200,
        height: 630,
        alt: 'Suisse slow travel — Stoos et Fronalpstock',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Suisse slow travel | Guide Heldonica',
    description: 'Montagnes, lacs, funiculaire le plus raide du monde et alpages sans moteur.',
    images: ['/images/destinations/suisse/stoos/etape1_stoos_panorama_lac.jpg'],
    creator: '@heldonica',
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata(PAGE, metadata);
}

export const revalidate = 3600;

export default async function SuissePage() {
  const zones = await getPageZones(PAGE);

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'TouristDestination',
            name: 'Suisse',
            description:
              'La Suisse slow travel : crêtes panoramiques du Fronalpstock, funiculaire le plus raide du monde à Stoos, mobilité douce et villages alpins préservés des moteurs.',
            url: 'https://www.heldonica.fr/destinations/suisse',
            address: {
              '@type': 'PostalAddress',
              addressCountry: 'CH',
            },
            geo: {
              '@type': 'GeoCoordinates',
              latitude: 46.9694,
              longitude: 8.6366,
            },
            touristType: ['Slow traveler', 'Nature lover', 'Hiker'],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'Comment voyager en Suisse sans voiture ?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Le réseau de transports suisse (CFF/SBB) permet d atteindre chaque crête et chaque village sans voiture. Pour Stoos, le train direct mène à Schwyz, le bus 501 vous dépose au pied du funiculaire Stoosbahn (110% de pente), puis les cabines sphériques vous montent dans le village sans voiture.',
                },
              },
              {
                '@type': 'Question',
                name: 'Quand faire la randonnée des crêtes de Stoos ?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'La meilleure période s étend de fin juin à début octobre. Notre repère terrain : partir sur les crêtes en fin d après-midi après 16h30, quand les excursionnistes redescendent vers la vallée. Vous profitez de la lumière dorée sur le lac des Quatre-Cantons dans un calme total.',
                },
              },
              {
                '@type': 'Question',
                name: 'La Suisse est-elle accessible en slow travel avec un budget maîtrisé ?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Oui, à condition de privilégier les pique-niques de terroir achetés directement dans les fromageries d alpage, de dormir dans les auberges de village et d emprunter les sentiers balisés gratuits plutôt que d accumuler les remontées mécaniques privées.',
                },
              },
            ],
          }),
        }}
      />

      <Header />

      <main className="min-h-screen bg-[#FDFBF7] text-[#2C2416]">
        {/* HERO SECTION */}
        <section className="relative h-[65vh] min-h-[480px] max-h-[660px] w-full overflow-hidden flex items-end">
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
                {Z('hero_breadcrumb_1', 'text', 'Destinations')}
              </Link>
              <span>{Z('hero_breadcrumb_sep', 'text', '/')}</span>
              <span>{Z('hero_breadcrumb_2', 'text', 'Suisse')}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white mb-4 leading-[1.15]">
              {Z(
                'hero_title',
                'text',
                'Suisse : les Alpes par leurs crêtes sans moteur'
              )}
            </h1>

            <p className="text-white/90 text-sm sm:text-base max-w-2xl font-light leading-relaxed mb-6">
              {Z(
                'hero_subtitle',
                'textarea',
                'Loin des clichés de carte postale, la Suisse se révèle dans ses villages d altitude sans voiture, ses funiculaires futuristes et le silence retrouvé de ses alpages au crépuscule.'
              )}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-white/80 border-t border-white/20 pt-4">
              <span className="flex items-center gap-1.5">
                <Mountain className="w-3.5 h-3.5 text-[#E8C547]" />
                {Z('hero_meta_alt', 'text', '1 922 m de crête alpine')}
              </span>
              <span className="flex items-center gap-1.5">
                <Train className="w-3.5 h-3.5 text-[#E8C547]" />
                {Z('hero_meta_transport', 'text', 'Mobilité 100% douce CFF & Stoosbahn')}
              </span>
              <span className="bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded text-[11px] font-medium text-white">
                {Z('hero_meta_badge', 'text', 'Vécu terrain certifié')}
              </span>
            </div>
          </div>
        </section>

        {/* SUB NAVIGATION */}
        <nav
          className="bg-[#FAF7F2] border-b border-[#DED5C6] sticky top-16 z-40"
          aria-label="Sous-destinations et carnets suisses"
        >
          <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar text-xs font-medium">
            <div className="flex items-center gap-6 whitespace-nowrap">
              <Link
                href="/destinations/suisse/stoos"
                className="text-[#9A442D] hover:underline flex items-center gap-1.5 font-semibold"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>{Z('nav_stoos', 'text', 'Stoos & Fronalpstock')}</span>
              </Link>
              <Link
                href="/destinations/zurich"
                className="text-[#5A5043] hover:text-[#9A442D] transition-colors"
              >
                <span>{Z('nav_zurich', 'text', 'Zurich & Limmat')}</span>
              </Link>
              <Link
                href="/atlas"
                className="text-[#5A5043] hover:text-[#9A442D] transition-colors flex items-center gap-1"
              >
                <MapPin className="w-3.5 h-3.5 text-[#9A442D]" />
                <span>{Z('nav_atlas', 'text', 'Voir sur l Atlas')}</span>
              </Link>
            </div>
            <span className="text-[11px] text-[#7D7365] hidden sm:inline">
              {Z('nav_status', 'text', 'Territoire alpin documenté')}
            </span>
          </div>
        </nav>

        {/* NOTRE ANGLE */}
        <section className="max-w-3xl mx-auto px-6 py-12">
          <div className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm p-6 sm:p-8">
            <span className="text-xs uppercase tracking-[0.2em] text-[#9A442D] font-semibold">
              {Z('angle_badge', 'text', 'Notre regard')}
            </span>
            <h2 className="font-serif text-xl sm:text-2xl text-[#2C2416] font-normal mt-1 mb-4">
              {Z('angle_title', 'text', 'Pourquoi la Suisse en slow travel ?')}
            </h2>
            <div className="prose prose-stone text-xs sm:text-sm leading-relaxed text-[#5A5043] space-y-3">
              <p>
                {Z(
                  'angle_p1',
                  'textarea',
                  'On entend souvent que la Suisse est coûteuse et balisée. C est exact si l on se contente des téléphériques de luxe et des vitrines de station. Mais dès que l on adopte la mobilité ferroviaire, que l on dort dans les villages sans voiture et que l on marche à contretemps, elle devient un sanctuaire d écologie acoustique.'
                )}
              </p>
              <p>
                {Z(
                  'angle_p2',
                  'textarea',
                  'Sur les crêtes du canton de Schwyz, quand les cabines cessent de tourner vers 19h30, la montagne retrouve son silence d origine. On marche entre herbe et gouffre, avec pour seuls repères sonores les sonnailles des troupeaux et la ligne d horizon sur le lac des Quatre-Cantons.'
                )}
              </p>
            </div>
          </div>
        </section>

        {/* CARNETS & ITINERAIRES */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center mb-10">
            <span className="text-xs uppercase tracking-[0.2em] text-[#9A442D] font-semibold">
              {Z('itineraries_label', 'text', 'Carnets & Itinéraires de terrain')}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#2C2416] font-normal mt-1">
              {Z(
                'itineraries_title',
                'text',
                'Nos traversées vécues en Suisse'
              )}
            </h2>
            <p className="text-xs sm:text-sm text-[#7D7365] mt-2 max-w-xl mx-auto">
              {Z(
                'itineraries_subtitle',
                'text',
                'Itinéraires complets adossés à des coordonnées GPS enregistrées lors de nos pas.'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CARTE 1 : STOOS & FRONALPSTOCK */}
            <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm overflow-hidden flex flex-col justify-between group hover:border-[#9A442D]/40 transition-all">
              <div>
                <div className="relative h-56 w-full overflow-hidden">
                  <Image
                    src="/images/destinations/suisse/stoos/etape1_stoos_panorama_lac.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[#9A442D] text-white text-[11px] font-semibold px-2.5 py-1 rounded-sm uppercase tracking-wider">
                    {Z('card1_badge', 'text', 'Randonnée de crête')}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[11px] font-mono px-2 py-0.5 rounded">
                    {Z('card1_alt', 'text', '1 922 m')}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-[#9A442D] font-semibold uppercase tracking-wider mb-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{Z('card1_loc', 'text', 'Canton de Schwyz')}</span>
                  </div>

                  <h3 className="font-serif text-xl font-medium text-[#2C2416] mb-2 group-hover:text-[#9A442D] transition-colors">
                    {Z(
                      'card1_title',
                      'text',
                      'Stoos & l arête du Fronalpstock'
                    )}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#5A5043] leading-relaxed mb-4">
                    {Z(
                      'card1_desc',
                      'textarea',
                      'La traversée en funambule au-dessus des eaux turquoise du lac des Quatre-Cantons. Accès par le funiculaire le plus raide du monde (110%), 6 étapes à pied et coucher de soleil sur les crêtes.'
                    )}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#7D7365] pt-3 border-t border-[#EFE9DF]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#9A442D]" />
                      {Z('card1_time', 'text', '2h45 à 3h15 de marche')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5 text-[#9A442D]" />
                      {Z('card1_diff', 'text', 'Niveau T2 sentier d arête')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <Link
                  href="/destinations/suisse/stoos"
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#9A442D] text-white py-2.5 px-4 rounded-sm text-xs font-semibold hover:bg-[#7C2E19] transition-colors"
                >
                  <span>{Z('card1_cta', 'text', 'Consulter le carnet de route')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>

            {/* CARTE 2 : ZURICH & LA LIMMAT */}
            <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm overflow-hidden flex flex-col justify-between group hover:border-[#9A442D]/40 transition-all">
              <div>
                <div className="relative h-56 w-full overflow-hidden bg-stone-200">
                  <Image
                    src="/images/destinations/suisse/stoos/etape6_stoos_table_crepuscule.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[#1D2D44] text-white text-[11px] font-semibold px-2.5 py-1 rounded-sm uppercase tracking-wider">
                    {Z('card2_badge', 'text', 'Étape urbaine slow')}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-[#1D2D44] font-semibold uppercase tracking-wider mb-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{Z('card2_loc', 'text', 'Canton de Zurich')}</span>
                  </div>

                  <h3 className="font-serif text-xl font-medium text-[#2C2416] mb-2 group-hover:text-[#9A442D] transition-colors">
                    {Z('card2_title', 'text', 'Zurich au fil de l eau')}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#5A5043] leading-relaxed mb-4">
                    {Z(
                      'card2_desc',
                      'textarea',
                      'La capitale helvétique par ses bains fluviaux dans la Limmat, les ruelles médiévales du Niederdorf et les échappées ferroviaires vers les villages de bois préservés.'
                    )}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#7D7365] pt-3 border-t border-[#EFE9DF]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#1D2D44]" />
                      {Z('card2_time', 'text', '2 à 3 jours')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Train className="w-3.5 h-3.5 text-[#1D2D44]" />
                      {Z('card2_train', 'text', 'Tram & marche')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <Link
                  href="/destinations/zurich"
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#FAF7F2] border border-[#1D2D44] text-[#1D2D44] py-2.5 px-4 rounded-sm text-xs font-semibold hover:bg-[#1D2D44] hover:text-white transition-colors"
                >
                  <span>{Z('card2_cta', 'text', 'Voir notre guide de Zurich')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          </div>
        </section>

        {/* REPERES TERRAIN HELVETIQUES */}
        <section className="max-w-3xl mx-auto px-6 py-12">
          <div className="bg-[#F4EFE6] border border-[#E3DACB] rounded-sm p-6 sm:p-8">
            <span className="text-xs uppercase tracking-[0.2em] text-[#9A442D] font-semibold">
              {Z('rules_badge', 'text', 'Garde-fous de voyage')}
            </span>
            <h2 className="font-serif text-xl sm:text-2xl text-[#2C2416] font-normal mt-1 mb-6">
              {Z('rules_title', 'text', 'Nos 3 règles d or pour explorer la Suisse')}
            </h2>

            <div className="space-y-6 text-xs sm:text-sm text-[#5A5043]">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#9A442D] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {Z('rule1_num', 'text', '1')}
                </div>
                <div>
                  <h3 className="font-serif font-medium text-sm text-[#2C2416] mb-1">
                    {Z('rule1_heading', 'text', 'Décaler ses horaires de montagne')}
                  </h3>
                  <p className="leading-relaxed">
                    {Z(
                      'rule1_text',
                      'textarea',
                      'Entre 10h et 15h, les crêtes alpines accessibles en remontée mécanique attirent les groupes. En démarrant votre marche vers 16h30, vous profitez de sentiers déserts et de la lumière dorée sur les reliefs.'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#9A442D] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {Z('rule2_num', 'text', '2')}
                </div>
                <div>
                  <h3 className="font-serif font-medium text-sm text-[#2C2416] mb-1">
                    {Z('rule2_heading', 'text', 'Privilégier les villages 100% piétons')}
                  </h3>
                  <p className="leading-relaxed">
                    {Z(
                      'rule2_text',
                      'textarea',
                      'Stoos, Wengen, Mürren, Bettmeralp : la Suisse abrite des havres d altitude interdits aux véhicules motorisés. Le calme acoustique y est total et transforme le sommeil dès la première nuit.'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#9A442D] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {Z('rule3_num', 'text', '3')}
                </div>
                <div>
                  <h3 className="font-serif font-medium text-sm text-[#2C2416] mb-1">
                    {Z('rule3_heading', 'text', 'S approvisionner directement dans les alpages')}
                  </h3>
                  <p className="leading-relaxed">
                    {Z(
                      'rule3_text',
                      'textarea',
                      'Au lieu de fréquenter les restaurants touristiques des sommets, achetez l Alpkäse (fromage d alpage) et le pain de seigle directement dans les fermes croisées sur le sentier pour un pique-nique mémorable face aux cimes.'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ATLAS BANNER */}
        <section className="max-w-4xl mx-auto px-6 py-6 mb-12">
          <div className="bg-[#1D2D44] text-white rounded-sm p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-[11px] uppercase tracking-widest text-[#E8C547] font-semibold">
                {Z('atlas_banner_tag', 'text', 'Cartographie interactive')}
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-light text-white mt-1 mb-2">
                {Z('atlas_banner_title', 'text', 'Retrouvez les étapes suisses sur l Atlas')}
              </h3>
              <p className="text-white/80 text-xs sm:text-sm max-w-xl">
                {Z(
                  'atlas_banner_desc',
                  'text',
                  'Coordonnées GPS, tracés d arête, dénivelés et camps de base répertoriés dans notre atlas cartographique.'
                )}
              </p>
            </div>
            <Link
              href="/atlas"
              className="bg-[#E8C547] text-[#1D2D44] font-semibold px-5 py-2.5 rounded-sm text-xs hover:bg-white transition-colors shrink-0"
            >
              <span>{Z('atlas_banner_cta', 'text', 'Explorer l Atlas')}</span>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </InlineEditProvider>
  );
}

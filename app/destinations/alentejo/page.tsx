import Image from 'next/image'
import type { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SlowTravelQuiz from '@/components/SlowTravelQuiz'
import { getPageZones } from '@/lib/cms-zones'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import EditableZone from '@/components/inline-edit/EditableZone'
import { buildPageMetadata } from '@/lib/page-metadata'

export const revalidate = 3600

const PAGE = 'destinations-alentejo'

const metadata: Metadata = {
  title: 'Alentejo : Guide Slow Travel Complet | Heldonica',
  description:
    'Guide pilier Alentejo : Évora, Monsaraz, vin de Talha, rizières de Comporta et cabanes sur pilotis de Carrasqueira. Séjours vécus par le duo Heldonica.',
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/alentejo',
  },
  openGraph: {
    title: 'Alentejo : Guide Slow Travel Complet | Heldonica',
    description:
      'L’Alentejo en slow travel : plaines de chênes-lièges, vin de Talha à Monsaraz et rizières de Comporta. Notre guide terrain.',
    images: [
      {
        url: '/images/destinations/portugal/obidos/etape2_obidos_panorama.jpg',
        width: 1200,
        height: 630,
        alt: 'Alentejo — vignobles et plaines dorées',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('destinations-alentejo', metadata)
}

export default async function AlentejoPage() {
  const zones = await getPageZones(PAGE)

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
  )

  const faqJsonLdSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name:
          zones[`${PAGE}__faq_1_q`] ?? "Quand partir dans l'Alentejo pour le slow travel ?",
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            zones[`${PAGE}__faq_1_a`] ??
            'Les meilleures périodes sont mars-mai et septembre-novembre : températures douces (20 à 26 °C), floraison printanière ou vendanges en septembre, loin de la chaleur estivale.',
        },
      },
      {
        '@type': 'Question',
        name:
          zones[`${PAGE}__faq_2_q`] ?? "Combien de jours pour découvrir l'Alentejo ?",
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            zones[`${PAGE}__faq_2_a`] ??
            "Compte au minimum 4 à 5 jours pour relier Évora, Monsaraz et les vignobles de Vidigueira. Une semaine complète permet d'ajouter le littoral de Comporta et le port sur pilotis de Carrasqueira.",
        },
      },
      {
        '@type': 'Question',
        name: zones[`${PAGE}__faq_3_q`] ?? "Comment se déplacer dans l'Alentejo ?",
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            zones[`${PAGE}__faq_3_a`] ??
            'La voiture est indispensable pour relier les villages perchés et les quintas, puis le vélo est idéal autour des rizières de Comporta et de Carrasqueira.',
        },
      },
      {
        '@type': 'Question',
        name: zones[`${PAGE}__faq_4_q`] ?? "Budget moyen par jour dans l'Alentejo ?",
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            zones[`${PAGE}__faq_4_a`] ??
            "Compte 70 à 120 € par jour en maison d'hôtes (monte alentejano) avec repas en tasca de village et dégustations en quinta.",
        },
      },
    ],
  }

  return (
    <InlineEditProvider page={PAGE} initialZones={zones}>
      <Script
        id="tourist-destination-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            '{"@context":"https://schema.org","@type":"TouristDestination","name":"Alentejo","description":"Région du sud du Portugal entre le Tage et l’Algarve. Plaines de chênes-lièges, vin de Talha, Monsaraz, Évora et rizières de Comporta.","url":"https://www.heldonica.fr/destinations/alentejo","address":{"@type":"PostalAddress","addressCountry":"PT","addressRegion":"Alentejo"},"geo":{"@type":"GeoCoordinates","latitude":38.5667,"longitude":-7.9},"touristType":["Gourmet","Nature lover","Slow traveler"],"bestSeasonToVisit":["March","April","May","September","October","November"]}',
        }}
      />
      <Script
        id="faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLdSchema) }}
      />
      <Header />
      <Script id="ga4-destination-view" strategy="lazyOnload">{`
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'destination_view', { destination: 'alentejo' });
        }
      `}</Script>
      <main className="bg-[#F7F3EC] text-[#241D1A]">
        {/* ── HERO ── */}
        <section className="relative min-h-[64vh] flex items-end overflow-hidden bg-[#241D1A] border-b border-[#DED5C6]">
          <Image
            src="/images/destinations/portugal/obidos/etape2_obidos_panorama.jpg"
            alt=""
            fill
            className="object-cover opacity-55"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1512]/85 via-[#1A1512]/35 to-transparent" />

          <div className="absolute left-6 top-6 md:left-16 md:top-10">
            <span className="inline-block rounded-sm bg-[#241D1A]/80 border border-[#E6DEC8]/30 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-[#E6DEC8]">
              {Z('hero_badge', 'text', 'Carnet de terrain', undefined, 'span')}
            </span>
          </div>

          <div className="relative z-10 px-6 md:px-16 pb-12 md:pb-20 max-w-4xl">
            <p className="text-[#E6DEC8]/85 text-[11px] font-medium tracking-[0.22em] uppercase mb-3">
              {Z('hero_label', 'text', 'Destination Portugal', undefined, 'span')}
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-normal text-[#FAF7F2] mb-4 leading-tight">
              {Z('hero_title', 'text', 'Alentejo : le slow travel absolu', undefined, 'span')}
              <br />
              <span className="text-[#E6DEC8] italic">
                {Z('hero_subtitle', 'text', 'entre terres de liège et océan', undefined, 'span')}
              </span>
            </h1>
            <p className="text-[#E6DEC8]/85 text-base md:text-lg leading-relaxed max-w-2xl">
              {Z(
                'hero_description',
                'textarea',
                'Plaines dorées bordées de chênes-lièges, vin de Talha élevé en jarres d’argile à Monsaraz et cabanes de pêcheurs sur pilotis à Carrasqueira. L’Alentejo, c’est le Portugal qui prend son temps.',
                undefined,
                'span'
              )}
            </p>
          </div>
        </section>

        {/* ── INTRODUCTION E-E-A-T ── */}
        <section className="py-16 md:py-24 bg-[#F7F3EC] border-b border-[#DED5C6]">
          <div className="max-w-4xl mx-auto px-6">
            <p className="text-eucalyptus text-[11px] font-medium tracking-[0.2em] uppercase mb-4">
              {Z('intro_label', 'text', 'Récit de terrain', undefined, 'span')}
            </p>
            <h2 className="text-3xl md:text-4xl font-serif font-normal text-mahogany mb-8">
              {Z('intro_title', 'text', 'Pourquoi l’Alentejo nous a conquis', undefined, 'span')}
            </h2>
            <div className="prose prose-lg max-w-none prose-stone">
              <p className="text-charcoal/85 leading-relaxed text-lg">
                {Z(
                  'intro_1',
                  'html',
                  '<strong class="text-mahogany">La première fois</strong>, on a traversé l’Alentejo trop vite en filant vers le sud. Grosse erreur : on a longé des collines de chênes-lièges numérotés à la craie blanche et des villages fortifiés sur leurs éperons d’ardoise sans prendre le temps de couper le moteur.',
                  undefined,
                  'span'
                )}
              </p>
              <p className="text-charcoal/80 leading-relaxed">
                {Z(
                  'intro_2',
                  'html',
                  '<strong class="text-mahogany">La deuxième fois</strong>, on a posé nos sacs cinq jours entre l’Alentejo central et le littoral de Comporta : Évora au lever du jour, Monsaraz au crépuscule, les caves de Vidigueira et les rizières de Carrasqueira à vélo.',
                  undefined,
                  'span'
                )}
              </p>
              <p className="text-charcoal/80 leading-relaxed">
                {Z(
                  'intro_3',
                  'html',
                  'Ce qu’on y a vécu : la dégustation du vin de Talha vinifié dans des amphores d’argile héritées de l’époque romaine, les cigognes posées au bord des canaux de rizières, les tascas de village où l’açorda alentejana arrive brûlante à table, et des plages de dunes sans aucun immeuble à l’horizon.',
                  undefined,
                  'span'
                )}
              </p>
            </div>
          </div>
        </section>

        {/* ── INFOS PRATIQUES ── */}
        <section className="py-12 bg-[#EFE9DF] border-b border-[#DED5C6]">
          <div className="max-w-5xl mx-auto px-6">
            <p className="text-eucalyptus text-[11px] font-medium tracking-[0.2em] uppercase mb-6 text-center">
              {Z('quick_kicker', 'text', 'Bon à savoir', undefined, 'span')}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center rounded-sm border border-[#DED5C6] bg-[#FAF7F2] p-4">
                <p className="text-[10px] text-charcoal/60 uppercase tracking-[0.16em] mb-1">
                  {Z('quick_1_label', 'text', 'Meilleure période', undefined, 'span')}
                </p>
                <p className="text-lg font-serif text-mahogany">
                  {Z(
                    'quick_1_value',
                    'html',
                    'Mars–Juin<br /><span class="text-eucalyptus">Sept–Nov</span>',
                    undefined,
                    'span'
                  )}
                </p>
              </div>
              <div className="text-center rounded-sm border border-[#DED5C6] bg-[#FAF7F2] p-4">
                <p className="text-[10px] text-charcoal/60 uppercase tracking-[0.16em] mb-1">
                  {Z('quick_2_label', 'text', 'Durée idéale', undefined, 'span')}
                </p>
                <p className="text-lg font-serif text-mahogany">
                  {Z('quick_2_value', 'html', '5–7 jours', undefined, 'span')}
                </p>
              </div>
              <div className="text-center rounded-sm border border-[#DED5C6] bg-[#FAF7F2] p-4">
                <p className="text-[10px] text-charcoal/60 uppercase tracking-[0.16em] mb-1">
                  {Z('quick_3_label', 'text', 'Budget/jour', undefined, 'span')}
                </p>
                <p className="text-lg font-serif text-mahogany">
                  {Z('quick_3_value', 'html', '80–130€', undefined, 'span')}
                </p>
              </div>
              <div className="text-center rounded-sm border border-[#DED5C6] bg-[#FAF7F2] p-4">
                <p className="text-[10px] text-charcoal/60 uppercase tracking-[0.16em] mb-1">
                  {Z('quick_4_label', 'text', 'Langue', undefined, 'span')}
                </p>
                <p className="text-lg font-serif text-mahogany">
                  {Z(
                    'quick_4_value',
                    'html',
                    'Portugais<br /><span class="text-eucalyptus">+ français</span>',
                    undefined,
                    'span'
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── NOS PÉPITES ── */}
        <section className="py-16 md:py-24 bg-[#F7F3EC] border-b border-[#DED5C6]">
          <div className="max-w-5xl mx-auto px-6">
            <p className="text-eucalyptus text-[11px] font-medium tracking-[0.2em] uppercase mb-4 text-center">
              {Z('pepites_kicker', 'text', "Ce qu'on a vécu", undefined, 'span')}
            </p>
            <h2 className="text-3xl md:text-4xl font-serif font-normal text-mahogany mb-12 text-center">
              {Z('pepites_section_title', 'text', 'Nos pépites dénichées', undefined, 'span')}
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-[#FAF7F2] rounded-sm p-6 border border-[#DED5C6]">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-11 h-11 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center shrink-0">
                    {Z('pepite_1_emoji', 'text', 'Landmark', 'w-5 h-5 text-eucalyptus', 'span')}
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-normal text-mahogany mb-1">
                      {Z('pepite_1_title', 'text', 'Évora au lever du jour', undefined, 'span')}
                    </h3>
                    <p className="text-xs text-eucalyptus font-medium uppercase tracking-[0.14em]">
                      {Z('pepite_1_subtitle', 'text', 'La cité UNESCO à taille humaine', undefined, 'span')}
                    </p>
                  </div>
                </div>
                <p className="text-charcoal/80 text-sm leading-relaxed mb-4">
                  {Z(
                    'pepite_1_desc',
                    'textarea',
                    'Capitale historique de l’Alentejo. On a aimé marcher sous les arcades de la Praça do Giraldo avant 9h00, longer les arches de l’aqueduc Água de Prata encastrées dans les maisons blanchies à la chaux, et partager une açorda alentejana à l’ail et à la coriandre.',
                    undefined,
                    'span'
                  )}
                </p>
                <p className="text-xs text-mahogany/85 italic border-t border-[#DED5C6] pt-3">
                  {Z(
                    'pepite_1_verdict',
                    'textarea',
                    'Verdict Heldonica : Arpente la vieille ville entre 8h et 10h30 avant l’arrivée des excursions depuis Lisbonne.',
                    undefined,
                    'span'
                  )}
                </p>
              </div>
              <div className="bg-[#FAF7F2] rounded-sm p-6 border border-[#DED5C6]">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-11 h-11 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center shrink-0">
                    {Z('pepite_2_emoji', 'text', 'Castle', 'w-5 h-5 text-eucalyptus', 'span')}
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-normal text-mahogany mb-1">
                      {Z('pepite_2_title', 'text', 'Monsaraz & le vin de Talha', undefined, 'span')}
                    </h3>
                    <p className="text-xs text-eucalyptus font-medium uppercase tracking-[0.14em]">
                      {Z('pepite_2_subtitle', 'text', 'Promontoire d’ardoise face à l’Alqueva', undefined, 'span')}
                    </p>
                  </div>
                </div>
                <p className="text-charcoal/80 text-sm leading-relaxed mb-4">
                  {Z(
                    'pepite_2_desc',
                    'textarea',
                    'Perché au-dessus du grand lac d’Alqueva, ce bourg clos de remparts d’ardoise retrouve un silence complet dès la tombée du jour. C’est là qu’on a dégusté le vin de Talha, vinifié dans de grandes jarres d’argile poreuse selon la méthode romaine.',
                    undefined,
                    'span'
                  )}
                </p>
                <p className="text-xs text-mahogany/85 italic border-t border-[#DED5C6] pt-3">
                  {Z(
                    'pepite_2_verdict',
                    'textarea',
                    'Verdict Heldonica : Reste dormir intra-muros ou dans un monte au pied de la colline pour observer le ciel étoilé de la réserve Dark Sky Alqueva.',
                    undefined,
                    'span'
                  )}
                </p>
              </div>
              <div className="bg-[#FAF7F2] rounded-sm p-6 border border-[#DED5C6]">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-11 h-11 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center shrink-0">
                    {Z('pepite_3_emoji', 'text', 'Wine', 'w-5 h-5 text-eucalyptus', 'span')}
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-normal text-mahogany mb-1">
                      {Z('pepite_3_title', 'text', 'Quintas de Vidigueira & Redondo', undefined, 'span')}
                    </h3>
                    <p className="text-xs text-eucalyptus font-medium uppercase tracking-[0.14em]">
                      {Z('pepite_3_subtitle', 'text', 'La route des vignerons indépendants', undefined, 'span')}
                    </p>
                  </div>
                </div>
                <p className="text-charcoal/80 text-sm leading-relaxed mb-4">
                  {Z(
                    'pepite_3_desc',
                    'textarea',
                    'Entre Vidigueira et Redondo, on a poussé la porte de petites adegas familiales entourées d’oliviers et de chênes-lièges : dégustation directe au chai, bouteilles entre 5 et 9 € sur place, et récits de trois générations de vignerons.',
                    undefined,
                    'span'
                  )}
                </p>
                <p className="text-xs text-mahogany/85 italic border-t border-[#DED5C6] pt-3">
                  {Z(
                    'pepite_3_verdict',
                    'textarea',
                    'Verdict Heldonica : Prévois de dormir directement dans une quinta viticole pour profiter du dîner au domaine sans reprendre le volant.',
                    undefined,
                    'span'
                  )}
                </p>
              </div>
              <div className="bg-[#FAF7F2] rounded-sm p-6 border border-[#DED5C6]">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-11 h-11 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center shrink-0">
                    {Z('pepite_4_emoji', 'text', 'Waves', 'w-5 h-5 text-eucalyptus', 'span')}
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-normal text-mahogany mb-1">
                      {Z(
                        'pepite_4_title',
                        'text',
                        'Comporta & le port sur pilotis de Carrasqueira',
                        undefined,
                        'span'
                      )}
                    </h3>
                    <p className="text-xs text-eucalyptus font-medium uppercase tracking-[0.14em]">
                      {Z('pepite_4_subtitle', 'text', 'Rizières, cigognes et dunes atlantiques', undefined, 'span')}
                    </p>
                  </div>
                </div>
                <p className="text-charcoal/80 text-sm leading-relaxed mb-4">
                  {Z(
                    'pepite_4_desc',
                    'textarea',
                    'Sur la façade atlantique de l’Alentejo, on a roulé à vélo entre les rizières vertes bordées de cigognes jusqu’au port palafittique de Carrasqueira : un lacis de passerelles en bois irrégulières sur la vase de l’estuaire du Sado, suivi d’une marche sur les dunes de Praia do Pego.',
                    undefined,
                    'span'
                  )}
                </p>
                <p className="text-xs text-mahogany/85 italic border-t border-[#DED5C6] pt-3">
                  {Z(
                    'pepite_4_verdict',
                    'textarea',
                    'Verdict Heldonica : Rejoins le port sur pilotis de Carrasqueira une heure avant le coucher du soleil à marée montante.',
                    undefined,
                    'span'
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── OÙ DORMIR ── */}
        <section className="py-16 md:py-24 bg-[#EFE9DF] border-b border-[#DED5C6]">
          <div className="max-w-5xl mx-auto px-6">
            <p className="text-eucalyptus text-[11px] font-medium tracking-[0.2em] uppercase mb-4 text-center">
              {Z('accom_kicker', 'text', 'Hébergement', undefined, 'span')}
            </p>
            <h2 className="text-3xl md:text-4xl font-serif font-normal text-mahogany mb-4 text-center">
              {Z('accom_section_title', 'text', 'Où dormir selon ton style', undefined, 'span')}
            </h2>
            <p className="text-charcoal/75 text-center mb-12 max-w-xl mx-auto">
              {Z(
                'accom_section_subtitle',
                'textarea',
                "L'Alentejo offre des refuges ruraux à l'écart des grands axes. Voici les trois typologies qu'on privilégie.",
                undefined,
                'span'
              )}
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-[#FAF7F2] rounded-sm p-6 border border-[#DED5C6]">
                <div className="w-10 h-10 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center mb-4">
                  {Z('accom_1_emoji', 'text', 'Leaf', 'w-5 h-5 text-eucalyptus', 'span')}
                </div>
                <h3 className="text-lg font-serif font-normal text-mahogany mb-2">
                  {Z('accom_1_title', 'text', 'Montes Alentejanos', undefined, 'span')}
                </h3>
                <p className="text-sm text-charcoal/80 mb-4 leading-relaxed">
                  {Z(
                    'accom_1_desc',
                    'textarea',
                    'Anciennes fermes blanchies à la chaux bordées de bleu ou d’ocre, isolées au milieu des oliviers et des chênes-lièges près de Monsaraz.',
                    undefined,
                    'span'
                  )}
                </p>
                <p className="text-xs text-charcoal/65 border-t border-[#DED5C6] pt-3">
                  {Z(
                    'accom_1_tip',
                    'textarea',
                    'Notre conseil : pose tes valises au moins 3 nuits au même endroit pour laisser le rythme ralentir.',
                    undefined,
                    'span'
                  )}
                </p>
              </div>
              <div className="bg-[#FAF7F2] rounded-sm p-6 border border-[#DED5C6]">
                <div className="w-10 h-10 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center mb-4">
                  {Z('accom_2_emoji', 'text', 'Building2', 'w-5 h-5 text-eucalyptus', 'span')}
                </div>
                <h3 className="text-lg font-serif font-normal text-mahogany mb-2">
                  {Z('accom_2_title', 'text', 'Maisons d’hôtes de village', undefined, 'span')}
                </h3>
                <p className="text-sm text-charcoal/80 mb-4 leading-relaxed">
                  {Z(
                    'accom_2_desc',
                    'textarea',
                    'À Évora ou dans les ruelles fortifiées de Monsaraz. Idéal pour sortir dîner à pied le soir et arpenter les remparts dès 8h00.',
                    undefined,
                    'span'
                  )}
                </p>
                <p className="text-xs text-charcoal/65 border-t border-[#DED5C6] pt-3">
                  {Z(
                    'accom_2_tip',
                    'textarea',
                    'Notre conseil : choisis une maison avec cour intérieure ombragée et pain alentejano frais au petit-déjeuner.',
                    undefined,
                    'span'
                  )}
                </p>
              </div>
              <div className="bg-[#FAF7F2] rounded-sm p-6 border border-[#DED5C6]">
                <div className="w-10 h-10 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center mb-4">
                  {Z('accom_3_emoji', 'text', 'Grape', 'w-5 h-5 text-eucalyptus', 'span')}
                </div>
                <h3 className="text-lg font-serif font-normal text-mahogany mb-2">
                  {Z('accom_3_title', 'text', 'Quintas viticoles', undefined, 'span')}
                </h3>
                <p className="text-sm text-charcoal/80 mb-4 leading-relaxed">
                  {Z(
                    'accom_3_desc',
                    'textarea',
                    'Dormir directement chez le vigneron autour de Vidigueira ou d’Estremoz, avec visite des chais d’amphores et dégustation en fin de journée.',
                    undefined,
                    'span'
                  )}
                </p>
                <p className="text-xs text-charcoal/65 border-t border-[#DED5C6] pt-3">
                  {Z(
                    'accom_3_tip',
                    'textarea',
                    'Notre conseil : réserve en direct auprès du domaine pour éviter les commissions des plateformes.',
                    undefined,
                    'span'
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── COMMENT SE DÉPLACER ── */}
        <section className="py-16 md:py-24 bg-[#F7F3EC] border-b border-[#DED5C6]">
          <div className="max-w-4xl mx-auto px-6">
            <p className="text-eucalyptus text-[11px] font-medium tracking-[0.2em] uppercase mb-4 text-center">
              {Z('transport_kicker', 'text', 'Logistique', undefined, 'span')}
            </p>
            <h2 className="text-3xl md:text-4xl font-serif font-normal text-mahogany mb-8 text-center">
              {Z('transport_section_title', 'text', 'Comment se déplacer', undefined, 'span')}
            </h2>
            <div className="space-y-5">
              <div className="flex gap-4 p-6 bg-[#FAF7F2] rounded-sm border border-[#DED5C6]">
                <div className="w-10 h-10 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center shrink-0">
                  {Z('transport_1_emoji', 'text', 'Car', 'w-5 h-5 text-eucalyptus', 'span')}
                </div>
                <div>
                  <h3 className="text-lg font-serif font-normal text-mahogany mb-2">
                    {Z('transport_1_title', 'text', 'Voiture sur les routes secondaires & vélo à Comporta', undefined, 'span')}
                  </h3>
                  <p className="text-charcoal/80 text-sm leading-relaxed">
                    {Z(
                      'transport_1_desc',
                      'html',
                      '<strong>Indispensable entre les villages.</strong> Les distances sont vastes (Évora à Monsaraz demande 50 minutes par les départementales bordées de chênes-lièges). Une fois à Comporta, pose la voiture et loue un vélo pour longer les rizières jusqu’à Carrasqueira.',
                      undefined,
                      'span'
                    )}
                  </p>
                  <p className="text-xs text-charcoal/65 mt-2">
                    {Z(
                      'transport_1_tip',
                      'textarea',
                      "Notre conseil : récupère une citadine à Lisbonne après tes jours piétons dans la capitale (compte 30 à 40 € par jour).",
                      undefined,
                      'span'
                    )}
                  </p>
                </div>
              </div>
              <div className="flex gap-4 p-6 bg-[#FAF7F2] rounded-sm border border-[#DED5C6]">
                <div className="w-10 h-10 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center shrink-0">
                  {Z('transport_2_emoji', 'text', 'Bus', 'w-5 h-5 text-eucalyptus', 'span')}
                </div>
                <div>
                  <h3 className="text-lg font-serif font-normal text-mahogany mb-2">
                    {Z('transport_2_title', 'text', 'Train Intercidades & cars Rede Expressos', undefined, 'span')}
                  </h3>
                  <p className="text-charcoal/80 text-sm leading-relaxed">
                    {Z(
                      'transport_2_desc',
                      'html',
                      'Sans voiture, le train CP relie Lisbonne-Oriente à Évora en 1h30, et les cars Rede Expressos desservent les bourgs principaux, mais les hameaux et quintas restent difficiles d’accès.',
                      undefined,
                      'span'
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA TRAVEL PLANNING ── */}
        <section className="py-16 md:py-24 bg-[#2A1D18] text-[#F7F3EC]">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-normal mb-4">
              {Z(
                'cta_title',
                'text',
                'Tu veux qu’on conçoive ton séjour dans l’Alentejo sur mesure ?',
                undefined,
                'span'
              )}
            </h2>
            <p className="text-[#E6DEC8]/80 mb-8 max-w-xl mx-auto leading-relaxed">
              {Z(
                'cta_text',
                'textarea',
                'On te construit un itinéraire fondé sur nos séjours réels : quintas de vin de Talha, villages perchés et rizières de Comporta — à ton rythme.',
                undefined,
                'span'
              )}
            </p>
            <Link
              href="/travel-planning"
              className="inline-flex items-center gap-2 rounded-sm bg-action px-8 py-3.5 text-xs uppercase tracking-[0.16em] font-medium text-[#FAF7F2] transition-colors hover:bg-action-fonce"
            >
              {Z('cta_button', 'text', 'Confier mon projet', undefined, 'span')}
            </Link>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-16 md:py-24 bg-[#EFE9DF] border-b border-[#DED5C6]">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-serif font-normal text-mahogany mb-8 text-center">
              {Z('faq_section_title', 'text', 'Questions fréquentes', undefined, 'span')}
            </h2>
            <div className="space-y-3">
              <details className="bg-[#FAF7F2] rounded-sm p-5 border border-[#DED5C6] group">
                <summary className="font-medium text-mahogany cursor-pointer list-none flex justify-between items-center">
                  <span>
                    {Z(
                      'faq_1_q',
                      'text',
                      "Quand partir dans l'Alentejo pour le slow travel ?",
                      undefined,
                      'span'
                    )}
                  </span>
                  <span className="text-eucalyptus group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 text-charcoal/75 text-sm leading-relaxed">
                  {Z(
                    'faq_1_a',
                    'textarea',
                    'Les meilleures périodes sont mars-mai et septembre-novembre : températures douces (20 à 26 °C), floraison printanière ou vendanges en septembre, loin de la chaleur estivale.',
                    undefined,
                    'span'
                  )}
                </p>
              </details>
              <details className="bg-[#FAF7F2] rounded-sm p-5 border border-[#DED5C6] group">
                <summary className="font-medium text-mahogany cursor-pointer list-none flex justify-between items-center">
                  <span>
                    {Z(
                      'faq_2_q',
                      'text',
                      "Combien de jours pour découvrir l'Alentejo ?",
                      undefined,
                      'span'
                    )}
                  </span>
                  <span className="text-eucalyptus group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 text-charcoal/75 text-sm leading-relaxed">
                  {Z(
                    'faq_2_a',
                    'textarea',
                    "Compte au minimum 4 à 5 jours pour relier Évora, Monsaraz et les vignobles de Vidigueira. Une semaine complète permet d'ajouter le littoral de Comporta et le port sur pilotis de Carrasqueira.",
                    undefined,
                    'span'
                  )}
                </p>
              </details>
              <details className="bg-[#FAF7F2] rounded-sm p-5 border border-[#DED5C6] group">
                <summary className="font-medium text-mahogany cursor-pointer list-none flex justify-between items-center">
                  <span>
                    {Z('faq_3_q', 'text', "Comment se déplacer dans l'Alentejo ?", undefined, 'span')}
                  </span>
                  <span className="text-eucalyptus group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 text-charcoal/75 text-sm leading-relaxed">
                  {Z(
                    'faq_3_a',
                    'textarea',
                    'La voiture est indispensable pour relier les villages perchés et les quintas, puis le vélo est idéal autour des rizières de Comporta et de Carrasqueira.',
                    undefined,
                    'span'
                  )}
                </p>
              </details>
              <details className="bg-[#FAF7F2] rounded-sm p-5 border border-[#DED5C6] group">
                <summary className="font-medium text-mahogany cursor-pointer list-none flex justify-between items-center">
                  <span>
                    {Z('faq_4_q', 'text', "Budget moyen par jour dans l'Alentejo ?", undefined, 'span')}
                  </span>
                  <span className="text-eucalyptus group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 text-charcoal/75 text-sm leading-relaxed">
                  {Z(
                    'faq_4_a',
                    'textarea',
                    "Compte 70 à 120 € par jour en maison d'hôtes (monte alentejano) avec repas en tasca de village et dégustations en quinta.",
                    undefined,
                    'span'
                  )}
                </p>
              </details>
            </div>
          </div>
        </section>

        {/* ── RELATED ARTICLES ── */}
        <section className="py-16 md:py-24 bg-[#F7F3EC] border-b border-[#DED5C6]">
          <div className="max-w-5xl mx-auto px-6">
            <p className="text-eucalyptus text-[11px] font-medium tracking-[0.2em] uppercase mb-4 text-center">
              {Z('related_kicker', 'text', 'Pour aller plus loin', undefined, 'span')}
            </p>
            <h2 className="text-2xl md:text-3xl font-serif font-normal text-mahogany mb-8 text-center">
              {Z('related_section_title', 'text', 'Nos carnets liés', undefined, 'span')}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link
                href="/destinations/portugal/lisbonne"
                className="group block bg-[#FAF7F2] rounded-sm overflow-hidden border border-[#DED5C6] hover:border-mahogany/40 transition-colors"
              >
                <div className="relative aspect-[4/3] bg-[#EFE9DF]">
                  <Image
                    src="/images/destinations/portugal/sintra/etape1_sintra_regaleira.jpg"
                    alt={Z('article_1_alt', 'text', 'Collines et ruelles du Portugal', undefined, 'span') as any}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="p-5">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-eucalyptus font-medium mb-1">
                    {Z('article_1_label', 'text', 'Portugal', undefined, 'span')}
                  </p>
                  <h3 className="font-serif font-normal text-mahogany group-hover:text-eucalyptus transition-colors">
                    {Z(
                      'article_1_title',
                      'text',
                      'Lisbonne à pied : ruelles d’Alfama et miradouros',
                      undefined,
                      'span'
                    )}
                  </h3>
                </div>
              </Link>
              <Link
                href="/destinations/portugal/obidos"
                className="group block bg-[#FAF7F2] rounded-sm overflow-hidden border border-[#DED5C6] hover:border-mahogany/40 transition-colors"
              >
                <div className="relative aspect-[4/3] bg-[#EFE9DF]">
                  <Image
                    src="/images/destinations/portugal/obidos/etape1_obidos_castelo.jpg"
                    alt={Z('article_2_alt', 'text', 'Remparts et maisons blanchies à la chaux', undefined, 'span') as any}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="p-5">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-eucalyptus font-medium mb-1">
                    {Z('article_2_label', 'text', 'Découvertes Locales', undefined, 'span')}
                  </p>
                  <h3 className="font-serif font-normal text-mahogany group-hover:text-eucalyptus transition-colors">
                    {Z('article_2_title', 'text', 'Óbidos : le chemin de ronde à 8h00', undefined, 'span')}
                  </h3>
                </div>
              </Link>
              <Link
                href="/destinations/portugal/alcobaca"
                className="group block bg-[#FAF7F2] rounded-sm overflow-hidden border border-[#DED5C6] hover:border-mahogany/40 transition-colors"
              >
                <div className="relative aspect-[4/3] bg-[#EFE9DF]">
                  <Image
                    src="/images/destinations/portugal/alcobaca/etape4_alcobaca_cloitre.jpg"
                    alt={Z('article_3_alt', 'text', 'Cloître du Silence à Alcobaça', undefined, 'span') as any}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="p-5">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-eucalyptus font-medium mb-1">
                    {Z('article_3_label', 'text', 'Patrimoine & Terroir', undefined, 'span')}
                  </p>
                  <h3 className="font-serif font-normal text-mahogany group-hover:text-eucalyptus transition-colors">
                    {Z(
                      'article_3_title',
                      'text',
                      'Alcobaça : abbaye cistercienne et Cloître du Silence',
                      undefined,
                      'span'
                    )}
                  </h3>
                </div>
              </Link>
            </div>
            <div className="mt-8 text-center">
              <Link
                href="/blog"
                className="text-xs uppercase tracking-[0.16em] text-mahogany font-medium border-b border-mahogany/40 pb-1 hover:border-mahogany"
              >
                {Z('related_all_link', 'text', 'Voir tous nos carnets', undefined, 'span')}
              </Link>
            </div>
          </div>
        </section>

        <div className="max-w-3xl mx-auto px-6 py-16">
          <SlowTravelQuiz />
        </div>
      </main>
      <Footer />
    </InlineEditProvider>
  )
}

import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Compass, MapPin, ShieldCheck, Sparkles, Clock, Waves } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import EditableZone from '@/components/inline-edit/EditableZone'
import { getPageZones } from '@/lib/cms-zones'
import { buildPageMetadata } from '@/lib/page-metadata'
import ComingSoonDestination from '@/components/ComingSoonDestination'
import { isUnpublishedCmsPage } from '@/lib/unpublished-pages'

export const revalidate = 86400

const PAGE = 'destinations-zurich'

const defaultMetadata: Metadata = {
  title: 'Zurich slow travel : flotter sur la Limmat, Badi et vieille ville | Heldonica',
  description:
    'Notre carnet de terrain à Zurich : descente en bouée sur la Limmat de Wipkingerpark à Glanzenberg (portage à Hönggerwehr), piscines flottantes Badi, colline du Lindenhof et brasseries du Kreis 4.',
  alternates: { canonical: 'https://www.heldonica.fr/destinations/zurich' },
  openGraph: {
    title: 'Zurich slow travel : flotter sur la Limmat, Badi et vieille ville | Heldonica',
    description:
      'Badi flottantes, descente de la Limmat depuis Wipkingerpark, marché de la Bürkliplatz et échappées vers Stoos et Stein am Rhein.',
    url: 'https://www.heldonica.fr/destinations/zurich',
    siteName: 'Heldonica',
    type: 'website',
    locale: 'fr_FR',
    images: [
      {
        url: '/images/destinations/suisse/stoos/etape6_stoos_table_crepuscule.jpg',
        width: 1200,
        height: 630,
        alt: 'Zurich slow travel — Heldonica',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zurich slow travel | Guide Heldonica',
    description: 'Descente de la Limmat, Badi flottantes et vieille ville : notre carnet vécu à Zurich.',
    images: ['/images/destinations/suisse/stoos/etape6_stoos_table_crepuscule.jpg'],
    creator: '@heldonica',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata(PAGE, defaultMetadata)
}

export default async function ZurichPage({
  searchParams,
}: {
  searchParams?: Promise<{ preview?: string }>
}) {
  const sp = searchParams ? await searchParams : {}
  const isDraftPreview = sp?.preview === 'draft' || sp?.preview === 'true'
  const zones = await getPageZones(PAGE)
  const published = !isUnpublishedCmsPage(PAGE)

  if (!published && !isDraftPreview) {
    return (
      <ComingSoonDestination
        slug="zurich"
        title={zones.title || 'Zurich'}
        country="Suisse"
        hero_unsplash_url="/images/destinations/suisse/stoos/etape6_stoos_table_crepuscule.jpg"
        zones={zones}
      />
    )
  }

  const Z = (
    zone: string,
    type: 'text' | 'textarea' | 'html' | 'image' = 'text',
    fallback: string = '',
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

  return (
    <InlineEditProvider page={PAGE} initialZones={zones}>
      <Header />

      {isDraftPreview && !published && (
        <div className="bg-[#2C2416] text-[#F5F0E8] text-xs py-2.5 px-4 text-center border-b border-[#8B6E32]/40">
          {Z(
            'draft_preview_banner',
            'text',
            'Mode prévisualisation brouillon — Cette destination est en cours de préparation éditoriale.'
          )}
        </div>
      )}

      <main className="min-h-screen bg-[#F5F0E8] text-[#2C2416]">
        {/* HERO SECTION */}
        <section className="relative h-[68vh] min-h-[480px] flex items-end overflow-hidden">
          <div className="absolute inset-0">
            {Z(
              'hero_image',
              'image',
              '/images/destinations/suisse/stoos/etape6_stoos_table_crepuscule.jpg',
              'w-full h-full object-cover object-center'
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1610]/90 via-[#1A1610]/45 to-transparent" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-6 pb-12 w-full">
            <Link
              href="/destinations/suisse"
              className="inline-flex items-center gap-2 text-[#F5F0E8]/80 hover:text-[#F5F0E8] text-xs uppercase tracking-[0.2em] mb-6 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {Z('back_to_parent', 'text', 'Retour au carnet Suisse', undefined, 'span')}
            </Link>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#8B6E32]/90 text-[#F5F0E8] text-[11px] uppercase tracking-[0.18em]">
                <Waves className="w-3 h-3" />
                {Z('hero_badge', 'text', 'Destination testée', undefined, 'span')}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#2C2416]/80 text-[#E8DFD1] text-[11px] tracking-wider border border-[#F5F0E8]/15">
                <MapPin className="w-3 h-3 text-[#C49A45]" />
                {Z('hero_coords', 'text', '47.3769° N, 8.5417° E', undefined, 'span')}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl text-[#F5F0E8] font-normal leading-tight mb-3">
              {Z('title', 'text', 'Zurich', undefined, 'span')}
              {Z('title_sep', 'text', ' — ', undefined, 'span')}
              <em className="text-[#E8C547] not-italic">
                {Z(
                  'subtitle',
                  'text',
                  'flotter sur la Limmat, Badi en bois et vieille ville sans hâte',
                  undefined,
                  'span'
                )}
              </em>
            </h1>

            <p className="text-sm sm:text-base text-[#E8DFD1]/90 max-w-2xl leading-relaxed">
              {Z(
                'hero_lead',
                'textarea',
                'On croyait Zurich réservée aux banquiers et aux vitrines horlogères de la Bahnhofstrasse. On y est arrivés un vendredi de juillet, sacs sur le dos, et l on a découvert une ville qui vit dans l eau claire de sa rivière.'
              )}
            </p>
          </div>
        </section>

        {/* METADATA BAR (CMS ZONES info_*_label + duration/season/budget/profile) */}
        <section className="border-b border-[#DED5C6] bg-[#EFE9DF]/70">
          <div className="max-w-4xl mx-auto px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-[#8B6E32] shrink-0" />
              <div>
                <div className="text-[#7D7365] uppercase tracking-wider text-[10px]">
                  {Z('info_duration_label', 'text', 'Durée idéale')}
                </div>
                <div className="font-medium text-[#2C2416]">
                  {Z('duration', 'text', '3-5 jours')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Waves className="w-4 h-4 text-[#8B6E32] shrink-0" />
              <div>
                <div className="text-[#7D7365] uppercase tracking-wider text-[10px]">
                  {Z('info_season_label', 'text', 'Meilleure saison')}
                </div>
                <div className="font-medium text-[#2C2416]">
                  {Z('season', 'text', 'Juin à septembre (Limmat > 18 °C)')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Compass className="w-4 h-4 text-[#8B6E32] shrink-0" />
              <div>
                <div className="text-[#7D7365] uppercase tracking-wider text-[10px]">
                  {Z('info_budget_label', 'text', 'Budget indicatif')}
                </div>
                <div className="font-medium text-[#2C2416]">
                  {Z('budget', 'text', '80-120 € / j / pers. hors hôtel')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#8B6E32] shrink-0" />
              <div>
                <div className="text-[#7D7365] uppercase tracking-wider text-[10px]">
                  {Z('info_profile_label', 'text', 'Profil')}
                </div>
                <div className="font-medium text-[#2C2416]">
                  {Z('profile', 'text', 'Baignade fluviale, vélo & culture')}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INTRO & RECIT DE TERRAIN (CMS ZONES description_title + description) */}
        <section className="max-w-3xl mx-auto px-6 py-14">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#8B6E32] font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            {Z('intro_kicker', 'text', 'Récit de terrain · Juillet sur la Limmat')}
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl text-[#2C2416] font-normal leading-snug mb-6">
            {Z('description_title', 'text', 'On y est allés : de Wipkingerpark à Glanzenberg au fil du courant')}
          </h2>

          <div className="prose prose-stone max-w-none text-[#4A3F31] leading-relaxed space-y-4 text-sm sm:text-base">
            <EditableZone
              page={PAGE}
              zone="description"
              type="textarea"
              as="p"
              className="text-base sm:text-lg text-[#2C2416] leading-relaxed font-serif"
              fallback="Zurich n est pas ce qu on croit. Dès les beaux jours, toute la ville descend vers l eau : les habitants nagent à la pause déjeuner entre les pontons de bois des Badi (les bains fluviaux et lacustres d Oberer Letten, d Unterer Letten ou du Frauenbadi), puis se retrouvent au coucher du soleil sur les marches du Niederdorf et sous les tilleuls du Lindenhof."
            />
            {Z(
              'intro_body_1',
              'textarea',
              'Notre journée la plus marquante à Zurich a commencé à 14 h au bord de l eau près du Wipkingerpark, les sacs étanches remplis d une tarte au saumon fumé maison et d une bouteille de vin frais. Même si notre pompe à air manuelle a rendu l âme deux fois sur la pelouse — ce qui nous a immédiatement valu l aide et les sourires des familles zurichoises voisines —, la mise à l eau dans le courant doux de la Limmat a lancé six heures de dérive paisible.',
              'text-[#4A3F31] leading-relaxed',
              'p'
            )}
            {Z(
              'intro_body_2',
              'textarea',
              'En glissant entre les berges boisées où fument les barbecues, on garde l œil sur les piliers de pont et la signalisation fluviale : à l approche du barrage d Hönggerwehr, la sortie par les escaliers de la rive gauche est obligatoire. On porte les bateaux gonflables à pied sur 150 mètres avant de se remettre à l eau pour la portion finale plus sauvage jusqu à la grande pelouse de Glanzenberg vers 20 h, à cinq minutes à pied de la gare S-Bahn.',
              'text-[#4A3F31] leading-relaxed',
              'p'
            )}
          </div>
        </section>

        {/* LES 4 REPERES (CMS ZONES tips_title + tip_1..4) */}
        <section className="bg-[#EFE9DF] border-y border-[#DED5C6] py-14 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#2C2416] mb-2 text-center">
              {Z('tips_title', 'text', 'Ce qu on te recommande à Zurich')}
            </h2>
            <p className="text-[11px] text-[#5A5043] tracking-[0.18em] text-center uppercase mb-10">
              {Z('subdest_title', 'text', 'Quatre repères dénichés entre la Limmat et les collines')}
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-[#FAF7F2] rounded-sm p-6 border border-[#DED5C6]">
                <div className="text-[11px] uppercase tracking-[0.18em] text-[#8B6E32] font-semibold mb-2">
                  {Z('tip_1_kicker', 'text', '01 · Descente fluviale (Böötle)')}
                </div>
                <p className="text-[#2C2416] text-sm leading-relaxed">
                  {Z(
                    'tip_1',
                    'textarea',
                    'Flotter sur la Limmat depuis Wipkingerpark jusqu à Glanzenberg (ou nager à Oberer Letten) : vérifie toujours que la température de l eau dépasse 18 °C et que le débit reste sous 60 m³/s, et sors impérativement à gauche avant le barrage d Hönggerwehr (portage 150 m).',
                    undefined,
                    'span'
                  )}
                </p>
              </div>

              <div className="bg-[#FAF7F2] rounded-sm p-6 border border-[#DED5C6]">
                <div className="text-[11px] uppercase tracking-[0.18em] text-[#8B6E32] font-semibold mb-2">
                  {Z('tip_2_kicker', 'text', '02 · Kreis 4 & Kreis 5')}
                </div>
                <p className="text-[#2C2416] text-sm leading-relaxed">
                  {Z(
                    'tip_2',
                    'textarea',
                    'Poser ses valises et sortir le soir autour de la Langstrasse (Kreis 4) et des anciens viaducs industriels de Zurich-West (Kreis 5) : on y a testé trois brasseries artisanales de quartier fréquentées uniquement par les habitants.',
                    undefined,
                    'span'
                  )}
                </p>
              </div>

              <div className="bg-[#FAF7F2] rounded-sm p-6 border border-[#DED5C6]">
                <div className="text-[11px] uppercase tracking-[0.18em] text-[#8B6E32] font-semibold mb-2">
                  {Z('tip_3_kicker', 'text', '03 · Échappées en train CFF (1 h)')}
                </div>
                <p className="text-[#2C2416] text-sm leading-relaxed">
                  {Z(
                    'tip_3',
                    'textarea',
                    'Depuis Zurich HB, rayonne en une heure de train vers les façades peintes de Stein am Rhein sur le Rhin ou vers Schwyz et le funiculaire à 110 % de la crête alpine de Stoos.',
                    undefined,
                    'span'
                  )}
                </p>
              </div>

              <div className="bg-[#FAF7F2] rounded-sm p-6 border border-[#DED5C6]">
                <div className="text-[11px] uppercase tracking-[0.18em] text-[#8B6E32] font-semibold mb-2">
                  {Z('tip_4_kicker', 'text', '04 · Samedi matin & crépuscule')}
                </div>
                <p className="text-[#2C2416] text-sm leading-relaxed">
                  {Z(
                    'tip_4',
                    'textarea',
                    'Faire son marché paysan le samedi matin sur la Bürkliplatz face au lac (légumes bio, fromages d alpage et fleurs coupées), puis monter au belvédère du Lindenhof ou flâner dans le Niederdorf au coucher du soleil.',
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
                'Trois jours à Zurich : des Badi du centre à la descente de la Limmat'
              )}
            </h2>
            <p className="text-xs sm:text-sm text-[#7D7365] mt-2 max-w-xl mx-auto">
              {Z(
                'subdest_teaser',
                'text',
                'Nos guides détaillés de terrain par quartier et au fil de la rivière.'
              )}
            </p>
          </div>

          <div className="space-y-12">
            {/* ETAPE 1 */}
            <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div className="relative h-64 md:h-auto min-h-[260px]">
                  <Image
                    src="/images/destinations/suisse/stoos/etape6_stoos_table_crepuscule.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] uppercase tracking-[0.18em] text-[#8B6E32] font-semibold">
                        {Z('step1_tag', 'text', 'Étape 01 · Vieille ville & Lindenhof')}
                      </span>
                      <span className="text-[11px] font-mono text-[#7D7365]">
                        {Z('step1_coords', 'text', '47.3730° N, 8.5406° E')}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl sm:text-2xl text-[#2C2416] font-normal mb-3">
                      {Z('step1_title', 'text', 'Marché de la Bürkliplatz, Frauenbadi et colline du Lindenhof')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#4A3F31] leading-relaxed mb-4">
                      {Z(
                        'step1_desc',
                        'textarea',
                        'Commence le samedi matin sur la Bürkliplatz à l embouchure du lac de Zurich, puis remonte à pied le long de la Limmat devant la structure en bois Art nouveau du Frauenbadi (qui se transforme le soir venu en Barfussbar, où l on boit un verre pieds nus au-dessus de l eau). Grimpe ensuite sur l esplanade ombragée du Lindenhof pour dominer les clochers du Grossmünster et les toits du Niederdorf.'
                      )}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#DED5C6]/80 text-xs text-[#6E6252]">
                    {Z(
                      'step1_note',
                      'text',
                      'Mobilité : la Zürich Card (24 h ou 72 h) couvre l ensemble des trams, des bus, des bateaux fluviaux Limmatschiff et de la montée à l Uetliberg.'
                    )}
                  </div>
                </div>
              </div>
            </article>

            {/* ETAPE 2 */}
            <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div className="relative h-64 md:h-auto min-h-[260px] md:order-2">
                  <Image
                    src="/images/destinations/suisse/stoos/etape1_stoos_panorama_lac.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 sm:p-8 flex flex-col justify-between md:order-1">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] uppercase tracking-[0.18em] text-[#8B6E32] font-semibold">
                        {Z('step2_tag', 'text', 'Étape 02 · 14 h 00 – 20 h 00 sur l eau')}
                      </span>
                      <span className="text-[11px] font-mono text-[#7D7365]">
                        {Z('step2_coords', 'text', '47.3917° N, 8.5269° E')}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl sm:text-2xl text-[#2C2416] font-normal mb-3">
                      {Z('step2_title', 'text', 'La descente de la Limmat : de Wipkingerpark à Glanzenberg')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#4A3F31] leading-relaxed mb-4">
                      {Z(
                        'step2_desc',
                        'textarea',
                        'Mets ton bateau gonflable solide (type Züri Böötle ou Decathlon, évite les bouées de piscine fines) à l eau au niveau du Wipkingerpark. Le parcours de 11 kilomètres file sous les ponts de Zurich jusqu au barrage d Hönggerwehr (sortie obligatoire sur la gauche signalée 2 km en amont, portage de 150 m), avant la seconde section boisée jusqu à la pelouse de sortie de Glanzenberg.'
                      )}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#DED5C6]/80 text-xs text-[#6E6252]">
                    {Z(
                      'step2_note',
                      'text',
                      'Sécurité fluviale : ne pars jamais après un orage ou une forte pluie (attends 2 à 3 jours), ni lorsque le débit dépasse 100 m³/s (sous 60 m³/s, le courant est paisible).'
                    )}
                  </div>
                </div>
              </div>
            </article>

            {/* ETAPE 3 */}
            <article className="bg-[#FAF7F2] border border-[#DED5C6] rounded-sm overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div className="relative h-64 md:h-auto min-h-[260px]">
                  <Image
                    src="/images/destinations/suisse/stoos/etape4_stoos_rayons_alpins.jpg"
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] uppercase tracking-[0.18em] text-[#8B6E32] font-semibold">
                        {Z('step3_tag', 'text', 'Étape 03 · Depuis Zurich HB en 1 h')}
                      </span>
                      <span className="text-[11px] font-mono text-[#7D7365]">
                        {Z('step3_coords', 'text', '46.9767° N, 8.6631° E')}
                      </span>
                    </div>
                    <h3 className="font-serif text-xl sm:text-2xl text-[#2C2416] font-normal mb-3">
                      {Z('step3_title', 'text', 'Monter sur la crête de Stoos au crépuscule depuis Zurich')}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#4A3F31] leading-relaxed mb-4">
                      {Z(
                        'step3_desc',
                        'textarea',
                        'Zurich est le camp de base idéal pour rayonner vers les Alpes centrales : en quittant la ville en milieu d après-midi, une heure de route ou de train CFF mène au pied de la Stoosbahn à Schwyz. On a vécu là-haut la traversée crépusculaire du Fronalpstock au Klingenstock avec une bratwurst au col du Furggeli avant de redescendre par le dernier funiculaire de 23 h 40.'
                      )}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#DED5C6]/80 text-xs text-[#6E6252]">
                    <Link
                      href="/destinations/suisse/stoos"
                      className="text-[#8B6E32] font-semibold hover:underline"
                    >
                      {Z('subdest_cta', 'text', 'Voir le guide Stoos & Fronalpstock', undefined, 'span')}
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* VERDICT & CTA (CMS ZONES verdict_badge, verdict, verdict_signature, cta_title, cta_text, cta_button) */}
        <section className="max-w-3xl mx-auto px-6 pb-16">
          <div className="bg-[#2C2416] text-[#F5F0E8] rounded-sm p-8 sm:p-10 border border-[#8B6E32]/40">
            <div className="flex items-center gap-2 text-[#C49A45] text-xs uppercase tracking-[0.2em] mb-3">
              <Compass className="w-4 h-4" />
              {Z('verdict_badge', 'text', 'Notre verdict', undefined, 'span')}
            </div>
            <EditableZone
              page={PAGE}
              zone="verdict"
              type="textarea"
              as="p"
              className="font-serif text-lg sm:text-xl text-[#F5F0E8] leading-relaxed mb-2"
              fallback="On a posé nos valises 4 jours à Zurich et l on en aurait volontiers pris 7 : entre la dérive en bouée sur la Limmat, les pique-niques des marchés fermiers et les échappées d une heure vers Stoos, c est l une des villes européennes les plus douces à vivre en été."
            />
            <p className="text-xs text-[#E8DFD1]/70 mb-6">
              {Z('verdict_signature', 'text', '— Heldonica, testés sur place', undefined, 'span')}
            </p>

            <div className="pt-6 border-t border-[#F5F0E8]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-base text-[#F5F0E8] mb-1">
                  {Z('cta_title', 'text', 'Tu veux un voyage adapté à ton rythme ?', undefined, 'span')}
                </h3>
                <p className="text-xs text-[#E8DFD1]/80">
                  {Z(
                    'cta_text',
                    'text',
                    'On transforme tes contraintes en itinéraire sur mesure, avec adresses testées.',
                    undefined,
                    'span'
                  )}
                </p>
              </div>
              <Link
                href="/travel-planning-form?destination=zurich"
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-sm bg-[#8B6E32] text-[#F5F0E8] hover:bg-[#A3823D] text-xs uppercase tracking-[0.15em] shrink-0 transition-colors"
              >
                {Z('cta_button', 'text', 'Planifier ce voyage avec Heldonica', undefined, 'span')}
              </Link>
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#DED5C6] pt-8">
            <Link
              href="/destinations/suisse"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#2C2416] hover:text-[#8B6E32] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {Z('footer_back_link', 'text', 'Voir tout le carnet Suisse', undefined, 'span')}
            </Link>
            <Link
              href="/destinations/suisse/stoos"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm bg-[#2C2416] text-[#F5F0E8] hover:bg-[#3E3321] text-xs uppercase tracking-[0.18em] transition-colors"
            >
              {Z('footer_cta_stoos', 'text', 'Continuer vers Stoos & Fronalpstock', undefined, 'span')}
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </InlineEditProvider>
  )
}

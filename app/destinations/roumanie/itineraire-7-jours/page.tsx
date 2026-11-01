import type { Metadata } from 'next'
import Link from 'next/link'
import { Eye } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getPageZones } from '@/lib/cms-zones'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import EditableZone from '@/components/inline-edit/EditableZone'
import { buildPageMetadata } from '@/lib/page-metadata'
import ComingSoonDestination from '@/components/ComingSoonDestination'
import { isUnpublishedCmsPage } from '@/lib/unpublished-pages'
import DayAccommodationBox from '@/components/itinerary/DayAccommodationBox'

export const revalidate = 3600

const PAGE = 'destinations-roumanie-itineraire-7-jours'

const metadata: Metadata = {
  title: 'Itinéraire Roumanie 7 jours | Transylvanie complète slow travel | Heldonica',
  description:
    'Itinéraire 7 jours en Roumanie : Brașov, Bran, Viscri, Sighișoara, Sibiu et la route Transfăgărășan. Testé en couple en août 2026.',
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/roumanie/itineraire-7-jours',
  },
  openGraph: {
    title: 'Itinéraire Roumanie 7 jours — La Transylvanie complète | Heldonica',
    description:
      '7 jours en Transylvanie : Brașov, Viscri, Sighișoara, Sibiu et la Transfăgărășan.',
    url: 'https://www.heldonica.fr/destinations/roumanie/itineraire-7-jours',
    type: 'article',
    images: [
      {
        url: 'https://www.heldonica.fr/images/destinations/roumanie/IMG_20260827_135023.jpg',
        width: 1200,
        height: 630,
        alt: 'Itinéraire Roumanie 7 jours — Heldonica',
      },
    ],
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('destinations-roumanie-itineraire-7-jours', metadata)
}

interface Props {
  searchParams?: Promise<{ preview?: string }>
}

export default async function Itineraire7JoursPage({ searchParams }: Props) {
  const sp = searchParams ? await searchParams : {}
  const isPreview = sp.preview === 'draft' || sp.preview === 'true'
  const zones = await getPageZones(PAGE)

  if (!isPreview && isUnpublishedCmsPage('destinations-roumanie-itineraire-7-jours')) {
    return (
      <ComingSoonDestination
        slug="roumanie-itineraire-7-jours"
        title={zones.title || 'Itinéraire Roumanie — 7 jours'}
        country="Roumanie"
        hero_unsplash_url="/images/destinations/roumanie/IMG_20260827_135023.jpg"
        zones={zones}
      />
    )
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
  )

  const getCmsOrSetting = (zone: string, fallback: string) =>
    zones[`${PAGE}__${zone}`] ?? fallback

  const DAYS = [
    {
      day: 1,
      location: getCmsOrSetting('day_1_location', 'Bucarest → Brașov'),
      activity: getCmsOrSetting('day_1_activity_short', 'Train 2h30 + Piața Sfatului'),
      accommodation: getCmsOrSetting('day_1_acc_short', 'Casa Wagner'),
    },
    {
      day: 2,
      location: getCmsOrSetting('day_2_location', 'Brașov & Château de Bran'),
      activity: getCmsOrSetting('day_2_activity_short', 'Bran à 8h00 + Mont Tâmpa'),
      accommodation: getCmsOrSetting('day_2_acc_short', 'Casa Wagner'),
    },
    {
      day: 3,
      location: getCmsOrSetting('day_3_location', 'Viscri (UNESCO)'),
      activity: getCmsOrSetting('day_3_activity_short', 'Église fortifiée + ruelles saxonnes'),
      accommodation: getCmsOrSetting('day_3_acc_short', 'Viscri 125'),
    },
    {
      day: 4,
      location: getCmsOrSetting('day_4_location', 'Sighișoara'),
      activity: getCmsOrSetting('day_4_activity_short', 'Citadelle médiévale + Escalier des Écoliers'),
      accommodation: getCmsOrSetting('day_4_acc_short', 'Casa Georgius Krauss'),
    },
    {
      day: 5,
      location: getCmsOrSetting('day_5_location', 'Sibiu (via Biertan)'),
      activity: getCmsOrSetting('day_5_activity_short', 'Église fortifiée de Biertan + Piața Mare'),
      accommodation: getCmsOrSetting('day_5_acc_short', 'Maison d’hôtes Piața Mică'),
    },
    {
      day: 6,
      location: getCmsOrSetting('day_6_location', 'Route Transfăgărășan & Lac Bâlea'),
      activity: getCmsOrSetting('day_6_activity_short', 'Lac glaciaire à 2 034 m + crêtes Făgăraș'),
      accommodation: getCmsOrSetting('day_6_acc_short', 'Maison d’hôtes Piața Mică'),
    },
    {
      day: 7,
      location: getCmsOrSetting('day_7_location', 'Sibiu → Bucarest'),
      activity: getCmsOrSetting('day_7_activity_short', 'Vallée de l’Olt + départ'),
      accommodation: '—',
    },
  ]

  const departText = getCmsOrSetting(
    'depart',
    'Août 2026 • Couple • Train + voiture de location • ~1 050 € tout compris pour 2'
  )

  return (
    <InlineEditProvider page={PAGE} initialZones={zones}>
      <Header />
      <main className="min-h-screen bg-[#FAF7F2]">
        {isPreview && (
          <div className="bg-amber-100/90 border-b border-amber-300 text-amber-900 px-4 py-2.5 text-xs flex items-center justify-center gap-2">
            <Eye className="w-4 h-4 text-amber-700" />
            <span className="font-medium">
              {Z('draft_badge_title', 'text', 'Mode Brouillon actif :', undefined, 'span')}
            </span>
            <span>
              {Z(
                'draft_badge_desc',
                'text',
                'Aperçu interne de l’itinéraire Roumanie 7 jours (non indexé).',
                undefined,
                'span'
              )}
            </span>
          </div>
        )}

        {/* Hero */}
        <section className="bg-stone-900 text-white py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 text-stone-300 text-sm mb-4">
              <Link href="/destinations/roumanie" className="hover:text-white transition-colors">
                {Z('breadcrumb_roumanie', 'text', 'Roumanie', undefined, 'span')}
              </Link>
              <span>/</span>
              <span>{Z('breadcrumb_current', 'text', 'Itinéraire 7 jours', undefined, 'span')}</span>
            </div>
            <span className="inline-block bg-teal text-white text-xs font-medium px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
              {Z('hero_kicker', 'text', 'Testé par Heldonica • Format équilibré', undefined, 'span')}
            </span>
            <h1 className="font-serif text-4xl md:text-5xl text-white mb-4 leading-tight">
              {Z('hero_title', 'text', 'Roumanie en 7 jours', undefined, 'span')}
            </h1>
            <p className="text-xl text-stone-300 max-w-2xl leading-relaxed mb-8">
              {Z(
                'hero_subtitle',
                'textarea',
                'La Transylvanie complète au bon rythme : cités saxonnes, villages classés UNESCO et la route alpine Transfăgărășan.',
                undefined,
                'span'
              )}
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full">
                {Z('chip_1', 'text', '7 jours / 6 nuits', undefined, 'span')}
              </span>
              <span className="bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full">
                {Z('chip_2', 'text', 'Août 2026', undefined, 'span')}
              </span>
              <span className="bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full">
                {Z('chip_3', 'text', 'Train + voiture de location (5j)', undefined, 'span')}
              </span>
              <span className="bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full font-semibold">
                {Z('chip_4', 'text', '~1 050 € pour 2 tout compris', undefined, 'span')}
              </span>
            </div>
          </div>
        </section>

        {/* Tableau récapitulatif */}
        <section className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-sm border border-[#DED5C6] overflow-hidden">
            <div className="bg-stone-50 px-6 py-4 border-b border-stone-200 flex items-center justify-between flex-wrap gap-2">
              <h2 className="font-serif text-lg text-stone-900">
                {Z('summary_title', 'text', "Aperçu de l'itinéraire", undefined, 'span')}
              </h2>
              <span className="text-xs text-stone-500">{departText}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100 text-stone-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-3 text-left">{Z('th_day', 'text', 'Jour', undefined, 'span')}</th>
                    <th className="px-6 py-3 text-left">{Z('th_city', 'text', 'Ville', undefined, 'span')}</th>
                    <th className="px-6 py-3 text-left">{Z('th_activity', 'text', 'Activité', undefined, 'span')}</th>
                    <th className="px-6 py-3 text-left">{Z('th_night', 'text', 'Nuit', undefined, 'span')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {DAYS.map((d) => (
                    <tr key={d.day} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-6 py-3.5 font-semibold text-eucalyptus whitespace-nowrap">J{d.day}</td>
                      <td className="px-6 py-3.5 font-medium text-stone-900">{d.location}</td>
                      <td className="px-6 py-3.5 text-stone-600">{d.activity}</td>
                      <td className="px-6 py-3.5 text-stone-500">{d.accommodation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Jours détaillés */}
        <section className="max-w-4xl mx-auto px-4 pb-16 space-y-10">
          {/* J1 */}
          <div className="bg-white rounded-sm border border-[#DED5C6] p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-action text-white text-xs font-bold px-3 py-1.5 rounded-full">J1</span>
              <h2 className="font-serif text-2xl text-stone-900">
                {Z('day_1_title', 'text', 'Bucarest → Brașov', undefined, 'span')}
              </h2>
            </div>
            <p className="text-stone-700 leading-relaxed mb-4">
              {Z(
                'day_1_text',
                'textarea',
                'Arrivée à Bucarest puis train direct vers Brașov depuis la Gara de Nord (2h30). Installation dans la vieille ville saxonne et première soirée sur la Piața Sfatului entourée des façades baroques et du mont Tâmpa.',
                undefined,
                'span'
              )}
            </p>
            <div className="bg-[#EFE9DF]/60 border-l-4 border-teal rounded-r-xl p-4">
              <p className="text-xs font-semibold text-teal uppercase tracking-wider mb-1">
                {Z('day_1_tip_kicker', 'text', 'Repère de terrain', undefined, 'span')}
              </p>
              <p className="text-[#4A413A] text-sm">
                {Z(
                  'day_1_tip',
                  'textarea',
                  'Prends le train CFR direct depuis Bucarest Gara de Nord : le trajet franchit les Carpates par Sinaia et Bușteni sans le stress de la circulation routière.',
                  undefined,
                  'span'
                )}
              </p>
            </div>
            <DayAccommodationBox
              page={PAGE}
              day={1}
              departText={departText}
              cityFallback={getCmsOrSetting('day_1_city_fb', 'Brașov')}
              accommodationFallback={getCmsOrSetting('day_1_acc_fb', 'Casa Wagner (Piața Sfatului)')}
            />
          </div>

          {/* J2 */}
          <div className="bg-white rounded-sm border border-[#DED5C6] p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-action text-white text-xs font-bold px-3 py-1.5 rounded-full">J2</span>
              <h2 className="font-serif text-2xl text-stone-900">
                {Z('day_2_title', 'text', 'Château de Bran à l’ouverture & Brașov', undefined, 'span')}
              </h2>
            </div>
            <p className="text-stone-700 leading-relaxed mb-4">
              {Z(
                'day_2_text',
                'textarea',
                'Prise de la voiture de location tôt le matin et route vers Bran (35 min) pour entrer dès 8h00 avant l’arrivée des autocars. Retour à Brașov pour visiter l’Église Noire (Biserica Neagră) et monter à pied sous les hêtres jusqu’au belvédère du mont Tâmpa.',
                undefined,
                'span'
              )}
            </p>
            <div className="bg-[#EFE9DF]/60 border-l-4 border-teal rounded-r-xl p-4">
              <p className="text-xs font-semibold text-teal uppercase tracking-wider mb-1">
                {Z('day_2_tip_kicker', 'text', 'Repère de terrain', undefined, 'span')}
              </p>
              <p className="text-[#4A413A] text-sm">
                {Z(
                  'day_2_tip',
                  'textarea',
                  'Sur le retour de Bran, fais un détour par les gorges de Zărnești (Prăpăstiile Zărneștilor) dans le parc national Piatra Craiului pour marcher une heure entre les parois calcaires.',
                  undefined,
                  'span'
                )}
              </p>
            </div>
            <DayAccommodationBox
              page={PAGE}
              day={2}
              departText={departText}
              cityFallback={getCmsOrSetting('day_2_city_fb', 'Brașov')}
              accommodationFallback={getCmsOrSetting('day_2_acc_fb', 'Casa Wagner')}
            />
          </div>

          {/* J3 */}
          <div className="bg-white rounded-sm border border-[#DED5C6] p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-action text-white text-xs font-bold px-3 py-1.5 rounded-full">J3</span>
              <h2 className="font-serif text-2xl text-stone-900">
                {Z('day_3_title', 'text', 'Viscri — Le temps suspendu en terre saxonne', undefined, 'span')}
              </h2>
            </div>
            <p className="text-stone-700 leading-relaxed mb-4">
              {Z(
                'day_3_text',
                'textarea',
                'Route vers le nord-ouest (1h15) jusqu’à Viscri, village saxon classé à l’UNESCO au bout d’une route secondaire bordée de prairies. Visite de l’église fortifiée blanche du XIIe siècle, rencontre avec les artisans du village et nuit dans une ferme saxonne restaurée.',
                undefined,
                'span'
              )}
            </p>
            <div className="bg-[#EFE9DF]/60 border-l-4 border-teal rounded-r-xl p-4">
              <p className="text-xs font-semibold text-teal uppercase tracking-wider mb-1">
                {Z('day_3_tip_kicker', 'text', 'Repère de terrain', undefined, 'span')}
              </p>
              <p className="text-[#4A413A] text-sm">
                {Z(
                  'day_3_tip',
                  'textarea',
                  'En fin d’après-midi, monte sur la colline face à l’église fortifiée pour observer le retour des troupeaux et des charrettes dans la rue principale de terre battue.',
                  undefined,
                  'span'
                )}
              </p>
            </div>
            <DayAccommodationBox
              page={PAGE}
              day={3}
              departText={departText}
              cityFallback={getCmsOrSetting('day_3_city_fb', 'Viscri')}
              accommodationFallback={getCmsOrSetting('day_3_acc_fb', 'Viscri 125')}
            />
          </div>

          {/* J4 */}
          <div className="bg-white rounded-sm border border-[#DED5C6] p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-action text-white text-xs font-bold px-3 py-1.5 rounded-full">J4</span>
              <h2 className="font-serif text-2xl text-stone-900">
                {Z('day_4_title', 'text', 'Sighișoara — La citadelle habitée', undefined, 'span')}
              </h2>
            </div>
            <p className="text-stone-700 leading-relaxed mb-4">
              {Z(
                'day_4_text',
                'textarea',
                'Court trajet (45 min) jusqu’à Sighișoara. Sa citadelle médiévale perchée est l’une des rares d’Europe encore habitée à l’année. Montée par l’Escalier couvert des Écoliers (175 marches en bois de 1642) jusqu’à l’église sur la Colline et la Tour de l’Horloge.',
                undefined,
                'span'
              )}
            </p>
            <div className="bg-[#EFE9DF]/60 border-l-4 border-teal rounded-r-xl p-4">
              <p className="text-xs font-semibold text-teal uppercase tracking-wider mb-1">
                {Z('day_4_tip_kicker', 'text', 'Repère de terrain', undefined, 'span')}
              </p>
              <p className="text-[#4A413A] text-sm">
                {Z(
                  'day_4_tip',
                  'textarea',
                  'Dors à l’intérieur même des remparts : après 19h00, les visiteurs d’un jour repartent et les ruelles pavées aux maisons ocre et vert d’eau retrouvent un calme absolu.',
                  undefined,
                  'span'
                )}
              </p>
            </div>
            <DayAccommodationBox
              page={PAGE}
              day={4}
              departText={departText}
              cityFallback={getCmsOrSetting('day_4_city_fb', 'Sighișoara')}
              accommodationFallback={getCmsOrSetting('day_4_acc_fb', 'Casa Georgius Krauss')}
            />
          </div>

          {/* J5 */}
          <div className="bg-white rounded-sm border border-[#DED5C6] p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-action text-white text-xs font-bold px-3 py-1.5 rounded-full">J5</span>
              <h2 className="font-serif text-2xl text-stone-900">
                {Z('day_5_title', 'text', 'Biertan & Sibiu', undefined, 'span')}
              </h2>
            </div>
            <p className="text-stone-700 leading-relaxed mb-4">
              {Z(
                'day_5_text',
                'textarea',
                'En route vers Sibiu, halte à Biertan (30 min de Sighișoara) pour visiter son impressionnante église fortifiée entourée de trois enceintes concentriques et sa célèbre porte de sacristie à 19 verrous (1515). Arrivée à Sibiu l’après-midi : Piața Mare, Piața Mică et Pont des Mensonges.',
                undefined,
                'span'
              )}
            </p>
            <div className="bg-[#EFE9DF]/60 border-l-4 border-teal rounded-r-xl p-4">
              <p className="text-xs font-semibold text-teal uppercase tracking-wider mb-1">
                {Z('day_5_tip_kicker', 'text', 'Repère de terrain', undefined, 'span')}
              </p>
              <p className="text-[#4A413A] text-sm">
                {Z(
                  'day_5_tip',
                  'textarea',
                  'À Sibiu, descends par le Passage des Escaliers (Pasajul Scărilor) vers la Ville Basse pour dîner dans une cave voûtée en briques loin des grandes terrasses.',
                  undefined,
                  'span'
                )}
              </p>
            </div>
            <DayAccommodationBox
              page={PAGE}
              day={5}
              departText={departText}
              cityFallback={getCmsOrSetting('day_5_city_fb', 'Sibiu')}
              accommodationFallback={getCmsOrSetting('day_5_acc_fb', 'Maison d’hôtes Piața Mică')}
            />
          </div>

          {/* J6 */}
          <div className="bg-white rounded-sm border border-[#DED5C6] p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-action text-white text-xs font-bold px-3 py-1.5 rounded-full">J6</span>
              <h2 className="font-serif text-2xl text-stone-900">
                {Z('day_6_title', 'text', 'La route Transfăgărășan & le lac glaciaire Bâlea', undefined, 'span')}
              </h2>
            </div>
            <p className="text-stone-700 leading-relaxed mb-4">
              {Z(
                'day_6_text',
                'textarea',
                'Excursion à la journée sur le versant nord de la route Transfăgărășan (DN7C), ouverte de fin juin à octobre. Les lacets spectaculaires grimpent à travers le cirque glaciaire jusqu’au lac Bâlea à 2 034 mètres d’altitude. Marche sur le sentier de crête vers le col Capra pour embrasser toute la vallée.',
                undefined,
                'span'
              )}
            </p>
            <div className="bg-[#EFE9DF]/60 border-l-4 border-teal rounded-r-xl p-4">
              <p className="text-xs font-semibold text-teal uppercase tracking-wider mb-1">
                {Z('day_6_tip_kicker', 'text', 'Repère de terrain', undefined, 'span')}
              </p>
              <p className="text-[#4A413A] text-sm">
                {Z(
                  'day_6_tip',
                  'textarea',
                  'Pars de Sibiu dès 7h00 : le col à 2 034 m est dégagé le matin avant la formation des brumes thermiques de milieu de journée, et le stationnement au lac Bâlea est immédiat.',
                  undefined,
                  'span'
                )}
              </p>
            </div>
            <DayAccommodationBox
              page={PAGE}
              day={6}
              departText={departText}
              cityFallback={getCmsOrSetting('day_6_city_fb', 'Sibiu')}
              accommodationFallback={getCmsOrSetting('day_6_acc_fb', 'Maison d’hôtes Piața Mică')}
            />
          </div>

          {/* J7 */}
          <div className="bg-white rounded-sm border border-[#DED5C6] p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-action text-white text-xs font-bold px-3 py-1.5 rounded-full">J7</span>
              <h2 className="font-serif text-2xl text-stone-900">
                {Z('day_7_title', 'text', 'Sibiu → Bucarest par le défilé de l’Olt', undefined, 'span')}
              </h2>
            </div>
            <p className="text-stone-700 leading-relaxed mb-4">
              {Z(
                'day_7_text',
                'textarea',
                'Route retour vers Bucarest par la vallée encaissée de la rivière Olt, avec une pause au monastère médiéval de Cozia dont les fresques d’origine se reflètent dans le fleuve. Restitution du véhicule à l’aéroport d’Otopeni.',
                undefined,
                'span'
              )}
            </p>
          </div>
        </section>

        {/* Budget détaillé */}
        <section className="bg-stone-100 py-14 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-2xl text-stone-900 mb-6">
              {Z('budget_title', 'text', 'Budget réel (pour 2 personnes)', undefined, 'span')}
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-5 border border-[#DED5C6]">
                <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">
                  {Z('budget_1_label', 'text', 'Hébergements (6 nuits)', undefined, 'span')}
                </p>
                <p className="font-serif text-2xl text-stone-900 font-bold">
                  {Z('budget_1_val', 'text', '490 €', undefined, 'span')}
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  {Z('budget_1_sub', 'text', 'Maisons d’hôtes & fermes saxonnes', undefined, 'span')}
                </p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-[#DED5C6]">
                <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">
                  {Z('budget_2_label', 'text', 'Transports sur place', undefined, 'span')}
                </p>
                <p className="font-serif text-2xl text-stone-900 font-bold">
                  {Z('budget_2_val', 'text', '220 €', undefined, 'span')}
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  {Z('budget_2_sub', 'text', 'Train + voiture 5j + carburant', undefined, 'span')}
                </p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-[#DED5C6]">
                <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">
                  {Z('budget_3_label', 'text', 'Repas & cafés', undefined, 'span')}
                </p>
                <p className="font-serif text-2xl text-stone-900 font-bold">
                  {Z('budget_3_val', 'text', '260 €', undefined, 'span')}
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  {Z('budget_3_sub', 'text', 'Tables de terroir & marchés', undefined, 'span')}
                </p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-[#DED5C6]">
                <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">
                  {Z('budget_4_label', 'text', 'Visites & entrées', undefined, 'span')}
                </p>
                <p className="font-serif text-2xl text-stone-900 font-bold">
                  {Z('budget_4_val', 'text', '80 €', undefined, 'span')}
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  {Z('budget_4_sub', 'text', 'Églises fortifiées, Bran, musées', undefined, 'span')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation autres durées */}
        <section className="max-w-4xl mx-auto px-4 py-12">
          <h2 className="font-serif text-xl text-stone-900 mb-5">
            {Z('other_durations_title', 'text', 'Autres durées disponibles', undefined, 'span')}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              href="/destinations/roumanie/itineraire-5-jours"
              className="group bg-white rounded-xl border border-[#DED5C6] p-5 hover:border-eucalyptus transition-all flex items-center justify-between"
            >
              <div>
                <p className="font-semibold text-stone-900 group-hover:text-eucalyptus transition-colors">
                  {Z('other_5j_title', 'text', 'Roumanie en 5 jours', undefined, 'span')}
                </p>
                <p className="text-stone-500 text-sm">
                  {Z('other_5j_sub', 'text', 'Format court : Brașov, Viscri & Sibiu', undefined, 'span')}
                </p>
              </div>
              <span className="text-eucalyptus font-bold text-lg">→</span>
            </Link>
            <Link
              href="/destinations/roumanie/itineraire-10-jours"
              className="group bg-white rounded-xl border border-[#DED5C6] p-5 hover:border-eucalyptus transition-all flex items-center justify-between"
            >
              <div>
                <p className="font-semibold text-stone-900 group-hover:text-eucalyptus transition-colors">
                  {Z('other_10j_title', 'text', 'Roumanie en 10 jours', undefined, 'span')}
                </p>
                <p className="text-stone-500 text-sm">
                  {Z('other_10j_sub', 'text', 'Transylvanie + Maramureș au nord', undefined, 'span')}
                </p>
              </div>
              <span className="text-eucalyptus font-bold text-lg">→</span>
            </Link>
          </div>
          <div className="mt-8 pt-6 border-t border-stone-200">
            <Link href="/destinations/roumanie" className="text-sm text-eucalyptus font-semibold hover:underline">
              {Z('back_link', 'text', '← Retour au guide Roumanie', undefined, 'span')}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </InlineEditProvider>
  )
}

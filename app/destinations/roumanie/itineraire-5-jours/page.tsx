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

export const revalidate = 86400

const PAGE = 'destinations-roumanie-itineraire-5-jours'

const metadata: Metadata = {
  title: 'Itinéraire Roumanie 5 jours | Brașov & Transylvanie slow travel | Heldonica',
  description:
    'Itinéraire 5 jours en Transylvanie : Brașov, château de Bran à l’ouverture, église fortifiée de Viscri et Sibiu. Testé en couple en août 2026.',
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/roumanie/itineraire-5-jours',
  },
  openGraph: {
    title: 'Itinéraire Roumanie 5 jours — Brașov, Viscri & Sibiu | Heldonica',
    description:
      '5 jours en Transylvanie sans courir : Brașov, Bran à 8h00, Viscri et Sibiu.',
    url: 'https://www.heldonica.fr/destinations/roumanie/itineraire-5-jours',
    type: 'article',
    images: [
      {
        url: 'https://www.heldonica.fr/images/destinations/roumanie/IMG_20260827_135023.jpg',
        width: 1200,
        height: 630,
        alt: 'Itinéraire Roumanie 5 jours — Heldonica',
      },
    ],
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('destinations-roumanie-itineraire-5-jours', metadata)
}

interface Props {
  searchParams?: Promise<{ preview?: string }>
}

export default async function Itineraire5JoursPage({ searchParams }: Props) {
  const sp = searchParams ? await searchParams : {}
  const isPreview = sp.preview === 'draft' || sp.preview === 'true'
  const zones = await getPageZones(PAGE)

  if (!isPreview && isUnpublishedCmsPage('destinations-roumanie-itineraire-5-jours')) {
    return (
      <ComingSoonDestination
        slug="roumanie-itineraire-5-jours"
        title={zones.title || 'Itinéraire Roumanie — 5 jours'}
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
      location: getCmsOrSetting('day_4_location', 'Sibiu'),
      activity: getCmsOrSetting('day_4_activity_short', 'Piața Mare, Piața Mică & Pont des Mensonges'),
      accommodation: getCmsOrSetting('day_4_acc_short', 'Maison d’hôtes Piața Mică'),
    },
    {
      day: 5,
      location: getCmsOrSetting('day_5_location', 'Sibiu → Bucarest'),
      activity: getCmsOrSetting('day_5_activity_short', 'Vallée de l’Olt + vol retour'),
      accommodation: '—',
    },
  ]

  const departText = getCmsOrSetting(
    'depart',
    'Août 2026 • Couple • Train + voiture de location • ~780 € tout compris pour 2'
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
                'Aperçu interne de l’itinéraire Roumanie 5 jours (non indexé).',
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
              <span>{Z('breadcrumb_current', 'text', 'Itinéraire 5 jours', undefined, 'span')}</span>
            </div>
            <span className="inline-block bg-teal text-white text-xs font-medium px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
              {Z('hero_kicker', 'text', 'Testé par Heldonica', undefined, 'span')}
            </span>
            <h1 className="font-serif text-4xl md:text-5xl text-white mb-4 leading-tight">
              {Z('hero_title', 'text', 'Roumanie en 5 jours', undefined, 'span')}
            </h1>
            <p className="text-xl text-stone-300 max-w-2xl leading-relaxed mb-8">
              {Z(
                'hero_subtitle',
                'textarea',
                'L’essentiel de la Transylvanie sans courir : Brașov, Bran, Viscri et Sibiu en 5 jours bien pensés.',
                undefined,
                'span'
              )}
            </p>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full">
                {Z('chip_1', 'text', '5 jours / 4 nuits', undefined, 'span')}
              </span>
              <span className="bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full">
                {Z('chip_2', 'text', 'Août 2026', undefined, 'span')}
              </span>
              <span className="bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full">
                {Z('chip_3', 'text', 'Train + voiture de location', undefined, 'span')}
              </span>
              <span className="bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full font-semibold">
                {Z('chip_4', 'text', '~780 € pour 2 tout compris', undefined, 'span')}
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
          {/* Jour 1 */}
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
                'Arrivée à Bucarest (aéroport Henri Coandă) puis train direct vers Brașov depuis la Gara de Nord (2h30, environ 15 € par personne). La ligne traverse la vallée de la Prahova au pied des Carpates. Installation dans le centre historique saxon et dîner autour de la Piața Sfatului.',
                undefined,
                'span'
              )}
            </p>
            <div className="bg-[#EFE9DF]/60 border-l-4 border-teal rounded-r-xl p-4">
              <p className="text-xs font-semibold text-teal uppercase tracking-wider mb-1">
                {Z('day_1_tip_kicker', 'text', 'Repère de terrain', undefined, 'span')}
              </p>
              <p className="text-stone-700 text-sm">
                {Z(
                  'day_1_tip',
                  'textarea',
                  'Prends le train de 10h00 depuis Bucarest Gara de Nord : les billets CFR se réservent en ligne la veille et évitent les embouteillages de la route DN1.',
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

          {/* Jour 2 */}
          <div className="bg-white rounded-sm border border-[#DED5C6] p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-action text-white text-xs font-bold px-3 py-1.5 rounded-full">J2</span>
              <h2 className="font-serif text-2xl text-stone-900">
                {Z('day_2_title', 'text', 'Château de Bran à l’aube & Brașov', undefined, 'span')}
              </h2>
            </div>
            <p className="text-stone-700 leading-relaxed mb-4">
              {Z(
                'day_2_text',
                'textarea',
                'Départ à 7h30 pour arriver au château de Bran dès l’ouverture : les cours intérieures et les escaliers dérobés sont encore silencieux. Retour à Brașov en fin de matinée pour visiter l’Église Noire (Biserica Neagră) et sa collection de tapis d’Anatolie, puis montée au mont Tâmpa en fin d’après-midi.',
                undefined,
                'span'
              )}
            </p>
            <div className="bg-[#EFE9DF]/60 border-l-4 border-teal rounded-r-xl p-4">
              <p className="text-xs font-semibold text-teal uppercase tracking-wider mb-1">
                {Z('day_2_tip_kicker', 'text', 'Repère de terrain', undefined, 'span')}
              </p>
              <p className="text-stone-700 text-sm">
                {Z(
                  'day_2_tip',
                  'textarea',
                  'À Brașov, cherche le passage de la Strada Sforii (l’une des ruelles les plus étroites d’Europe, 111 cm de large) tôt le matin avant de monter sous les arbres vers les Bastions des Tisserands.',
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

          {/* Jour 3 */}
          <div className="bg-white rounded-sm border border-[#DED5C6] p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-action text-white text-xs font-bold px-3 py-1.5 rounded-full">J3</span>
              <h2 className="font-serif text-2xl text-stone-900">
                {Z('day_3_title', 'text', 'Viscri — Le village saxon préservé', undefined, 'span')}
              </h2>
            </div>
            <p className="text-stone-700 leading-relaxed mb-4">
              {Z(
                'day_3_text',
                'textarea',
                'Prise en charge de la voiture de location (environ 30 €/jour) et route vers Viscri (1h15). Ce village saxon classé à l’UNESCO a conservé ses fermes aux façades bleu pastel et son église fortifiée blanche du XIIe siècle perchée au-dessus des prairies. Marche dans les collines et dîner de produits fermiers.',
                undefined,
                'span'
              )}
            </p>
            <div className="bg-[#EFE9DF]/60 border-l-4 border-teal rounded-r-xl p-4">
              <p className="text-xs font-semibold text-teal uppercase tracking-wider mb-1">
                {Z('day_3_tip_kicker', 'text', 'Repère de terrain', undefined, 'span')}
              </p>
              <p className="text-stone-700 text-sm">
                {Z(
                  'day_3_tip',
                  'textarea',
                  'Monte dans le chemin de ronde de l’église fortifiée de Viscri : la vue embrasse tous les toits de tuiles brunes et les pâturages où rentrent les troupeaux le soir.',
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
              accommodationFallback={getCmsOrSetting('day_3_acc_fb', 'Viscri 125 (maison saxonne restaurée)')}
            />
          </div>

          {/* Jour 4 */}
          <div className="bg-white rounded-sm border border-[#DED5C6] p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-action text-white text-xs font-bold px-3 py-1.5 rounded-full">J4</span>
              <h2 className="font-serif text-2xl text-stone-900">
                {Z('day_4_title', 'text', 'Sibiu — La perle culturelle de Transylvanie', undefined, 'span')}
              </h2>
            </div>
            <p className="text-stone-700 leading-relaxed mb-4">
              {Z(
                'day_4_text',
                'textarea',
                'Route matinale vers Sibiu (1h30) à travers le plateau transylvain. Découverte des trois places reliées par des passages voûtés : Piața Mare, Piața Mică et Piața Huet, sous le regard des célèbres lucarnes en forme d’yeux (« les yeux de Sibiu »). Traversée du Pont des Mensonges et descente par les escaliers des Passages vers la Ville Basse.',
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
                  'Grimpe au sommet de la Tour du Conseil (Turnul Sfatului, 2 €) une heure avant le coucher du soleil : la lumière dorée souligne les toits à lucarnes et la chaîne des monts Făgăraș au sud.',
                  undefined,
                  'span'
                )}
              </p>
            </div>
            <DayAccommodationBox
              page={PAGE}
              day={4}
              departText={departText}
              cityFallback={getCmsOrSetting('day_4_city_fb', 'Sibiu')}
              accommodationFallback={getCmsOrSetting('day_4_acc_fb', 'Maison d’hôtes sur Piața Mică')}
            />
          </div>

          {/* Jour 5 */}
          <div className="bg-white rounded-sm border border-[#DED5C6] p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-action text-white text-xs font-bold px-3 py-1.5 rounded-full">J5</span>
              <h2 className="font-serif text-2xl text-stone-900">
                {Z('day_5_title', 'text', 'Sibiu → Bucarest par la vallée de l’Olt', undefined, 'span')}
              </h2>
            </div>
            <p className="text-stone-700 leading-relaxed mb-4">
              {Z(
                'day_5_text',
                'textarea',
                'Dernier café matinal sur la Piața Mică, puis route vers le sud par le défilé de la rivière Olt et arrêt au monastère de Cozia (XIVe siècle) au bord de l’eau. Restitution du véhicule à l’aéroport d’Otopeni en fin d’après-midi.',
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
                  {Z('budget_1_label', 'text', 'Hébergements (4 nuits)', undefined, 'span')}
                </p>
                <p className="font-serif text-2xl text-stone-900 font-bold">
                  {Z('budget_1_val', 'text', '340 €', undefined, 'span')}
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  {Z('budget_1_sub', 'text', 'Maisons d’hôtes de caractère', undefined, 'span')}
                </p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-[#DED5C6]">
                <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">
                  {Z('budget_2_label', 'text', 'Transports sur place', undefined, 'span')}
                </p>
                <p className="font-serif text-2xl text-stone-900 font-bold">
                  {Z('budget_2_val', 'text', '160 €', undefined, 'span')}
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  {Z('budget_2_sub', 'text', 'Train + location voiture 3j + essence', undefined, 'span')}
                </p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-[#DED5C6]">
                <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">
                  {Z('budget_3_label', 'text', 'Repas & cafés', undefined, 'span')}
                </p>
                <p className="font-serif text-2xl text-stone-900 font-bold">
                  {Z('budget_3_val', 'text', '210 €', undefined, 'span')}
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  {Z('budget_3_sub', 'text', 'Tables locales midi et soir', undefined, 'span')}
                </p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-[#DED5C6]">
                <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">
                  {Z('budget_4_label', 'text', 'Visites & entrées', undefined, 'span')}
                </p>
                <p className="font-serif text-2xl text-stone-900 font-bold">
                  {Z('budget_4_val', 'text', '70 €', undefined, 'span')}
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  {Z('budget_4_sub', 'text', 'Bran, Église Noire, Viscri, musées', undefined, 'span')}
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
              href="/destinations/roumanie/itineraire-7-jours"
              className="group bg-white rounded-xl border border-[#DED5C6] p-5 hover:border-eucalyptus transition-all flex items-center justify-between"
            >
              <div>
                <p className="font-semibold text-stone-900 group-hover:text-eucalyptus transition-colors">
                  {Z('other_7j_title', 'text', 'Roumanie en 7 jours', undefined, 'span')}
                </p>
                <p className="text-stone-500 text-sm">
                  {Z('other_7j_sub', 'text', '+ Sighișoara et la route Transfăgărășan', undefined, 'span')}
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
                  {Z('other_10j_sub', 'text', 'Transylvanie complète + Maramureș au nord', undefined, 'span')}
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

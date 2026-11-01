import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getPageZones } from '@/lib/cms-zones'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import EditableZone from '@/components/inline-edit/EditableZone'
import { buildPageMetadata } from '@/lib/page-metadata'

export const revalidate = 86400

const PAGE = 'destinations-idf'

const metadata: Metadata = {
  title: 'Île-de-France slow travel | Guide Heldonica',
  description:
    'Paris autrement (Petite Ceinture du 14e, Canal Saint-Martin, rue Mouffetard), Versailles à 8h00, Giverny à vélo et forêt de Fontainebleau. Notre guide slow travel.',
  alternates: { canonical: 'https://www.heldonica.fr/destinations/idf' },
  openGraph: {
    title: 'Île-de-France slow travel | Guide Heldonica',
    description:
      'Paris autrement, Versailles hors saison, Giverny au petit matin et chaos de grès de Fontainebleau. Slow travel en Île-de-France.',
    url: 'https://www.heldonica.fr/destinations/idf',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'Paris slow travel — Île-de-France' }],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@heldonica',
    title: 'Île-de-France slow travel | Guide Heldonica',
    description: 'Paris autrement, Versailles à l’aube, Giverny à vélo et Fontainebleau.',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('destinations-idf', metadata)
}

export default async function IdfPage() {
  const zones = await getPageZones(PAGE)

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
  )

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: zones[`${PAGE}__faq_1_q`] ?? 'Quand aller à Paris et en Île-de-France ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            zones[`${PAGE}__faq_1_a`] ??
            "Avril à juin pour les jardins et la douceur, septembre-octobre pour les lumières dorées en forêt de Fontainebleau et les files d'attente réduites.",
        },
      },
      {
        '@type': 'Question',
        name:
          zones[`${PAGE}__faq_2_q`] ?? 'Comment se déplacer en Île-de-France sans voiture ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            zones[`${PAGE}__faq_2_a`] ??
            'Le Pass Navigo (zones 1-5) couvre métro, RER, bus et trains Transilien vers Versailles (ligne L) et Fontainebleau-Avon (ligne R en 40 min depuis Gare de Lyon).',
        },
      },
      {
        '@type': 'Question',
        name: zones[`${PAGE}__faq_3_q`] ?? 'Que faire autour de Paris en journée ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            zones[`${PAGE}__faq_3_a`] ??
            'Fontainebleau (40 min, ligne R) pour le sentier bleu Denecourt n° 2 et les chaos de grès d’Apremont. Versailles (8h00 par la Grille de la Reine) pour le Grand Canal et le Potager du Roi. Giverny (train Saint-Lazare + 5 km à vélo sur la voie verte depuis Vernon) dès 9h00.',
        },
      },
      {
        '@type': 'Question',
        name:
          zones[`${PAGE}__faq_4_q`] ??
          'Y a-t-il des promenades slow travel gratuites à Paris ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            zones[`${PAGE}__faq_4_a`] ??
            'Oui : la Petite Ceinture du 14e (entrée rue Didot jusqu’à la rue des Suisses), les neuf écluses du Canal Saint-Martin et la rue Sainte-Marthe (10e), le Canal de l’Ourcq à vélo et le marché de la rue Mouffetard (5e).',
        },
      },
    ],
  }

  const touristSchema = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: zones[`${PAGE}__hero_title`] ?? 'Île-de-France',
    description:
      zones[`${PAGE}__hero_description`] ??
      "On habite à côté, et Paris nous surprend encore. Pas le Paris des selfies devant la Tour Eiffel — l'autre Paris, celui de la Petite Ceinture du 14e, du Canal Saint-Martin au matin, de la rue Mouffetard et des forêts accessibles en train.",
    url: 'https://www.heldonica.fr/destinations/idf',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'FR',
      addressRegion: 'Île-de-France',
    },
    geo: { '@type': 'GeoCoordinates', latitude: 48.8566, longitude: 2.3522 },
    touristType: ['Slow traveler', 'City explorer', 'Nature lover'],
  }

  const subNavItems = [
    { href: '/destinations/idf/paris', node: Z('subnav_1', 'text', 'Paris (14e, 5e & 10e)', undefined, 'span') },
    { href: '/destinations/idf/versailles', node: Z('subnav_2', 'text', 'Versailles', undefined, 'span') },
    { href: '/destinations/idf/giverny', node: Z('subnav_3', 'text', 'Giverny', undefined, 'span') },
    { href: '/destinations/idf/fontainebleau', node: Z('subnav_4', 'text', 'Fontainebleau', undefined, 'span') },
  ]

  return (
    <InlineEditProvider page={PAGE} initialZones={zones}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(touristSchema) }}
      />
      <Header />
      <main className="min-h-screen bg-[#F7F3EC]">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-stone-900 via-stone-800 to-stone-700 py-24 md:py-32">
          <div className="absolute inset-0 opacity-20">
            {Z('hero_image', 'image', '/og-default.jpg', 'w-full h-full object-cover')}
          </div>
          <div className="relative max-w-4xl mx-auto px-4">
            <span className="inline-block text-teal text-xs font-semibold uppercase tracking-widest mb-4">
              {Z('hero_badge', 'text', 'Destinations France', undefined, 'span')}
            </span>
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-4 leading-tight">
              {Z('hero_title', 'text', 'Île-de-France', undefined, 'span')}
            </h1>
            <p className="text-lg md:text-xl text-stone-200 max-w-2xl leading-relaxed">
              {Z(
                'hero_description',
                'textarea',
                "On habite à côté, et Paris nous surprend encore. Pas le Paris des files d'attente devant la Tour Eiffel — l'autre Paris, celui de la Petite Ceinture du 14e, des écluses du Canal Saint-Martin, de la rue Mouffetard le vendredi soir et des chaos de grès de Fontainebleau à 40 minutes de train.",
                undefined,
                'span'
              )}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/destinations/idf/paris"
                className="inline-flex items-center gap-2 px-6 py-3 bg-action text-white font-semibold rounded-sm hover:bg-action-fonce transition-colors text-sm"
              >
                {Z('hero_cta_1', 'text', 'Explorer Paris', undefined, 'span')}
              </Link>
              <Link
                href="/destinations/idf/fontainebleau"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#FAF7F2]/10 text-white font-medium rounded-sm hover:bg-[#FAF7F2]/20 transition-colors text-sm border border-white/20"
              >
                {Z('hero_cta_2', 'text', 'Fontainebleau', undefined, 'span')}
              </Link>
            </div>
          </div>
        </section>

        {/* Sub navigation */}
        <nav
          className="bg-[#FAF7F2] border-b border-[#DED5C6] sticky top-16 z-40"
          aria-label="Sous-destinations Île-de-France"
        >
          <div className="max-w-4xl mx-auto px-4 py-3 flex gap-6 overflow-x-auto no-scrollbar">
            {subNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-stone-600 hover:text-eucalyptus whitespace-nowrap text-sm font-medium transition-colors pb-0.5 border-b-2 border-transparent hover:border-eucalyptus/50"
              >
                {item.node}
              </Link>
            ))}
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Intro */}
          <section className="mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-eucalyptus mb-3">
              {Z('intro_kicker', 'text', 'Notre angle', undefined, 'span')}
            </p>
            <h2 className="text-2xl md:text-3xl font-serif text-stone-900 mb-5">
              {Z(
                'intro_title',
                'text',
                'Le slow travel commence parfois à 30 minutes de chez soi',
                undefined,
                'span'
              )}
            </h2>
            <div className="prose prose-stone max-w-none text-stone-700 leading-relaxed space-y-4">
              <p>
                {Z(
                  'intro_1',
                  'textarea',
                  "L'Île-de-France a beau être la région la plus visitée d'Europe, il suffit de décaler ses horaires ou de descendre d'une station de métro plus tôt pour retrouver le calme d'un village. La Petite Ceinture ferroviaire du 14e entre la rue Didot et la rue des Suisses, la place Sainte-Marthe derrière le Canal Saint-Martin, ou le sentier bleu Denecourt n° 2 à Fontainebleau : c'est ce terrain-là qu'on arpente toute l'année.",
                  undefined,
                  'span'
                )}
              </p>
              <p>
                {Z(
                  'intro_2',
                  'textarea',
                  "Ici, pas besoin d'avion ni de location de voiture : un Pass Navigo suffit pour relier les halles du marché Notre-Dame à Versailles dès 8h00, pédaler le long du Canal de l'Ourcq jusqu'à Meaux ou fermer l'ordinateur un vendredi à 18h00 pour traverser le Jardin du Luxembourg jusqu'à la rue Mouffetard.",
                  undefined,
                  'span'
                )}
              </p>
            </div>
          </section>

          {/* Pépites */}
          <section className="mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-eucalyptus mb-3">
              {Z('pepites_kicker', 'text', "Ce qu'on a vraiment aimé", undefined, 'span')}
            </p>
            <h2 className="text-2xl font-serif text-stone-900 mb-6">
              {Z('pepites_section_title', 'text', 'Nos pépites en Île-de-France', undefined, 'span')}
            </h2>
            <div className="grid gap-5 md:grid-cols-2">
              <Link
                href="/destinations/idf/paris"
                className="group block p-6 bg-[#FAF7F2] rounded-sm border border-[#DED5C6] hover:border-eucalyptus/40 transition-all"
              >
                <span className="inline-block text-xs font-semibold uppercase tracking-widest text-eucalyptus mb-3">
                  {Z('pepite_1_tag', 'text', 'Corridor ferroviaire · 14e', undefined, 'span')}
                </span>
                <h3 className="font-serif text-base text-stone-900 mb-2 group-hover:text-eucalyptus transition-colors">
                  {Z('pepite_1_titre', 'text', 'La Petite Ceinture du 14e (Didot – Suisses)', undefined, 'span')}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {Z(
                    'pepite_1_desc',
                    'textarea',
                    "L'ancienne ligne ferroviaire circulaire de 32 km devenue refuge écologique entre les traverses : buddléias, fresques murales sous le tunnel désaffecté et silence total entre 8h et 10h.",
                    undefined,
                    'span'
                  )}
                </p>
              </Link>
              <Link
                href="/destinations/idf/paris"
                className="group block p-6 bg-[#FAF7F2] rounded-sm border border-[#DED5C6] hover:border-eucalyptus/40 transition-all"
              >
                <span className="inline-block text-xs font-semibold uppercase tracking-widest text-eucalyptus mb-3">
                  {Z('pepite_2_tag', 'text', 'Balade du vendredi soir · 5e', undefined, 'span')}
                </span>
                <h3 className="font-serif text-base text-stone-900 mb-2 group-hover:text-eucalyptus transition-colors">
                  {Z('pepite_2_titre', 'text', "Du Luxembourg à la rue Mouffetard & Singh'Nature", undefined, 'span')}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {Z(
                    'pepite_2_desc',
                    'textarea',
                    "Fermer l'ordinateur à 18h00, traverser les pelouses du Luxembourg et la Sorbonne, flâner devant les fromagers de la rue Mouffetard et s'attabler au Singh'Nature autour d'assiettes indiennes parfumées.",
                    undefined,
                    'span'
                  )}
                </p>
              </Link>
              <Link
                href="/destinations/idf/paris"
                className="group block p-6 bg-[#FAF7F2] rounded-sm border border-[#DED5C6] hover:border-eucalyptus/40 transition-all"
              >
                <span className="inline-block text-xs font-semibold uppercase tracking-widest text-eucalyptus mb-3">
                  {Z('pepite_3_tag', 'text', 'Au fil de l’eau · 10e & 19e', undefined, 'span')}
                </span>
                <h3 className="font-serif text-base text-stone-900 mb-2 group-hover:text-eucalyptus transition-colors">
                  {Z('pepite_3_titre', 'text', "Canal Saint-Martin, rue Sainte-Marthe & l'Ourcq à vélo", undefined, 'span')}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {Z(
                    'pepite_3_desc',
                    'textarea',
                    "Observer la lenteur mécanique des neuf écluses sur 4,5 km au matin, bifurquer vers les façades colorées de la rue Sainte-Marthe, ou pédaler sans voiture de La Villette jusqu'à Meaux.",
                    undefined,
                    'span'
                  )}
                </p>
              </Link>
              <Link
                href="/destinations/idf/fontainebleau"
                className="group block p-6 bg-[#FAF7F2] rounded-sm border border-[#DED5C6] hover:border-eucalyptus/40 transition-all"
              >
                <span className="inline-block text-xs font-semibold uppercase tracking-widest text-eucalyptus mb-3">
                  {Z('pepite_4_tag', 'text', 'Forêt & Chaos de grès · 40 min en train', undefined, 'span')}
                </span>
                <h3 className="font-serif text-base text-stone-900 mb-2 group-hover:text-eucalyptus transition-colors">
                  {Z('pepite_4_titre', 'text', 'Forêt de Fontainebleau & Sentier Denecourt n° 2', undefined, 'span')}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {Z(
                    'pepite_4_desc',
                    'textarea',
                    'À 40 minutes de Paris-Gare de Lyon par la ligne R : les rochers de grès de Cassepot, le panorama à 360° de la Tour Denecourt, les gorges d’Apremont et la spécialité fromagère fouettée au marché.',
                    undefined,
                    'span'
                  )}
                </p>
              </Link>
            </div>
          </section>

          {/* Zones */}
          <section className="mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-eucalyptus mb-3">
              {Z('zones_kicker', 'text', 'Par secteur', undefined, 'span')}
            </p>
            <h2 className="text-2xl font-serif text-stone-900 mb-6">
              {Z('zones_section_title', 'text', 'Explorer par zone', undefined, 'span')}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Link
                href="/destinations/idf/paris"
                className="group flex items-start gap-4 p-5 bg-[#FAF7F2] rounded-sm border border-[#DED5C6] hover:border-eucalyptus/40 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-eucalyptus/10 flex items-center justify-center flex-shrink-0 group-hover:bg-eucalyptus/20 transition-colors">
                  <span className="text-eucalyptus font-serif font-bold text-sm">
                    {String.fromCharCode((zones[`${PAGE}__zone_1_label`] ?? 'Paris').charCodeAt(0))}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900 mb-1 group-hover:text-eucalyptus transition-colors">
                    {Z('zone_1_label', 'text', 'Paris', undefined, 'span')}
                  </h3>
                  <p className="text-stone-600 text-sm leading-relaxed">
                    {Z(
                      'zone_1_desc',
                      'textarea',
                      "La capitale par ses traversées piétonnes : Petite Ceinture du 14e, villas pavées d'Alésia, rue Mouffetard et écluses du Canal Saint-Martin.",
                      undefined,
                      'span'
                    )}
                  </p>
                </div>
              </Link>
              <Link
                href="/destinations/idf/versailles"
                className="group flex items-start gap-4 p-5 bg-[#FAF7F2] rounded-sm border border-[#DED5C6] hover:border-eucalyptus/40 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-eucalyptus/10 flex items-center justify-center flex-shrink-0 group-hover:bg-eucalyptus/20 transition-colors">
                  <span className="text-eucalyptus font-serif font-bold text-sm">
                    {String.fromCharCode((zones[`${PAGE}__zone_2_label`] ?? 'Versailles').charCodeAt(0))}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900 mb-1 group-hover:text-eucalyptus transition-colors">
                    {Z('zone_2_label', 'text', 'Versailles', undefined, 'span')}
                  </h3>
                  <p className="text-stone-600 text-sm leading-relaxed">
                    {Z(
                      'zone_2_desc',
                      'textarea',
                      'Entrée gratuite dès 8h00 par la Grille de la Reine vers le Grand Canal, halles du marché Notre-Dame, Potager du Roi (1683) et Hameau de la Reine.',
                      undefined,
                      'span'
                    )}
                  </p>
                </div>
              </Link>
              <Link
                href="/destinations/idf/giverny"
                className="group flex items-start gap-4 p-5 bg-[#FAF7F2] rounded-sm border border-[#DED5C6] hover:border-eucalyptus/40 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-eucalyptus/10 flex items-center justify-center flex-shrink-0 group-hover:bg-eucalyptus/20 transition-colors">
                  <span className="text-eucalyptus font-serif font-bold text-sm">
                    {String.fromCharCode((zones[`${PAGE}__zone_3_label`] ?? 'Giverny').charCodeAt(0))}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900 mb-1 group-hover:text-eucalyptus transition-colors">
                    {Z('zone_3_label', 'text', 'Giverny', undefined, 'span')}
                  </h3>
                  <p className="text-stone-600 text-sm leading-relaxed">
                    {Z(
                      'zone_3_desc',
                      'textarea',
                      'Train depuis Saint-Lazare puis 5 km à vélo sur la voie verte de Vernon, entrée à 9h00 pile au Jardin d’Eau et retour par le sentier des coteaux crayeux.',
                      undefined,
                      'span'
                    )}
                  </p>
                </div>
              </Link>
              <Link
                href="/destinations/idf/fontainebleau"
                className="group flex items-start gap-4 p-5 bg-[#FAF7F2] rounded-sm border border-[#DED5C6] hover:border-eucalyptus/40 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-eucalyptus/10 flex items-center justify-center flex-shrink-0 group-hover:bg-eucalyptus/20 transition-colors">
                  <span className="text-eucalyptus font-serif font-bold text-sm">
                    {String.fromCharCode((zones[`${PAGE}__zone_4_label`] ?? 'Fontainebleau').charCodeAt(0))}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900 mb-1 group-hover:text-eucalyptus transition-colors">
                    {Z('zone_4_label', 'text', 'Fontainebleau', undefined, 'span')}
                  </h3>
                  <p className="text-stone-600 text-sm leading-relaxed">
                    {Z(
                      'zone_4_desc',
                      'textarea',
                      '25 000 hectares de pins et de chaos de grès à 40 minutes de train : sentier bleu Denecourt, gorges d’Apremont et Jardin Anglais.',
                      undefined,
                      'span'
                    )}
                  </p>
                </div>
              </Link>
            </div>
          </section>

          {/* Infos pratiques */}
          <section className="mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-eucalyptus mb-3">
              {Z('info_kicker', 'text', 'Côté pratique', undefined, 'span')}
            </p>
            <h2 className="text-2xl font-serif text-stone-900 mb-6">
              {Z('info_section_title', 'text', "Ce qu'il faut savoir", undefined, 'span')}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-[#FAF7F2] p-6 rounded-sm border border-[#DED5C6]">
                <h3 className="font-serif text-lg text-stone-900 mb-4">
                  {Z('when_title', 'text', 'Quand y aller', undefined, 'span')}
                </h3>
                <ul className="space-y-3 text-stone-600 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-eucalyptus font-bold mt-0.5">·</span>
                    <span>
                      {Z(
                        'when_1',
                        'html',
                        "<strong>Avril – Juin</strong> — glycines en fleurs à Giverny, allées claires sur la Petite Ceinture et température idéale pour marcher.",
                        undefined,
                        'span'
                      )}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-eucalyptus font-bold mt-0.5">·</span>
                    <span>
                      {Z(
                        'when_2',
                        'html',
                        "<strong>Septembre – Octobre</strong> — fougères cuivrées dans les gorges d'Apremont à Fontainebleau et lumière rasante sur le Grand Canal.",
                        undefined,
                        'span'
                      )}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-eucalyptus font-bold mt-0.5">·</span>
                    <span>
                      {Z(
                        'when_3',
                        'html',
                        "<strong>Juillet – Août</strong> — privilégie les départs à 8h00 dans les parcs et les balades à vélo le long du Canal de l'Ourcq.",
                        undefined,
                        'span'
                      )}
                    </span>
                  </li>
                </ul>
              </div>
              <div className="bg-[#FAF7F2] p-6 rounded-sm border border-[#DED5C6]">
                <h3 className="font-serif text-lg text-stone-900 mb-4">
                  {Z('transport_title', 'text', 'Transport & Budget', undefined, 'span')}
                </h3>
                <ul className="space-y-3 text-stone-600 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-eucalyptus font-bold mt-0.5">·</span>
                    <span>
                      {Z(
                        'transport_1',
                        'html',
                        '<strong>Pass Navigo zones 1-5</strong> — couvre métro, RER, bus et trains Transilien vers Versailles (ligne L) et Fontainebleau-Avon (ligne R).',
                        undefined,
                        'span'
                      )}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-eucalyptus font-bold mt-0.5">·</span>
                    <span>
                      {Z(
                        'transport_2',
                        'html',
                        '<strong>Hébergement</strong> — 90 à 180 €/nuit selon le quartier. Les 14e (Alésia/Montsouris), 10e (Sainte-Marthe) et 11e offrent une vraie vie de quartier.',
                        undefined,
                        'span'
                      )}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-eucalyptus font-bold mt-0.5">·</span>
                    <span>
                      {Z(
                        'transport_3',
                        'html',
                        '<strong>Tables de quartier</strong> — compte 18 à 35 €/personne (rue Mouffetard, rue Sainte-Marthe ou marché Notre-Dame à Versailles).',
                        undefined,
                        'span'
                      )}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-eucalyptus mb-3">
              {Z('faq_kicker', 'text', 'Questions fréquentes', undefined, 'span')}
            </p>
            <div className="space-y-4">
              <details className="group bg-[#FAF7F2] rounded-sm border border-[#DED5C6] p-5">
                <summary className="font-semibold text-stone-900 cursor-pointer list-none flex items-center justify-between">
                  {Z('faq_1_q', 'text', 'Quand aller à Paris et en Île-de-France ?', undefined, 'span')}
                  <span className="text-eucalyptus group-open:rotate-180 transition-transform">↓</span>
                </summary>
                <p className="mt-3 text-stone-600 text-sm leading-relaxed">
                  {Z(
                    'faq_1_a',
                    'textarea',
                    "Avril à juin pour les jardins et la douceur, septembre-octobre pour les lumières dorées en forêt de Fontainebleau et les files d'attente réduites.",
                    undefined,
                    'span'
                  )}
                </p>
              </details>
              <details className="group bg-[#FAF7F2] rounded-sm border border-[#DED5C6] p-5">
                <summary className="font-semibold text-stone-900 cursor-pointer list-none flex items-center justify-between">
                  {Z(
                    'faq_2_q',
                    'text',
                    'Comment se déplacer en Île-de-France sans voiture ?',
                    undefined,
                    'span'
                  )}
                  <span className="text-eucalyptus group-open:rotate-180 transition-transform">↓</span>
                </summary>
                <p className="mt-3 text-stone-600 text-sm leading-relaxed">
                  {Z(
                    'faq_2_a',
                    'textarea',
                    'Le Pass Navigo (zones 1-5) couvre métro, RER, bus et trains Transilien vers Versailles (ligne L) et Fontainebleau-Avon (ligne R en 40 min depuis Gare de Lyon).',
                    undefined,
                    'span'
                  )}
                </p>
              </details>
              <details className="group bg-[#FAF7F2] rounded-sm border border-[#DED5C6] p-5">
                <summary className="font-semibold text-stone-900 cursor-pointer list-none flex items-center justify-between">
                  {Z('faq_3_q', 'text', 'Que faire autour de Paris en journée ?', undefined, 'span')}
                  <span className="text-eucalyptus group-open:rotate-180 transition-transform">↓</span>
                </summary>
                <p className="mt-3 text-stone-600 text-sm leading-relaxed">
                  {Z(
                    'faq_3_a',
                    'textarea',
                    'Fontainebleau (40 min, ligne R) pour le sentier bleu Denecourt n° 2 et les chaos de grès d’Apremont. Versailles (8h00 par la Grille de la Reine) pour le Grand Canal et le Potager du Roi. Giverny (train Saint-Lazare + 5 km à vélo sur la voie verte depuis Vernon) dès 9h00.',
                    undefined,
                    'span'
                  )}
                </p>
              </details>
              <details className="group bg-[#FAF7F2] rounded-sm border border-[#DED5C6] p-5">
                <summary className="font-semibold text-stone-900 cursor-pointer list-none flex items-center justify-between">
                  {Z(
                    'faq_4_q',
                    'text',
                    'Y a-t-il des promenades slow travel gratuites à Paris ?',
                    undefined,
                    'span'
                  )}
                  <span className="text-eucalyptus group-open:rotate-180 transition-transform">↓</span>
                </summary>
                <p className="mt-3 text-stone-600 text-sm leading-relaxed">
                  {Z(
                    'faq_4_a',
                    'textarea',
                    'Oui : la Petite Ceinture du 14e (entrée rue Didot jusqu’à la rue des Suisses), les neuf écluses du Canal Saint-Martin et la rue Sainte-Marthe (10e), le Canal de l’Ourcq à vélo et le marché de la rue Mouffetard (5e).',
                    undefined,
                    'span'
                  )}
                </p>
              </details>
            </div>
          </section>

          {/* Back link */}
          <Link
            href="/destinations"
            className="text-eucalyptus hover:text-eucalyptus/80 text-sm font-medium transition-colors"
          >
            {Z('back_link', 'text', '← Toutes les destinations', undefined, 'span')}
          </Link>
        </div>
      </main>
      <Footer />
    </InlineEditProvider>
  )
}

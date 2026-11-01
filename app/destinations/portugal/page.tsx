import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getPageZones } from '@/lib/cms-zones';
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider';
import EditableZone from '@/components/inline-edit/EditableZone';
import { buildPageMetadata } from '@/lib/page-metadata';

export const revalidate = 86400;

const PAGE = 'destinations-portugal';

const metadata: Metadata = {
  title: 'Portugal slow travel | Guide Heldonica — Madère, Porto, Lisbonne, Alentejo',
  description:
    'Guide Portugal slow travel : Madère, Lisbonne, Porto, Sintra, Óbidos, Coimbra et Alentejo. Nos adresses testées, budgets réels et itinéraires vécus en couple.',
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/portugal',
  },
  openGraph: {
    title: 'Portugal slow travel | Guide Heldonica — Madère, Porto, Lisbonne, Alentejo',
    description:
      'Guide Portugal slow travel : Madère, Lisbonne, Porto, Sintra, Óbidos, Coimbra et Alentejo. Nos adresses testées et budgets réels.',
    url: 'https://www.heldonica.fr/destinations/portugal',
    images: [
      {
        url: '/images/destinations/portugal/porto/etape1_porto_virtudes.jpg',
        width: 1200,
        height: 630,
        alt: 'Portugal slow travel — Madère, Porto, Lisbonne',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('destinations-portugal', metadata);
}

export default async function PortugalPage() {
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

  const touristDestinationSchema = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: zones[`${PAGE}__hero_title`] ?? 'Portugal',
    description:
      zones[`${PAGE}__hero_description`] ??
      'Le Portugal en slow travel : de Madère aux rives du Douro, des abbayes cisterciennes du Centre aux plaines de liège de l’Alentejo.',
    url: 'https://www.heldonica.fr/destinations/portugal',
    address: { '@type': 'PostalAddress', addressCountry: 'PT' },
    geo: { '@type': 'GeoCoordinates', latitude: 39.3999, longitude: -8.2245 },
    touristType: ['Culture lover', 'Nature lover', 'Slow traveler'],
  };

  const faqJsonLdSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: zones[`${PAGE}__faq_1_q`] ?? 'Quand aller au Portugal ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            zones[`${PAGE}__faq_1_a`] ??
            "Mars à juin pour la douceur printanière et les foules maîtrisées. Septembre-octobre pour la mer encore douce et les vendanges dans le Douro et l'Alentejo. Madère se visite toute l'année entre 18 et 23 °C.",
        },
      },
      {
        '@type': 'Question',
        name: zones[`${PAGE}__faq_2_q`] ?? 'Comment aller au Portugal depuis Paris ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            zones[`${PAGE}__faq_2_a`] ??
            'Vols directs depuis Paris vers Lisbonne (2h30), Porto (2h15) ou Funchal/Madère (3h30). Sur le continent, les trains Comboios de Portugal (CP) relient facilement Lisbonne, Coimbra et Porto.',
        },
      },
      {
        '@type': 'Question',
        name: zones[`${PAGE}__faq_3_q`] ?? 'Quel est le budget pour un voyage au Portugal ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            zones[`${PAGE}__faq_3_a`] ??
            "Au Portugal continental : 80 à 120 € par jour et par personne en maison d'hôtes et tasca de quartier (bica à 0,80 €, pastel de nata à 1,30 €, plat du jour entre 12 et 16 €). À Madère : 70 à 100 € par jour hors vols.",
        },
      },
      {
        '@type': 'Question',
        name: zones[`${PAGE}__faq_4_q`] ?? 'Portugal continental ou Madère — lequel choisir en premier ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            zones[`${PAGE}__faq_4_a`] ??
            "Madère si tu cherches la forêt primaire de Laurisilva, les levadas et les reliefs volcaniques. Le Portugal continental (Lisbonne, Sintra, Coimbra, Porto, Alentejo) si tu préfères les villes d'histoire, l'artisanat et les vignobles. Combiner 3 jours à Lisbonne puis un vol vers Madère reste notre formule favorite.",
        },
      },
    ],
  };

  const subNavItems = [
    { href: '/destinations/madere', node: Z('subnav_1', 'text', 'Madère', undefined, 'span') },
    { href: '/destinations/portugal/porto', node: Z('subnav_2', 'text', 'Porto & Nord', undefined, 'span') },
    { href: '/destinations/portugal/lisbonne', node: Z('subnav_3', 'text', 'Lisbonne', undefined, 'span') },
    { href: '/destinations/portugal/sintra', node: Z('subnav_4', 'text', 'Sintra', undefined, 'span') },
    { href: '/destinations/portugal/obidos', node: Z('subnav_5', 'text', 'Óbidos', undefined, 'span') },
    { href: '/destinations/portugal/alcobaca', node: Z('subnav_6', 'text', 'Alcobaça', undefined, 'span') },
    { href: '/destinations/portugal/batalha-tomar', node: Z('subnav_7', 'text', 'Batalha & Tomar', undefined, 'span') },
    { href: '/destinations/portugal/coimbra', node: Z('subnav_8', 'text', 'Coimbra', undefined, 'span') },
    { href: '/destinations/alentejo', node: Z('subnav_9', 'text', 'Alentejo', undefined, 'span') },
  ];

  const territoryCards = [
    {
      href: '/destinations/madere',
      image: '/images/destinations/madere/fanal_foret.jpg',
      tag: Z('card_1_tag', 'text', 'Île Atlantique · Nature UNESCO', undefined, 'span'),
      title: Z('card_1_title', 'text', 'Madère (13 carnets de terrain)', undefined, 'span'),
      desc: Z(
        'card_1_desc',
        'textarea',
        "L'île de l'éternel printemps : lauriers centenaires de Fanal dans la brume, fajã d'Achadas da Cruz, piscines de lave de Porto Moniz, poncha au caralhinho et bolo do caco chaud.",
        undefined,
        'span'
      ),
    },
    {
      href: '/destinations/portugal/lisbonne',
      image: '/images/destinations/portugal/sintra/etape1_sintra_regaleira.jpg',
      tag: Z('card_2_tag', 'text', 'Capitale & Serra · Fado & Jardins', undefined, 'span'),
      title: Z('card_2_title', 'text', 'Lisbonne & la Serra de Sintra', undefined, 'span'),
      desc: Z(
        'card_2_desc',
        'textarea',
        "La bica matinale à 0,80 € dans les travessas d'Alfama, les escaliers de la Mouraria loin du tram 28 bondé, le ferry du Tage vers Cacilhas et les jardins moussus de la Quinta da Regaleira à Sintra.",
        undefined,
        'span'
      ),
    },
    {
      href: '/destinations/portugal/porto',
      image: '/images/destinations/portugal/porto/etape1_porto_virtudes.jpg',
      tag: Z('card_3_tag', 'text', 'Granit · Douro & Minho', undefined, 'span'),
      title: Z('card_3_title', 'text', 'Porto & Guimarães', undefined, 'span'),
      desc: Z(
        'card_3_desc',
        'textarea',
        "Les terrasses en escaliers du Passeio das Virtudes face au Douro, les 20 000 azulejos de la gare de São Bento à 7h30, la vraie francesinha de taverne et les places médiévales de Guimarães.",
        undefined,
        'span'
      ),
    },
    {
      href: '/destinations/alentejo',
      image: '/images/destinations/portugal/obidos/etape2_obidos_panorama.jpg',
      tag: Z('card_4_tag', 'text', 'Rural · Terroir & Rizières', undefined, 'span'),
      title: Z('card_4_title', 'text', 'Alentejo : Évora, Monsaraz & Comporta', undefined, 'span'),
      desc: Z(
        'card_4_desc',
        'textarea',
        "Les plaines de chênes-lièges, le village fortifié de Monsaraz, les vignerons de vin de Talha en jarres d'argile et les cabanes sur pilotis de Carrasqueira au bord des rizières de Comporta.",
        undefined,
        'span'
      ),
    },
    {
      href: '/destinations/portugal/alcobaca',
      image: '/images/destinations/portugal/alcobaca/etape1_alcobaca_facade.jpg',
      tag: Z('card_5_tag', 'text', 'Patrimoine UNESCO · Centre', undefined, 'span'),
      title: Z('card_5_title', 'text', 'Alcobaça, Batalha & Tomar', undefined, 'span'),
      desc: Z(
        'card_5_desc',
        'textarea',
        "Le triangle monastique du Centre du Portugal : la nef cistercienne dépouillée d'Alcobaça, la pierre ciselée du cloître royal de Batalha et la rotonde templière du Couvent du Christ à Tomar.",
        undefined,
        'span'
      ),
    },
    {
      href: '/destinations/portugal/coimbra',
      image: '/images/destinations/portugal/coimbra/etape1_coimbra_santacruz.jpg',
      tag: Z('card_6_tag', 'text', 'Université & Remparts · Beira & Estremadura', undefined, 'span'),
      title: Z('card_6_title', 'text', 'Coimbra & les remparts d’Óbidos', undefined, 'span'),
      desc: Z(
        'card_6_desc',
        'textarea',
        "Les ruelles escarpées du Quebra-Costas à Coimbra où résonne la guitarra à douze cordes, et le chemin de ronde crénelé d'Óbidos parcouru à 8h00 du matin avant les autocars.",
        undefined,
        'span'
      ),
    },
  ];

  return (
    <InlineEditProvider page={PAGE} initialZones={zones}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(touristDestinationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLdSchema) }}
      />
      <Header />
      <main className="min-h-screen bg-[#F7F3EC]">
        {/* Hero */}
        <section className="relative bg-stone-900 py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0 opacity-35">
            <Image
              src="/images/destinations/portugal/porto/etape1_porto_virtudes.jpg"
              alt=""
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          </div>
          <div className="relative max-w-4xl mx-auto px-4">
            <span className="inline-block text-teal text-sm font-medium mb-4 uppercase tracking-widest">
              {Z('hero_badge', 'text', 'Destinations Portugal', undefined, 'span')}
            </span>
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-6 leading-tight">
              {Z('hero_title', 'text', 'Portugal', undefined, 'span')}
              <span className="block text-[#E6DEC8] italic text-2xl md:text-3xl mt-2 font-normal">
                {Z(
                  'hero_subtitle',
                  'text',
                  "De l'archipel de Madère aux collines de granit et de chaux du continent",
                  undefined,
                  'span'
                )}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-stone-200 max-w-2xl leading-relaxed">
              {Z(
                'hero_description',
                'textarea',
                "Le pays qu'on arpente et revisite. Madère pour la forêt primaire et les levadas, Lisbonne et Coimbra pour la guitare à douze cordes, Porto pour le granit au-dessus du Douro, et l'Alentejo pour le silence des chênes-lièges.",
                undefined,
                'span'
              )}
            </p>
          </div>
        </section>

        {/* Sub navigation */}
        <nav
          className="bg-[#FAF7F2] border-b border-[#DED5C6] sticky top-16 z-40"
          aria-label="Sous-destinations"
        >
          <div className="max-w-4xl mx-auto px-4 py-3 flex gap-6 overflow-x-auto no-scrollbar">
            {subNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-stone-600 hover:text-eucalyptus whitespace-nowrap text-sm font-medium transition-colors"
              >
                {item.node}
              </Link>
            ))}
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Intro */}
          <section className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-eucalyptus mb-3">
              {Z('intro_kicker', 'text', 'Notre angle', undefined, 'span')}
            </p>
            <h2 className="text-2xl md:text-3xl font-serif text-stone-900 mb-5">
              {Z('intro_title', 'text', "Le Portugal qu'on connaît vraiment", undefined, 'span')}
            </h2>
            <p className="text-lg text-stone-700 leading-relaxed mb-4">
              {Z(
                'intro_1',
                'html',
                "On a une relation intime avec le Portugal. L'un de nous y a ses racines atlantiques — Madère, les lauriers de Fanal, les canaux d'irrigation taillés dans le basalte. L'autre l'a adopté séjour après séjour, des venelles d'Alfama aux abbayes cisterciennes du Centre et aux plaines de l'Alentejo.",
                undefined,
                'span'
              )}
            </p>
            <p className="text-lg text-stone-700 leading-relaxed mb-4">
              {Z(
                'intro_2',
                'html',
                "Ce qu'on documente ici, c'est le Portugal qui prend son temps : le café serré (bica à 0,80 €) bu au comptoir en inox dès 7h30, le bacalhau dessalé pendant 48 heures avant d'être rôti au four, le pudim de nata retourné sur une nappe en papier, et les belvédères où l'on s'arrête sans montre.",
                undefined,
                'span'
              )}
            </p>
          </section>

          {/* Cards grid */}
          <section className="mb-12">
            <h2 className="text-2xl font-serif text-stone-900 mb-6">
              {Z('cards_section_title', 'text', 'Où aller au Portugal', undefined, 'span')}
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {territoryCards.map((card) => (
                <Link
                  key={card.href}
                  href={card.href}
                  className="bg-[#FAF7F2] rounded-sm border border-[#DED5C6] hover:border-eucalyptus/40 transition-all group overflow-hidden flex flex-col"
                >
                  <div className="relative aspect-[16/10] bg-stone-200 overflow-hidden">
                    <Image
                      src={card.image}
                      alt=""
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-eucalyptus mb-2">
                      {card.tag}
                    </span>
                    <h3 className="font-serif text-lg text-stone-900 mb-2 group-hover:text-eucalyptus transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-stone-600 text-sm leading-relaxed">{card.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Infos pratiques */}
          <section className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-eucalyptus mb-3">
              {Z('info_kicker', 'text', 'Côté pratique', undefined, 'span')}
            </p>
            <h2 className="text-2xl font-serif text-stone-900 mb-6">
              {Z('info_title', 'text', "Ce qu'il faut savoir", undefined, 'span')}
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-[#FAF7F2] p-6 rounded-sm border border-[#DED5C6]">
                <h3 className="font-serif text-lg text-stone-900 mb-4">
                  {Z('info_1_title', 'text', 'Quand y aller', undefined, 'span')}
                </h3>
                <ul className="space-y-3 text-stone-600 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-eucalyptus font-bold mt-0.5">·</span>
                    <span>
                      {Z(
                        'info_1_item_1',
                        'html',
                        '<span><strong>Mars – Juin</strong> — idéal sur le continent : jardins en fleurs, douceur printanière et tarifs modérés.</span>',
                        undefined,
                        'span'
                      )}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-eucalyptus font-bold mt-0.5">·</span>
                    <span>
                      {Z(
                        'info_1_item_2',
                        'html',
                        '<span><strong>Septembre – Octobre</strong> — océan encore doux, lumière ambrée et vendanges en Alentejo comme dans le Douro.</span>',
                        undefined,
                        'span'
                      )}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-eucalyptus font-bold mt-0.5">·</span>
                    <span>
                      {Z(
                        'info_1_item_3',
                        'html',
                        "<span><strong>Madère toute l'année</strong> — entre 18 et 23 °C. D'octobre à mai pour le calme et les cascades vives, au printemps pour les fleurs.</span>",
                        undefined,
                        'span'
                      )}
                    </span>
                  </li>
                </ul>
              </div>
              <div className="bg-[#FAF7F2] p-6 rounded-sm border border-[#DED5C6]">
                <h3 className="font-serif text-lg text-stone-900 mb-4">
                  {Z('info_2_title', 'text', 'Budget & Logistique', undefined, 'span')}
                </h3>
                <ul className="space-y-3 text-stone-600 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-eucalyptus font-bold mt-0.5">·</span>
                    <span>
                      {Z(
                        'info_2_item_1',
                        'html',
                        '<span><strong>Vols & Trains</strong> — 80 à 200 € A/R depuis Paris selon la saison. Trains CP confortables entre Lisbonne, Coimbra et Porto.</span>',
                        undefined,
                        'span'
                      )}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-eucalyptus font-bold mt-0.5">·</span>
                    <span>
                      {Z(
                        'info_2_item_2',
                        'html',
                        "<span><strong>Hébergement</strong> — 60 à 150 €/nuit. Les quintas de l'Alentejo et de Santo da Serra à Madère offrent un calme remarquable.</span>",
                        undefined,
                        'span'
                      )}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-eucalyptus font-bold mt-0.5">·</span>
                    <span>
                      {Z(
                        'info_2_item_3',
                        'html',
                        '<span><strong>Tables locales</strong> — 15 à 30 €/personne dans une tasca de quartier. Le bacalhau à Gomes de Sá et le pudim de nata maison restent la norme.</span>',
                        undefined,
                        'span'
                      )}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-eucalyptus mb-3">
              {Z('faq_kicker', 'text', 'Questions fréquentes', undefined, 'span')}
            </p>
            <div className="space-y-4">
              <details className="group bg-[#FAF7F2] rounded-sm border border-[#DED5C6] p-5">
                <summary className="font-semibold text-stone-900 cursor-pointer list-none flex items-center justify-between">
                  {Z('faq_1_q', 'text', 'Quand aller au Portugal ?', undefined, 'span')}
                  <span className="text-eucalyptus group-open:rotate-180 transition-transform">↓</span>
                </summary>
                <p className="mt-3 text-stone-600 text-sm leading-relaxed">
                  {Z(
                    'faq_1_a',
                    'textarea',
                    "Mars à juin pour la douceur printanière et les foules maîtrisées. Septembre-octobre pour la mer encore douce et les vendanges dans le Douro et l'Alentejo. Madère se visite toute l'année entre 18 et 23 °C.",
                    undefined,
                    'span'
                  )}
                </p>
              </details>
              <details className="group bg-[#FAF7F2] rounded-sm border border-[#DED5C6] p-5">
                <summary className="font-semibold text-stone-900 cursor-pointer list-none flex items-center justify-between">
                  {Z('faq_2_q', 'text', 'Comment aller au Portugal depuis Paris ?', undefined, 'span')}
                  <span className="text-eucalyptus group-open:rotate-180 transition-transform">↓</span>
                </summary>
                <p className="mt-3 text-stone-600 text-sm leading-relaxed">
                  {Z(
                    'faq_2_a',
                    'textarea',
                    'Vols directs depuis Paris vers Lisbonne (2h30), Porto (2h15) ou Funchal/Madère (3h30). Sur le continent, les trains Comboios de Portugal (CP) relient facilement Lisbonne, Coimbra et Porto.',
                    undefined,
                    'span'
                  )}
                </p>
              </details>
              <details className="group bg-[#FAF7F2] rounded-sm border border-[#DED5C6] p-5">
                <summary className="font-semibold text-stone-900 cursor-pointer list-none flex items-center justify-between">
                  {Z('faq_3_q', 'text', 'Quel est le budget pour un voyage au Portugal ?', undefined, 'span')}
                  <span className="text-eucalyptus group-open:rotate-180 transition-transform">↓</span>
                </summary>
                <p className="mt-3 text-stone-600 text-sm leading-relaxed">
                  {Z(
                    'faq_3_a',
                    'textarea',
                    "Au Portugal continental : 80 à 120 € par jour et par personne en maison d'hôtes et tasca de quartier (bica à 0,80 €, pastel de nata à 1,30 €, plat du jour entre 12 et 16 €). À Madère : 70 à 100 € par jour hors vols.",
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
                    'Portugal continental ou Madère — lequel choisir en premier ?',
                    undefined,
                    'span'
                  )}
                  <span className="text-eucalyptus group-open:rotate-180 transition-transform">↓</span>
                </summary>
                <p className="mt-3 text-stone-600 text-sm leading-relaxed">
                  {Z(
                    'faq_4_a',
                    'textarea',
                    "Madère si tu cherches la forêt primaire de Laurisilva, les levadas et les reliefs volcaniques. Le Portugal continental (Lisbonne, Sintra, Coimbra, Porto, Alentejo) si tu préfères les villes d'histoire, l'artisanat et les vignobles. Combiner 3 jours à Lisbonne puis un vol vers Madère reste notre formule favorite.",
                    undefined,
                    'span'
                  )}
                </p>
              </details>
            </div>
          </section>

          <div className="bg-eucalyptus/5 border border-eucalyptus/20 rounded-sm p-8 text-center mb-8">
            <h3 className="font-serif text-xl text-stone-900 mb-3">
              {Z('cta_title', 'text', 'Un itinéraire Portugal conçu sur mesure', undefined, 'span')}
            </h3>
            <p className="text-stone-600 text-sm mb-5 max-w-md mx-auto">
              {Z(
                'cta_text',
                'textarea',
                'On conçoit des carnets de route Portugal adaptés à ton rythme : combiné Lisbonne + Madère, traversée de l’Alentejo ou vallée du Douro.',
                undefined,
                'span'
              )}
            </p>
            <Link
              href="/travel-planning"
              className="inline-flex items-center gap-2 px-6 py-3 bg-action text-white font-semibold rounded-sm hover:bg-action-fonce transition-colors text-sm"
            >
              {Z('cta_button', 'text', 'Préparer un voyage', undefined, 'span')}
            </Link>
          </div>
          <div className="pt-4 border-t border-[#DED5C6]">
            <Link href="/destinations" className="text-sm text-eucalyptus font-semibold hover:underline">
              {Z('back_link', 'text', '← Toutes les destinations', undefined, 'span')}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </InlineEditProvider>
  );
}

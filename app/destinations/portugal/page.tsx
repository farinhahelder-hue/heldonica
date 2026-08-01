import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getPageZones } from '@/lib/cms-zones';
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider';
import EditableZone from '@/components/inline-edit/EditableZone';
import { buildPageMetadata } from '@/lib/page-metadata'

const PAGE = "destinations-portugal";
const SUBNav = [
  { label: "Madère", href: "/destinations/madere" },
  { label: "Porto", href: "/destinations/portugal/porto" },
  { label: "Lisbonne", href: "/destinations/portugal/lisbonne" },
  { label: "Alentejo", href: "/destinations/alentejo" },
];
const FAQS: { q: string; a: string }[] = [
  { q: "Quand aller au Portugal ?", a: "Mars à juin pour la douceur printanière et les foules maîtrisées. Septembre-octobre pour la mer encore chaude et les prix raisonnables. Juillet-août possible mais touristique et chaud. Madère se visite toute l'année (l'île de l'éternel printemps — entre 18 et 23°C selon les saisons)." },
  { q: "Comment aller au Portugal depuis Paris ?", a: "Vols directs depuis Paris vers Lisbonne (2h30), Porto (2h15) ou Funchal/Madère (3h30). EasyJet, Ryanair et TAP proposent des liaisons régulières. En train via Madrid est possible mais long (environ 20h)." },
  { q: "Quel est le budget pour un voyage au Portugal ?", a: "En Portugal continental : 80–120€/jour/personne en hôtel confort et restaurant local. À Madère : légèrement plus (70–100€ hors vols). Lisbonne et Porto restent abordables comparé à l'Europe occidentale. L'Alentejo et les régions rurales sont les zones les plus économiques." },
  { q: "Portugal ou Madère — laquelle choisir en premier ?", a: "Madère si vous cherchez nature, randonnée et dépaysement absolu. Le Portugal continental (Lisbonne + Porto + Alentejo) si vous préférez les villes, la gastronomie et les paysages variés. Les deux en combinant : Lisbonne 3 jours + vol Madère pour une semaine complet est notre schéma favori." },
];
const HERO_SUBTITLE = "";

const metadata: Metadata = {
  title: "Portugal slow travel | Guide Heldonica — Madère, Porto, Lisbonne",
  description: "Guide Portugal slow travel : Madère, Lisbonne, Porto, Alentejo. Nos adresses testées, budgets réels et itinéraires pour un voyage authentique.",
  alternates: {
    canonical: "https://www.heldonica.fr/destinations/portugal",
  },
  openGraph: {
    title: "Portugal slow travel | Guide Heldonica — Madère, Porto, Lisbonne",
    description: "Guide Portugal slow travel : Madère, Lisbonne, Porto, Alentejo. Nos adresses testées, budgets réels et itinéraires pour un voyage authentique.",
    url: "https://www.heldonica.fr/destinations/portugal",
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: "Portugal slow travel — Madère, Porto, Lisbonne",
      },
    ],
    locale: 'fr_FR',
    type: "website",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('destinations-portugal', metadata)
}


export default async function PortugalPage() {
  const zones = await getPageZones(PAGE)

  const Z = (zone: string, type: 'text' | 'textarea' | 'html', fallback: string, className?: string, as?: any) => (
    <EditableZone page={PAGE} zone={zone} type={type} fallback={fallback} className={className} as={as} />
  )

  return (
    <InlineEditProvider page={PAGE} initialZones={zones}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: "{\"@context\":\"https://schema.org\",\"@type\":\"TouristDestination\",\"name\":\"Portugal\",\"description\":\"Le Portugal slow travel : de Madère aux rives du Douro. Destinations authentiques testées et documentées par Heldonica.\",\"url\":\"https://www.heldonica.fr/destinations/portugal\",\"address\":{\"@type\":\"PostalAddress\",\"addressCountry\":\"PT\"},\"geo\":{\"@type\":\"GeoCoordinates\",\"latitude\":39.3999,\"longitude\":-8.2245},\"touristType\":[\"Culture lover\",\"Nature lover\",\"Slow traveler\"]}" }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQS.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          }),
        }}
      />
      <Header />
      <main className="min-h-screen bg-stone-50">
        {/* Hero */}
        <section className="relative bg-stone-900 py-20 md:py-24 overflow-hidden">
          <div className="max-w-4xl mx-auto px-4">
            <span className="inline-block text-teal text-sm font-medium mb-4 uppercase tracking-widest">
              {Z('hero_badge', 'text', "Destinations Portugal", undefined, 'span')}
            </span>
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-6 leading-tight">
              {Z('hero_title', 'text', "Portugal", undefined, 'span')}
              {HERO_SUBTITLE ? (
                <span className="block text-teal italic text-3xl md:text-4xl mt-2">
                  {Z('hero_subtitle', 'text', HERO_SUBTITLE, undefined, 'span')}
                </span>
              ) : null}
            </h1>
            <p className="text-lg md:text-xl text-stone-300 max-w-2xl leading-relaxed">
              {Z('hero_description', 'textarea', "Le pays qu'on visite et revisite. Madère pour la nature, Lisbonne pour l'âme, Porto pour le vin. Le Portugal a fait le slow travel avant que le mot existe.", undefined, 'span')}
            </p>
          </div>
        </section>

        {/* Sub navigation */}
        <nav className="bg-white border-b border-stone-200 sticky top-16 z-40" aria-label="Sous-destinations">
          <div className="max-w-4xl mx-auto px-4 py-3 flex gap-6 overflow-x-auto no-scrollbar">
            {SUBNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-stone-600 hover:text-eucalyptus whitespace-nowrap text-sm font-medium transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Intro */}
          <section className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-eucalyptus mb-3">Notre angle</p>
            <h2 className="text-2xl md:text-3xl font-serif text-stone-900 mb-5">
              {Z('intro_title', 'text', "Le Portugal qu'on connaît vraiment", undefined, 'span')}
            </h2>
              <p className="text-lg text-stone-700 leading-relaxed">
                {Z('intro_1', 'html', "On a une relation particulière avec le Portugal. L'un de nous y a des racines atlantiques — Madère, forêts de lauriers, sentiers de levadas. L'autre l'a adopté séjour après séjour, de Lisbonne aux plaines de l'Alentejo.", undefined, 'span')}
              </p>
              <p className="text-lg text-stone-700 leading-relaxed mb-4">
                {Z('intro_2', 'html', "Ce qu'on documente, c'est le Portugal qui n'a pas changé : les marchés de village le samedi matin, les restaurants sans menus traduits, les routes de montagne à Madère où on s'arrête sans raison précise parce que la vue mérite la pause.", undefined, 'span')}
              </p>
          </section>

          {/* Cards grid */}
          <section className="mb-12">
            <h2 className="text-2xl font-serif text-stone-900 mb-6">
              Où aller au Portugal
            </h2>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="bg-white p-6 rounded-xl border border-stone-200 hover:border-eucalyptus/40 hover:shadow-md transition-all group">
                <span className="inline-block text-xs font-semibold uppercase tracking-widest text-teal mb-2">
                  {Z('card_1_tag', 'text', "Île · Nature", undefined, 'span')}
                </span>
                <h3 className="font-serif text-lg text-stone-900 mb-2 group-hover:text-eucalyptus transition-colors">
                  {Z('card_1_title', 'text', "Madère", undefined, 'span')}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {Z('card_1_desc', 'textarea', "L'île de l'éternel printemps. Forêt de Fanal dans la brume, levadas, bolo do caco. Notre destination portugaise favorite, de loin.", undefined, 'span')}
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-stone-200 hover:border-eucalyptus/40 hover:shadow-md transition-all group">
                <span className="inline-block text-xs font-semibold uppercase tracking-widest text-teal mb-2">
                  {Z('card_2_tag', 'text', "Capitale · Culture", undefined, 'span')}
                </span>
                <h3 className="font-serif text-lg text-stone-900 mb-2 group-hover:text-eucalyptus transition-colors">
                  {Z('card_2_title', 'text', "Lisbonne", undefined, 'span')}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {Z('card_2_desc', 'textarea', "Les collines, les azulejos, le Tram 28 bondé qu'on évite au profit des ruelles du Mouraria. La ville qui se vit lentement.", undefined, 'span')}
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-stone-200 hover:border-eucalyptus/40 hover:shadow-md transition-all group">
                <span className="inline-block text-xs font-semibold uppercase tracking-widest text-teal mb-2">
                  {Z('card_3_tag', 'text', "Vin · Histoire", undefined, 'span')}
                </span>
                <h3 className="font-serif text-lg text-stone-900 mb-2 group-hover:text-eucalyptus transition-colors">
                  {Z('card_3_title', 'text', "Porto", undefined, 'span')}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {Z('card_3_desc', 'textarea', "Le vin de Porto, les caves de Vila Nova de Gaia, les bords du Douro et les librairies du centre historique. Porto est dense et mémorable.", undefined, 'span')}
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-stone-200 hover:border-eucalyptus/40 hover:shadow-md transition-all group">
                <span className="inline-block text-xs font-semibold uppercase tracking-widest text-teal mb-2">
                  {Z('card_4_tag', 'text', "Rural · Terroir", undefined, 'span')}
                </span>
                <h3 className="font-serif text-lg text-stone-900 mb-2 group-hover:text-eucalyptus transition-colors">
                  {Z('card_4_title', 'text', "Alentejo", undefined, 'span')}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {Z('card_4_desc', 'textarea', "Les plaines de liège, les villages blancs perchés, les vignerons qui vous racontent leur terroir. L'Alentejo prend son temps — et c'est tant mieux.", undefined, 'span')}
                </p>
              </div>
            </div>
          </section>

          {/* Infos pratiques */}
          <section className="mb-12">
            
            <p className="text-xs font-semibold uppercase tracking-widest text-eucalyptus mb-3">Côté pratique</p>
            <h2 className="text-2xl font-serif text-stone-900 mb-6">
              {Z('info_title', 'text', "Ce qu'il faut savoir", undefined, 'span')}
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl border border-stone-200">
              <h3 className="font-serif text-lg text-stone-900 mb-4">
                {Z('info_1_title', 'text', "Quand y aller", undefined, 'span')}
              </h3>
              <ul className="space-y-3 text-stone-600 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-eucalyptus font-bold mt-0.5">✓</span>
                  <span>{Z('info_1_item_1', 'html', "<span><strong>Mars – Juin</strong> — idéal sur le continent. Fleurs, douceur, prix de saison.</span>", undefined, 'span')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-eucalyptus font-bold mt-0.5">✓</span>
                  <span>{Z('info_1_item_2', 'html', "<span><strong>Septembre – Octobre</strong> — mer chaude, foule en baisse, vendanges en Alentejo.</span>", undefined, 'span')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-eucalyptus font-bold mt-0.5">✓</span>
                  <span>{Z('info_1_item_3', 'html', "<span><strong>Madère toute l'année</strong> — entre 18 et 23°C. Novembre-mars pour les cascades, juillet pour les fleurs.</span>", undefined, 'span')}</span>
                </li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-xl border border-stone-200">
              <h3 className="font-serif text-lg text-stone-900 mb-4">
                {Z('info_2_title', 'text', "Budget & Logistique", undefined, 'span')}
              </h3>
              <ul className="space-y-3 text-stone-600 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-eucalyptus font-bold mt-0.5">✓</span>
                  <span>{Z('info_2_item_1', 'html', "<span><strong>Vols</strong> — 80–200€ A/R depuis Paris selon saison. Madère légèrement plus cher.</span>", undefined, 'span')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-eucalyptus font-bold mt-0.5">✓</span>
                  <span>{Z('info_2_item_2', 'html', "<span><strong>Hébergement</strong> — 60–150€/nuit. Les aldeias (villages) d'Alentejo sont souvent les meilleurs rapports qualité-prix.</span>", undefined, 'span')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-eucalyptus font-bold mt-0.5">✓</span>
                  <span>{Z('info_2_item_3', 'html', "<span><strong>Repas</strong> — 20–40€/personne dans un bon restaurant local. Le bacalhau à 12€ existe encore.</span>", undefined, 'span')}</span>
                </li>
              </ul>
            </div>
            </div>
          </section>

          <section className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-eucalyptus mb-3">Questions fréquentes</p>
            <div className="space-y-4">
              <details key={0} className="group bg-white rounded-xl border border-stone-200 p-5">
                <summary className="font-semibold text-stone-900 cursor-pointer list-none flex items-center justify-between">
                  {Z('faq_1_q', 'text', "Quand aller au Portugal ?", undefined, 'span')}
                  <span className="text-eucalyptus group-open:rotate-180 transition-transform">↓</span>
                </summary>
                <p className="mt-3 text-stone-600 text-sm leading-relaxed">
                  {Z('faq_1_a', 'textarea', "Mars à juin pour la douceur printanière et les foules maîtrisées. Septembre-octobre pour la mer encore chaude et les prix raisonnables. Juillet-août possible mais touristique et chaud. Madère se visite toute l'année (l'île de l'éternel printemps — entre 18 et 23°C selon les saisons).", undefined, 'span')}
                </p>
              </details>
              <details key={1} className="group bg-white rounded-xl border border-stone-200 p-5">
                <summary className="font-semibold text-stone-900 cursor-pointer list-none flex items-center justify-between">
                  {Z('faq_2_q', 'text', "Comment aller au Portugal depuis Paris ?", undefined, 'span')}
                  <span className="text-eucalyptus group-open:rotate-180 transition-transform">↓</span>
                </summary>
                <p className="mt-3 text-stone-600 text-sm leading-relaxed">
                  {Z('faq_2_a', 'textarea', "Vols directs depuis Paris vers Lisbonne (2h30), Porto (2h15) ou Funchal/Madère (3h30). EasyJet, Ryanair et TAP proposent des liaisons régulières. En train via Madrid est possible mais long (environ 20h).", undefined, 'span')}
                </p>
              </details>
              <details key={2} className="group bg-white rounded-xl border border-stone-200 p-5">
                <summary className="font-semibold text-stone-900 cursor-pointer list-none flex items-center justify-between">
                  {Z('faq_3_q', 'text', "Quel est le budget pour un voyage au Portugal ?", undefined, 'span')}
                  <span className="text-eucalyptus group-open:rotate-180 transition-transform">↓</span>
                </summary>
                <p className="mt-3 text-stone-600 text-sm leading-relaxed">
                  {Z('faq_3_a', 'textarea', "En Portugal continental : 80–120€/jour/personne en hôtel confort et restaurant local. À Madère : légèrement plus (70–100€ hors vols). Lisbonne et Porto restent abordables comparé à l'Europe occidentale. L'Alentejo et les régions rurales sont les zones les plus économiques.", undefined, 'span')}
                </p>
              </details>
              <details key={3} className="group bg-white rounded-xl border border-stone-200 p-5">
                <summary className="font-semibold text-stone-900 cursor-pointer list-none flex items-center justify-between">
                  {Z('faq_4_q', 'text', "Portugal ou Madère — laquelle choisir en premier ?", undefined, 'span')}
                  <span className="text-eucalyptus group-open:rotate-180 transition-transform">↓</span>
                </summary>
                <p className="mt-3 text-stone-600 text-sm leading-relaxed">
                  {Z('faq_4_a', 'textarea', "Madère si vous cherchez nature, randonnée et dépaysement absolu. Le Portugal continental (Lisbonne + Porto + Alentejo) si vous préférez les villes, la gastronomie et les paysages variés. Les deux en combinant : Lisbonne 3 jours + vol Madère pour une semaine complet est notre schéma favori.", undefined, 'span')}
                </p>
              </details>
            </div>
          </section>
          <div className="bg-eucalyptus/5 border border-eucalyptus/20 rounded-2xl p-8 text-center mb-8">
            <h3 className="font-serif text-xl text-stone-900 mb-3">
              {Z('cta_title', 'text', "Un itinéraire Portugal sur mesure", undefined, 'span')}
            </h3>
            <p className="text-stone-600 text-sm mb-5 max-w-md mx-auto">
              {Z('cta_text', 'textarea', "On conçoit des carnets de route Portugal complets : Madère + continent, circuits Alentejo, combinés familles.", undefined, 'span')}
            </p>
            <Link
              href="/travel-planning"
              className="inline-flex items-center gap-2 px-6 py-3 bg-eucalyptus text-white font-semibold rounded-xl hover:bg-eucalyptus/90 transition-colors text-sm"
            >
              Planifier mon voyage Portugal →
            </Link>
          </div>          <div className="pt-4 border-t border-stone-200">
            <Link href="/destinations" className="text-sm text-eucalyptus font-semibold hover:underline">
              ← Toutes les destinations
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </InlineEditProvider>
  );
}

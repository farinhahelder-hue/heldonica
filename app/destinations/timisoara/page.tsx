import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getPageZones } from '@/lib/cms-zones'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import EditableZone from '@/components/inline-edit/EditableZone'
import { buildPageMetadata } from '@/lib/page-metadata'

const SITE_URL = 'https://www.heldonica.fr'
const PAGE = 'destinations-timisoara'

const metadata: Metadata = {
  title: 'Timișoara slow travel | Guide Heldonica',
  description:
    'Timișoara, capitale européenne de la culture 2023 : architecture baroque, scène culturelle vivante et cafés de quartier. Notre guide slow travel.',
  alternates: {
    canonical: `${SITE_URL}/destinations/timisoara`,
  },
  openGraph: {
    title: 'Timișoara slow travel | Guide Heldonica',
    description: 'Première ville d\'Europe à avoir l\'éclairage électrique, première ville de la révolution roumaine. Timișoara se découvre lentement.',
    url: `${SITE_URL}/destinations/timisoara`,
    images: [{ url: `${SITE_URL}/og-default.jpg`, width: 1024, height: 683, alt: 'Timișoara — Heldonica' }],
    locale: 'fr_FR',
    type: 'website',
    siteName: 'Heldonica',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Timișoara slow travel | Guide Heldonica',
    description: 'Capitale européenne de la culture 2023. Bars, cours cachées, architecture baroque — notre guide.',
    images: [`${SITE_URL}/og-default.jpg`],
    creator: '@heldonica',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('destinations-timisoara', metadata)
}


// Valeurs de référence (source de vérité = cms_editable_zones ; ces valeurs
// servent de fallback technique tant que le CMS n'a pas été appliqué/seeded).
const FAQS: { q: { zone: string; fb: string }; a: { zone: string; fb: string } }[] = [
  { q: { zone: "faq_1_q", fb: "Quand aller à Timișoara ?" }, a: { zone: "faq_1_a", fb: "Mai-juin pour les parcs en fleurs et les températures douces. Septembre-octobre pour les festivals de rue. Éviter juillet-août (chaleur intense, +35°C). Décembre pour le marché de Noël place Unirii." } },
  { q: { zone: "faq_2_q", fb: "Comment aller à Timișoara depuis Paris ?" }, a: { zone: "faq_2_a", fb: "Vol direct Paris-Timișoara avec Tarom (3h). Alternativement Paris-Bucarest puis train de nuit (6h) ou Budapest puis train (3h). Le trajet Budapest-Timișoara en train longe la frontière hongroise et est magnifique." } },
  { q: { zone: "faq_3_q", fb: "Quel budget pour Timișoara ?" }, a: { zone: "faq_3_a", fb: "La ville est très abordable : dîner dans un bon restaurant local entre 15-25€/pers, café 1,5-2€, hébergement 40-80€/nuit en hôtel centre-ville. Budget total : 70-100€/pers/jour confort inclus." } }
]

export default async function TimisoaraPage() {
  const zones = await getPageZones(PAGE)

  const Z = (zone: string, type: 'text' | 'textarea' | 'html' | 'image', fallback: string, className?: string, as?: any) => (
    <EditableZone page={PAGE} zone={zone} type={type} fallback={fallback} className={className} as={as} />
  )

  return (
    <InlineEditProvider page={PAGE} initialZones={zones}>
      <Header />
      <main className="min-h-screen bg-stone-50">

        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-stone-900 via-stone-800 to-stone-700 py-24 md:py-32">
          <div className="absolute inset-0 opacity-30">
            {Z('hero_image', 'image', '/og-default.jpg', 'w-full h-full object-cover')}
          </div>
          <div className="relative max-w-4xl mx-auto px-4">
            <span className="inline-block text-teal text-xs font-semibold uppercase tracking-widest mb-4">{Z('hero_badge', 'text', "Roumanie · Banat", undefined, 'span')}</span>
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-4 leading-tight">
              {Z('hero_title', 'text', "Timișoara", undefined, 'span')}
            </h1>
            <p className="text-lg md:text-xl text-stone-200 max-w-2xl leading-relaxed">
              {Z('hero_description', 'textarea', "Première ville d'Europe à avoir eu l'éclairage électrique. Première ville de la révolution roumaine. Capitale européenne de la culture 2023. Et pourtant, presque personne ne s'y arrête.", undefined, 'span')}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/destinations/roumanie"
                className="inline-flex items-center gap-2 px-6 py-3 bg-eucalyptus text-white font-semibold rounded-xl hover:bg-eucalyptus/90 transition-colors text-sm"
              >
                Guide Roumanie →
              </Link>
              <Link
                href="/travel-planning"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors text-sm border border-white/20"
              >
                Planifier mon séjour
              </Link>
            </div>
          </div>
        </section>

        {/* Breadcrumb nav */}
        <nav className="bg-white border-b border-stone-200 sticky top-16 z-40">
          <div className="max-w-4xl mx-auto px-4 py-3 flex gap-2 text-sm text-stone-500 overflow-x-auto no-scrollbar">
            <Link href="/destinations" className="hover:text-eucalyptus transition-colors whitespace-nowrap">Destinations</Link>
            <span>›</span>
            <Link href="/destinations/roumanie" className="hover:text-eucalyptus transition-colors whitespace-nowrap">Roumanie</Link>
            <span>›</span>
            <span className="text-stone-900 whitespace-nowrap">{Z('hero_title', 'text', "Timișoara", undefined, 'span')}</span>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-12">

          {/* Intro */}
          <section className="mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-eucalyptus mb-3">Notre angle</p>
            <h2 className="text-2xl md:text-3xl font-serif text-stone-900 mb-5">
              {Z('intro_title', 'text', "La ville qu'on n'avait pas prévu d'aimer", undefined, 'span')}
            </h2>
            <div className="space-y-4 text-stone-700 leading-relaxed">
              <p>
                {Z('intro_1', 'textarea', "On est arrivés à Timișoara par hasard, en route vers Bucarest. On est restés quatre jours. La ville a cette qualité rare : elle ne se donne pas d'emblée. Il faut traîner dans le Fabric le soir, s'asseoir sur la place Unirii avec un café, tourner dans les ruelles du vieux centre.", undefined, 'span')}
              </p>
              <p>
                {Z('intro_2', 'textarea', "Timișoara est roumaine, mais elle parle hongrois, serbe et allemand dans la même phrase. C'est une ville de carrefour, d'influences mêlées, d'histoire dense. Et depuis 2023, capitale européenne de la culture qui a investi dans ses scènes alternatives sans perdre son âme de quartier.", undefined, 'span')}
              </p>
            </div>
          </section>

          {/* Pépites grid */}
          <section className="mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-eucalyptus mb-3">Ce qu'on a déniché</p>
            <h2 className="text-2xl font-serif text-stone-900 mb-6">Les spots qu'on revisite</h2>
            <div className="grid gap-5 sm:grid-cols-2">
                <div className="bg-white rounded-2xl border border-stone-200 p-6 hover:border-eucalyptus/30 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">{Z('pepite_1_icon', 'text', "🏛️", undefined, 'span')}</span>
                    <span className="text-xs font-semibold uppercase tracking-widest text-teal">{Z('pepite_1_tag', 'text', "Incontournable", undefined, 'span')}</span>
                  </div>
                  <h3 className="font-serif text-lg text-stone-900 mb-2">{Z('pepite_1_title', 'text', "Piața Unirii", undefined, 'span')}</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">{Z('pepite_1_desc', 'textarea', "La plus belle place baroque de Roumanie. Cathédrale catholique, fontaine, terrasses qui invitent à rester. Le matin, avant les touristes.", undefined, 'span')}</p>
                </div>
                <div className="bg-white rounded-2xl border border-stone-200 p-6 hover:border-eucalyptus/30 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">{Z('pepite_2_icon', 'text', "🎨", undefined, 'span')}</span>
                    <span className="text-xs font-semibold uppercase tracking-widest text-teal">{Z('pepite_2_tag', 'text', "Pépite cachée", undefined, 'span')}</span>
                  </div>
                  <h3 className="font-serif text-lg text-stone-900 mb-2">{Z('pepite_2_title', 'text', "Cuib d'Arte", undefined, 'span')}</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">{Z('pepite_2_desc', 'textarea', "Cour intérieure cachée dans le quartier Fabric. Galeries d'art, installations éphémères, café avec jardin. L'âme créative de la ville.", undefined, 'span')}</p>
                </div>
                <div className="bg-white rounded-2xl border border-stone-200 p-6 hover:border-eucalyptus/30 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">{Z('pepite_3_icon', 'text', "🏚️", undefined, 'span')}</span>
                    <span className="text-xs font-semibold uppercase tracking-widest text-teal">{Z('pepite_3_tag', 'text', "Quartier", undefined, 'span')}</span>
                  </div>
                  <h3 className="font-serif text-lg text-stone-900 mb-2">{Z('pepite_3_title', 'text', "Quartier Fabric", undefined, 'span')}</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">{Z('pepite_3_desc', 'textarea', "L'ancien quartier ouvrier en pleine renaissance. Street art, petits bars indépendants, ateliers d'artisans. L'endroit où la ville se réinvente.", undefined, 'span')}</p>
                </div>
                <div className="bg-white rounded-2xl border border-stone-200 p-6 hover:border-eucalyptus/30 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">{Z('pepite_4_icon', 'text', "🇷🇴", undefined, 'span')}</span>
                    <span className="text-xs font-semibold uppercase tracking-widest text-teal">{Z('pepite_4_tag', 'text', "Histoire", undefined, 'span')}</span>
                  </div>
                  <h3 className="font-serif text-lg text-stone-900 mb-2">{Z('pepite_4_title', 'text', "Piața Victoriei", undefined, 'span')}</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">{Z('pepite_4_desc', 'textarea', "Point de départ de la révolution roumaine de 1989. Opéra, cathédrale orthodoxe et cette longue avenue qui invite à la promenade du soir.", undefined, 'span')}</p>
                </div>
                <div className="bg-white rounded-2xl border border-stone-200 p-6 hover:border-eucalyptus/30 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">{Z('pepite_5_icon', 'text', "🌳", undefined, 'span')}</span>
                    <span className="text-xs font-semibold uppercase tracking-widest text-teal">{Z('pepite_5_tag', 'text', "Nature urbaine", undefined, 'span')}</span>
                  </div>
                  <h3 className="font-serif text-lg text-stone-900 mb-2">{Z('pepite_5_title', 'text', "Parcul Civic", undefined, 'span')}</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">{Z('pepite_5_desc', 'textarea', "Le poumon vert de la ville. Lac, barques, familles le dimanche. Les Timișoreni viennent ici pour ne rien faire — et ça se voit.", undefined, 'span')}</p>
                </div>
                <div className="bg-white rounded-2xl border border-stone-200 p-6 hover:border-eucalyptus/30 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">{Z('pepite_6_icon', 'text', "🍸", undefined, 'span')}</span>
                    <span className="text-xs font-semibold uppercase tracking-widest text-teal">{Z('pepite_6_tag', 'text', "Vie locale", undefined, 'span')}</span>
                  </div>
                  <h3 className="font-serif text-lg text-stone-900 mb-2">{Z('pepite_6_title', 'text', "Strada Mercy & Piața Traian", undefined, 'span')}</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">{Z('pepite_6_desc', 'textarea', "Artère Art Nouveau du vieux Fabric. Façades colorées en cours de restauration, cafés de spécialité, bars à cocktails abordables.", undefined, 'span')}</p>
                </div>
            </div>
          </section>

          {/* Infos pratiques */}
          <section className="mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-eucalyptus mb-3">Côté pratique</p>
            <h2 className="text-2xl font-serif text-stone-900 mb-6">Ce qu'il faut savoir</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-stone-200">
                <h3 className="font-serif text-lg text-stone-900 mb-4">Où dormir</h3>
                <ul className="space-y-3 text-stone-600 text-sm">
                  <li>{Z('sleep_1', 'html', "<strong>Hôtel Timișoara</strong> — Centre historique, vue Piața Victoriei. 70–100€/nuit.", undefined, 'span')}</li>
                  <li>{Z('sleep_2', 'html', "<strong>Casa del Arte</strong> — Boutique hôtel dans une villa Art Nouveau restaurée. 60–90€.", undefined, 'span')}</li>
                  <li>{Z('sleep_3', 'html', "<strong>Appartements Fabric</strong> — Location courte durée dans le quartier créatif. 40–60€.", undefined, 'span')}</li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-xl border border-stone-200">
                <h3 className="font-serif text-lg text-stone-900 mb-4">Où manger</h3>
                <ul className="space-y-3 text-stone-600 text-sm">
                  <li>{Z('eat_1', 'html', "<strong>Conviva</strong> — Gastro-pub, cuisine locale revisitée. Réservation conseillée.", undefined, 'span')}</li>
                  <li>{Z('eat_2', 'html', "<strong>Barista Fabric</strong> — Café de spécialité, viennoiseries. Le matin incontournable.", undefined, 'span')}</li>
                  <li>{Z('eat_3', 'html', "<strong>Marchés du samedi</strong> — Piața Badea Cârțan. Fromages, charcuteries locales, légumes.", undefined, 'span')}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-eucalyptus mb-3">Questions fréquentes</p>
            <div className="space-y-4">
              {FAQS.map((f, i) => (
                <details key={i} className="group bg-white rounded-xl border border-stone-200 p-5">
                  <summary className="font-semibold text-stone-900 cursor-pointer list-none flex items-center justify-between">
                    {zones[`${PAGE}__${f.q.zone}`] ?? f.q.fb}
                    <span className="text-eucalyptus group-open:rotate-180 transition-transform">↓</span>
                  </summary>
                  <p className="mt-3 text-stone-600 text-sm leading-relaxed">{zones[`${PAGE}__${f.a.zone}`] ?? f.a.fb}</p>
                </details>
              ))}
            </div>
          </section>

          {/* À proximité */}
          <section className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-eucalyptus mb-3">À proximité</p>
            <div className="grid gap-4 md:grid-cols-3">
              <Link href="/destinations/roumanie" className="p-4 bg-white rounded-xl border border-stone-200 text-center hover:border-eucalyptus/40 transition-colors">
                <span className="text-stone-700 font-medium">Roumanie</span>
                <span className="block text-xs text-stone-500 mt-1">Guide complet</span>
              </Link>
              <div className="p-4 bg-stone-100 rounded-xl text-center">
                <span className="text-stone-700 font-medium">Budapest</span>
                <span className="block text-xs text-stone-500 mt-1">~3h en train</span>
              </div>
              <div className="p-4 bg-stone-100 rounded-xl text-center">
                <span className="text-stone-700 font-medium">Belgrade</span>
                <span className="block text-xs text-stone-500 mt-1">~4h en bus</span>
              </div>
            </div>
          </section>

          {/* CTA */}
          <div className="bg-eucalyptus/5 border border-eucalyptus/20 rounded-2xl p-8 text-center mb-8">
            <h3 className="font-serif text-xl text-stone-900 mb-3">Un itinéraire Roumanie sur mesure</h3>
            <p className="text-stone-600 text-sm mb-5 max-w-md mx-auto">
              Timișoara + Transylvanie + Bucarest : on conçoit le circuit qui correspond à ton rythme.
            </p>
            <Link
              href="/travel-planning"
              className="inline-flex items-center gap-2 px-6 py-3 bg-eucalyptus text-white font-semibold rounded-xl hover:bg-eucalyptus/90 transition-colors text-sm"
            >
              Concevoir mon voyage →
            </Link>
          </div>

          <Link href="/destinations/roumanie" className="text-eucalyptus hover:text-eucalyptus/80 text-sm font-medium transition-colors">
            ← Guide Roumanie
          </Link>
        </div>
      </main>
      <Footer />
    </InlineEditProvider>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getPageZones } from '@/lib/cms-zones'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import EditableZone from '@/components/inline-edit/EditableZone'
import { buildPageMetadata } from '@/lib/page-metadata'
import ComingSoonDestination from '@/components/ComingSoonDestination'
import { isUnpublishedCmsPage } from '@/lib/unpublished-pages'

const SITE_URL = 'https://www.heldonica.fr'
const PAGE = 'destinations-roumanie-timisoara'

const metadata: Metadata = {
  title: 'Timișoara slow travel | Guide Heldonica',
  description:
    'Timișoara, capitale européenne de la culture : architecture baroque, scène culturelle vivante et cafés de quartier. Notre guide slow travel.',
  alternates: {
    canonical: `${SITE_URL}/destinations/roumanie/timisoara`,
  },
  openGraph: {
    title: 'Timișoara slow travel | Guide Heldonica',
    description: 'Première ville d\'Europe à avoir l\'éclairage électrique, première ville de la révolution roumaine. Timișoara se découvre lentement.',
    url: `${SITE_URL}/destinations/roumanie/timisoara`,
    images: [{ url: `${SITE_URL}/og-default.jpg`, width: 1024, height: 683, alt: 'Timișoara — Heldonica' }],
    locale: 'fr_FR',
    type: 'website',
    siteName: 'Heldonica',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Timișoara slow travel | Guide Heldonica',
    description: 'capitale européenne de la culture. Bars, cours cachées, architecture baroque — notre guide.',
    images: [`${SITE_URL}/og-default.jpg`],
    creator: '@heldonica',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata(PAGE, metadata)
}


// Valeurs de référence (source de vérité = cms_editable_zones ; ces valeurs
// servent de fallback technique tant que le CMS n'a pas été appliqué/seeded).
const FAQS: { q: { zone: string; fb: string }; a: { zone: string; fb: string } }[] = [
  { q: { zone: "faq_1_q", fb: "Quand aller à Timișoara ?" }, a: { zone: "faq_1_a", fb: "Mai-juin pour les parcs en fleurs et les températures douces. Septembre-octobre pour les festivals de rue. Éviter juillet-août (chaleur intense, +35°C). Décembre pour le marché de Noël place Unirii." } },
  { q: { zone: "faq_2_q", fb: "Comment aller à Timișoara depuis Paris ?" }, a: { zone: "faq_2_a", fb: "Vol direct Paris-Timișoara avec Tarom (3h). Alternativement Paris-Bucarest puis train de nuit (6h) ou Budapest puis train (3h). Le trajet Budapest-Timișoara en train longe la frontière hongroise, la plaine défile sur 3h." } },
  { q: { zone: "faq_3_q", fb: "Quel budget pour Timișoara ?" }, a: { zone: "faq_3_a", fb: "La ville est très abordable : dîner dans un bon restaurant local entre 15-25€/pers, café 1,5-2€, hébergement 40-80€/nuit en hôtel centre-ville. Budget total : 70-100€/pers/jour confort inclus." } }
]

export default async function TimisoaraPage() {
  // MVP : page sans photo vérifiée, « Bientôt » tant qu'elle figure dans lib/unpublished-pages.ts.
  if (isUnpublishedCmsPage('destinations-roumanie-timisoara')) {
    return (
      <ComingSoonDestination
        slug="roumanie-timisoara"
        title="Timișoara"
        country="Roumanie"
        hero_unsplash_url="/og-default.jpg"
        zones={await getPageZones('destinations-roumanie-timisoara')}
      />
    )
  }
  const zones = await getPageZones(PAGE)

  const Z = (zone: string, type: 'text' | 'textarea' | 'html' | 'image', fallback: string, className?: string, as?: any) => (
    <EditableZone page={PAGE} zone={zone} type={type} fallback={fallback} className={className} as={as} />
  )

  return (
    <InlineEditProvider page={PAGE} initialZones={zones}>
      <Header />
      <main className="min-h-screen bg-[#F7F3EC] text-[#241D1A]">

        {/* Hero */}
        <section className="relative overflow-hidden bg-[#1E1916] py-24 md:py-32 border-b border-[#DED5C6]">
          <div className="absolute inset-0 opacity-35">
            {Z('hero_image', 'image', '/og-default.jpg', 'w-full h-full object-cover')}
          </div>
          <div className="relative max-w-4xl mx-auto px-4">
            <span className="inline-block text-[#D8CFC0] text-[11px] uppercase tracking-[0.22em] mb-4">{Z('hero_badge', 'text', "Roumanie · Banat", undefined, 'span')}</span>
            <h1 className="text-4xl md:text-5xl font-serif font-normal text-[#F7F3EC] mb-4 leading-tight">
              {Z('hero_title', 'text', "Timișoara", undefined, 'span')}
            </h1>
            <p className="text-lg md:text-xl text-[#E2D9C8] max-w-2xl leading-relaxed">
              {Z('hero_description', 'textarea', "Première ville d'Europe à avoir eu l'éclairage électrique. Première ville de la révolution roumaine. capitale européenne de la culture. Et pourtant, presque personne ne s'y arrête.", undefined, 'span')}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/destinations/roumanie"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#4A3B32] text-[#F7F3EC] rounded-sm hover:bg-[#3A2D26] transition-colors text-xs uppercase tracking-[0.16em]"
              >
                Guide Roumanie
              </Link>
              <Link
                href="/travel-planning"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#F7F3EC]/10 text-[#F7F3EC] rounded-sm hover:bg-[#F7F3EC]/20 transition-colors text-xs uppercase tracking-[0.16em] border border-[#F7F3EC]/30"
              >
                Planifier mon séjour
              </Link>
            </div>
          </div>
        </section>

        {/* Breadcrumb nav */}
        <nav className="bg-[#EFE9DF] border-b border-[#DED5C6] sticky top-16 z-40">
          <div className="max-w-4xl mx-auto px-4 py-3 flex gap-2 text-xs uppercase tracking-[0.14em] text-[#6E655C] overflow-x-auto no-scrollbar">
            <Link href="/destinations" className="hover:text-[#241D1A] transition-colors whitespace-nowrap">Destinations</Link>
            <span>›</span>
            <Link href="/destinations/roumanie" className="hover:text-[#241D1A] transition-colors whitespace-nowrap">Roumanie</Link>
            <span>›</span>
            <span className="text-[#241D1A] whitespace-nowrap">{Z('hero_title', 'text', "Timișoara", undefined, 'span')}</span>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-12">

          {/* Intro */}
          <section className="mb-16">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#3D5A47] mb-3">Notre angle</p>
            <h2 className="text-2xl md:text-3xl font-serif font-normal text-[#241D1A] mb-5">
              {Z('intro_title', 'text', "La ville qu'on n'avait pas prévu d'aimer", undefined, 'span')}
            </h2>
            <div className="space-y-4 text-[#4A413A] leading-relaxed">
              <p>
                {Z('intro_1', 'textarea', "On est arrivés à Timișoara par hasard, en route vers Bucarest. On est restés quatre jours. La ville a cette qualité rare : elle ne se donne pas d'emblée. Il faut traîner dans le Fabric le soir, s'asseoir sur la place Unirii avec un café, tourner dans les ruelles du vieux centre.", undefined, 'span')}
              </p>
              <p>
                {Z('intro_2', 'textarea', "Timișoara est roumaine, mais elle parle hongrois, serbe et allemand dans la même phrase. C'est une ville de carrefour, d'influences mêlées, d'histoire dense. Désignée capitale européenne de la culture, elle a investi dans ses scènes alternatives sans perdre son âme de quartier.", undefined, 'span')}
              </p>
            </div>
          </section>

          {/* Pépites grid */}
          <section className="mb-16">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#3D5A47] mb-3">Ce qu'on a déniché</p>
            <h2 className="text-2xl font-serif font-normal text-[#241D1A] mb-6">Les lieux qu'on revisite</h2>
            <div className="grid gap-5 sm:grid-cols-2">
                <div className="bg-[#FAF7F2] rounded-sm border border-[#DED5C6] p-6 hover:border-[#8C7A6B] transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-[#3D5A47]">{Z('pepite_1_icon', 'text', "Landmark", undefined, 'span')}</span>
                    <span className="text-[10px] uppercase tracking-[0.18em] text-[#6E655C]">{Z('pepite_1_tag', 'text', "Le classique", undefined, 'span')}</span>
                  </div>
                  <h3 className="font-serif font-normal text-lg text-[#241D1A] mb-2">{Z('pepite_1_title', 'text', "Piața Unirii", undefined, 'span')}</h3>
                  <p className="text-[#5C5349] text-sm leading-relaxed">{Z('pepite_1_desc', 'textarea', "La plus belle place baroque de Roumanie. Cathédrale catholique, fontaine, terrasses qui invitent à rester. Le matin, avant que la foule arrive.", undefined, 'span')}</p>
                </div>
                <div className="bg-[#FAF7F2] rounded-sm border border-[#DED5C6] p-6 hover:border-[#8C7A6B] transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-[#3D5A47]">{Z('pepite_2_icon', 'text', "Palette", undefined, 'span')}</span>
                    <span className="text-[10px] uppercase tracking-[0.18em] text-[#6E655C]">{Z('pepite_2_tag', 'text', "Pépite cachée", undefined, 'span')}</span>
                  </div>
                  <h3 className="font-serif font-normal text-lg text-[#241D1A] mb-2">{Z('pepite_2_title', 'text', "Cuib d'Arte", undefined, 'span')}</h3>
                  <p className="text-[#5C5349] text-sm leading-relaxed">{Z('pepite_2_desc', 'textarea', "Cour intérieure cachée dans le quartier Fabric. Galeries d'art, installations éphémères, café avec jardin. L'âme créative de la ville.", undefined, 'span')}</p>
                </div>
                <div className="bg-[#FAF7F2] rounded-sm border border-[#DED5C6] p-6 hover:border-[#8C7A6B] transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-[#3D5A47]">{Z('pepite_3_icon', 'text', "Building2", undefined, 'span')}</span>
                    <span className="text-[10px] uppercase tracking-[0.18em] text-[#6E655C]">{Z('pepite_3_tag', 'text', "Quartier", undefined, 'span')}</span>
                  </div>
                  <h3 className="font-serif font-normal text-lg text-[#241D1A] mb-2">{Z('pepite_3_title', 'text', "Quartier Fabric", undefined, 'span')}</h3>
                  <p className="text-[#5C5349] text-sm leading-relaxed">{Z('pepite_3_desc', 'textarea', "L'ancien quartier ouvrier en pleine renaissance. Fresques murales, petits bars indépendants, ateliers d'artisans. L'endroit où la ville se réinvente.", undefined, 'span')}</p>
                </div>
                <div className="bg-[#FAF7F2] rounded-sm border border-[#DED5C6] p-6 hover:border-[#8C7A6B] transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-[#3D5A47]">{Z('pepite_4_icon', 'text', "Landmark", undefined, 'span')}</span>
                    <span className="text-[10px] uppercase tracking-[0.18em] text-[#6E655C]">{Z('pepite_4_tag', 'text', "Histoire", undefined, 'span')}</span>
                  </div>
                  <h3 className="font-serif font-normal text-lg text-[#241D1A] mb-2">{Z('pepite_4_title', 'text', "Piața Victoriei", undefined, 'span')}</h3>
                  <p className="text-[#5C5349] text-sm leading-relaxed">{Z('pepite_4_desc', 'textarea', "Point de départ de la révolution roumaine de 1989. Opéra, cathédrale orthodoxe et cette longue avenue qui invite à la promenade du soir.", undefined, 'span')}</p>
                </div>
                <div className="bg-[#FAF7F2] rounded-sm border border-[#DED5C6] p-6 hover:border-[#8C7A6B] transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-[#3D5A47]">{Z('pepite_5_icon', 'text', "Trees", undefined, 'span')}</span>
                    <span className="text-[10px] uppercase tracking-[0.18em] text-[#6E655C]">{Z('pepite_5_tag', 'text', "Nature urbaine", undefined, 'span')}</span>
                  </div>
                  <h3 className="font-serif font-normal text-lg text-[#241D1A] mb-2">{Z('pepite_5_title', 'text', "Parcul Civic", undefined, 'span')}</h3>
                  <p className="text-[#5C5349] text-sm leading-relaxed">{Z('pepite_5_desc', 'textarea', "Le poumon vert de la ville. Lac, barques, familles le dimanche. Les Timișoreni viennent ici pour ne rien faire — et ça se voit.", undefined, 'span')}</p>
                </div>
                <div className="bg-[#FAF7F2] rounded-sm border border-[#DED5C6] p-6 hover:border-[#8C7A6B] transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-[#3D5A47]">{Z('pepite_6_icon', 'text', "Martini", undefined, 'span')}</span>
                    <span className="text-[10px] uppercase tracking-[0.18em] text-[#6E655C]">{Z('pepite_6_tag', 'text', "Vie locale", undefined, 'span')}</span>
                  </div>
                  <h3 className="font-serif font-normal text-lg text-[#241D1A] mb-2">{Z('pepite_6_title', 'text', "Strada Mercy & Piața Traian", undefined, 'span')}</h3>
                  <p className="text-[#5C5349] text-sm leading-relaxed">{Z('pepite_6_desc', 'textarea', "Artère Art Nouveau du vieux Fabric. Façades colorées en cours de restauration, cafés de spécialité, bars à cocktails abordables.", undefined, 'span')}</p>
                </div>
            </div>
          </section>

          {/* Infos pratiques */}
          <section className="mb-16">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#3D5A47] mb-3">Côté pratique</p>
            <h2 className="text-2xl font-serif font-normal text-[#241D1A] mb-6">Ce qu'il faut savoir</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-[#FAF7F2] p-6 rounded-sm border border-[#DED5C6]">
                <h3 className="font-serif font-normal text-lg text-[#241D1A] mb-4">Où dormir</h3>
                <ul className="space-y-3 text-[#5C5349] text-sm">
                  <li>{Z('sleep_1', 'html', "<strong>Hôtel Timișoara</strong> — Centre historique, vue Piața Victoriei. 70–100€/nuit.", undefined, 'span')}</li>
                  <li>{Z('sleep_2', 'html', "<strong>Casa del Arte</strong> — Boutique hôtel dans une villa Art Nouveau restaurée. 60–90€.", undefined, 'span')}</li>
                  <li>{Z('sleep_3', 'html', "<strong>Appartements Fabric</strong> — Location courte durée dans le quartier créatif. 40–60€.", undefined, 'span')}</li>
                </ul>
              </div>
              <div className="bg-[#FAF7F2] p-6 rounded-sm border border-[#DED5C6]">
                <h3 className="font-serif font-normal text-lg text-[#241D1A] mb-4">Où manger</h3>
                <ul className="space-y-3 text-[#5C5349] text-sm">
                  <li>{Z('eat_1', 'html', "<strong>Conviva</strong> — Gastro-pub, cuisine locale revisitée. Réservation conseillée.", undefined, 'span')}</li>
                  <li>{Z('eat_2', 'html', "<strong>Barista Fabric</strong> — Café de spécialité, viennoiseries. Le rendez-vous du matin.", undefined, 'span')}</li>
                  <li>{Z('eat_3', 'html', "<strong>Marchés du samedi</strong> — Piața Badea Cârțan. Fromages, charcuteries locales, légumes.", undefined, 'span')}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-16">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#3D5A47] mb-3">Questions fréquentes</p>
            <div className="space-y-4">
              {FAQS.map((f, i) => (
                <details key={i} className="group bg-[#FAF7F2] rounded-sm border border-[#DED5C6] p-5">
                  <summary className="font-serif font-normal text-[#241D1A] cursor-pointer list-none flex items-center justify-between">
                    {zones[`${PAGE}__${f.q.zone}`] ?? f.q.fb}
                    <span className="text-[#3D5A47] group-open:rotate-180 transition-transform">↓</span>
                  </summary>
                  <p className="mt-3 text-[#5C5349] text-sm leading-relaxed">{zones[`${PAGE}__${f.a.zone}`] ?? f.a.fb}</p>
                </details>
              ))}
            </div>
          </section>

          {/* À proximité */}
          <section className="mb-12">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#3D5A47] mb-3">À proximité</p>
            <div className="grid gap-4 md:grid-cols-3">
              <Link href="/destinations/roumanie" className="p-4 bg-[#FAF7F2] rounded-sm border border-[#DED5C6] text-center hover:border-[#8C7A6B] transition-colors">
                <span className="text-[#241D1A] font-serif">Roumanie</span>
                <span className="block text-xs text-[#6E655C] mt-1">Guide complet</span>
              </Link>
              <div className="p-4 bg-[#EFE9DF] border border-[#DED5C6] rounded-sm text-center">
                <span className="text-[#241D1A] font-serif">Budapest</span>
                <span className="block text-xs text-[#6E655C] mt-1">~3h en train</span>
              </div>
              <div className="p-4 bg-[#EFE9DF] border border-[#DED5C6] rounded-sm text-center">
                <span className="text-[#241D1A] font-serif">Belgrade</span>
                <span className="block text-xs text-[#6E655C] mt-1">~4h en bus</span>
              </div>
            </div>
          </section>

          {/* CTA */}
          <div className="bg-[#EFE9DF] border border-[#DED5C6] rounded-sm p-8 text-center mb-8">
            <h3 className="font-serif font-normal text-xl text-[#241D1A] mb-3">Un itinéraire Roumanie sur mesure</h3>
            <p className="text-[#5C5349] text-sm mb-5 max-w-md mx-auto">
              Timișoara + Transylvanie + Bucarest : on conçoit l’itinéraire qui correspond à ton rythme.
            </p>
            <Link
              href="/travel-planning"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#4A3B32] text-[#F7F3EC] rounded-sm hover:bg-[#3A2D26] transition-colors text-xs uppercase tracking-[0.16em]"
            >
              Concevoir mon voyage
            </Link>
          </div>

          <Link href="/destinations/roumanie" className="text-[#3D5A47] hover:text-[#241D1A] text-xs uppercase tracking-[0.16em] transition-colors">
            ← Guide Roumanie
          </Link>
        </div>
      </main>
      <Footer />
    </InlineEditProvider>
  )
}

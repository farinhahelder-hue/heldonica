import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Script from 'next/script'
import { getPageZones } from '@/lib/cms-zones'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import EditableZone from '@/components/inline-edit/EditableZone'
import { buildPageMetadata } from '@/lib/page-metadata'
import ComingSoonDestination from '@/components/ComingSoonDestination'
import { isUnpublishedCmsPage } from '@/lib/unpublished-pages'

const PAGE = 'destinations-montenegro-kotor'

const metadata: Metadata = {
  title: 'Kotor avant les croisiéristes — guide slow travel | Heldonica',
  description: 'Notre guide pour découvrir Kotor à son meilleur : lever du soleil sur la baie, remparts vides et vieille ville avant 9h. Conseils terrain pour un slow travel réussi.',
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/montenegro/kotor',
  },
  openGraph: {
    title: 'Kotor avant les croisiéristes | Heldonica',
    description: 'Le secret de Kotor : partir à 7h. Notre guide slow travel pour une ville vide.',
    url: 'https://www.heldonica.fr/destinations/montenegro/kotor',
    siteName: 'Heldonica',
    locale: 'fr_FR',
    type: 'article',
    images: ['/images/destinations/montenegro/moraca_millennium.jpg'],
  },
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('destinations-montenegro-kotor', metadata)
}


const navLinks = [
  { label: 'Destinations', href: '/destinations' },
  { label: 'Monténégro', href: '/destinations/montenegro' },
]

// Valeurs de référence (source de vérité = cms_editable_zones ; ces valeurs
// servent de fallback technique tant que le CMS n'a pas été appliqué/seeded).
const FAQS: { q: { zone: string; fb: string }; a: { zone: string; fb: string } }[] = [
  { q: { zone: "faq_1_q", fb: "Quel est le meilleur moment pour visiter Kotor ?" }, a: { zone: "faq_1_a", fb: "Tôt le matin (7h-9h) pour avoir la vieille ville avant l'arrivée des croisiéristes. Mai-juin et septembre-octobre offrent le meilleur équilibre température/affluence." } },
  { q: { zone: "faq_2_q", fb: "Combien de temps rester à Kotor ?" }, a: { zone: "faq_2_a", fb: "2 à 3 jours suffisent pour découvrir la vieille ville, les remparts et une excursion dans les bouches de Kotor. Compte 4-5 jours si tu veux explorer Lovćen ou le Durmitor." } },
  { q: { zone: "faq_3_q", fb: "Les remparts de Kotor sont-ils difficiles ?" }, a: { zone: "faq_3_a", fb: "Oui — 1350 marches pour rejoindre la forteresse de San Giovanni. C'est éprouvant mais la vue sur la baie en vaut la peine. Pars tôt pour éviter la chaleur." } }
]

export default async function KotorPage() {
  // MVP : page sans photo vérifiée, « Bientôt » tant qu'elle figure dans lib/unpublished-pages.ts.
  if (isUnpublishedCmsPage('destinations-montenegro-kotor')) {
    return (
      <ComingSoonDestination
        slug="montenegro-kotor"
        title="Kotor"
        country="Monténégro"
        hero_unsplash_url="/og-default.jpg"
        zones={await getPageZones('destinations-montenegro-kotor')}
      />
    )
  }
  const zones = await getPageZones(PAGE)

  const Z = (zone: string, type: 'text' | 'textarea' | 'html' | 'image', fallback: string, className?: string, as?: any) => (
    <EditableZone page={PAGE} zone={zone} type={type} fallback={fallback} className={className} as={as} />
  )

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: zones[`${PAGE}__${f.q.zone}`] ?? f.q.fb,
      acceptedAnswer: { '@type': 'Answer', text: zones[`${PAGE}__${f.a.zone}`] ?? f.a.fb },
    })),
  }

  return (
    <InlineEditProvider page={PAGE} initialZones={zones}>
      <Script id="kotor-faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Header />
      <main className="min-h-screen bg-[#F7F3EC] text-[#241D1A]">
        {/* Hero */}
        <section className="relative bg-[#1E1916] py-20 md:py-28 border-b border-[#DED5C6]">
          <div className="absolute inset-0 opacity-35">
            {Z('hero_image', 'image', '/images/destinations/montenegro/moraca_millennium.jpg', 'w-full h-full object-cover')}
          </div>
          <div className="relative max-w-4xl mx-auto px-4">
            <span className="inline-block text-[#D8CFC0] text-[11px] uppercase tracking-[0.22em] mb-4">
              {Z('hero_badge', 'text', "Monténégro · Bouches de Kotor", undefined, 'span')}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-normal text-[#F7F3EC] mb-6 leading-tight">
              {Z('hero_title', 'text', "Kotor avant les croisiéristes", undefined, 'span')}
            </h1>
            <p className="text-xl text-[#E2D9C8] max-w-2xl leading-relaxed mb-8">
              {Z('hero_description', 'textarea', "Le secret de Kotor, c'est l'heure. À 7h du matin, la vieille ville est à toi. Les ruelles pavées, la lumière sur la baie, le silence avant l'invasion. Voici comment on l'a vécue — et comment tu peux la vivre aussi.", undefined, 'span')}
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#decouvrir" className="inline-flex items-center gap-2 bg-[#4A3B32] text-[#F7F3EC] px-6 py-3 rounded-sm text-xs uppercase tracking-[0.16em] hover:bg-[#3A2D26] transition-colors">
                Découvrir notre approche
              </a>
              <Link href="/destinations/montenegro" className="inline-flex items-center gap-2 bg-[#F7F3EC]/10 text-[#F7F3EC] border border-[#F7F3EC]/30 px-6 py-3 rounded-sm text-xs uppercase tracking-[0.16em] hover:bg-[#F7F3EC]/20 transition-colors">
                Retour au Monténégro
              </Link>
            </div>
          </div>
        </section>

        {/* Breadcrumb */}
        <nav className="bg-[#EFE9DF] border-b border-[#DED5C6]">
          <div className="max-w-4xl mx-auto px-4 py-3 flex gap-3 text-xs uppercase tracking-[0.14em] items-center">
            {navLinks.map((link, i) => (
              <span key={link.href} className="flex items-center gap-3">
                {i > 0 && <span className="text-[#9A8F80]">/</span>}
                <Link href={link.href} className="text-[#6E655C] hover:text-[#241D1A] transition-colors">
                  {link.label}
                </Link>
              </span>
            ))}
            <span className="flex items-center gap-3">
              <span className="text-[#9A8F80]">/</span>
              <span className="text-[#241D1A] font-medium">Kotor</span>
            </span>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">

          {/* Intro terrain */}
          <section id="decouvrir" className="mb-16">
            <h2 className="text-3xl font-serif font-normal text-[#241D1A] mb-6">
              {Z('intro_title', 'text', "La baie de Kotor au lever du soleil", undefined, 'span')}
            </h2>
            <div className="text-lg text-[#4A413A] leading-relaxed mb-4">
              {Z('intro_1', 'html', " <strong>6h30.</strong> On a quitté notre hébergement dans la vieille ville avant l'aube. Les premières lueurs sont apparues à l'horizon, rougissant les sommets calcaires. La baie était mate, sans un pli. Quelques pêcheurs préparaient leurs bateaux. ", undefined, 'p')}
            </div>
            <div className="text-lg text-[#4A413A] leading-relaxed mb-4">
              {Z('intro_2', 'html', " C'est à ce moment précis que Kotor révèle ce qu'il est vraiment : une cité saisissante coincée entre montagne et mer, qui mérite mieux que les groupes de croisiéristes qui l'envahissent à partir de 10h. ", undefined, 'p')}
            </div>
            <div className="text-lg text-[#4A413A] leading-relaxed">
              {Z('intro_3', 'html', " <strong>Notre conseil terrain :</strong> Lève-toi à 7h. Fais les remparts avant 9h. Ensuite, va nager dans une crique de la baie ou prends le bateau pour Perast. ", undefined, 'p')}
            </div>
          </section>

          {/* Pourquoi se lever tôt */}
          <section className="mb-16 bg-[#EFE9DF] border border-[#DED5C6] px-6 py-10 rounded-sm">
            <h2 className="text-3xl font-serif font-normal text-[#241D1A] mb-6">
              Pourquoi découvrir Kotor tôt le matin
            </h2>
            <p className="text-lg text-[#4A413A] leading-relaxed mb-8">
              Kotor subit le syndrome des destinations méditerranéennes :
              saisissantes hors saison, étouffantes durant l'été.
              Mais même hors saison, les croisiéristes débarquent chaque matin.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-[#FAF7F2] rounded-sm border border-[#DED5C6]">
                <h3 className="font-serif font-normal text-lg text-[#241D1A] mb-3">{Z('why_1_title', 'text', "Une vieille ville vide", undefined, 'span')}</h3>
                <p className="text-[#5C5349]">{Z('why_1_desc', 'textarea', "Avant 9h, les ruelles pavées sont à toi. Les portes colorées, les chats endormis, l'odeur du café qui sort des fenêtres — c'est le Kotor authentique.", undefined, 'span')}</p>
              </div>
              <div className="p-6 bg-[#FAF7F2] rounded-sm border border-[#DED5C6]">
                <h3 className="font-serif font-normal text-lg text-[#241D1A] mb-3">{Z('why_2_title', 'text', "Des remparts tranquilles", undefined, 'span')}</h3>
                <p className="text-[#5C5349]">{Z('why_2_desc', 'textarea', "1350 marches avec vue sur la baie — difficile de profiter si tu montes derrière 200 passagers de paquebot. À 7h, tu seras seul·e ou quasi.", undefined, 'span')}</p>
              </div>
              <div className="p-6 bg-[#FAF7F2] rounded-sm border border-[#DED5C6]">
                <h3 className="font-serif font-normal text-lg text-[#241D1A] mb-3">{Z('why_3_title', 'text', "La lumière du matin", undefined, 'span')}</h3>
                <p className="text-[#5C5349]">{Z('why_3_desc', 'textarea', "Le soleil levant sur les falaises de la baie est un spectacle. C'est le moment pour les photos — sans filtres, sans monde.", undefined, 'span')}</p>
              </div>
              <div className="p-6 bg-[#FAF7F2] rounded-sm border border-[#DED5C6]">
                <h3 className="font-serif font-normal text-lg text-[#241D1A] mb-3">{Z('why_4_title', 'text', "Les criques accessibles", undefined, 'span')}</h3>
                <p className="text-[#5C5349]">{Z('why_4_desc', 'textarea', "Les petites plages autour de Kotor sont vides le matin. Quai Bajova, Stoliv — tu auras le choix.", undefined, 'span')}</p>
              </div>
            </div>
          </section>

          {/* Notre façon de vivre */}
          <section className="mb-16">
            <h2 className="text-3xl font-serif font-normal text-[#241D1A] mb-6">
              Comment on organise une journée type à Kotor
            </h2>
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-16 h-16 bg-[#EFE9DF] border border-[#DED5C6] rounded-sm flex items-center justify-center">
                  <span className="text-[#3D5A47] font-serif text-lg">{Z('day_1_time', 'text', "7h", undefined, 'span')}</span>
                </div>
                <div>
                  <h3 className="font-serif font-normal text-lg text-[#241D1A] mb-2">{Z('day_1_title', 'text', "Lever du soleil sur la baie", undefined, 'span')}</h3>
                  <p className="text-[#5C5349]">{Z('day_1_desc', 'textarea', "Promenade le long de la marina, puis remontée vers les remparts. Si tu montes, prépare de l'eau — les marches sont raides.", undefined, 'span')}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-16 h-16 bg-[#EFE9DF] border border-[#DED5C6] rounded-sm flex items-center justify-center">
                  <span className="text-[#3D5A47] font-serif text-lg">{Z('day_2_time', 'text', "9h", undefined, 'span')}</span>
                </div>
                <div>
                  <h3 className="font-serif font-normal text-lg text-[#241D1A] mb-2">{Z('day_2_title', 'text', "Petit-déjeuner dans la vieille ville", undefined, 'span')}</h3>
                  <p className="text-[#5C5349]">{Z('day_2_desc', 'textarea', "Premier café, dernier calme. Profites-en pour flâner dans les ruelles avant que les boutiques ouvrent.", undefined, 'span')}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-16 h-16 bg-[#EFE9DF] border border-[#DED5C6] rounded-sm flex items-center justify-center">
                  <span className="text-[#3D5A47] font-serif text-lg">{Z('day_3_time', 'text', "10h", undefined, 'span')}</span>
                </div>
                <div>
                  <h3 className="font-serif font-normal text-lg text-[#241D1A] mb-2">{Z('day_3_title', 'text', "Direction le port pour l'excursion", undefined, 'span')}</h3>
                  <p className="text-[#5C5349]">{Z('day_3_desc', 'textarea', "Les bateaux partent du vieux port. Destination : les bouches de Kotor, Perast, et l'île de Notre-Dame-du-Rocher. <strong className=\"text-mahogany\"> Repère utile : échange directement avec les bateliers sur le quai.</strong>", undefined, 'span')}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-16 h-16 bg-[#EFE9DF] border border-[#DED5C6] rounded-sm flex items-center justify-center">
                  <span className="text-[#3D5A47] font-serif text-lg">{Z('day_4_time', 'text', "15h", undefined, 'span')}</span>
                </div>
                <div>
                  <h3 className="font-serif font-normal text-lg text-[#241D1A] mb-2">{Z('day_4_title', 'text', "Pause plage ou balade douce", undefined, 'span')}</h3>
                  <p className="text-[#5C5349]">{Z('day_4_desc', 'textarea', "L'après-midi, Kotor est envahi. C'est le moment pour une crique au bord de la baie ou une expédition vers la réserve naturelle de Lustica.", undefined, 'span')}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Infos pratiques */}
          <section className="mb-16 bg-[#FAF7F2] rounded-sm p-8 border border-[#DED5C6]">
            <h2 className="text-3xl font-serif font-normal text-[#241D1A] mb-6">
              Infos pratiques pour Kotor
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-serif font-normal text-lg text-[#241D1A] mb-4">{Z('info_1_title', 'text', "Quand y aller", undefined, 'span')}</h3>
                <ul className="space-y-2 text-[#5C5349]">
                  <li>{Z('info_1_item_1', 'html', "<strong className=\"text-eucalyptus\">Mai-juin :</strong> Températures agréables, peu de croisiéristes", undefined, 'span')}</li>
                  <li>{Z('info_1_item_2', 'html', "<strong className=\"text-eucalyptus\">Septembre-octobre :</strong> Mer chaude, fréquentation en baisse", undefined, 'span')}</li>
                  <li>{Z('info_1_item_3', 'html', "<strong className=\"text-red-500\">Juillet-août :</strong> À éviter si tu cherches le calme", undefined, 'span')}</li>
                </ul>
              </div>
              <div>
                <h3 className="font-serif font-normal text-lg text-[#241D1A] mb-4">{Z('info_2_title', 'text', "Combien de temps", undefined, 'span')}</h3>
                <ul className="space-y-2 text-[#5C5349]">
                  <li>{Z('info_2_item_1', 'html', "<strong className=\"text-eucalyptus\">2-3 jours :</strong> Vieille ville, remparts, Perast", undefined, 'span')}</li>
                  <li>{Z('info_2_item_2', 'html', "<strong className=\"text-eucalyptus\">4-5 jours :</strong> Ajout de Lovćen ou Budva", undefined, 'span')}</li>
                  <li>{Z('info_2_item_3', 'html', "<strong className=\"text-eucalyptus\">1 semaine+ :</strong> Durée complète pour le Monténégro", undefined, 'span')}</li>
                </ul>
              </div>
              <div>
                <h3 className="font-serif font-normal text-lg text-[#241D1A] mb-4">{Z('info_3_title', 'text', "Budget couple / jour", undefined, 'span')}</h3>
                <ul className="space-y-2 text-[#5C5349]">
                  <li>{Z('info_3_item_1', 'html', "<strong className=\"text-eucalyptus\">Entrée remparts :</strong> ~15€/pers", undefined, 'span')}</li>
                  <li>{Z('info_3_item_2', 'html', "<strong className=\"text-eucalyptus\">Excursion bateau :</strong> ~40-60€/pers", undefined, 'span')}</li>
                  <li>{Z('info_3_item_3', 'html', "<strong className=\"text-eucalyptus\">Repas :</strong> ~20-30€/pers", undefined, 'span')}</li>
                </ul>
              </div>
              <div>
                <h3 className="font-serif font-normal text-lg text-[#241D1A] mb-4">{Z('info_4_title', 'text', "Pour qui", undefined, 'span')}</h3>
                <ul className="space-y-2 text-[#5C5349]">
                  <li>{Z('info_4_item_1', 'html', "<strong className=\"text-eucalyptus\">Couples :</strong> Idéal pour un week-end romantique", undefined, 'span')}</li>
                  <li>{Z('info_4_item_2', 'html', "<strong className=\"text-eucalyptus\">Amis :</strong> Authentique, peu fréquenté hors saison", undefined, 'span')}</li>
                  <li>{Z('info_4_item_3', 'html', "<strong className=\"text-eucalyptus\">Familles :</strong> Facile avec enfants (pas de grosses marches)", undefined, 'span')}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-16">
            <h2 className="text-3xl font-serif font-normal text-[#241D1A] mb-6">
              Questions fréquentes sur Kotor
            </h2>
            <div className="space-y-4">
              {FAQS.map((f) => (
                <details key={f.q.fb} className="bg-[#FAF7F2] rounded-sm border border-[#DED5C6] p-6 group">
                  <summary className="font-serif font-normal text-lg text-[#241D1A] cursor-pointer list-none flex justify-between items-center">
                    {zones[`${PAGE}__${f.q.zone}`] ?? f.q.fb}
                    <span className="text-[#3D5A47] group-open:rotate-180 transition-transform">↓</span>
                  </summary>
                  <p className="text-[#5C5349] mt-4 pt-4 border-t border-[#DED5C6]">
                    {zones[`${PAGE}__${f.a.zone}`] ?? f.a.fb}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* Verdict */}
          <section className="mb-16 bg-[#241D1A] text-[#F7F3EC] rounded-sm p-8 md:p-12 border border-[#DED5C6]">
            <h2 className="text-3xl font-serif font-normal mb-6">
              Notre verdict sur Kotor
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-[11px] uppercase tracking-[0.2em] text-[#C8BEAC] mb-3">Pour qui</h3>
                <p className="text-[#E2D9C8]">
                  {Z('verdict_who', 'textarea', "Couples qui cherchent une destination romantique avec de vrais beaux paysages. Amateurs d'histoire (vieille ville UNESCO) et de nature (baie, montagnes).", undefined, 'span')}
                </p>
              </div>
              <div>
                <h3 className="text-[11px] uppercase tracking-[0.2em] text-[#C8BEAC] mb-3">Ce qu'on retient</h3>
                <ul className="text-[#E2D9C8] space-y-1">
                  <li>{Z('verdict_adore_1', 'textarea', "— La baie au lever du soleil", undefined, 'span')}</li>
                  <li>{Z('verdict_adore_2', 'textarea', "— Les ruelles pavées avant 9h", undefined, 'span')}</li>
                  <li>{Z('verdict_adore_3', 'textarea', "— L'excursion en bateau vers Perast", undefined, 'span')}</li>
                  <li>{Z('verdict_adore_4', 'textarea', "— Le rapport qualité-prix", undefined, 'span')}</li>
                </ul>
              </div>
              <div className="md:col-span-2">
                <h3 className="text-[11px] uppercase tracking-[0.2em] text-[#C8BEAC] mb-3">Ce qu'on évite</h3>
                <p className="text-[#E2D9C8]">
                  {Z('verdict_avoid', 'textarea', "Les croisiéristes. Juillet-août si tu cherches du slow travel. Les restaurants hors de la vieille ville — moins authentiques, plus chers.", undefined, 'span')}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xl font-serif italic border-t border-[#4A413A] pt-6 text-[#F7F3EC]">
                  {Z('verdict_quote', 'textarea', "\"Kotor se découvre à l'aube. Le reste de la journée, prends le large en bateau.\"", undefined, 'span')}
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="mb-16 text-center">
            <div className="bg-[#EFE9DF] border border-[#DED5C6] rounded-sm p-8 md:p-12">
              <h2 className="text-2xl font-serif font-normal text-[#241D1A] mb-4">
                Envie d'explorer le Monténégro sur mesure ?
              </h2>
              <p className="text-[#5C5349] mb-6 max-w-lg mx-auto">
                On peut concevoir ton itinéraire Monténégro avec nos adresses testées terrain —
                de Kotor à Durmitor, sans compromis.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/travel-planning" className="inline-flex items-center gap-2 bg-[#4A3B32] text-[#F7F3EC] px-8 py-3.5 rounded-sm text-xs uppercase tracking-[0.16em] hover:bg-[#3A2D26] transition-colors">
                  Découvrir Travel Planning →
                </Link>
                <Link href="/destinations/montenegro" className="inline-flex items-center gap-2 bg-[#FAF7F2] text-[#241D1A] px-8 py-3.5 rounded-sm text-xs uppercase tracking-[0.16em] hover:bg-[#F7F3EC] transition-colors border border-[#DED5C6]">
                  Retour au Monténégro
                </Link>
              </div>
            </div>
          </section>

          {/* Liens vers autres destinations */}
          <section className="border-t border-[#DED5C6] pt-12">
            <h3 className="text-[11px] uppercase tracking-[0.2em] text-[#6E655C] mb-6">Autres destinations Heldonica</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Link href="/destinations/madere" className="p-4 bg-[#FAF7F2] rounded-sm border border-[#DED5C6] hover:border-[#8C7A6B] transition-colors">
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#6E655C] block mb-1">Atlantique</span>
                <span className="text-[#241D1A] font-serif text-lg">Madère</span>
              </Link>
              <Link href="/destinations/roumanie" className="p-4 bg-[#FAF7F2] rounded-sm border border-[#DED5C6] hover:border-[#8C7A6B] transition-colors">
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#6E655C] block mb-1">Carpates</span>
                <span className="text-[#241D1A] font-serif text-lg">Roumanie</span>
              </Link>
              <Link href="/destinations" className="p-4 bg-[#FAF7F2] rounded-sm border border-[#DED5C6] hover:border-[#8C7A6B] transition-colors">
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#6E655C] block mb-1">Index</span>
                <span className="text-[#241D1A] font-serif text-lg">Toutes</span>
              </Link>
            </div>
          </section>

        </div>
      </main>
      <Footer />
    </InlineEditProvider>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Script from 'next/script'
import { getPageZones } from '@/lib/cms-zones'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import EditableZone from '@/components/inline-edit/EditableZone'
import { buildPageMetadata } from '@/lib/page-metadata'

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
  { q: { zone: "faq_3_q", fb: "Les remparts de Kotor sont-ils difficiles ?" }, a: { zone: "faq_3_a", fb: "Oui — 1350 marches pour rejoindre la forteresse de San Giovanni. C'est éprouvant mais la vue sur la baie en vaut la peine. Partez tôt pour éviter la chaleur." } }
]

export default async function KotorPage() {
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
      <main className="min-h-screen bg-stone-50">
        {/* Hero */}
        <section className="relative bg-gradient-to-b from-stone-900 via-stone-800 to-stone-700 py-20 md:py-28">
          <div className="absolute inset-0 opacity-30">
            {Z('hero_image', 'image', '/og-default.jpg', 'w-full h-full object-cover')}
          </div>
          <div className="relative max-w-4xl mx-auto px-4">
            <span className="inline-block text-teal text-sm font-medium mb-4 tracking-wide">
              {Z('hero_badge', 'text', "Monténégro · Bouches de Kotor", undefined, 'span')}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-6 leading-tight">
              {Z('hero_title', 'text', "Kotor avant les croisiéristes", undefined, 'span')}
            </h1>
            <p className="text-xl text-stone-200 max-w-2xl leading-relaxed mb-8">
              {Z('hero_description', 'textarea', "Le secret de Kotor, c'est l'heure. À 7h du matin, la vieille ville est à toi. Les ruelles pavées, la lumière sur la baie, le silence avant l'invasion. Voici comment on l'a vécue — et comment tu peux la vivre aussi.", undefined, 'span')}
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#decouvrir" className="inline-flex items-center gap-2 bg-eucalyptus text-white px-6 py-3 rounded-full font-semibold hover:bg-eucalyptus/90 transition-colors">
                Découvrir notre approche
              </a>
              <Link href="/destinations/montenegro" className="inline-flex items-center gap-2 bg-white/10 text-white px-6 py-3 rounded-full font-semibold hover:bg-white/20 transition-colors">
                Retour au Monténégro
              </Link>
            </div>
          </div>
        </section>

        {/* Breadcrumb */}
        <nav className="bg-white border-b border-stone-200">
          <div className="max-w-4xl mx-auto px-4 py-3 flex gap-3 text-sm items-center">
            {navLinks.map((link, i) => (
              <span key={link.href} className="flex items-center gap-3">
                {i > 0 && <span className="text-stone-300">/</span>}
                <Link href={link.href} className="text-stone-500 hover:text-eucalyptus transition-colors">
                  {link.label}
                </Link>
              </span>
            ))}
            <span className="flex items-center gap-3">
              <span className="text-stone-300">/</span>
              <span className="text-mahogany font-medium">Kotor</span>
            </span>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">

          {/* Intro terrain */}
          <section id="decouvrir" className="mb-16">
            <h2 className="text-3xl font-serif text-mahogany mb-6">
              {Z('intro_title', 'text', "La baie de Kotor au lever du soleil", undefined, 'span')}
            </h2>
            <p className="text-lg text-stone-700 leading-relaxed mb-4">
              {Z('intro_1', 'html', " <strong>6h30.</strong> On a quitté notre hébergement dans la vieille ville avant l'aube. Les premières lueurs sont apparues à l'horizon, rougissant les peaks calcaires. La baie était mate, sans un pli. Quelques pêcheurs préparaient leurs bateaux. ", undefined, 'p')}
            </p>
            <p className="text-lg text-stone-700 leading-relaxed">
              {Z('intro_2', 'html', " C'est à ce moment précis que Kotor révèle ce qu'il est vraiment : une ville magnifique coincée entre montagne et mer, qui mérite mieux que les groupes de croisiéristes qui la envahissent à partir de 10h. ", undefined, 'p')}
            </p>
            <p className="text-lg text-stone-700 leading-relaxed">
              {Z('intro_3', 'html', " <strong>Notre conseil terrain :</strong> Lève-toi à 7h. Fais les remparts avant 9h. Ensuite, va nager dans une crique de la baie ou prends le bateau pour Perast. ", undefined, 'p')}
            </p>
          </section>

          {/* Pourquoi se lever tôt */}
          <section className="mb-16 bg-gradient-to-b from-white to-stone-50 -mx-4 px-4 py-12 rounded-2xl">
            <h2 className="text-3xl font-serif text-mahogany mb-6">
              {Z('why_title', 'text', "Pourquoi découvrir Kotor tôt le matin", undefined, 'span')}
            </h2>
            <p className="text-lg text-stone-700 leading-relaxed mb-8">
              {Z('why_intro', 'textarea', "Kotor subit le syndrome des destinations méditerranéennes :\n              magnifiques hors saison, invivables en juillet-août.\n              Mais même hors saison, les croisiéristes débarquent chaque matin.", undefined, 'span')}
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-white rounded-xl border border-stone-200 shadow-sm">
                <h3 className="font-serif text-lg text-mahogany mb-3">{Z('why_1_title', 'text', "Une vieille ville vide", undefined, 'span')}</h3>
                <p className="text-stone-600">{Z('why_1_desc', 'textarea', "Avant 9h, les ruelles pavées sont à toi. Les portes colorées, les chats endormis, l'odeur du café qui sort des fenêtres — c'est le Kotor authentique.", undefined, 'span')}</p>
              </div>
              <div className="p-6 bg-white rounded-xl border border-stone-200 shadow-sm">
                <h3 className="font-serif text-lg text-mahogany mb-3">{Z('why_2_title', 'text', "Des remparts tranquilles", undefined, 'span')}</h3>
                <p className="text-stone-600">{Z('why_2_desc', 'textarea', "1350 marches avec vue sur la baie — difficile de profiter si tu montes derrière 200 passagers de cruise. À 7h, tu seras seul·e ou quasi.", undefined, 'span')}</p>
              </div>
              <div className="p-6 bg-white rounded-xl border border-stone-200 shadow-sm">
                <h3 className="font-serif text-lg text-mahogany mb-3">{Z('why_3_title', 'text', "La lumière du matin", undefined, 'span')}</h3>
                <p className="text-stone-600">{Z('why_3_desc', 'textarea', "Le soleil levant sur les falaises de la baie est un spectacle. C'est le moment pour les photos — sans filtres, sans monde.", undefined, 'span')}</p>
              </div>
              <div className="p-6 bg-white rounded-xl border border-stone-200 shadow-sm">
                <h3 className="font-serif text-lg text-mahogany mb-3">{Z('why_4_title', 'text', "Les criques accessibles", undefined, 'span')}</h3>
                <p className="text-stone-600">{Z('why_4_desc', 'textarea', "Les petites plages autour de Kotor sont vides le matin. Bajova Quay, Stoliv — tu auras le choix.", undefined, 'span')}</p>
              </div>
            </div>
          </section>

          {/* Notre façon de vivre */}
          <section className="mb-16">
            <h2 className="text-3xl font-serif text-mahogany mb-6">
              {Z('day_title', 'text', "Comment on organise une journée type à Kotor", undefined, 'span')}
            </h2>
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-16 h-16 bg-eucalyptus/10 rounded-full flex items-center justify-center">
                  <span className="text-eucalyptus font-bold">{Z('day_1_time', 'text', "7h", undefined, 'span')}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-mahogany mb-2">{Z('day_1_title', 'text', "Lever du soleil sur la baie", undefined, 'span')}</h3>
                  <p className="text-stone-600">{Z('day_1_desc', 'textarea', "Promenade le long de la marina, puis remontée vers les remparts. Si tu montes, prépare de l'eau — les marches sont raides.", undefined, 'span')}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-16 h-16 bg-eucalyptus/10 rounded-full flex items-center justify-center">
                  <span className="text-eucalyptus font-bold">{Z('day_2_time', 'text', "9h", undefined, 'span')}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-mahogany mb-2">{Z('day_2_title', 'text', "Petit-déjeuner dans la vieille ville", undefined, 'span')}</h3>
                  <p className="text-stone-600">{Z('day_2_desc', 'textarea', "Premier café, dernier calme. Profites-en pour flâner dans les ruelles avant que les boutiques ouvrent.", undefined, 'span')}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-16 h-16 bg-eucalyptus/10 rounded-full flex items-center justify-center">
                  <span className="text-eucalyptus font-bold">{Z('day_3_time', 'text', "10h", undefined, 'span')}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-mahogany mb-2">{Z('day_3_title', 'text', "Direction le port pour l'excursion", undefined, 'span')}</h3>
                  <p className="text-stone-600">{Z('day_3_desc', 'textarea', "Les bateaux partent du vieux port. Destination : les bouches de Kotor, Perast, et l'île de Notre-Dame-du-Rocher. <strong className=\"text-mahogany\"> Astuce : négociez directement avec les pêcheurs sur le port.</strong>", undefined, 'span')}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-16 h-16 bg-eucalyptus/10 rounded-full flex items-center justify-center">
                  <span className="text-eucalyptus font-bold">{Z('day_4_time', 'text', "15h", undefined, 'span')}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-mahogany mb-2">{Z('day_4_title', 'text', "Pause plage ou balade douce", undefined, 'span')}</h3>
                  <p className="text-stone-600">{Z('day_4_desc', 'textarea', "L'après-midi, Kotor est envahi. C'est le moment pour une crique au bord de la baie ou une expédition vers la réserve naturelle de Lustica.", undefined, 'span')}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Infos pratiques */}
          <section className="mb-16 bg-white rounded-2xl p-8 border border-stone-200">
            <h2 className="text-3xl font-serif text-mahogany mb-6">
              {Z('info_title', 'text', "Infos pratiques pour Kotor", undefined, 'span')}
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-mahogany mb-4">{Z('info_1_title', 'text', "Quand y aller", undefined, 'span')}</h3>
                <ul className="space-y-2 text-stone-600">
                  <li>{Z('info_1_item_1', 'html', "<strong className=\"text-eucalyptus\">Mai-juin :</strong> Températures agréables, peu de croisiéristes", undefined, 'span')}</li>
                  <li>{Z('info_1_item_2', 'html', "<strong className=\"text-eucalyptus\">Septembre-octobre :</strong> Mer chaude, touristes en baisse", undefined, 'span')}</li>
                  <li>{Z('info_1_item_3', 'html', "<strong className=\"text-red-500\">Juillet-août :</strong> À éviter si tu cherches le calme", undefined, 'span')}</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-mahogany mb-4">{Z('info_2_title', 'text', "Combien de temps", undefined, 'span')}</h3>
                <ul className="space-y-2 text-stone-600">
                  <li>{Z('info_2_item_1', 'html', "<strong className=\"text-eucalyptus\">2-3 jours :</strong> Vieille ville, remparts, Perast", undefined, 'span')}</li>
                  <li>{Z('info_2_item_2', 'html', "<strong className=\"text-eucalyptus\">4-5 jours :</strong> Ajout de Lovćen ou Budva", undefined, 'span')}</li>
                  <li>{Z('info_2_item_3', 'html', "<strong className=\"text-eucalyptus\">1 semaine+ :</strong> Durée complète pour le Monténégro", undefined, 'span')}</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-mahogany mb-4">{Z('info_3_title', 'text', "Budget couple / jour", undefined, 'span')}</h3>
                <ul className="space-y-2 text-stone-600">
                  <li>{Z('info_3_item_1', 'html', "<strong className=\"text-eucalyptus\">Entrée remparts :</strong> ~15€/pers", undefined, 'span')}</li>
                  <li>{Z('info_3_item_2', 'html', "<strong className=\"text-eucalyptus\">Excursion bateau :</strong> ~40-60€/pers", undefined, 'span')}</li>
                  <li>{Z('info_3_item_3', 'html', "<strong className=\"text-eucalyptus\">Repas :</strong> ~20-30€/pers", undefined, 'span')}</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-mahogany mb-4">{Z('info_4_title', 'text', "Pour qui", undefined, 'span')}</h3>
                <ul className="space-y-2 text-stone-600">
                  <li>{Z('info_4_item_1', 'html', "<strong className=\"text-eucalyptus\">Couples :</strong> Idéal pour un week-end romantique", undefined, 'span')}</li>
                  <li>{Z('info_4_item_2', 'html', "<strong className=\"text-eucalyptus\">Amis :</strong> Authentique, pas trop tourist", undefined, 'span')}</li>
                  <li>{Z('info_4_item_3', 'html', "<strong className=\"text-eucalyptus\">Familles :</strong> Facile avec enfants (pas de grosses marches)", undefined, 'span')}</li>
                </ul>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-16">
            <h2 className="text-3xl font-serif text-mahogany mb-6">
              {Z('faq_title', 'text', "Questions fréquentes sur Kotor", undefined, 'span')}
            </h2>
            <div className="space-y-4">
              {FAQS.map((f) => (
                <details key={f.q.fb} className="bg-white rounded-xl border border-stone-200 p-6 group">
                  <summary className="font-semibold text-mahogany cursor-pointer list-none flex justify-between items-center">
                    {zones[`${PAGE}__${f.q.zone}`] ?? f.q.fb}
                    <span className="text-eucalyptus group-open:rotate-180 transition-transform">↓</span>
                  </summary>
                  <p className="text-stone-600 mt-4 pt-4 border-t border-stone-100">
                    {zones[`${PAGE}__${f.a.zone}`] ?? f.a.fb}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* Verdict */}
          <section className="mb-16 bg-mahogany text-white rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl font-serif mb-6">
              {Z('verdict_title', 'text', "Notre verdict sur Kotor", undefined, 'span')}
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-teal mb-3">{Z('verdict_who_title', 'text', "Pour qui", undefined, 'span')}</h3>
                <p className="text-stone-200">
                  {Z('verdict_who', 'textarea', "Couples qui cherchent une destination romantique avec de vrais beaux paysages. Amateurs d'histoire (vieille ville UNESCO) et de nature (baie, montagnes).", undefined, 'span')}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-teal mb-3">{Z('verdict_adore_title', 'text', "Ce qu'on adore", undefined, 'span')}</h3>
                <ul className="text-stone-200 space-y-1">
                  <li>{Z('verdict_adore_1', 'textarea', "✓ La baie au lever du soleil", undefined, 'span')}</li>
                  <li>{Z('verdict_adore_2', 'textarea', "✓ Les ruelles pavées avant 9h", undefined, 'span')}</li>
                  <li>{Z('verdict_adore_3', 'textarea', "✓ L'excursion en bateau vers Perast", undefined, 'span')}</li>
                  <li>{Z('verdict_adore_4', 'textarea', "✓ Le rapport qualité-prix", undefined, 'span')}</li>
                </ul>
              </div>
              <div className="md:col-span-2">
                <h3 className="font-semibold text-teal mb-3">{Z('verdict_avoid_title', 'text', "Ce qu'on évite", undefined, 'span')}</h3>
                <p className="text-stone-200">
                  {Z('verdict_avoid', 'textarea', "Les croisiéristes. Juillet-août si tu cherches du slow travel. Les restaurants hors de la vieille ville — moins authentiques, plus chers.", undefined, 'span')}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xl italic border-t border-stone-600 pt-6">
                  {Z('verdict_quote', 'textarea', "\"Kotor se découvre à l'aube. Le reste de la journée, partez en bateau.\"", undefined, 'span')}
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="mb-16 text-center">
            <div className="inline-block bg-gradient-to-r from-eucalyptus/10 to-teal/10 rounded-2xl p-8 md:p-12">
              <h2 className="text-2xl font-serif text-mahogany mb-4">
                {Z('cta_title', 'text', "Envie d'explorer le Monténégro sur mesure ?", undefined, 'span')}
              </h2>
              <p className="text-stone-600 mb-6 max-w-lg mx-auto">
                {Z('cta_text', 'textarea', "On peut concevoir ton itinéraire Monténégro avec nos adresses testées terrain —\n                de Kotor à Durmitor, sans compromis.", undefined, 'span')}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/travel-planning" className="inline-flex items-center gap-2 bg-eucalyptus text-white px-8 py-4 rounded-full font-semibold hover:bg-eucalyptus/90 transition-colors">
                  {Z('cta_button_1', 'text', "Découvrir Travel Planning →", undefined, 'span')}
                </Link>
                <Link href="/destinations/montenegro" className="inline-flex items-center gap-2 bg-white text-mahogany px-8 py-4 rounded-full font-semibold hover:bg-stone-100 transition-colors border border-stone-200">
                  {Z('cta_button_2', 'text', "Retour au Monténégro", undefined, 'span')}
                </Link>
              </div>
            </div>
          </section>

          {/* Liens vers autres destinations */}
          <section className="border-t border-stone-200 pt-12">
            <h3 className="text-sm uppercase tracking-wider text-stone-500 mb-6">{Z('related_title', 'text', "Autres destinations Heldonica", undefined, 'span')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Link href="/destinations/madere" className="p-4 bg-white rounded-xl border border-stone-200 hover:border-eucalyptus hover:shadow-md transition-all">
                <span className="text-2xl mr-2">🇵🇹</span>
                <span className="text-mahogany font-medium">{Z('related_1_label', 'text', "Madère", undefined, 'span')}</span>
              </Link>
              <Link href="/destinations/roumanie" className="p-4 bg-white rounded-xl border border-stone-200 hover:border-eucalyptus hover:shadow-md transition-all">
                <span className="text-2xl mr-2">🇷🇴</span>
                <span className="text-mahogany font-medium">{Z('related_2_label', 'text', "Roumanie", undefined, 'span')}</span>
              </Link>
              <Link href="/destinations" className="p-4 bg-white rounded-xl border border-stone-200 hover:border-eucalyptus hover:shadow-md transition-all">
                <span className="text-2xl mr-2">🗺️</span>
                <span className="text-mahogany font-medium">{Z('related_3_label', 'text', "Toutes", undefined, 'span')}</span>
              </Link>
            </div>
          </section>

        </div>
      </main>
      <Footer />
    </InlineEditProvider>
  )
}

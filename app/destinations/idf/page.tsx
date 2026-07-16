import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const faqIdfSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Quand aller à Paris et en Île-de-France ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Avril à juin pour les jardins et la douceur, septembre-octobre pour les files d'attente réduites. Juillet-août reste agréable mais plus fréquenté et potentiellement caniculaire." }
    },
    {
      "@type": "Question",
      "name": "Comment se déplacer en Île-de-France sans voiture ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Le Pass Navigo (zones 1-5) couvre métro, RER, bus, et trains vers Versailles, Fontainebleau et Giverny. Pour Paris intra-muros, le Vélib' est idéal. La voiture est souvent un obstacle plus qu'une aide." }
    },
    {
      "@type": "Question",
      "name": "Que faire autour de Paris en journée ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Fontainebleau (40 min, RER D) pour la forêt et l'escalade sur blocs. Versailles (35 min, RER C) pour les jardins plutôt que le château. Giverny (1h30 en train + bus) pour les jardins de Monet d'avril à novembre." }
    },
    {
      "@type": "Question",
      "name": "Y a-t-il des activités slow travel gratuites à Paris ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Oui — la Petite Ceinture (14e, 15e), le Canal de l'Ourcq à vélo, les marchés de quartier (Mouffetard, Belleville), les jardins du Palais-Royal. Les musées nationaux sont gratuits le premier dimanche de chaque mois." }
    }
  ]
}

const schemaTouristDestination = {
  "@context": "https://schema.org",
  "@type": "TouristDestination",
  "name": "Île-de-France",
  "description": "Paris et sa région en slow travel : Petite Ceinture, Canal de l'Ourcq, Fontainebleau. L'Île-de-France qu'on explore lentement, en dehors des circuits touristiques classiques.",
  "url": "https://www.heldonica.fr/destinations/idf",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "FR",
    "addressRegion": "Île-de-France"
  },
  "geo": { "@type": "GeoCoordinates", "latitude": 48.8566, "longitude": 2.3522 },
  "touristType": ["Slow traveler", "City explorer", "Nature lover"]
}

export const metadata: Metadata = {
  title: 'Île-de-France slow travel | Guide Heldonica',
  description: 'Paris autrement, Versailles hors saison, Giverny au petit matin. Notre guide Île-de-France pour voyager lentement dans la région la plus visitée du monde.',
  alternates: { canonical: 'https://www.heldonica.fr/destinations/idf' },
  openGraph: {
    title: 'Île-de-France slow travel | Guide Heldonica',
    description: 'Paris autrement, Versailles hors saison, Giverny au petit matin. Slow travel en Île-de-France.',
    url: 'https://www.heldonica.fr/destinations/idf',
    images: [{ url: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=1200&q=80', width: 1200, height: 630, alt: 'Paris slow travel — Île-de-France' }],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', creator: '@heldonica', title: 'Île-de-France slow travel | Guide Heldonica', description: 'Paris autrement, Versailles hors saison, Giverny au petit matin.' },
}

const subNav = [
  { label: 'Paris', href: '/destinations/idf/paris' },
  { label: 'Versailles', href: '/destinations/idf/versailles' },
  { label: 'Giverny', href: '/destinations/idf/giverny' },
  { label: 'Fontainebleau', href: '/destinations/idf/fontainebleau' },
]

const pepites = [
  {
    titre: 'La Petite Ceinture (14e)',
    description: 'L\'ancienne voie ferrée devenue promenade sauvage au cœur de Paris. Street art, végétation folle, silence improbable. Un Paris d\'explorateur à 15 minutes du Sacré-Cœur.',
    tag: 'Urbex légal',
    href: '/destinations/idf/paris',
  },
  {
    titre: 'Rue Mouffetard & Singh\'Nature',
    description: 'Le marché du jeudi matin, les fromagers, le boulanger de quartier. Le soir, une table végétarienne fusion au Singh\'Nature — notre découverte la plus mémorable du 5e.',
    tag: 'Food',
    href: '/destinations/idf/paris',
  },
  {
    titre: 'Canal de l\'Ourcq à vélo',
    description: 'De La Villette jusqu\'à Meaux en longeant le canal. Une journée entière, sans voiture, en glissant entre les péniches et les écluses. Le slow travel commence à 30 minutes de chez soi.',
    tag: 'Vélo',
    href: '/destinations/idf/paris',
  },
  {
    titre: 'Forêt de Fontainebleau',
    description: 'Le château, oui — mais surtout la forêt. Escalade sur les blocs de grès, pique-nique en sous-bois, silence garanti hors week-end. 40 minutes depuis Paris-Gare de Lyon.',
    tag: 'Nature',
    href: '/destinations/idf/fontainebleau',
  },
]

const zones = [
  {
    label: 'Paris',
    href: '/destinations/idf/paris',
    desc: 'La capitale autrement — Petite Ceinture, Mouffetard, Canal de l\'Ourcq. La Paris des quartiers, pas des monuments.',
  },
  {
    label: 'Versailles',
    href: '/destinations/idf/versailles',
    desc: 'Les jardins à l\'aube avant les cars de touristes, le marché couvert, le quartier Saint-Louis pour déjeuner.',
  },
  {
    label: 'Giverny',
    href: '/destinations/idf/giverny',
    desc: 'Les jardins de Monet en avril ou en juin — pas en août. Une demi-journée, une lumière douce, pas de foule.',
  },
  {
    label: 'Fontainebleau',
    href: '/destinations/idf/fontainebleau',
    desc: 'Forêt, blocs de grès, chemins marqués. La nature à 40 minutes de Paris — notre escape dominical préféré.',
  },
]

export default function IdfPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqIdfSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaTouristDestination) }} />
      <Header />
      <main className="min-h-screen bg-stone-50">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-stone-900 via-stone-800 to-stone-700 py-24 md:py-32">
          <div
            className="absolute inset-0 opacity-20 bg-cover bg-center"
            style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=1920&q=75)' }}
            aria-hidden="true"
          />
          <div className="relative max-w-4xl mx-auto px-4">
            <span className="inline-block text-teal text-xs font-semibold uppercase tracking-widest mb-4">Destinations France</span>
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-4 leading-tight">
              Île-de-France
            </h1>
            <p className="text-lg md:text-xl text-stone-200 max-w-2xl leading-relaxed">
              On habite à côté, et Paris nous surprend encore. Pas le Paris des selfies devant la Tour Eiffel — l'autre Paris, celui de la Petite Ceinture, du Canal de l'Ourcq un dimanche matin, des cours intérieures cachées dans le Marais.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/destinations/idf/paris"
                className="inline-flex items-center gap-2 px-6 py-3 bg-eucalyptus text-white font-semibold rounded-xl hover:bg-eucalyptus/90 transition-colors text-sm"
              >
                Explorer Paris →
              </Link>
              <Link
                href="/destinations/idf/fontainebleau"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors text-sm border border-white/20"
              >
                Fontainebleau →
              </Link>
            </div>
          </div>
        </section>

        {/* Sub navigation */}
        <nav className="bg-white border-b border-stone-200 sticky top-16 z-40" aria-label="Sous-destinations Île-de-France">
          <div className="max-w-4xl mx-auto px-4 py-3 flex gap-6 overflow-x-auto no-scrollbar">
            {subNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-stone-600 hover:text-eucalyptus whitespace-nowrap text-sm font-medium transition-colors pb-0.5 border-b-2 border-transparent hover:border-eucalyptus/50"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Intro */}
          <section className="mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-eucalyptus mb-3">Notre angle</p>
            <h2 className="text-2xl md:text-3xl font-serif text-stone-900 mb-5">
              Le slow travel commence parfois à 30 minutes de chez soi
            </h2>
            <div className="prose prose-stone max-w-none text-stone-700 leading-relaxed space-y-4">
              <p>
                L'Île-de-France est la région la plus visitée du monde — et pourtant, on peut y passer une semaine entière sans croiser un touriste. La Petite Ceinture au 14e, les bords du Canal de l'Ourcq un mardi matin, la forêt de Fontainebleau en automne : c'est cette région-là qu'on documente.
              </p>
              <p>
                Pas les monuments (on les connaît), pas les photos Instagram (on les a vues) — les adresses de quartier, les promenades qui n'existent sur aucune carte de métro, les marchés où les locaux font vraiment leurs courses.
              </p>
            </div>
          </section>

          {/* Pépites */}
          <section className="mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-eucalyptus mb-3">Ce qu'on a vraiment aimé</p>
            <h2 className="text-2xl font-serif text-stone-900 mb-6">Nos pépites en Île-de-France</h2>
            <div className="grid gap-5 md:grid-cols-2">
              {pepites.map((p) => (
                <Link
                  key={p.titre}
                  href={p.href}
                  className="group block p-6 bg-white rounded-2xl border border-stone-200 hover:border-eucalyptus/40 hover:shadow-md transition-all"
                >
                  <span className="inline-block text-xs font-semibold uppercase tracking-widest text-teal mb-3">{p.tag}</span>
                  <h3 className="font-serif text-base text-stone-900 mb-2 group-hover:text-eucalyptus transition-colors">{p.titre}</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">{p.description}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* Zones */}
          <section className="mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-eucalyptus mb-3">Par secteur</p>
            <h2 className="text-2xl font-serif text-stone-900 mb-6">Explorer par zone</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {zones.map((z) => (
                <Link
                  key={z.href}
                  href={z.href}
                  className="group flex items-start gap-4 p-5 bg-white rounded-xl border border-stone-200 hover:border-eucalyptus/40 hover:shadow-sm transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-eucalyptus/10 flex items-center justify-center flex-shrink-0 group-hover:bg-eucalyptus/20 transition-colors">
                    <span className="text-eucalyptus font-serif font-bold text-sm">{z.label.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-900 mb-1 group-hover:text-eucalyptus transition-colors">{z.label}</h3>
                    <p className="text-stone-600 text-sm leading-relaxed">{z.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Infos pratiques */}
          <section className="mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-eucalyptus mb-3">Côté pratique</p>
            <h2 className="text-2xl font-serif text-stone-900 mb-6">Ce qu'il faut savoir</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-stone-200">
                <h3 className="font-serif text-lg text-stone-900 mb-4">Quand y aller</h3>
                <ul className="space-y-3 text-stone-600 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-eucalyptus font-bold mt-0.5">✓</span>
                    <span><strong>Avril – Juin</strong> — idéal. Jardins en fleurs, température parfaite, files d'attente raisonnables.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-eucalyptus font-bold mt-0.5">✓</span>
                    <span><strong>Septembre – Octobre</strong> — lumière dorée, foule réduite, terrasses encore ouvertes.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-stone-400 font-bold mt-0.5">~</span>
                    <span><strong>Juillet – Août</strong> — possible mais chaud et fréquenté. Privilégier les parcs et les plans d'eau.</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-xl border border-stone-200">
                <h3 className="font-serif text-lg text-stone-900 mb-4">Transport & Budget</h3>
                <ul className="space-y-3 text-stone-600 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-eucalyptus font-bold mt-0.5">→</span>
                    <span><strong>Pass Navigo zones 1-5</strong> — couvre tout : métro, RER, bus, trains vers Versailles et Fontainebleau.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-eucalyptus font-bold mt-0.5">→</span>
                    <span><strong>Hébergement</strong> — 80–200€/nuit selon arrondissement. Le 11e, 18e et 20e restent les plus abordables.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-eucalyptus font-bold mt-0.5">→</span>
                    <span><strong>Repas</strong> — compter 15–35€/personne dans un bistrot de quartier. Éviter les restaurants à menus photos.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-eucalyptus mb-3">Questions fréquentes</p>
            <div className="space-y-4">
              {faqIdfSchema.mainEntity.map((faq) => (
                <details key={faq.name} className="group bg-white rounded-xl border border-stone-200 p-5">
                  <summary className="font-semibold text-stone-900 cursor-pointer list-none flex items-center justify-between">
                    {faq.name}
                    <span className="text-eucalyptus group-open:rotate-180 transition-transform">↓</span>
                  </summary>
                  <p className="mt-3 text-stone-600 text-sm leading-relaxed">{faq.acceptedAnswer.text}</p>
                </details>
              ))}
            </div>
          </section>

          {/* Back link */}
          <Link href="/destinations" className="text-eucalyptus hover:text-eucalyptus/80 text-sm font-medium transition-colors">
            ← Toutes les destinations
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}

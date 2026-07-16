import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'

const faqColombieSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Quand aller en Colombie ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Décembre à avril : saison sèche, idéale pour Bogotá et Medellín. Juillet-août également sec et festif (Feria de Cali)." }
    },
    {
      "@type": "Question",
      "name": "La Colombie est-elle sûre pour les voyageurs ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Les zones touristiques de Bogotá, Medellín, Cali et la région caféière sont sécurisées. Les précautions habituelles s'appliquent en milieu urbain." }
    },
    {
      "@type": "Question",
      "name": "Quel est le budget pour un voyage en Colombie ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Destination abordable : compter 50–80€/jour en couple hors vol. Les hébergements et restaurants de qualité restent très accessibles." }
    }
  ]
}

export const metadata: Metadata = {
  title: 'Colombie slow travel | Guide Heldonica',
  description: "Guide slow travel Colombie : Bogotá, Medellín, Cali et la région du café. Adresses dénichées, itinéraires testés et conseils terrain par Heldonica.",
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/colombie',
  },
  openGraph: {
    title: 'Colombie slow travel | Guide Heldonica',
    description: "Bogotá, Medellín, Cali et la région du café. Notre guide slow travel Colombie avec adresses dénichées et itinéraires testés.",
    url: 'https://www.heldonica.fr/destinations/colombie',
    siteName: 'Heldonica',
    type: 'website',
    locale: 'fr_FR',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1523986371872-9d3ba2e2a389?w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'Colombie — Bogotá et la région du café',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Colombie slow travel | Guide Heldonica',
    description: "Bogotá, Medellín, Cali et la région du café. Adresses dénichées et itinéraires testés.",
    images: ['https://images.unsplash.com/photo-1523986371872-9d3ba2e2a389?w=1200&q=80'],
    creator: '@heldonica',
  },
}

const subNav = [
  { label: 'Bogotá', href: '/destinations/colombie/bogota' },
  { label: 'Medellín', href: '/destinations/colombie/medellin' },
  { label: 'Cali', href: '/destinations/colombie/cali' },
  { label: 'Cartago', href: '/destinations/colombie/cartago' },
]

export default function ColombiePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqColombieSchema) }} />
      <Header />
      <Breadcrumb />
      <main className="min-h-screen bg-stone-50">
        <section className="relative bg-stone-900 py-24 md:py-32 overflow-hidden">
          <div
            className="absolute inset-0 opacity-30 bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1523986371872-9d3ba2e2a389?w=1400&q=70')" }}
          />
          <div className="relative max-w-4xl mx-auto px-6">
            <p className="text-teal text-xs font-bold tracking-[0.2em] uppercase mb-4">
              Destination testée
            </p>
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-6 leading-tight">
              Colombie
              <span className="block text-teal italic text-3xl md:text-4xl mt-2">le pays qui a changé plus vite que sa réputation</span>
            </h1>
            <p className="text-xl text-stone-300 max-w-2xl leading-relaxed">
              Café, salsa, émeraudes. Medellín métamorphosée, Bogotá qui déborde de culture, et les routes du café qui n'ont pas d'équivalent.
            </p>
          </div>
        </section>

        <nav aria-label="Villes de Colombie" className="bg-white border-b border-stone-200 sticky top-16 z-10">
          <div className="max-w-4xl mx-auto px-4 py-3 flex gap-6 overflow-x-auto no-scrollbar">
            {subNav.map((item) => (
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
          <section className="mb-12">
            <p className="text-lg text-stone-700 leading-relaxed mb-4">
              La Colombie, c'est le retour. Le retour d'une destination qui a mis des années à se défaire de sa réputation, et qui s'est transformée plus vite que les voyageurs n'ont pu le réaliser.
              Bogotá la culturelle, Medellín la résiliente, Cali la sensuelle — et entre les deux, les routes du café, où l'on s'arrête dans les fincas pour comprendre ce qui pousse dans ces collines vertes.
            </p>
            <p className="text-lg text-stone-700 leading-relaxed">
              Ce qu'on préfère ? La façon dont les gens parlent de leur pays. Avec une fierté calme, une envie de te montrer ce qui a changé. C'est ça, la vraie Colombie lente.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif text-stone-900 mb-6">Nos villes favorites</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {[
                { href: '/destinations/colombie/bogota', title: 'Bogotá', desc: 'Capitale à 2 600 m. Musées de classe mondiale, street food, graffitis engagés.' },
                { href: '/destinations/colombie/medellin', title: 'Medellín', desc: "La ville de l'éternel printemps. Innovation urbaine, quartier El Poblado, tramway." },
                { href: '/destinations/colombie/cali', title: 'Cali', desc: 'Reine de la salsa. Valle del Cauca, ambiance décalée, feria en décembre.' },
                { href: '/destinations/colombie/cartago', title: 'Cartago & la région café', desc: 'UNESCO. Fincas caféières, paysages ondulés, haciendas coloniales.' },
              ].map((z) => (
                <Link key={z.href} href={z.href}
                  className="block p-6 bg-white rounded-xl border border-stone-200 hover:border-eucalyptus/40 hover:shadow-md transition-all group">
                  <h3 className="font-serif text-lg text-stone-900 mb-2 group-hover:text-eucalyptus transition-colors">{z.title}</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">{z.desc}</p>
                  <span className="text-xs text-eucalyptus font-semibold mt-3 inline-block group-hover:translate-x-1 transition-transform">Voir le guide →</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-6 rounded-xl border border-stone-200">
              <h3 className="font-serif text-stone-900 font-medium mb-4">Meilleure période</h3>
              <ul className="text-stone-600 text-sm space-y-2">
                <li>✓ Décembre – Avril : saison sèche, idéale</li>
                <li>✓ Juillet – Août : festivals, Feria de Cali</li>
                <li>⚠ Mai – Juin : saison des pluies</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-xl border border-stone-200">
              <h3 className="font-serif text-stone-900 font-medium mb-4">Budget indicatif (duo/semaine)</h3>
              <ul className="text-stone-600 text-sm space-y-2">
                <li>Hébergement : 50–120€/nuit</li>
                <li>Repas au restaurant : 20–40€/jour</li>
                <li>Vol Paris–Bogotá : ~600–900€ A/R</li>
              </ul>
            </div>
          </section>

          <div className="pt-4 border-t border-stone-200">
            <Link href="/destinations" className="text-sm text-eucalyptus font-semibold hover:underline">
              ← Toutes les destinations
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'

const faqSardaigneSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Quand aller en Sardaigne ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Mai-juin ou septembre : plages parfaites, foules réduites. Juillet-août reste possible mais très fréquenté." }
    },
    {
      "@type": "Question",
      "name": "Où loger en Sardaigne ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Cagliari pour la culture et la vie locale, Alghero pour le charme catalan, et les agriturismes de l'intérieur pour le vrai slow travel." }
    },
    {
      "@type": "Question",
      "name": "Comment se déplacer en Sardaigne ?",
      "acceptedAnswer": { "@type": "Answer", "text": "La voiture est indispensable pour explorer les villages et l'intérieur. Vols directs vers Cagliari (CAG) ou Olbia (OLB) depuis Paris." }
    }
  ]
}

export const metadata: Metadata = {
  title: 'Sardaigne slow travel | Guide Heldonica',
  description: "Guide slow travel Sardaigne : plages sauvages, villages de l'intérieur, agritourisme et adresses dénichées loin des foules. Testé par Heldonica.",
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/sardaigne',
  },
  openGraph: {
    title: 'Sardaigne slow travel | Guide Heldonica',
    description: "Plages sauvages, villages de l'intérieur et adresses dénichées loin des foules. Notre guide slow travel Sardaigne testé sur le terrain.",
    url: 'https://www.heldonica.fr/destinations/sardaigne',
    siteName: 'Heldonica',
    type: 'website',
    locale: 'fr_FR',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'Sardaigne — plages et villages slow travel',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sardaigne slow travel | Guide Heldonica',
    description: "Plages sauvages, villages de l'intérieur et adresses dénichées loin des foules.",
    images: ['https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80'],
    creator: '@heldonica',
  },
}

const subNav = [
  { label: 'Cagliari', href: '/destinations/sardaigne/cagliari' },
  { label: 'Costa Smeralda', href: '/destinations/sardaigne/costa-smeralda' },
  { label: 'Alghero', href: '/destinations/sardaigne/alghero' },
  { label: 'Nuoro', href: '/destinations/sardaigne/nuoro' },
  { label: 'Asinara', href: '/destinations/sardaigne/asinara' },
]

export default function SardaignePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSardaigneSchema) }} />
      <Header />
      <Breadcrumb />
      <main className="min-h-screen bg-stone-50">
        <section className="relative bg-stone-900 py-24 md:py-32 overflow-hidden">
          <div
            className="absolute inset-0 opacity-30 bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1400&q=70')" }}
          />
          <div className="relative max-w-4xl mx-auto px-6">
            <p className="text-teal text-xs font-bold tracking-[0.2em] uppercase mb-4">
              Destination testée
            </p>
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-6 leading-tight">
              Sardaigne
              <span className="block text-teal italic text-3xl md:text-4xl mt-2">l'île qui ne se livre pas d'un seul coup</span>
            </h1>
            <p className="text-xl text-stone-300 max-w-2xl leading-relaxed">
              Entre Méditerranée et mer Tyrrhénienne, la Sardaigne cache ses meilleures cartes à l'intérieur des terres, loin des plages célèbres.
            </p>
          </div>
        </section>

        <nav aria-label="Villes et zones de Sardaigne" className="bg-white border-b border-stone-200 sticky top-16 z-10">
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
              La Sardaigne, c'est l'île qui reste. Pas dans le sens d'un souvenir vague — dans le sens d'un endroit qui s'installe et ne repart plus.
              Les plages du sud autour de Cagliari, les lagunes roses aux flamants, les dunes sauvages de Piscinas. Et puis l'intérieur : les villages de pierre, les fêtes bariolées, les pecorino vieux qu'on mange au couteau.
            </p>
            <p className="text-lg text-stone-700 leading-relaxed">
              Ce qu'on préfère ? Les agriturismes de la Barbagia, où l'on mange ce que la famille a produit. Et les routes qui ne mènent nulle part — jusqu'à ce qu'elles mènent quelque part d'extraordinaire.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-serif text-stone-900 mb-6">Nos zones favorites</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {[
                { href: '/destinations/sardaigne/cagliari', title: 'Cagliari', desc: 'Le sud. Capitale animée, lagune aux flamants, dunes de Piscinas.' },
                { href: '/destinations/sardaigne/alghero', title: 'Alghero', desc: 'Nord-ouest. Ville catalane aux remparts dorés, grotte de Neptune.' },
                { href: '/destinations/sardaigne/nuoro', title: 'Nuoro & Barbagia', desc: "L'intérieur. Villages de pierre, agritourismes, cuisine de montagne." },
                { href: '/destinations/sardaigne/asinara', title: 'Asinara', desc: "Île sauvage du nord-ouest. Parc national, ânes blancs, plongée." },
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
                <li>✓ Mai – Juin : idéal, mer et terrasses</li>
                <li>✓ Septembre : parfait, foules réduites</li>
                <li>⚠ Juillet – Août : chaud, très fréquenté</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-xl border border-stone-200">
              <h3 className="font-serif text-stone-900 font-medium mb-4">Budget indicatif (duo/semaine)</h3>
              <ul className="text-stone-600 text-sm space-y-2">
                <li>Hébergement : 70–150€/nuit</li>
                <li>Repas au restaurant : 40–70€/jour</li>
                <li>Vol Paris–Cagliari : ~120–200€ A/R</li>
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

import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const SITE_URL = 'https://www.heldonica.fr'

const schemaTouristDestination = {
  '@context': 'https://schema.org',
  '@type': 'TouristDestination',
  name: 'Portugal',
  description: 'Le Portugal slow travel : de Madère aux rives du Douro. Destinations authentiques testées et documentées par Heldonica.',
  url: `${SITE_URL}/destinations/portugal`,
  address: { '@type': 'PostalAddress', addressCountry: 'PT' },
  geo: { '@type': 'GeoCoordinates', latitude: 39.3999, longitude: -8.2245 },
  touristType: ['Culture lover', 'Nature lover', 'Slow traveler'],
}

const faqPortugalSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Quand aller au Portugal ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Mars à juin pour la douceur printanière et les foules maîtrisées. Septembre-octobre pour la mer encore chaude et les prix raisonnables. Juillet-août possible mais touristique et chaud. Madère se visite toute l'année (l'île de l'éternel printemps — entre 18 et 23°C selon les saisons)." }
    },
    {
      "@type": "Question",
      "name": "Comment aller au Portugal depuis Paris ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Vols directs depuis Paris vers Lisbonne (2h30), Porto (2h15) ou Funchal/Madère (3h30). EasyJet, Ryanair et TAP proposent des liaisons régulières. En train via Madrid est possible mais long (environ 20h)." }
    },
    {
      "@type": "Question",
      "name": "Quel est le budget pour un voyage au Portugal ?",
      "acceptedAnswer": { "@type": "Answer", "text": "En Portugal continental : 80–120€/jour/personne en hôtel confort et restaurant local. À Madère : légèrement plus (70–100€ hors vols). Lisbonne et Porto restent abordables comparé à l'Europe occidentale. L'Alentejo et les régions rurales sont les zones les plus économiques." }
    },
    {
      "@type": "Question",
      "name": "Portugal ou Madère — laquelle choisir en premier ?",
      "acceptedAnswer": { "@type": "Answer", "text": "Madère si vous cherchez nature, randonnée et dépaysement absolu. Le Portugal continental (Lisbonne + Porto + Alentejo) si vous préférez les villes, la gastronomie et les paysages variés. Les deux en combinant : Lisbonne 3 jours + vol Madère pour une semaine complet est notre schéma favori." }
    }
  ]
}

export const metadata: Metadata = {
  title: 'Portugal slow travel | Guide Heldonica — Madère, Porto, Lisbonne',
  description: 'Guide Portugal slow travel : Madère, Lisbonne, Porto, Alentejo. Nos adresses testées, budgets réels et itinéraires pour un voyage authentique.',
  alternates: { canonical: 'https://www.heldonica.fr/destinations/portugal' },
  openGraph: {
    title: 'Portugal slow travel | Guide Heldonica',
    description: 'De Madère à Porto — le Portugal slow travel selon Heldonica.',
    url: 'https://www.heldonica.fr/destinations/portugal',
    images: [{ url: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1200&q=85', width: 1200, height: 630, alt: 'Portugal slow travel — Madère, Porto, Lisbonne' }],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', creator: '@heldonica', title: 'Portugal slow travel | Guide Heldonica', description: 'Madère, Lisbonne, Porto. Le Portugal qu\'on aime.' },
}

const subNav = [
  { label: 'Madère', href: '/destinations/madere' },
  { label: 'Porto', href: '/destinations/portugal/porto' },
  { label: 'Lisbonne', href: '/destinations/portugal/lisbonne' },
  { label: 'Alentejo', href: '/destinations/alentejo' },
]

const destinations = [
  {
    label: 'Madère',
    href: '/destinations/madere',
    desc: 'L\'île de l\'éternel printemps. Forêt de Fanal dans la brume, levadas, bolo do caco. Notre destination portugaise favorite, de loin.',
    image: 'https://heldonica.fr/wp-content/uploads/2026/03/madere-foret-1024x683.jpg',
    tag: 'Île · Nature',
  },
  {
    label: 'Lisbonne',
    href: '/destinations/lisbonne',
    desc: 'Les collines, les azulejos, le Tram 28 bondé qu\'on évite au profit des ruelles du Mouraria. La ville qui se vit lentement.',
    image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=600&q=80',
    tag: 'Capitale · Culture',
  },
  {
    label: 'Porto',
    href: '/destinations/portugal/porto',
    desc: 'Le vin de Porto, les caves de Vila Nova de Gaia, les bords du Douro et les librairies du centre historique. Porto est dense et mémorable.',
    image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=600&q=80',
    tag: 'Vin · Histoire',
  },
  {
    label: 'Alentejo',
    href: '/destinations/alentejo',
    desc: 'Les plaines de liège, les villages blancs perchés, les vignerons qui vous racontent leur terroir. L\'Alentejo prend son temps — et c\'est tant mieux.',
    image: 'https://images.unsplash.com/photo-1548681528-6a5c45b66063?w=600&q=80',
    tag: 'Rural · Terroir',
  },
]

export default function PortugalPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaTouristDestination) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPortugalSchema) }} />
      <Header />
      <main className="min-h-screen bg-stone-50">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-stone-900 via-stone-800 to-stone-700 py-24 md:py-32">
          <div
            className="absolute inset-0 opacity-25 bg-cover bg-center"
            style={{ backgroundImage: 'url(https://heldonica.fr/wp-content/uploads/2026/03/madere-cascade-1024x683.jpg)' }}
            aria-hidden="true"
          />
          <div className="relative max-w-4xl mx-auto px-4">
            <span className="inline-block text-teal text-xs font-semibold uppercase tracking-widest mb-4">Destinations Portugal</span>
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-4 leading-tight">
              Portugal
            </h1>
            <p className="text-lg md:text-xl text-stone-200 max-w-2xl leading-relaxed">
              Le pays qu'on visite et revisite. Madère pour la nature, Lisbonne pour l'âme, Porto pour le vin. Le Portugal a fait le slow travel avant que le mot existe.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/destinations/madere"
                className="inline-flex items-center gap-2 px-6 py-3 bg-eucalyptus text-white font-semibold rounded-xl hover:bg-eucalyptus/90 transition-colors text-sm"
              >
                Découvrir Madère →
              </Link>
              <Link
                href="/destinations/alentejo"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors text-sm border border-white/20"
              >
                Explorer l'Alentejo →
              </Link>
            </div>
          </div>
        </section>

        {/* Sub navigation */}
        <nav className="bg-white border-b border-stone-200 sticky top-16 z-40" aria-label="Sous-destinations Portugal">
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
              Le Portugal qu'on connaît vraiment
            </h2>
            <div className="space-y-4 text-stone-700 leading-relaxed">
              <p>
                On a une relation particulière avec le Portugal. L'un de nous y a des racines atlantiques — Madère, forêts de lauriers, sentiers de levadas. L'autre l'a adopté séjour après séjour, de Lisbonne aux plaines de l'Alentejo.
              </p>
              <p>
                Ce qu'on documente, c'est le Portugal qui n'a pas changé : les marchés de village le samedi matin, les restaurants sans menus traduits, les routes de montagne à Madère où on s'arrête sans raison précise parce que la vue mérite la pause.
              </p>
            </div>
          </section>

          {/* Destinations grid */}
          <section className="mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-eucalyptus mb-3">Nos destinations</p>
            <h2 className="text-2xl font-serif text-stone-900 mb-6">Où aller au Portugal</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {destinations.map((d) => (
                <Link
                  key={d.href}
                  href={d.href}
                  className="group block bg-white rounded-2xl border border-stone-200 overflow-hidden hover:border-eucalyptus/40 hover:shadow-md transition-all"
                >
                  <div className="h-36 overflow-hidden">
                    <img
                      src={d.image}
                      alt={d.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-teal mb-2">{d.tag}</span>
                    <h3 className="font-serif text-base text-stone-900 mb-1 group-hover:text-eucalyptus transition-colors">{d.label}</h3>
                    <p className="text-stone-600 text-sm leading-relaxed">{d.desc}</p>
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
                    <span><strong>Mars – Juin</strong> — idéal sur le continent. Fleurs, douceur, prix de saison.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-eucalyptus font-bold mt-0.5">✓</span>
                    <span><strong>Septembre – Octobre</strong> — mer chaude, foule en baisse, vendanges en Alentejo.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-eucalyptus font-bold mt-0.5">✓</span>
                    <span><strong>Madère toute l'année</strong> — entre 18 et 23°C. Novembre-mars pour les cascades, juillet pour les fleurs.</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-xl border border-stone-200">
                <h3 className="font-serif text-lg text-stone-900 mb-4">Budget & Logistique</h3>
                <ul className="space-y-3 text-stone-600 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-eucalyptus font-bold mt-0.5">→</span>
                    <span><strong>Vols</strong> — 80–200€ A/R depuis Paris selon saison. Madère légèrement plus cher.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-eucalyptus font-bold mt-0.5">→</span>
                    <span><strong>Hébergement</strong> — 60–150€/nuit. Les aldeias (villages) d'Alentejo sont souvent les meilleurs rapports qualité-prix.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-eucalyptus font-bold mt-0.5">→</span>
                    <span><strong>Repas</strong> — 20–40€/personne dans un bon restaurant local. Le bacalhau à 12€ existe encore.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-eucalyptus mb-3">Questions fréquentes</p>
            <div className="space-y-4">
              {faqPortugalSchema.mainEntity.map((faq) => (
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

          {/* CTA */}
          <div className="bg-eucalyptus/5 border border-eucalyptus/20 rounded-2xl p-8 text-center mb-8">
            <h3 className="font-serif text-xl text-stone-900 mb-3">Un itinéraire Portugal sur mesure</h3>
            <p className="text-stone-600 text-sm mb-5 max-w-md mx-auto">
              On conçoit des carnets de route Portugal complets : Madère + continent, circuits Alentejo, combinés familles.
            </p>
            <Link
              href="/travel-planning"
              className="inline-flex items-center gap-2 px-6 py-3 bg-eucalyptus text-white font-semibold rounded-xl hover:bg-eucalyptus/90 transition-colors text-sm"
            >
              Planifier mon voyage Portugal →
            </Link>
          </div>

          <Link href="/destinations" className="text-eucalyptus hover:text-eucalyptus/80 text-sm font-medium transition-colors">
            ← Toutes les destinations
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}

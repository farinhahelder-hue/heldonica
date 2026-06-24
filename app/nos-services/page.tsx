import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import FaqSection from '@/components/FaqSection'
import { FAQJsonLd } from '@/components/JsonLd'

export const metadata: Metadata = {
  title: 'Nos Services — Heldonica | Travel Planning sur mesure',
  description:
    "Services Heldonica : Travel Planning personnalisé, expertise hôtelière B2B, et plus encore. Des solutions sur mesure pour vos voyages et établissements.",
  keywords: [
    'travel planning',
    'voyage sur mesure',
    'expert hotelier',
    'heldonica',
    'services voyage',
  ],
  alternates: {
    canonical: 'https://www.heldonica.fr/nos-services',
  },
  openGraph: {
    title: 'Nos Services | Heldonica',
    description: "Des services pensés pour les voyageurs en quête d’authenticité et les professionnels de l’hôtellerie.",
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Heldonica — Nos Services',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
}

// FAQ content for Travel Planning service
const FAQ_QUESTIONS = [
  {
    question: 'Comment fonctionne le Travel Planning sur mesure ?',
    answer: 'Vous nous décrivez votre voyage idéal via notre formulaire ou lors d\'un échange. On analyse vos envies, contraintes et budget, puis on vous prépare un carnet de route PDF complet avec itinéraire, hébergements, restaurants et conseils pratiques. Le tout en 7-10 jours.',
  },
  {
    question: 'Combien coûte un voyage sur mesure avec Heldonica ?',
    answer: 'Le tarif du Travel Planning commence à 149€ pour un voyage de base. Le prix varie selon la complexité de l\'itinéraire, la durée du voyage et le niveau de personnalisation. Chaque projet est unique, on vous donne un chiffrage précis après notre échange découverte.',
  },
  {
    question: 'Heldonica accompagne aussi les voyageurs en solo ?',
    answer: 'Absolument. Le Travel Planning fonctionne pour tous les types de voyageurs : couples, solos, familles, groupes d\'amis. Pour les voyageurs solo, on peut aussi te mettre en contact avec d\'autres voyageurs ou te guider vers des expériences adaptées.',
  },
]

export default function NosServicesPage() {
  return (
    <>
      <FAQJsonLd questions={FAQ_QUESTIONS} />
      <Header />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="relative bg-stone-950 text-white py-24 md:py-32 overflow-hidden">
          <div 
            className="absolute inset-0 opacity-20" 
            style={{ 
              backgroundImage: 'url(https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1400&q=70)', 
              backgroundSize: 'cover', 
              backgroundPosition: 'center' 
            }} 
          />
          <div className="relative max-w-4xl mx-auto px-6 text-center">
            <span className="inline-block px-4 py-1.5 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded-full uppercase tracking-wider mb-6">
              Ce qu&apos;on propose
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light leading-tight mb-6">
              Des services pensés pour<br />
              <span className="text-amber-400">voyager autrement.</span>
            </h1>
            <p className="text-stone-300 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
              Du voyage sur mesure à l&apos;expertise hôtelière, on vous accompagne à chaque étape de votre projet.
            </p>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-12 text-center">
              Nos expertises
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Travel Planning */}
              <div className="bg-stone-50 rounded-2xl p-8 border border-stone-100 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-5">✈️</div>
                <h3 className="text-xl font-serif font-bold text-stone-900 mb-3">Travel Planning</h3>
                <p className="text-stone-600 leading-relaxed mb-6">
                  On conçoit votre voyage sur mesure. Carnet de route PDF, hébergements triés sur le volet, 
                  pépites dénichées, support WhatsApp.
                </p>
                <p className="text-amber-700 font-semibold text-sm mb-4">À partir de 149€</p>
                <Link 
                  href="/travel-planning"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-eucalyptus hover:text-eucalyptus/80 transition-colors"
                >
                  Découvrir →
                </Link>
              </div>

              {/* Expertise Hôtelière */}
              <div className="bg-stone-50 rounded-2xl p-8 border border-stone-100 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-5">🏨</div>
                <h3 className="text-xl font-serif font-bold text-stone-900 mb-3">Expertise Hôtelière B2B</h3>
                <p className="text-stone-600 leading-relaxed mb-6">
                  Audit complet, stratégie contenu et formation équipes pour hôteliers et gestionnaires de biens. 
                  On analyse, on optimise, on forme.
                </p>
                <Link 
                  href="/expert-hotelier"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-eucalyptus hover:text-eucalyptus/80 transition-colors"
                >
                  En savoir plus →
                </Link>
              </div>

              {/* Blog */}
              <div className="bg-stone-50 rounded-2xl p-8 border border-stone-100 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-5">📖</div>
                <h3 className="text-xl font-serif font-bold text-stone-900 mb-3">Carnets de Voyage</h3>
                <p className="text-stone-600 leading-relaxed mb-6">
                  Des récits de voyage authentic, des guides pratiques et des inspirations pour voyager 
                  à votre rythme. Sans filtre.
                </p>
                <Link 
                  href="/blog"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-eucalyptus hover:text-eucalyptus/80 transition-colors"
                >
                  Lire le blog →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section with accordion */}
        <FaqSection
          items={FAQ_QUESTIONS}
          title="Tout ce que tu veux savoir"
          subtitle="Les questions qu’on nous pose le plus souvent"
        />

        {/* CTA Section */}
        <section className="py-20 md:py-28 bg-white text-center">
          <div className="max-w-2xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-6">
              Prêt à voyager autrement&nbsp;?
            </h2>
            <p className="text-stone-600 mb-8">
              Dis-nous où tu veux aller. On s&apos;occupe du reste.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/travel-planning-form"
                className="px-8 py-4 bg-amber-800 text-white font-semibold rounded-full hover:bg-amber-700 transition-colors"
              >
                Demander un voyage sur mesure →
              </Link>
              <Link
                href="/expert-hotelier"
                className="px-8 py-4 bg-stone-100 text-stone-900 font-semibold rounded-full hover:bg-stone-200 transition-colors"
              >
                Découvrir l&apos;offre B2B
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
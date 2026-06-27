import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Happiness Design — Programme 12 séances | Monica Schneider',
  description:
    'Un programme complet de 12 séances pour reprendre les rênes de votre vie et de votre bonheur, au travail et ailleurs.',
  alternates: { canonical: 'https://www.heldonica.fr/happiness-design' },
}

const STEPS = [
  {
    num: '1',
    title: 'Les fondations',
    items: [
      'Comment ça marche (neuro + gratitude)',
      'Audit de sa vie — life design / bonheur',
      'Audit du boulot — design thinking appliqué au travail',
      'Audit de ses forces — via character strengths',
      'Les forces que vous pratiquez déjà',
    ],
  },
  {
    num: '2',
    title: 'Les freins',
    items: [
      'Votre relation à l\'échec',
      'Audit de vos freins profonds',
      'Le syndrome de l\'imposteur',
      'Votre style d\'attachement',
      'Vos peurs limitantes',
    ],
  },
  {
    num: '3',
    title: 'La transformation',
    items: [
      'Homo risibilis — imparfait mais impactant',
      'L\'action salvatrice',
      'Version 1 / Version 2 de vous-même',
      'Les 3 métamorphoses',
    ],
  },
  {
    num: '4',
    title: 'L\'ancrage',
    items: [
      'Construction de votre plan d\'action (Child\'s plan)',
      'Suivi à 1 mois',
      'Suivi à 2 mois',
      'Suivi à 3 mois',
      'Suivi à 6 mois',
    ],
  },
]

export default function HappinessDesignPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f5f3ef]">
        {/* Hero */}
        <section className="relative py-28 md:py-36 bg-gradient-to-br from-stone-900 to-stone-800 text-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1920&q=80')] bg-cover bg-center opacity-15" />
          <div className="relative z-10 container max-w-4xl mx-auto px-5 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light leading-tight mb-6">
              Happiness Design
            </h1>
            <p className="text-lg md:text-xl text-stone-300 max-w-2xl mx-auto leading-relaxed">
              12 séances pour reprendre les rênes de votre vie et de votre bonheur, au boulot et ailleurs.
            </p>
          </div>
        </section>

        {/* Intro */}
        <section className="py-20 md:py-28">
          <div className="container max-w-4xl mx-auto px-5">
            <p className="text-[#C4714A] text-xs font-semibold tracking-[0.2em] uppercase mb-3 text-center">Le programme</p>
            <h2 className="text-3xl md:text-4xl font-serif text-stone-900 text-center mb-2">Un parcours en 4 étapes</h2>
            <div className="w-12 h-0.5 bg-[#C4714A] mx-auto mt-6 mb-8" />
            <p className="text-stone-600 text-center max-w-2xl mx-auto leading-relaxed mb-16">
              Un programme intensif et transformateur qui combine neurosciences, psychologie positive, philosophie pratique et design thinking pour vous construire une boîte à outils du bonheur sur mesure.
            </p>

            <div className="space-y-10">
              {STEPS.map((step, i) => (
                <div key={i} className="bg-white rounded-2xl p-8 border border-stone-100">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="w-10 h-10 rounded-full bg-[#C4714A] text-white flex items-center justify-center text-sm font-bold shrink-0">
                      {step.num}
                    </span>
                    <h3 className="text-xl font-serif font-bold text-stone-900">{step.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {step.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-3 text-stone-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C4714A] mt-2 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 md:py-28 bg-white">
          <div className="container max-w-3xl mx-auto px-5 text-center">
            <h2 className="text-3xl md:text-4xl font-serif text-stone-900 mb-4">Prêt à transformer votre vie ?</h2>
            <p className="text-stone-600 mb-8 max-w-xl mx-auto">
              Le programme Happiness Design est un investissement dans la personne la plus importante de votre vie : vous.
            </p>
            <Link
              href="/coaching"
              className="inline-flex px-10 py-4 bg-[#C4714A] text-white font-semibold rounded-xl hover:bg-[#b05f3a] transition-all text-lg"
            >
              En savoir plus sur les programmes
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

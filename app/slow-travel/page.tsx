import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'

export const metadata: Metadata = {
  title: 'Slow Travel | Heldonica',
  description:
    'Le slow travel selon Heldonica : regarder mieux, laisser de la place, revenir, et apprendre à dénicher des pépites même en bas de chez soi.',
  alternates: {
    canonical: 'https://heldonica.fr/slow-travel',
  },
}

const principles = [
  {
    title: 'Ralentir assez pour voir',
    text: 'Le slow travel ne consiste pas à faire moins pour cocher une valeur morale. Il consiste à laisser une journée respirer assez longtemps pour qu’un lieu commence enfin à répondre.',
  },
  {
    title: 'Revenir quand c’est nécessaire',
    text: 'On comprend rarement un terrain au premier passage. Revenir, corriger, comparer, rater mieux : c’est aussi comme ça qu’on construit Heldonica.',
  },
  {
    title: 'Chercher juste, pas loin',
    text: 'Dénicheurs de pépites, même en bas de chez toi. Le regard compte autant que la distance. Un canal, une rue, une forêt proche peuvent déjà changer la journée.',
  },
]

export default function SlowTravelPage() {
  return (
    <>
      <Header />
      <Breadcrumb />
      <main>
        <section className="bg-gradient-to-br from-stone-50 via-amber-50/40 to-white py-24 md:py-28">
          <div className="mx-auto max-w-4xl px-6 text-center md:px-10">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-amber-800">Slow travel</p>
            <h1 className="mb-6 text-4xl font-serif font-light leading-tight text-stone-900 md:text-6xl">
              Le slow travel n’est pas une esthétique.
              <br />
              C’est une façon de regarder.
            </h1>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-stone-700">
              On ralentit pour mieux lire un lieu, mieux choisir un rythme, mieux sentir ce qui tient
              vraiment. Ce n’est pas plus noble. C’est simplement plus juste.
            </p>
          </div>
        </section>

        <section className="bg-white py-16 md:py-20">
          <div className="mx-auto grid max-w-6xl gap-6 px-6 md:grid-cols-3 md:px-10">
            {principles.map((principle) => (
              <div key={principle.title} className="rounded-[1.75rem] border border-stone-200 bg-stone-50 p-8">
                <h2 className="mb-4 text-2xl font-serif font-light leading-tight text-stone-900">
                  {principle.title}
                </h2>
                <p className="text-base leading-relaxed text-stone-700">{principle.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-stone-950 py-20 text-white md:py-24">
          <div className="mx-auto max-w-3xl px-6 text-center md:px-10">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Notre point de vue</p>
            <p className="text-2xl font-serif font-light leading-relaxed md:text-3xl">
              Voyager lentement, ce n’est pas se retirer du monde.
              <br />
              C’est accepter qu’un détail juste vaille mieux qu’une journée trop remplie.
            </p>
          </div>
        </section>

        <section className="bg-white py-20 md:py-24">
          <div className="mx-auto max-w-3xl px-6 text-center md:px-10">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">Continuer</p>
            <h2 className="mb-6 text-3xl font-serif font-light leading-tight text-stone-900 md:text-4xl">
              Si cette façon de voyager te parle, on a déjà des carnets pour ça.
            </h2>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/blog"
                className="rounded-full bg-amber-900 px-7 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-amber-800"
              >
                Lire le carnet →
              </Link>
              <Link
                href="/destinations"
                className="text-sm font-semibold text-amber-800 transition-colors duration-200 hover:text-amber-700"
              >
                Voir les destinations →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

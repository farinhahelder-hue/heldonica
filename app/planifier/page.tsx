import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'

export const metadata: Metadata = {
  title: 'Planifier | Heldonica',
  description:
    'Temps, budget, énergie, enfants, fatigue, envie de vrai : raconte-nous le cadre réel et on construit le voyage à partir de là.',
  alternates: {
    canonical: 'https://heldonica.fr/planifier',
  },
}

const constraints = [
  {
    title: 'Temps réel',
    text: 'Trois jours, huit jours, des horaires serrés, une arrivée tardive : on préfère le vrai calendrier à la version fantasmée du voyage.',
  },
  {
    title: 'Budget réel',
    text: 'Pas besoin de jouer au premium si ce n’est pas le bon cadre. On calibre à partir de ce que tu veux vivre, pas de ce qu’il faudrait afficher.',
  },
  {
    title: 'Énergie réelle',
    text: 'Couple, solo, famille, amis : le bon itinéraire n’est pas celui qui remplit le plus. C’est celui qui tient debout une fois sur place.',
  },
]

const steps = [
  'Tu nous envoies tes contraintes, même brutes.',
  'On clarifie ce qui compte vraiment et ce qu’il vaut mieux éviter.',
  'On transforme ça en séquence concrète, lisible, vivable.',
]

export default function PlanifierPage() {
  return (
    <>
      <Header />
      <Breadcrumb />
      <main>
        <section className="bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950 py-24 text-white md:py-32">
          <div className="mx-auto max-w-4xl px-6 text-center md:px-10">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">Planifier un voyage</p>
            <h1 className="mb-6 text-4xl font-serif font-light leading-tight md:text-6xl">
              Tu n’as pas besoin d’un rêve bien rangé pour nous écrire.
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-white/75">
              Temps court, budget serré, fatigue, enfants, envie de ralentir sans s’ennuyer,
              destination encore floue : c’est justement là qu’on sait être utiles.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/travel-planning-form"
                className="rounded-full bg-amber-500 px-8 py-4 text-sm font-semibold text-white transition-all duration-200 hover:bg-amber-400"
              >
                Nous écrire →
              </Link>
              <Link
                href="/travel-planning"
                className="text-sm font-semibold text-amber-200 transition-colors duration-200 hover:text-white"
              >
                Voir notre approche →
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 md:py-20">
          <div className="mx-auto grid max-w-6xl gap-6 px-6 md:grid-cols-3 md:px-10">
            {constraints.map((item) => (
              <div key={item.title} className="rounded-[1.75rem] border border-stone-200 bg-stone-50 p-8">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">{item.title}</p>
                <p className="text-base leading-relaxed text-stone-700">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-amber-50 py-16 md:py-20">
          <div className="mx-auto max-w-4xl px-6 md:px-10">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-amber-800">Comment on travaille</p>
            <h2 className="mb-10 text-3xl font-serif font-light leading-tight text-stone-900 md:text-4xl">
              On part du cadre. Pas de la promesse.
            </h2>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={step} className="flex gap-4 rounded-[1.5rem] border border-amber-200 bg-white p-6">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-800 text-xs font-bold text-white">
                    0{index + 1}
                  </span>
                  <p className="pt-1 text-base leading-relaxed text-stone-700">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-20 md:py-24">
          <div className="mx-auto max-w-3xl px-6 text-center md:px-10">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">Pour qui</p>
            <h2 className="mb-6 text-3xl font-serif font-light leading-tight text-stone-900 md:text-4xl">
              Notre terrain naturel reste le duo.
              <br />
              Notre service, lui, reste ouvert.
            </h2>
            <p className="text-base leading-relaxed text-stone-700 md:text-lg">
              Couples aventuriers, solos curieux, familles qui veulent respirer, groupes d’amis
              qui ne cherchent pas un séjour catalogue : on applique le même niveau d’exigence à
              tous les formats.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
